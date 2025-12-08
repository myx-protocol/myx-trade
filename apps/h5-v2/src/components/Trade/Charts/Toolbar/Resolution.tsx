import clsx from 'clsx'
import { useTradePageStore } from '../../store/TradePageStore'
import { ArrowDown } from '@/components/Icon'
import { HoverCard } from '@/components/UI/HoverCard'
import { dropDownMenuOptions, resolutionDefaultList } from '../const'
import { formatResolutionToDisplayText } from '../lib/datafeed'
import { klinePubSub, tradePubSub } from '@/utils/pubsub'

const resolutionOptions: Array<{ label: string; value: string | number }> = dropDownMenuOptions.map(
  (item) => ({
    label: formatResolutionToDisplayText(item) as string,
    value: item,
  }),
)

const fixedResolutionList: Array<{ label: string; value: string | number }> =
  resolutionDefaultList.map((item) => ({
    label: formatResolutionToDisplayText(item) as string,
    value: item,
  }))

export const Resolution = () => {
  const { resolutionFixed, setResolutionFixed, resolutionActive, setResolutionActive } =
    useTradePageStore()

  const handleResolutionChange = (value: string | number) => {
    setResolutionActive(value)
    klinePubSub.emit('kline:resolution:change', value)
  }
  return (
    <div className="flex items-center gap-[18px] text-[14px] leading-[1] font-medium text-[#9397A3]">
      {fixedResolutionList.map((item) => (
        <div
          key={item.value}
          className={clsx('cursor-pointer', {
            'text-green': item.value === resolutionActive,
          })}
          role="button"
          onClick={() => handleResolutionChange(item.value)}
        >
          {item.label}
        </div>
      ))}

      {/* options */}
      <div className="flex items-center gap-[4px]">
        <p
          role="button"
          className={clsx({
            'text-green': resolutionActive === resolutionFixed,
          })}
          onClick={() => handleResolutionChange(resolutionFixed)}
        >
          {formatResolutionToDisplayText(resolutionFixed) as string}
        </p>
        <HoverCard
          trigger={
            <span role="button">
              <ArrowDown size={10} color="#9A9B9F" />
            </span>
          }
        >
          <div className="flex flex-col rounded-[4px] bg-[#202129] py-[8px] text-[14px] leading-[1] font-medium text-[#9397A3]">
            {resolutionOptions
              .filter((item) => item.value !== resolutionFixed)
              .map((item) => (
                <div
                  key={item.value}
                  className="px-[12px] py-[12px] text-center hover:bg-[#18191F]"
                  role="button"
                  onClick={() => {
                    setResolutionFixed(item.value)
                    handleResolutionChange(item.value)
                  }}
                >
                  {item.label}
                </div>
              ))}
          </div>
        </HoverCard>
      </div>
    </div>
  )
}
