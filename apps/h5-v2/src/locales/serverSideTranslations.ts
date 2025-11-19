import { loadTranslationMessagesOnServerSide } from './messagesLoader'
import type { I18n } from '@lingui/core'
import type { AVAILABLE_LOCALES } from './locale'

export type SetupI18nProps = ConstructorParameters<typeof I18n>[0]

export const serverSideTranslations = async (
  initialLocale: AVAILABLE_LOCALES,
): Promise<SetupI18nProps> => {
  if (typeof initialLocale !== 'string') {
    throw new TypeError('Initial locale argument was not passed into serverSideTranslations')
  }

  return {
    messages: {
      [initialLocale]: (await loadTranslationMessagesOnServerSide(initialLocale)) || {},
    },

    locale: initialLocale,
  }
}
