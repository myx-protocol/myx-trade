import { t } from '@lingui/core/macro'
import dayjs from 'dayjs'
import { isNil } from 'lodash-es'
import screenfull from 'screenfull'
import scrollIntoViewIfNeed from 'scroll-into-view-if-needed'

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export const encryptionAddress = (address?: string, start = 6, end = 4) => {
  if (!address) return ''
  return `${address.slice(0, Math.max(0, start)).toLowerCase()}...${address.slice(-end).toLowerCase()}`
}

export const isNull = (a: any) => {
  if (a === '' || a === undefined || a === null) {
    return true
  }
  return false
}

export const isSafeNumber = (value?: any): boolean => {
  if (isNil(value)) return false
  if (typeof value === 'string' && value.trimStart().trimEnd() === '') return false
  const num = Number(value)
  if (isNaN(num)) return false
  return true
}

export const isEmpty = (obj: object) => {
  return Object.entries(obj).length === 0
}
const isAndroid = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('android')
}

export const scrollIntroView = (e: React.FocusEvent | { srcElement: HTMLElement | null }) => {
  if (!(isMobile() && isAndroid())) return
  const target = 'srcElement' in e ? (e.srcElement as Element) : (e.target as Element)
  setTimeout(() => {
    scrollIntoViewIfNeed(target, {
      block: 'nearest',
      scrollMode: 'always',
      // behavior: 'smooth'
    })
  }, 0)
}

export const toggleFullScreen = (element: HTMLElement) => {
  if (screenfull.isEnabled) {
    screenfull.toggle(element)
  }
}

const YEAR_IN_SECONDS = 365 * 24 * 60 * 60
const MONTH_IN_SECONDS = 30 * 24 * 60 * 60
const DAY_IN_SECONDS = 24 * 60 * 60
const HOUR_IN_SECONDS = 60 * 60
const MINUTE_IN_SECONDS = 60
const SECOND_IN_SECONDS = 1

/**
 * get relative time
 * @param timestamp  unix timestamp
 */
export const getRelativeTime = (timestamp: number) => {
  const now = dayjs().unix()
  const diff = now - timestamp
  console.log(diff, 'diff', timestamp, now)
  if (diff > YEAR_IN_SECONDS) {
    return `${Math.floor(diff / YEAR_IN_SECONDS)}${t`Y`}`
  }
  if (diff > MONTH_IN_SECONDS) {
    return `${Math.floor(diff / MONTH_IN_SECONDS)}${t`M`}`
  }
  if (diff > DAY_IN_SECONDS) {
    return `${Math.floor(diff / DAY_IN_SECONDS)}${t`D`}`
  }
  if (diff > HOUR_IN_SECONDS) {
    return `${Math.floor(diff / HOUR_IN_SECONDS)}${t`H`}`
  }
  if (diff > MINUTE_IN_SECONDS) {
    return `${Math.floor(diff / MINUTE_IN_SECONDS)}${t`m`}`
  }
  return `${Math.floor(diff / SECOND_IN_SECONDS)}${t`S`}`
}

/**
 * sleep
 * @param ms 睡眠时间
 * @returns
 */
export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export * from './url'
