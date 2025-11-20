import dayjs from 'dayjs'
import durationPlugin from 'dayjs/plugin/duration'

dayjs.extend(durationPlugin)
type Duration = ReturnType<typeof dayjs.duration>

export function cutDownFormat(duration: Duration): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const totalHours = duration.days() * 24 + duration.hours()

  return `${pad(totalHours)}:${pad(duration.minutes())}:${pad(duration.seconds())}`
}
