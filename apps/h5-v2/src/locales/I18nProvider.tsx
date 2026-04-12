import { i18n } from '@lingui/core'
import { I18nProvider as I18nProviderRaw } from '@lingui/react'
import { useEffect, useState } from 'react'
import useGlobalStore from '@/store/globalStore'
import { LOCALES } from '@/locales/locale.ts'
import { loadTranslationMessagesOnServerSide } from './messagesLoader'
import type { AVAILABLE_LOCALES } from '@/locales/locale.ts'

function useInitI18n() {
  const [isSuccess, setSuccess] = useState(false)
  const [isFailed, setFailed] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const { activeLocale: locale } = useGlobalStore()

  useEffect(() => {
    let cancelled = false

    setSuccess(false)
    setFailed(false)
    ;(async () => {
      try {
        setLoading(true)
        const messages = await loadTranslationMessagesOnServerSide(locale)
        if (cancelled) {
          return
        }
        i18n.loadAndActivate({ locale, messages })
        setSuccess(true)
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setFailed(true)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [locale])

  return { isSuccess, isFailed, i18n, isLoading }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { i18n, isFailed, isSuccess } = useInitI18n()

  useEffect(() => {
    if (i18n.locale) {
      const locale = LOCALES[i18n.locale as AVAILABLE_LOCALES].iso
      document.querySelector('html')?.setAttribute('lang', locale)
    }
  }, [i18n.locale])

  // failed
  if (isFailed) {
    return (
      <div className="flex h-[100vh] items-center justify-center text-[24px]">
        Language activation failed, please refresh and try again
      </div>
    )
  }

  if (!isSuccess) {
    return null
  }

  return <I18nProviderRaw i18n={i18n}>{children}</I18nProviderRaw>
}
