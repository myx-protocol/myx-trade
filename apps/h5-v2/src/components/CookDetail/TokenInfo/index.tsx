import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Collapse } from '@/components/Trade/components/Collapse'
import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import { usePoolContext } from '@/pages/Cook/hook'

export const TokenInfo = () => {
  const { baseLpDetail } = usePoolContext()
  return (
    <Collapse title={<Trans>Token Info</Trans>} defaultOpen={true}>
      <div className="flex flex-col gap-[16px] text-[12px] font-normal text-white">
        <FlexRowLayout
          left={
            <p className="text-[#848E9C]">
              <Trans>Total supply</Trans>
            </p>
          }
          right={
            <p>{baseLpDetail?.totalSupply ? formatNumber(baseLpDetail?.totalSupply) : '--'}</p>
          }
        />
        <FlexRowLayout
          left={
            <p className="text-[#848E9C]">
              <Trans>Circulation</Trans>
            </p>
          }
          right={<p>{baseLpDetail?.circulation ? formatNumber(baseLpDetail.circulation) : '--'}</p>}
        />
        <FlexRowLayout
          left={
            <p className="text-[#848E9C]">
              <Trans>Market cap</Trans>
            </p>
          }
          right={<p>${baseLpDetail?.marketCap ? formatNumber(baseLpDetail.marketCap) : '--'}</p>}
        />
        <FlexRowLayout
          left={
            <p className="text-[#848E9C]">
              <Trans>FDV</Trans>
            </p>
          }
          right={<p>${baseLpDetail?.fdv ? formatNumber(baseLpDetail.fdv) : '--'}</p>}
        />
        <FlexRowLayout
          left={
            <p className="text-[#848E9C]">
              <Trans>Holders</Trans>
            </p>
          }
          right={<p>{baseLpDetail?.holders ? formatNumber(baseLpDetail.holders) : '--'}</p>}
        />
        <FlexRowLayout
          left={
            <p className="text-[#848E9C]">
              <Trans>Traders</Trans>
            </p>
          }
          right={<p>{baseLpDetail?.traders ? formatNumber(baseLpDetail.traders) : '--'}</p>}
        />
        <FlexRowLayout
          left={
            <p className="text-[#848E9C]">
              <Trans>Total Spot liq</Trans>
            </p>
          }
          right={<p>${baseLpDetail?.liquidity ? formatNumber(baseLpDetail.liquidity) : '--'}</p>}
        />
      </div>
    </Collapse>
  )
}
