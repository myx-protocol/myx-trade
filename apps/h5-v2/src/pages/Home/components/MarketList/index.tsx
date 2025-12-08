import { ArrowRight } from '@/components/Icon'
import { MarketListRow } from '@/components/MarketList/MarketListRow'
import { Trans } from '@lingui/react/macro'
import clsx from 'clsx'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { FavoritesList } from './FavoritesList'
import { MarketList as MarketListComponent } from './MarketList'

type TabMarketValue = 'Favorites' | 'Hot' | 'Gainers' | 'New'

export const MarketList = () => {
  const MARKET_LIST: Array<{ value: TabMarketValue; label: ReactNode }> = useMemo(() => {
    return [
      {
        value: 'Favorites',
        label: <Trans>Favorites</Trans>,
      },
      {
        value: 'Hot',
        label: <Trans>Hot</Trans>,
      },
      {
        value: 'Gainers',
        label: <Trans>Gainers</Trans>,
      },
      {
        value: 'New',
        label: <Trans>New</Trans>,
      },
    ]
  }, [])
  const [activeMarket, setActiveMarket] = useState<TabMarketValue>('Hot')

  return (
    <div className="mt-[24px] w-full px-[16px]">
      {/* header */}
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-[1_1_0%] items-center justify-start gap-[24px] overflow-x-auto overflow-y-hidden text-[16px] font-medium text-[#848E9C]">
          {MARKET_LIST.map((item) => (
            <div
              key={item.value}
              role="button"
              className={clsx('transition-all duration-100', {
                'font-bold text-white': activeMarket === item.value,
              })}
              onClick={() => setActiveMarket(item.value)}
            >
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <Link to="/rank">
          <div role=" button" className="shrink-0">
            <ArrowRight size={18} />
          </div>
        </Link>
      </div>

      {/* list header */}
      <div className="mt-[20px] w-full text-[12px] leading-[1.2] text-[#848E9C]">
        <MarketListRow
          values={[<Trans>Name</Trans>, <Trans>Last Price</Trans>, <Trans>Change %</Trans>]}
        />
      </div>
      {activeMarket === 'Favorites' && <FavoritesList />}
      {activeMarket !== 'Favorites' && <MarketListComponent activeMarket={activeMarket} />}
    </div>
  )
}
