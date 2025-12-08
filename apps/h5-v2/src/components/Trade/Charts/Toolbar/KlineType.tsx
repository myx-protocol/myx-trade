import { Trans } from '@lingui/react/macro'
import { KlineTypeEnum } from '../type'
import IconChartType from '@/components/Icon/set/TradingViewChartType'
import IconBars from '@/components/Icon/set/IconBars'
import IconHCandle from '@/components/Icon/set/IconHCandle'
import IconCandle from '@/components/Icon/set/IconCandle'
import IconLine from '@/components/Icon/set/IconLine'
import IconArea from '@/components/Icon/set/IconArea'
import IconBaseLine from '@/components/Icon/set/IconBaseLine'
import { HoverCard } from '@/components/UI/HoverCard'
import { useTradePageStore } from '../../store/TradePageStore'
import clsx from 'clsx'
import { klinePubSub, tradePubSub } from '@/utils/pubsub'

const klineTypeOptions = [
  {
    label: <Trans>美国线</Trans>,
    value: KlineTypeEnum.Bar,
    Icon: IconBars,
  },
  {
    label: <Trans>空心蜡烛</Trans>,
    value: KlineTypeEnum.HollowCandle,
    Icon: IconHCandle,
  },
  {
    label: <Trans>实心蜡烛</Trans>,
    value: KlineTypeEnum.Candle,
    Icon: IconCandle,
  },
  {
    label: <Trans>线性图</Trans>,
    value: KlineTypeEnum.Line,
    Icon: IconLine,
  },
  {
    label: <Trans>面积图</Trans>,
    value: KlineTypeEnum.Area,
    Icon: IconArea,
  },
  {
    label: <Trans>基准线</Trans>,
    value: KlineTypeEnum.Baseline,
    Icon: IconBaseLine,
  },
]

export const KlineType = () => {
  const { klineType, setKlineType } = useTradePageStore()
  const handleKlineTypeChange = (value: KlineTypeEnum) => {
    setKlineType(value)
    klinePubSub.emit('kline:type:change', value)
  }
  return (
    <HoverCard
      trigger={
        <div role="button" className="text-[#9397A3] hover:text-white">
          <IconChartType size={16} />
        </div>
      }
    >
      <div className="rounded-[4px] bg-[#202129] py-[8px]">
        {klineTypeOptions.map((option) => (
          <div
            key={option.value}
            role="button"
            className={clsx(
              'hover:text-green flex items-center gap-[8px] px-[12px] py-[12px] text-[14px] leading-[1] text-[#9397A3] hover:bg-[rgba(0,227,165,0.20)]',
              {
                'text-green': klineType === option.value,
              },
            )}
            onClick={() => handleKlineTypeChange(option.value)}
          >
            <option.Icon size={16} />
            {option.label}
          </div>
        ))}
      </div>
    </HoverCard>
  )
}
