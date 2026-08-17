/**
 * Event tracking — Phase 2.
 *
 * Satisfies the plan's "GA4 events for every landing and every button" (p. 7).
 *
 * HOW IT WORKS
 * A single delegated click listener on the document classifies every link and
 * button once, instead of sprinkling handlers across components. That means a
 * new CTA added anywhere is tracked automatically, with no chance of someone
 * forgetting the handler — the most common source of gaps in event coverage.
 *
 * DIVISION OF LABOUR WITH GTM
 * This file only pushes a clean, named event with its parameters onto the
 * dataLayer. Which of those events becomes a GA4 event, and which one is marked
 * as a key event, is configured inside GTM — the plan's "centralize tags" rule
 * (p. 3). Nothing here writes a GA4 tag by hand.
 *
 * EVENTS PUSHED
 *   landing_view    a campaign landing was viewed (fires once, after consent)
 *   cta_click       any element marked data-track="cta"
 *   whatsapp_click  the floating WhatsApp button or any wa.me link
 *   phone_click     any tel: link
 *   email_click     any mailto: link
 *   outbound_click  any link leaving the site that is none of the above
 *   form_start      first interaction with the lead form   (scripts/leadForm.ts)
 *   generate_lead   HubSpot confirmed the submission       (scripts/leadForm.ts)
 */
import { hasConsent, onConsent } from './consent'

export interface PageContext {
  /** 'landing' | 'home' | 'services' | 'contact' | … */
  page_type: string
  language: string
  /** Stable landing ID from config/landings.ts. Landing pages only. */
  landing_id?: string
  /** 'offer' | 'segment'. Landing pages only. */
  landing_kind?: string
}

let pageContext: PageContext = { page_type: 'page', language: 'es' }

/**
 * Pushes an event onto the dataLayer, enriched with page context.
 * Silently drops the event when there is no consent — see scripts/consent.ts.
 */
export function trackEvent(event: string, params: Record<string, unknown> = {}): void {
  if (!hasConsent()) return
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ event, ...pageContext, ...params })
}

/** Text label for an element, trimmed to something reportable. */
function labelFor(el: HTMLElement): string {
  const explicit = el.getAttribute('data-track-label') || el.getAttribute('aria-label')
  const text = explicit || el.textContent || ''
  return text.trim().replace(/\s+/g, ' ').slice(0, 100)
}

function classifyClick(el: HTMLElement): { event: string; params: Record<string, unknown> } | null {
  const explicit = el.getAttribute('data-track')
  const label = labelFor(el)
  const location = el.getAttribute('data-track-location') || 'unknown'

  // Explicitly marked elements win — data-track="cta" becomes cta_click.
  if (explicit) {
    return {
      event: `${explicit}_click`,
      params: { link_label: label, link_location: location },
    }
  }

  const anchor = el as HTMLAnchorElement
  const href = anchor.getAttribute?.('href')
  if (!href) return null

  if (href.startsWith('tel:')) {
    return { event: 'phone_click', params: { link_label: label, link_location: location } }
  }
  if (href.startsWith('mailto:')) {
    return { event: 'email_click', params: { link_label: label, link_location: location } }
  }
  if (href.includes('wa.me') || href.includes('api.whatsapp.com')) {
    return { event: 'whatsapp_click', params: { link_label: label, link_location: location } }
  }

  // Outbound: absolute URL pointing somewhere other than this site.
  if (/^https?:\/\//i.test(href)) {
    try {
      if (new URL(href).origin !== window.location.origin) {
        return {
          event: 'outbound_click',
          params: { link_label: label, link_location: location, link_url: href },
        }
      }
    } catch {
      /* Malformed href — not worth an event. */
    }
  }

  return null
}

/**
 * Initializes tracking for the current page.
 * Call once per page, from BaseLayout.
 */
export function initTracking(context: PageContext): void {
  pageContext = context

  // A campaign landing view is a reportable event in its own right, so each
  // variant can be compared. Deferred until consent, and fired only once.
  if (context.landing_id) {
    onConsent(() =>
      trackEvent('landing_view', {
        landing_id: context.landing_id,
        landing_kind: context.landing_kind,
      }),
    )
  }

  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null
      if (!target || typeof target.closest !== 'function') return

      const el = target.closest('a, button') as HTMLElement | null
      if (!el) return

      const classified = classifyClick(el)
      if (classified) trackEvent(classified.event, classified.params)
    },
    // Capture phase: the event is recorded even if a handler further down
    // stops propagation or the browser starts navigating away.
    true,
  )
}
