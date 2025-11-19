// import type { Locale as RainbowLocale } from '@rainbow-me/rainbowkit'

export type Lang = {
  label: string
  shortLabel: string
  locale: AVAILABLE_LOCALES
  iso: string
  // rainbow: RainbowLocale
  tv: string
  boss: string
  okx: string
}
export enum AVAILABLE_LOCALES {
  EN = 'en',
  ZH_CN = 'zh-CN',
  KO = 'ko-KR',
}

export const LOCALES: Record<AVAILABLE_LOCALES, Lang> = {
  [AVAILABLE_LOCALES.ZH_CN]: {
    label: '简体中文',
    shortLabel: 'CN',
    locale: AVAILABLE_LOCALES.ZH_CN,
    iso: 'zh-CN',
    // rainbow: 'zh-CN',
    tv: 'zh',
    boss: 'zh-CN',
    okx: 'zh_cn',
  },
  [AVAILABLE_LOCALES.EN]: {
    label: 'English',
    shortLabel: 'EN',
    locale: AVAILABLE_LOCALES.EN,
    iso: 'en-US',
    // rainbow: 'en-US',
    tv: 'en',
    boss: 'en',
    okx: 'en_us',
  },
  [AVAILABLE_LOCALES.KO]: {
    label: '한국어',
    shortLabel: 'KO',
    locale: AVAILABLE_LOCALES.KO,
    iso: 'ko-KR',
    // rainbow: 'ko-KR',
    tv: 'ko',
    boss: 'ko-KR',
    okx: 'ko_kr',
  },
}

export const DEFAULT_LOCALE = AVAILABLE_LOCALES.EN

export const Locales: AVAILABLE_LOCALES[] = Object.keys(LOCALES) as AVAILABLE_LOCALES[]
export const i18nConfig: {
  defaultLocale: AVAILABLE_LOCALES
  locales: readonly AVAILABLE_LOCALES[]
} = {
  defaultLocale: DEFAULT_LOCALE,
  locales: Locales,
} as const

export type Locale = (typeof i18nConfig)['locales'][number]

export function isAcceptedLocale(locale: unknown): locale is AVAILABLE_LOCALES {
  if (typeof locale !== 'string') {
    return false
  }

  // TODO More elegant to determine whether it is the value of the enumeration
  return Locales.includes(locale as any)
}

export function getSupportLocale(lang: unknown) {
  return isAcceptedLocale(lang) ? (lang as AVAILABLE_LOCALES) : i18nConfig.defaultLocale
}

interface LocaleOptionType {
  label: string
  locale: AVAILABLE_LOCALES
  shortLabel: string
}

export const LOCALE_OPTIONS: LocaleOptionType[] = Locales.map((k) => {
  return {
    label: LOCALES[k].label,
    locale: LOCALES[k].locale,
    shortLabel: LOCALES[k].shortLabel,
  }
})

export const getLocaleAssetPath = (path = '', fileName: string, locale = DEFAULT_LOCALE) => {
  const filePath = new URL(`../assets/images/${path}/${locale}/${fileName}`, import.meta.url).href
  return filePath
}
