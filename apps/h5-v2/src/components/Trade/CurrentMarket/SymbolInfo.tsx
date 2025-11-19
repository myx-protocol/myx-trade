import { PairLogo } from '@/components/UI/PairLogo'
import Dropdown from '@/components/Icon/set/Dropdown'
import { useTradePageStore } from '../store/TradePageStore'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store'
import { t } from '@lingui/core/macro'
import { MarketCapType, SearchSecondTypeEnum, SearchTypeEnum } from '@myx-trade/sdk'
import { useBaseTokenInfo } from '../hooks/useBaseTokenInfo'
import { useMemo } from 'react'
import { getChainInfo } from '@/config/chainInfo'
import type { ChainId } from '@/config/chain'
import { Copy } from '@/components/Copy'
import { truncateAddress } from '@/utils/string'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'

export const SymbolInfo = () => {
  const { symbolInfo } = useTradePageStore()
  const { open: openGlobalSearch } = useGlobalSearchStore()

  const { data: baseTokenInfo } = useBaseTokenInfo({
    chainId: symbolInfo?.chainId,
    poolId: symbolInfo?.poolId,
  })
  const chainInfo = useMemo(() => {
    if (!symbolInfo?.chainId) return null
    return getChainInfo(symbolInfo?.chainId as ChainId)
  }, [symbolInfo?.chainId])

  const { isWalletConnected } = useWalletConnection()

  const isBluechip = symbolInfo?.capType === MarketCapType.BlueChips
  return (
    <div className="flex pl-[12px] leading-[1]">
      <PairLogo
        baseLogoSize={32}
        quoteLogoSize={12}
        baseLogo={baseTokenInfo?.tokenIcon}
        quoteLogo={chainInfo?.logoUrl}
        baseSymbol={symbolInfo?.baseSymbol}
        quoteSymbol={symbolInfo?.quoteSymbol}
      />
      <div className="pl-[4px]">
        {/* top */}
        <div className="flex items-center">
          <p className="text-[16px] font-bold text-white">
            {symbolInfo?.baseSymbol || '--'}
            {symbolInfo?.quoteSymbol || '--'}
          </p>
          {/* <p className="ml-[4px] text-[14px] font-normal text-[#848E9C]">Bitcoin</p> */}
          <div
            className="ml-[4px] flex"
            role="button"
            onClick={() => {
              openGlobalSearch({
                defaultTab: SearchTypeEnum.Contract,
                secondTab: isWalletConnected
                  ? SearchSecondTypeEnum.Favorite
                  : SearchSecondTypeEnum.BlueChips,
              })
            }}
          >
            <Dropdown size={10} color="#fff" />
          </div>
        </div>
        {/* bottom */}
        <div className="mt-[2px] flex items-center gap-[4px]">
          {isBluechip && (
            <div className="flex-shrink-0 rounded-[4px] bg-[rgba(0,227,165,0.1)] px-[4px] py-[3px] text-[10px] font-normal text-[#00E3A5]">
              {t`蓝筹`}
            </div>
          )}

          {/* address */}
          <div className="text-[12px] font-normal text-[#848E9C]">
            {truncateAddress(symbolInfo?.baseToken || '')}
          </div>
          <div className="flex text-[#848E9C]" role="button">
            <Copy content={symbolInfo?.baseToken} />
          </div>
        </div>
      </div>
    </div>
  )
}
