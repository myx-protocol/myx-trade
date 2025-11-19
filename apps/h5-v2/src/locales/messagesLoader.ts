import type { AVAILABLE_LOCALES } from './locale'
import type { Messages } from '@lingui/core'

export const loadTranslationMessagesOnServerSide = async (
  locale: AVAILABLE_LOCALES,
): Promise<Messages> => {
  try {
    const { messages } = await import(`./messages/${locale}.po`)
    return messages
  } catch (error) {
    console.log(error)
    console.error(`No catalog for locale "${locale}"`)
    return {}
  }
}
