/**
 * Consent state helper — Phase 2.
 *
 * The cookie banner in components/Analytics.astro owns the decision and stores
 * it under `kb_consent`. This module is the read side, so tracking code never
 * has to know how the banner works.
 *
 * WHY EVENTS ARE GATED RATHER THAN BUFFERED
 * Pushing to `dataLayer` before consent would not be harmless: GTM replays
 * everything already in the array the moment it loads, so pre-consent activity
 * would reach GA4 retroactively. That is exactly the "tracking active without
 * valid consent" risk flagged as High in the plan (p. 10). Events raised before
 * the visitor accepts are therefore dropped, not queued.
 */

const KEY = 'kb_consent'

/** Fired by Analytics.astro the moment the visitor accepts. */
export const CONSENT_EVENT = 'kb:consent-granted'

export function hasConsent(): boolean {
  try {
    return localStorage.getItem(KEY) === 'granted'
  } catch {
    // Storage blocked — treat as no consent. Failing closed is the safe default.
    return false
  }
}

/**
 * Runs `callback` once consent exists: immediately for a returning visitor who
 * already accepted, otherwise when they accept during this visit.
 */
export function onConsent(callback: () => void): void {
  if (hasConsent()) {
    callback()
    return
  }
  document.addEventListener(CONSENT_EVENT, () => callback(), { once: true })
}
