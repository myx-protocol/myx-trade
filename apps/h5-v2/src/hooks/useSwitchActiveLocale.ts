import type { AVAILABLE_LOCALES } from '@/locales/locale'
import useGlobalStore from '@/store/globalStore'
import { i18n } from '@lingui/core'

import { loadTranslationMessagesOnServerSide } from '@/locales/messagesLoader'

export const useSwitchActiveLocale = () => {
  const { setActiveLocale } = useGlobalStore()

  return async function (locale: AVAILABLE_LOCALES, { isReload }: { isReload?: boolean } = {}) {
    if (i18n.locale === locale) {
      return
    }

    setActiveLocale(locale)
    document.querySelector('html')?.setAttribute('lang', locale)

    if (isReload) {
      // TODO: Better interactive experience (I18n message requires real-time response)
      window.location.reload()
    } else {
      const messages = await loadTranslationMessagesOnServerSide(locale)
      i18n.loadAndActivate({ locale, messages })
    }
  }
}
