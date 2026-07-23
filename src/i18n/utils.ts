import { ui, defaultLang, type Lang, type TranslationKey } from './ui'

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/')
  if (lang in ui) return lang as Lang
  return defaultLang
}

export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey): string {
    return (ui[lang][key] ?? ui[defaultLang][key]) as string
  }
}

export function getRouteFromUrl(url: URL): string {
  const [, _lang, ...rest] = url.pathname.split('/')
  return rest.join('/')
}
