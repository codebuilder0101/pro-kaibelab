/**
 * Landing variants — Phase 2.
 *
 * Single source for every campaign landing. One template
 * (components/LandingTemplate.astro) renders all of them through the dynamic
 * route pages/[lang]/lp/[slug].astro.
 *
 * To add a variant: append one entry here. Nothing else needs to change —
 * routes, hreflang, sitemap, SEO metadata and analytics all derive from this.
 *
 * Decisions this file encodes (see doc/fase-2-decisiones.txt):
 *  - 4 variants: 2 by offer, 2 by segment, each in es + en.
 *  - `utmContent` is the agreed utm_content value used to compare variants.
 *  - `id` is the stable analytics identifier — it never changes, even if the
 *    slug or the copy does, so historical GA4 reports stay comparable.
 *
 * CONTENT STATUS: provisional. The copy below is written from the technical
 * information already published on the site (services/sectors) and is pending
 * the client's final approved content — Phase 2 task 2.1.
 */
import xenonChamber from '../assets/xenon-chamber.jpg'
import ipx8Img from '../assets/IPX8.jpg'
import hd702Img from '../assets/HD_E702.png'
import tcc1000Img from '../assets/TCC_1000.png'
import type { Lang } from '../i18n/ui'

export type LandingKind = 'offer' | 'segment'

export interface LandingBenefit {
  title: string
  desc: string
}

export interface LandingCopy {
  eyebrow: string
  headline: string
  subheadline: string
  cta: string
  formTitle: string
  benefits: [LandingBenefit, LandingBenefit, LandingBenefit]
  /** Reference standards shown under the benefits. Empty string = section hidden. */
  standards: string
  metaTitle: string
  metaDesc: string
}

export interface Landing {
  /** Stable analytics ID. Never change it — GA4 history is keyed on this. */
  id: string
  kind: LandingKind
  /** Agreed utm_content value for this variant. */
  utmContent: string
  /** URL segment after /{lang}/lp/ — one per language. */
  slug: Record<Lang, string>
  hero: ImageMetadata
  /** Preselects the matching option in the lead form's service dropdown. */
  serviceValue: Record<Lang, string>
  copy: Record<Lang, LandingCopy>
}

