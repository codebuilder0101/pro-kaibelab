// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://kaibelab.com',

  // Phase 2: /[lang]/campaign was published in Phase 1 and is now served by the
  // variant system. Redirect rather than delete, so any link already handed out
  // or indexed keeps working and passes its authority to the new canonical URL.
  redirects: {
    // Trailing slashes match the canonical URLs, so the browser lands directly
    // instead of taking a second hop through nginx's slash redirect.
    '/es/campaign': '/es/lp/intemperismo-acelerado/',
    '/en/campaign': '/en/lp/accelerated-weathering/',
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: { es: 'es-MX', en: 'en-US' },
      },
      // Keep noindex/legal drafts and redirect stubs out of the sitemap.
      filter: (page) => !page.includes('/privacy') && !page.includes('/campaign'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
})
