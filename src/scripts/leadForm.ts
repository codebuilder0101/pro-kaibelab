/**
 * Lead form → HubSpot Forms Submission API.
 *
 * Works from the static site with no backend: the browser POSTs directly to
 * HubSpot. Includes client-side validation, a honeypot, a required consent
 * checkbox, success/error states and a `generate_lead` dataLayer event.
 *
 * The form markup must expose these element IDs (see contact.astro / campaign.astro):
 *   #f-name #f-email #f-company #f-phone #f-service #f-message
 *   #f-website (honeypot, visually hidden)  #f-consent (checkbox)
 *   #form-status (message area)  #form-success (success block)  #btn-submit
 */
import { HUBSPOT, hubspotEnabled, hubspotEndpoint } from '../config/site'
import { attributionFields, captureAttribution } from './attribution'
import { trackEvent } from './tracking'

/** Page context so a lead can be traced back to the landing that produced it. */
export interface LeadContext {
  landing_id?: string
  landing_kind?: string
  form_name?: string
}

export interface LeadMessages {
  sending: string
  successNote: string
  errorGeneric: string
  errorRequired: string
  errorEmail: string
  errorPhone: string
  errorConsent: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Phone is optional; when provided, require 7–15 digits (ignoring spaces, +, -, (), .)
const PHONE_RE = /^[0-9]{7,15}$/

function val(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  return el ? String(el.value).trim() : ''
}

/** Reads the HubSpot tracking cookie, present only once HubSpot's script loads. */
function hubspotCookie(): string {
  const match = document.cookie.match(/(^|;)\s*hubspotutk=([^;]+)/)
  return match ? decodeURIComponent(match[2]) : ''
}

export function initLeadForm(messages: LeadMessages, context: LeadContext = {}) {
  const form = document.getElementById('contact-form') as HTMLFormElement | null
  const submitBtn = document.getElementById('btn-submit') as HTMLButtonElement | null
  const statusEl = document.getElementById('form-status')
  const successEl = document.getElementById('form-success')
  if (!form || !submitBtn) return

  const formName = context.form_name || 'lead'

  // Capture campaign parameters as soon as the form exists, so attribution is
  // already stored even if the visitor navigates before submitting.
  captureAttribution()

  // Guards against a double submission creating two contacts and two
  // conversions — the double-counting risk flagged in the plan.
  let submitting = false
  let submitted = false

  // Fire form_start once, when the user first interacts.
  let started = false
  form.addEventListener('input', () => {
    if (!started) {
      started = true
      trackEvent('form_start', {
        form_name: formName,
        landing_id: context.landing_id,
      })
    }
  })

  function showStatus(msg: string, kind: 'error' | 'info') {
    if (!statusEl) return
    statusEl.textContent = msg
    statusEl.hidden = false
    statusEl.setAttribute('role', kind === 'error' ? 'alert' : 'status')
    statusEl.className =
      'text-sm rounded px-4 py-3 ' +
      (kind === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-surface text-gray-700')
  }

  submitBtn.addEventListener('click', async () => {
    // A second click while the first request is in flight, or after it already
    // succeeded, would create a duplicate contact and a duplicate conversion.
    if (submitting || submitted) return

    // Honeypot: if filled, a bot did it. Pretend success, send nothing.
    if (val('f-website')) {
      if (successEl) successEl.hidden = false
      if (form) form.hidden = true
      return
    }

    const name = val('f-name')
    const email = val('f-email')
    const consent = (document.getElementById('f-consent') as HTMLInputElement | null)?.checked ?? false

    // Validation
    if (!name || !email) return showStatus(messages.errorRequired, 'error')
    if (!EMAIL_RE.test(email)) return showStatus(messages.errorEmail, 'error')
    const phoneRaw = val('f-phone')
    if (phoneRaw && !PHONE_RE.test(phoneRaw.replace(/[^0-9]/g, ''))) {
      return showStatus(messages.errorPhone, 'error')
    }
    if (!consent) return showStatus(messages.errorConsent, 'error')

    if (!hubspotEnabled) {
      // Placeholder mode: HubSpot IDs not set yet. Don't fake a real submission.
      return showStatus(
        'HubSpot no está configurado todavía (faltan portalId/formGuid). / HubSpot is not configured yet.',
        'info',
      )
    }

    const service = val('f-service')
    const message = [service ? `[${service}] ` : '', val('f-message')].join('').trim()

    // Campaign attribution — the plan's closing test "lead source correctly
    // attributed in HubSpot". Every property here must exist in the portal;
    // HubSpot silently ignores fields it does not recognize.
    const attribution = attributionFields()
    const landingField = context.landing_id
      ? [{ name: 'landing_variant', value: context.landing_id }]
      : []

    const hutk = hubspotCookie()

    const coreFields = [
      { name: 'firstname', value: name },
      { name: 'email', value: email },
      { name: 'company', value: val('f-company') },
      { name: 'phone', value: val('f-phone') },
      { name: 'message', value: message },
    ].filter((f) => f.value)

    const extraFields = [...attribution, ...landingField].filter((f) => f.value)

    const payload = {
      fields: [...coreFields, ...extraFields],
      context: {
        pageUri: window.location.href,
        pageName: document.title,
        // Present only once HubSpot's own script has loaded, which happens
        // after consent. Sent when available so HubSpot can stitch the
        // submission to the visitor's session; omitted otherwise.
        ...(hutk ? { hutk } : {}),
      },
      legalConsentOptions: {
        consent: {
          consentToProcess: true,
          text: messages.successNote,
        },
      },
    }

    submitting = true
    submitBtn.disabled = true
    const originalLabel = submitBtn.textContent
    submitBtn.textContent = messages.sending
    showStatus(messages.sending, 'info')

    const post = (body: unknown) =>
      fetch(hubspotEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

    try {
      let res = await post(payload)

      // HubSpot rejects the whole submission with 400 when a field does not
      // exist on the form. The attribution properties are created by hand in
      // the portal (Phase 2 task 0.2), so until that is done every lead would
      // be lost. Retry once with the core fields only: capturing the lead
      // without attribution beats not capturing it at all. Nothing is created
      // on a 400, so the retry cannot produce a duplicate contact.
      if (res.status === 400 && extraFields.length > 0) {
        res = await post({ ...payload, fields: coreFields })
      }

      if (!res.ok) throw new Error('HubSpot ' + res.status)

      // GA4 is the single source of truth for the conversion (decision 3), so
      // this fires exactly once, and only after HubSpot confirms receipt —
      // never on click, never on a failed submission.
      submitted = true
      trackEvent('generate_lead', {
        form_name: formName,
        service,
        landing_id: context.landing_id,
        landing_kind: context.landing_kind,
      })

      if (statusEl) statusEl.hidden = true
      if (successEl) successEl.hidden = false
      if (form) form.hidden = true
    } catch (err) {
      showStatus(messages.errorGeneric, 'error')
      submitBtn.disabled = false
      submitBtn.textContent = originalLabel
    } finally {
      submitting = false
    }
  })
}

export { HUBSPOT }
