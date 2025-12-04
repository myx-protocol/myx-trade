import { ArrowRight } from '@/components/Icon'
import { MarketListRow } from '@/components/MarketList/MarketListRow'
import { PriceChangeBlock } from '@/components/MarketList/PriceChangeBlock'
import { SymbolInfo } from '@/components/MarketList/SymbolInfo'
import { ChainId } from '@/config/chain'
import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import clsx from 'clsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const MARKET_LIST = ['Favorites', 'Hot', 'Gainers', 'New']

export const MarketList = () => {
  const [activeMarket, setActiveMarket] = useState('Hot')
  return (
    <div className="mt-[24px] w-full px-[16px]">
      {/* header */}
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-[1_1_0%] items-center justify-start gap-[24px] overflow-x-auto overflow-y-hidden text-[16px] font-medium text-[#848E9C]">
          {MARKET_LIST.map((item) => (
            <div
              key={item}
              role="button"
              className={clsx('transition-all duration-100', {
                'font-bold text-white': activeMarket === item,
              })}
              onClick={() => setActiveMarket(item)}
            >
              <span>{item}</span>
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
      {/* list body */}
      <div>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <MarketListRow
            className="my-[14px]"
            key={item}
            values={[
              <SymbolInfo
                symbol="BTC"
                baseTokenLogo="https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
                chainId={ChainId.ARB_TESTNET}
              />,
              <p className="text-[14px] font-medium text-[#fff]">
                {formatNumber(1123, {
                  showUnit: false,
                })}
              </p>,
              <PriceChangeBlock value={0.0} />,
            ]}
          />
        ))}
      </div>
    </div>
  )
}
