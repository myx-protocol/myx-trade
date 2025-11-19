import { Trans } from '@lingui/react/macro'
import { Collapse } from '../../components/Collapse'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import { formatNumber } from '@/utils/number'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { useTradePageStore } from '../../store/TradePageStore'
import { useBaseTokenInfo } from '../../hooks/useBaseTokenInfo'
import { Copy } from '@/components/Copy'
import { truncateAddress } from '@/utils/string'
import { useMemo } from 'react'
import { getRelativeTime } from '@/utils'

export const TokenInfo = () => {
  const { symbolInfo } = useTradePageStore()
  const { data: baseTokenInfo } = useBaseTokenInfo({
    chainId: symbolInfo?.chainId,
    poolId: symbolInfo?.poolId,
  })
  const tokenCreateTimeAgo = useMemo(() => {
    if (!baseTokenInfo?.tokenCreateTime) return ''
    return getRelativeTime(baseTokenInfo?.tokenCreateTime)
  }, [baseTokenInfo?.tokenCreateTime])
  return (
    <Collapse title={<Trans>Token Info</Trans>} defaultOpen={true}>
      <div className="flex flex-col gap-[14px] text-[12px] font-medium text-white">
        <FlexRowLayout
          left={
            <div className="flex items-center gap-[4px]">
              <p className="">{baseTokenInfo?.symbolName || '--'}</p>
              <CoinIcon
                icon={baseTokenInfo?.tokenIcon || ''}
                size={14}
                symbol={baseTokenInfo?.symbolName}
              />
              <p className="rounded-[999px] bg-[#202129] px-[6px] py-[4px] text-[10px] text-[#CED1D9]">
                {tokenCreateTimeAgo}
              </p>
            </div>
          }
          right={
            <div className="flex items-center gap-[4px]">
              <p>{truncateAddress(baseTokenInfo?.baseToken || '--', 4, 4)}</p>
              <Copy content={baseTokenInfo?.baseToken || '--'} />
            </div>
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
      </div>
    </Collapse>
  )
}
