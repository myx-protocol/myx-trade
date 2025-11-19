import { SelectPanel } from '@/components/SelectPanel'
import { Interval } from '@/request/type'

export const IntervalSelector = ({
  interval,
  setInterval,
}: {
  interval: Interval | undefined
  setInterval: (interval: Interval | undefined) => void
}) => {
  return (
    <SelectPanel
      value={interval}
      options={[
        { label: '10m', value: Interval['10m'] },
        { label: '1h', value: Interval['1h'] },
        { label: '4h', value: Interval['4h'] },
        { label: '12h', value: Interval['12h'] },
        { label: '24h', value: Interval['24h'] },
      ]}
      onChange={(_value) => setInterval(_value as Interval)}
    />
  )
}
