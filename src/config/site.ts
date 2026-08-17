/**
 * Central site configuration — Phase 1.
 *
 * Fill in the real IDs/keys here (or via the matching PUBLIC_* env vars) and
 * everything downstream (analytics, consent, HubSpot form) wires up automatically.
 *
 * Every integration is guarded: while an ID is empty the related script/behaviour
 * simply stays off, so the site builds and runs safely with placeholders.
 *
 * Env vars take precedence over the inline defaults, so production can inject them
 * at build time without editing this file:
 *   PUBLIC_GTM_ID, PUBLIC_GA4_ID, PUBLIC_CLARITY_ID,
 *   PUBLIC_HUBSPOT_PORTAL_ID, PUBLIC_HUBSPOT_FORM_GUID, PUBLIC_HUBSPOT_REGION,
 *   PUBLIC_TURNSTILE_SITEKEY
 */

const env = import.meta.env

export const SITE = {
  url: 'https://kaibelab.com',
  name: 'KAIBELAB',
  defaultLocale: 'es',
  locales: ['es', 'en'] as const,
} as const

/** Google Tag Manager — the single hub. Configure GA4, Clarity and HubSpot as tags inside GTM. */
export const GTM_ID = (env.PUBLIC_GTM_ID ?? 'GTM-KBDK9674') as string

/** GA4 — configured as a tag inside GTM. Stored here for reference / optional direct loading. */
export const GA4_ID = (env.PUBLIC_GA4_ID ?? 'G-8NKVFQJYL5') as string

/** Microsoft Clarity — configured as a tag inside GTM. Stored here for reference. */
export const CLARITY_ID = (env.PUBLIC_CLARITY_ID ?? 'xt4zt36wx9') as string

/** HubSpot lead capture via the Forms Submission API (works from a static site, no backend). */
export const HUBSPOT = {
  portalId: (env.PUBLIC_HUBSPOT_PORTAL_ID ?? '246883081') as string,
  formGuid: (env.PUBLIC_HUBSPOT_FORM_GUID ?? '140d6b1a-7595-46d7-83c7-d8bdc403a2f6') as string,
  region: (env.PUBLIC_HUBSPOT_REGION ?? 'na2') as string, // 'na1' | 'na2' | 'eu1' | ...
}

/** Cloudflare Turnstile (spam protection). Empty = disabled (honeypot still active). */
export const TURNSTILE_SITEKEY = (env.PUBLIC_TURNSTILE_SITEKEY ?? '') as string

/** Convenience flags. */
export const analyticsEnabled = Boolean(GTM_ID || GA4_ID || CLARITY_ID)
export const hubspotEnabled = Boolean(HUBSPOT.portalId && HUBSPOT.formGuid)
export const turnstileEnabled = Boolean(TURNSTILE_SITEKEY)

/** HubSpot Forms submission endpoint for the configured portal/form. */
export function hubspotEndpoint(): string {
  return `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT.portalId}/${HUBSPOT.formGuid}`
}
