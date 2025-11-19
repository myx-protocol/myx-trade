import dayjs from 'dayjs'

export function getTimeDiff(d: number, empty = '--'): string {
  if (!d) return empty || ''

  // 兼容秒级时间戳
  const date = typeof d === 'number' && String(d).length === 10 ? dayjs.unix(d) : dayjs(d)
  const now = dayjs()

  const diffSeconds = now.diff(date, 'second')
  const diffMinutes = now.diff(date, 'minute')
  const diffHours = now.diff(date, 'hour')
  const diffDays = now.diff(date, 'day')

  if (diffSeconds < 60) return 'now'
  if (diffMinutes < 60) return `${diffMinutes}min`
  if (diffHours < 24) return `${diffHours}h`
  return `${diffDays}d`
}
