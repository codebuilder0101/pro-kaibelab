/**
 * Structured data (JSON-LD) — Phase 2 · SEO.
 *
 * Builds the Organization and Service schemas required by the plan (p. 7) and
 * validated by the Rich Results Test in the phase's closing tests.
 *
 * EVERY VALUE HERE IS REAL DATA ALREADY PUBLISHED ON THE SITE. Nothing is
 * invented: search engines surface this markup to users, and fabricated
 * business details are both a trust problem and a manual-action risk.
 *
 * PENDING FROM THE CLIENT (Phase 2 task 0.7). Each field below is omitted from
 * the output while empty, so the markup stays valid until the data arrives:
 *   - streetAddress and postalCode
 *   - social profile URLs (sameAs)
 *   - the legal registered name, if it differs from KAIBEL
 */
import { SITE } from './site'
import { LANDINGS } from './landings'
import type { Lang } from '../i18n/ui'

export const ORGANIZATION = {
  name: 'KAIBELAB',
  /** KAIBELAB is the laboratory brand of KAIBEL (per the privacy notice). */
  legalName: 'KAIBEL',
  email: 'contacto@kaibelab.com',
  telephone: '+524497366489',
  addressLocality: 'Aguascalientes',
  addressCountry: 'MX',
  /** Pending: street and postal code. */
  streetAddress: '',
  postalCode: '',
  /** Pending: LinkedIn / Facebook / Instagram URLs. */
  sameAs: [] as string[],
  logo: '/images/logo.jpeg',
} as const

const DESCRIPTION: Record<Lang, string> = {
  es: 'Laboratorio de materiales y ensayos especializados. Evaluación, caracterización y análisis de materiales, polímeros, recubrimientos y componentes conforme a normativas y referencias técnicas aplicables.',
  en: 'Materials and specialized testing laboratory. Evaluation, characterization and analysis of materials, polymers, coatings and components per applicable standards and technical references.',
}

/** Drops empty values so the emitted JSON-LD never carries blank properties. */
function compact<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => {
      if (Array.isArray(v)) return v.length > 0
      return v !== '' && v !== undefined && v !== null
    }),
  )
}

/** Stable @id so other schemas can reference the same organization node. */
export const ORG_ID = `${SITE.url}/#organization`

export function organizationSchema(lang: Lang): Record<string, unknown> {
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: ORGANIZATION.name,
    legalName: ORGANIZATION.legalName,
    url: `${SITE.url}/${lang}/`,
    logo: new URL(ORGANIZATION.logo, SITE.url).href,
    image: new URL(ORGANIZATION.logo, SITE.url).href,
    description: DESCRIPTION[lang],
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.telephone,
    address: compact({
      '@type': 'PostalAddress',
      streetAddress: ORGANIZATION.streetAddress,
      postalCode: ORGANIZATION.postalCode,
      addressLocality: ORGANIZATION.addressLocality,
      addressCountry: ORGANIZATION.addressCountry,
    }),
    sameAs: ORGANIZATION.sameAs,
    contactPoint: compact({
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: ORGANIZATION.email,
      telephone: ORGANIZATION.telephone,
      availableLanguage: ['es', 'en'],
    }),
  })
}

export function websiteSchema(lang: Lang): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: `${SITE.url}/${lang}/`,
    name: ORGANIZATION.name,
    inLanguage: lang,
    publisher: { '@id': ORG_ID },
  }
}

/** Service schema for one campaign landing. */
export function landingServiceSchema(
  landingId: string,
  lang: Lang,
): Record<string, unknown> | null {
  const landing = LANDINGS.find((l) => l.id === landingId)
  if (!landing) return null

  const copy = landing.copy[lang]
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: copy.eyebrow,
    serviceType: copy.eyebrow,
    description: copy.metaDesc,
    url: `${SITE.url}/${lang}/lp/${landing.slug[lang]}/`,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'México' },
    inLanguage: lang,
  })
}

/** Service schemas for every offer landing — used on the services page. */
export function servicesSchema(lang: Lang): Record<string, unknown>[] {
  return LANDINGS.filter((l) => l.kind === 'offer')
    .map((l) => landingServiceSchema(l.id, lang))
    .filter((s): s is Record<string, unknown> => s !== null)
}
