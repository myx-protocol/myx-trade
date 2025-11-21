import { MarketListRow } from '@/components/MarketList/MarketListRow'
import { Sort } from '@/components/Sort'
import { Trans } from '@lingui/react/macro'
import { useVirtualList } from 'ahooks'
import { useMemo, useRef } from 'react'
import { Empty } from './Empty'
import { SymbolInfo } from '@/components/MarketList/SymbolInfo'
import { formatNumber } from '@/utils/number'
import { PriceChangeBlock } from '@/components/MarketList/PriceChangeBlock'
import clsx from 'clsx'

export const List = () => {
  const mockList = useMemo(() => new Array(100).fill(0), [])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [list] = useVirtualList(mockList, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 58,
    overscan: 3,
  })
  return (
    <div className="mt-[8px] flex min-h-0 flex-[1_1_0%] flex-col">
      {/* header */}
      <MarketListRow
        className="px-[16px] py-[8px] text-[12px] leading-[1.2] text-[#6D7180]"
        values={[
          <Sort
            label={
              <p>
                <Trans>Name/Mcap</Trans>
              </p>
            }
          />,
          <Sort
            label={
              <p>
                <Trans>Last Price</Trans>
              </p>
            }
          />,
          <Sort
            label={
              <p>
                <Trans>Change %</Trans>
              </p>
            }
          />,
        ]}
      />

      {/* list */}
      {/* <Empty /> */}

      <div className="min-h-0 flex-[1_1_0%] overflow-y-auto" ref={containerRef}>
        <div ref={wrapperRef} className="min-h-0 pb-[10px]">
          {list?.map((item) => (
            <MarketListRow
              key={item.index}
              className="h-[58px] px-[16px] py-[8px] text-[12px] leading-[1.2] text-[#6D7180]"
              values={[
                <div className="flex items-center gap-[8px]">
                  <p
                    className={clsx('min-w-[20px] text-[16px] leading-[1.2] font-semibold', {
                      'text-[#848E9C]': item.index + 1 > 3,
                      'text-[#FFCA40]': item.index + 1 <= 3,
                    })}
                  >
                    {item.index + 1}
                  </p>
                  <SymbolInfo
                    symbol="BTCUSDC"
                    descriptionText={formatNumber(123123123123)}
                    baseLogoSize={28}
                    quoteTokenSize={10}
                  />
                </div>,
                <div className="flex flex-col items-end justify-center">
                  <p className="text-[14px] font-medium text-white">
                    {formatNumber(12342.21, {
                      showUnit: false,
                    })}
                  </p>
                  <p className="text-[12px] font-medium text-[#848E9C]">
                    $
                    {formatNumber(123123.23, {
                      showUnit: false,
                    })}
                  </p>
                </div>,
                <PriceChangeBlock value={0.275322} />,
              ]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