export const LANDINGS: Landing[] = [
  // ── OFFER ──────────────────────────────────────────────────────────────
  {
    id: 'weathering',
    kind: 'offer',
    utmContent: 'lp-intemperismo',
    slug: { es: 'intemperismo-acelerado', en: 'accelerated-weathering' },
    hero: xenonChamber,
    serviceValue: { es: 'Intemperismo Acelerado', en: 'Accelerated Weathering' },
    copy: {
      es: {
        eyebrow: 'Intemperismo Acelerado',
        headline: 'Valida la durabilidad de tus materiales con ensayos de intemperismo acelerado',
        subheadline:
          'Simulación de envejecimiento por radiación Xenón conforme a normas ASTM, ISO y SAE. Resultados confiables para validación, desarrollo y control de calidad.',
        cta: 'Solicitar cotización',
        formTitle: 'Solicita tu cotización',
        benefits: [
          {
            title: 'Normativa reconocida',
            desc: 'Ensayos conforme a ASTM G155, ISO 4892-2, SAE J2527 y referencias aplicables a tu industria.',
          },
          {
            title: 'Equipamiento de vanguardia',
            desc: 'Cámara de arco de Xenón con control de temperatura, humedad y ciclos de lluvia.',
          },
          {
            title: 'Dirección técnica especializada',
            desc: 'Criterio metodológico y acompañamiento en la interpretación de resultados.',
          },
        ],
        standards:
          'ASTM G155 · ASTM D4329 · ASTM D2565 · ASTM D4587 · ISO 4892-2 · ISO 105-B02 · SAE J2527 · SAE J2412 · AATCC 16',
        metaTitle: 'Intemperismo Acelerado · Ensayos de durabilidad',
        metaDesc:
          'Ensayos de intemperismo acelerado por radiación Xenón conforme a ASTM, ISO y SAE. Solicita una cotización a KAIBELAB.',
      },
      en: {
        eyebrow: 'Accelerated Weathering',
        headline: 'Validate the durability of your materials with accelerated weathering testing',
        subheadline:
          'Xenon-arc aging simulation per ASTM, ISO and SAE standards. Reliable results for validation, development and quality control.',
        cta: 'Request a Quote',
        formTitle: 'Request your quote',
        benefits: [
          {
            title: 'Recognized standards',
            desc: 'Testing per ASTM G155, ISO 4892-2, SAE J2527 and the references that apply to your industry.',
          },
          {
            title: 'Advanced equipment',
            desc: 'Xenon-arc chamber with controlled temperature, humidity and rain cycles.',
          },
          {
            title: 'Specialized technical direction',
            desc: 'Methodological criteria and support in interpreting your results.',
          },
        ],
        standards:
          'ASTM G155 · ASTM D4329 · ASTM D2565 · ASTM D4587 · ISO 4892-2 · ISO 105-B02 · SAE J2527 · SAE J2412 · AATCC 16',
        metaTitle: 'Accelerated Weathering · Durability Testing',
        metaDesc:
          'Accelerated weathering testing with Xenon-arc radiation per ASTM, ISO and SAE. Request a quote from KAIBELAB.',
      },
    },
  },
  {
    id: 'ipx8',
    kind: 'offer',
    utmContent: 'lp-ipx8',
    slug: { es: 'impermeabilidad-ipx8', en: 'ipx8-waterproofing' },
    hero: ipx8Img,
    serviceValue: { es: 'Medición Especializada', en: 'Specialized Measurement' },
    copy: {
      es: {
        eyebrow: 'Impermeabilidad IPX8',
        headline: 'Certifica la protección contra ingreso de agua de tus componentes',
        subheadline:
          'Ensayos de inmersión continua conforme a IEC 60529 e ISO 20653, para componentes electrónicos, luminarias, conectores y gabinetes eléctricos.',
        cta: 'Solicitar cotización',
        formTitle: 'Solicita tu cotización',
        benefits: [
          {
            title: 'Conforme a IEC 60529 e ISO 20653',
            desc: 'Validación del grado de protección contra ingreso de agua bajo las referencias técnicas aplicables.',
          },
          {
            title: 'Inmersión bajo condiciones controladas',
            desc: 'Profundidad, tiempo de exposición y temperatura definidos según el requisito de tu producto.',
          },
          {
            title: 'Evidencia técnica documentada',
            desc: 'Registro de condiciones de ensayo y resultados para tus procesos de validación y liberación.',
          },
        ],
        standards: 'IEC 60529 · ISO 20653',
        metaTitle: 'Ensayos de Impermeabilidad IPX8 · IEC 60529',
        metaDesc:
          'Ensayos de impermeabilidad IPX8 por inmersión conforme a IEC 60529 e ISO 20653 para componentes electrónicos y eléctricos. Cotiza con KAIBELAB.',
      },
      en: {
        eyebrow: 'IPX8 Waterproofing',
        headline: 'Certify the water ingress protection of your components',
        subheadline:
          'Continuous immersion testing per IEC 60529 and ISO 20653 for electronic components, luminaires, connectors and electrical enclosures.',
        cta: 'Request a Quote',
        formTitle: 'Request your quote',
        benefits: [
          {
            title: 'Per IEC 60529 and ISO 20653',
            desc: 'Validation of the water ingress protection rating under the applicable technical references.',
          },
          {
            title: 'Immersion under controlled conditions',
            desc: 'Depth, exposure time and temperature defined according to your product requirement.',
          },
          {
            title: 'Documented technical evidence',
            desc: 'Record of test conditions and results for your validation and release processes.',
          },
        ],
        standards: 'IEC 60529 · ISO 20653',
        metaTitle: 'IPX8 Waterproofing Testing · IEC 60529',
        metaDesc:
          'IPX8 immersion waterproofing testing per IEC 60529 and ISO 20653 for electronic and electrical components. Request a quote from KAIBELAB.',
      },
    },
  },

  // ── SEGMENT ────────────────────────────────────────────────────────────
  {
    id: 'automotive',
    kind: 'segment',
    utmContent: 'lp-automotriz',
    slug: { es: 'automotriz', en: 'automotive' },
    hero: hd702Img,
    serviceValue: { es: 'Evaluación de Materiales', en: 'Material Evaluation' },
    copy: {
      es: {
        eyebrow: 'Sector Automotriz',
        headline: 'Ensayos de validación para proveedores de la industria automotriz',
        subheadline:
          'Recubrimientos, pinturas, plásticos, etiquetas, empaques y componentes expuestos a condiciones climáticas extremas, conforme a estándares OEM y de cadena de suministro Tier 1–4.',
        cta: 'Solicitar cotización',
        formTitle: 'Solicita tu cotización',
        benefits: [
          {
            title: 'Alineado a requisitos OEM',
            desc: 'Ensayos conforme a SAE J2527, SAE J2412 y las referencias que exige tu cliente armador.',
          },
          {
            title: 'Cobertura de ensayos amplia',
            desc: 'Intemperismo acelerado, ciclos térmicos e impermeabilidad en un mismo laboratorio.',
          },
          {
            title: 'Respuesta para cadena de suministro',
            desc: 'Acompañamiento técnico para proveedores Tier 1 a Tier 4 en procesos de validación.',
          },
        ],
        standards: 'SAE J2527 · SAE J2412 · ASTM G155 · ASTM D2244 · ISO 4892-2 · IEC 60529',
        metaTitle: 'Ensayos para el Sector Automotriz',
        metaDesc:
          'Validación de recubrimientos, plásticos y componentes automotrices conforme a SAE, ASTM e ISO. Laboratorio para proveedores Tier 1–4. Cotiza con KAIBELAB.',
      },
      en: {
        eyebrow: 'Automotive Sector',
        headline: 'Validation testing for automotive industry suppliers',
        subheadline:
          'Coatings, paints, plastics, labels, packaging and components exposed to extreme climatic conditions, per OEM and Tier 1–4 supply chain standards.',
        cta: 'Request a Quote',
        formTitle: 'Request your quote',
        benefits: [
          {
            title: 'Aligned to OEM requirements',
            desc: 'Testing per SAE J2527, SAE J2412 and the references your OEM customer requires.',
          },
          {
            title: 'Broad testing coverage',
            desc: 'Accelerated weathering, thermal cycling and waterproofing in a single laboratory.',
          },
          {
            title: 'Built for the supply chain',
            desc: 'Technical support for Tier 1 through Tier 4 suppliers throughout validation.',
          },
        ],
        standards: 'SAE J2527 · SAE J2412 · ASTM G155 · ASTM D2244 · ISO 4892-2 · IEC 60529',
        metaTitle: 'Testing for the Automotive Sector',
        metaDesc:
          'Validation of automotive coatings, plastics and components per SAE, ASTM and ISO. Laboratory for Tier 1–4 suppliers. Request a quote from KAIBELAB.',
      },
    },
  },
  {
    id: 'electronics',
    kind: 'segment',
    utmContent: 'lp-electronica',
    slug: { es: 'electronica', en: 'electronics' },
    hero: tcc1000Img,
    serviceValue: { es: 'Medición Especializada', en: 'Specialized Measurement' },
    copy: {
      es: {
        eyebrow: 'Sector Eléctrico y Electrónico',
        headline: 'Validación ambiental para componentes eléctricos y electrónicos',
        subheadline:
          'Impermeabilidad IPX8, resistencia ambiental y ciclos térmicos para componentes electrónicos, luminarias, conectores y gabinetes eléctricos.',
        cta: 'Solicitar cotización',
        formTitle: 'Solicita tu cotización',
        benefits: [
          {
            title: 'Protección contra ingreso de agua',
            desc: 'Validación conforme a IEC 60529 e ISO 20653 para el grado de protección que declara tu producto.',
          },
          {
            title: 'Ciclos térmicos controlados',
            desc: 'Evaluación del comportamiento del componente ante variaciones de temperatura y humedad.',
          },
          {
            title: 'Durabilidad de materiales expuestos',
            desc: 'Intemperismo acelerado para carcasas, etiquetas y componentes con exposición exterior.',
          },
        ],
        standards: 'IEC 60529 · ISO 20653 · ASTM G155 · ISO 4892-2',
        metaTitle: 'Ensayos para el Sector Eléctrico y Electrónico',
        metaDesc:
          'Ensayos de impermeabilidad IPX8, ciclos térmicos y resistencia ambiental para componentes eléctricos y electrónicos. Cotiza con KAIBELAB.',
      },
      en: {
        eyebrow: 'Electrical & Electronics Sector',
        headline: 'Environmental validation for electrical and electronic components',
        subheadline:
          'IPX8 waterproofing, environmental resistance and thermal cycling for electronic components, luminaires, connectors and electrical enclosures.',
        cta: 'Request a Quote',
        formTitle: 'Request your quote',
        benefits: [
          {
            title: 'Water ingress protection',
            desc: 'Validation per IEC 60529 and ISO 20653 for the protection rating your product declares.',
          },
          {
            title: 'Controlled thermal cycling',
            desc: 'Evaluation of component behavior under temperature and humidity variation.',
          },
          {
            title: 'Durability of exposed materials',
            desc: 'Accelerated weathering for enclosures, labels and components with outdoor exposure.',
          },
        ],
        standards: 'IEC 60529 · ISO 20653 · ASTM G155 · ISO 4892-2',
        metaTitle: 'Testing for the Electrical & Electronics Sector',
        metaDesc:
          'IPX8 waterproofing, thermal cycling and environmental resistance testing for electrical and electronic components. Request a quote from KAIBELAB.',
      },
    },
  },
]

/** Look up a landing by its slug in a given language. */
export function findLandingBySlug(lang: Lang, slug: string): Landing | undefined {
  return LANDINGS.find((l) => l.slug[lang] === slug)
}

/** Path (after the language prefix) for a landing in a given language. */
export function landingPath(landing: Landing, lang: Lang): string {
  return `/lp/${landing.slug[lang]}/`
}

/**
 * Per-language paths for one landing, used for canonical + hreflang.
 * Necessary because the slug differs per language — deriving alternates from
 * the current URL would produce /en/lp/automotriz/, which does not exist.
 */
export function landingAlternates(landing: Landing): Record<Lang, string> {
  return { es: landingPath(landing, 'es'), en: landingPath(landing, 'en') }
}
