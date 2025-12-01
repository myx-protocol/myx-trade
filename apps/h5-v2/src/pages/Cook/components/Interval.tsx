import { SelectPanel } from '@/components/SelectPanel'
import { Interval } from '@/request/type'

export const IntervalList = ({
  interval,
  setInterval,
}: {
  interval: Interval | undefined
  setInterval: (interval: Interval | undefined) => void
}) => {
  return (
    <ul className={'flex items-center gap-[8px] text-[12px] leading-[1] font-[500]'}>
      {[
        { label: '10m', value: Interval['10m'] },
        { label: '1h', value: Interval['1h'] },
        { label: '4h', value: Interval['4h'] },
        { label: '12h', value: Interval['12h'] },
        { label: '24h', value: Interval['24h'] },
      ].map((item) => {
        return (
          <li
            key={item.value}
            className={`rounded-[20px] px-[10px] py-[6px] transition ${interval === item.value ? 'text-deep bg-white' : 'text-secondary'}`}
            onClick={() => {
              setInterval(item.value)
            }}
          >
            {item.label}
          </li>
        )
      })}
    </ul>
  )
}
