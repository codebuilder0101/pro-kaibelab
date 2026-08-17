/**
 * Campaign attribution capture — Phase 2.
 *
 * Reads the agreed UTM parameters (doc/fase-2-decisiones.txt, decision 2) plus
 * the Google Ads click ID from the landing URL and keeps them for the duration
 * of the visit, so a lead submitted three pages later still carries the campaign
 * that brought the visitor in.
 *
 * STORAGE: sessionStorage only — cleared when the tab closes, never a
 * persistent cookie. This is first-party data used solely to attribute the form
 * the visitor chooses to submit, and the form carries its own explicit consent
 * checkbox. No third-party tag is loaded here; GTM/GA4/Clarity/HubSpot tags stay
 * gated behind the cookie banner exactly as in Phase 1.
 *
 * MODEL: last non-direct click within the session. Arriving with new campaign
 * parameters overwrites the stored set; arriving with none preserves what was
 * captured earlier in the visit.
 */

const KEY = 'kb_attr'

/** The agreed parameter set. Order is the reporting order — keep it stable. */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

/** Ad platform click IDs worth preserving for conversion import in Phase 3. */
const CLICK_ID_KEYS = ['gclid', 'gbraid', 'wbraid', 'msclkid'] as const

export interface Attribution {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
  gbraid?: string
  wbraid?: string
  msclkid?: string
  /** First page of the visit — where the campaign actually landed. */
  landing_page?: string
  /** External referrer, when there is one. */
  referrer?: string
}

function read(): Attribution {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Attribution) : {}
  } catch {
    // Private mode, storage disabled, or corrupt JSON — attribution degrades to
    // empty rather than breaking the form.
    return {}
  }
}

function write(data: Attribution): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    /* Storage unavailable — the in-page submission still works without it. */
  }
}

/** Trim and cap a parameter so a malformed URL cannot bloat the payload. */
function clean(value: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim().slice(0, 255)
  return trimmed || undefined
}

/**
 * Captures campaign parameters from the current URL.
 * Safe to call on every page — it only overwrites when new parameters arrive.
 */
export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  const incoming: Attribution = {}

  for (const key of UTM_KEYS) {
    const value = clean(params.get(key))
    if (value) incoming[key] = value
  }
  for (const key of CLICK_ID_KEYS) {
    const value = clean(params.get(key))
    if (value) incoming[key] = value
  }

  const stored = read()
  const hasNewCampaign = Object.keys(incoming).length > 0

  // Nothing new and something already stored: keep the earlier attribution.
  if (!hasNewCampaign && Object.keys(stored).length > 0) return stored

  const result: Attribution = hasNewCampaign ? incoming : stored

  // Landing page and referrer are recorded once, on the first page of the visit.
  if (!result.landing_page) {
    result.landing_page = window.location.origin + window.location.pathname
  }
  if (!result.referrer) {
    const ref = document.referrer
    // Ignore same-site referrers — they describe internal navigation, not source.
    if (ref && !ref.startsWith(window.location.origin)) {
      result.referrer = clean(ref)
    }
  }

  write(result)
  return result
}

/** Returns the attribution captured for this visit, without touching the URL. */
export function getAttribution(): Attribution {
  return read()
}

/**
 * Maps attribution onto HubSpot form fields.
 * The property names must exist as contact properties in the HubSpot portal
 * (Phase 2 task 0.2) — HubSpot silently drops fields it does not recognize,
 * which is why the names here and in the portal have to match exactly.
 */
export function attributionFields(): Array<{ name: string; value: string }> {
  const attr = getAttribution()
  return Object.entries(attr)
    .filter(([, value]) => Boolean(value))
    .map(([name, value]) => ({ name, value: String(value) }))
}
