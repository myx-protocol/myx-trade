import { useBaseTokenInfo } from '@/components/Trade/hooks/useBaseTokenInfo'
import { usePriceStore } from '../../store'
import { useMemo } from 'react'
import { getChainInfo } from '@/config/chainInfo'
import { ChainId } from '@/config/chain'
import { PairLogo } from '@/components/UI/PairLogo'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Trans } from '@lingui/react/macro'
import { formatNumber } from '@/utils/number'
import { Copy } from '@/components/Copy'
import { truncateAddress } from '@/utils/string'
import dayjs from 'dayjs'

export const TokenInfo = () => {
  const { symbolInfo } = usePriceStore()
  const { data: baseTokenInfo } = useBaseTokenInfo({
    chainId: symbolInfo?.chainId,
    poolId: symbolInfo?.poolId,
  })
  const chainInfo = useMemo(() => {
    if (!symbolInfo?.chainId) return null
    return getChainInfo(symbolInfo?.chainId as ChainId)
  }, [symbolInfo?.chainId])
  return (
    <div>
      {/* logo and coin name */}
      <div className="flex items-center">
        {/* logo */}
        <PairLogo
          baseLogoSize={28}
          quoteLogoSize={10}
          baseLogo={baseTokenInfo?.tokenIcon || ''}
          quoteLogo={chainInfo?.logoUrl || ''}
          baseSymbol={baseTokenInfo?.symbolName || ''}
        />
        <p className="ml-[4px] text-[16px] font-bold text-white">
          {baseTokenInfo?.symbolName || ''}
        </p>
        <p className="ml-[6px] text-[16px] font-medium text-[#848E9C]">
          {baseTokenInfo?.symbolName || ''}
        </p>
      </div>
      {/* list */}
      <div className="mt-[20px] flex flex-col gap-[16px] text-[12px] font-medium">
        <FlexRowLayout
          left={
            <p className="font-normal text-[#9397A3]">
              <Trans>Address</Trans>
            </p>
          }
          right={
            <div className="flex items-center gap-[4px]">
              <p>{truncateAddress(baseTokenInfo?.baseToken || '--', 4, 4)}</p>
              <Copy content={baseTokenInfo?.baseToken || ''}></Copy>
            </div>
          }
        />

        <FlexRowLayout
          left={
            <p className="font-normal text-[#9397A3]">
              <Trans>Create Time</Trans>
            </p>
          }
          right={
            <p>{dayjs.unix(baseTokenInfo?.tokenCreateTime || 0).format('YYYY/MM/DD HH:mm:ss')}</p>
          }
        />

        <FlexRowLayout
          left={
            <p className="font-normal text-[#9397A3]">
              <Trans>Total supply</Trans>
            </p>
          }
          right={<p>{formatNumber(baseTokenInfo?.totalSupply || 0)}</p>}
        />

        <FlexRowLayout
          left={
            <p className="font-normal text-[#9397A3]">
              <Trans>Circulation</Trans>
            </p>
          }
          right={<p>{formatNumber(baseTokenInfo?.circulation || 0)}</p>}
        />
        <FlexRowLayout
          left={
            <p className="font-normal text-[#9397A3]">
              <Trans>Market cap</Trans>
            </p>
          }
          right={<p>$ {formatNumber(baseTokenInfo?.marketCap || 0)}</p>}
        />
        <FlexRowLayout
          left={
            <p className="font-normal text-[#9397A3]">
              <Trans>FDV</Trans>
            </p>
          }
          right={<p>$ {formatNumber(baseTokenInfo?.fdv || 0)}</p>}
        />

        <FlexRowLayout
          left={
            <p className="font-normal text-[#9397A3]">
              <Trans>Holders</Trans>
            </p>
          }
          right={
            <p>
              {formatNumber(baseTokenInfo?.holders || 0, {
                decimals: 0,
              })}
            </p>
          }
        />

        <FlexRowLayout
          left={
            <p className="font-normal text-[#9397A3]">
              <Trans>Traders</Trans>
            </p>
          }
          right={
            <p>
              {formatNumber(baseTokenInfo?.traders || 0, {
                decimals: 0,
              })}
            </p>
          }
        />

        <FlexRowLayout
          left={
            <p className="font-normal text-[#9397A3]">
              <Trans>Total Spot liq</Trans>
            </p>
          }
          right={<p>{formatNumber(baseTokenInfo?.liquidity || 0)}</p>}
        />
      </div>
    </div>
  )
}
