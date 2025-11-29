import { ArrowDown } from '@/components/Icon'
import { Tooltips } from '@/components/UI/Tooltips'
import { formatNumber } from '@/utils/number'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import Security from '@/components/Icon/set/Security'
import { Popover } from '@/components/UI/Popover'
import { SafeList } from '@/components/SafeList'
import { usePoolContext } from '@/pages/Cook/hook'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { useMarketStore } from '@/components/Trade/store/MarketStore.tsx'
import { useSecurityInfo } from '@/api'
export const MarketData = () => {
  const { baseLpDetail, pool, poolId } = usePoolContext()
  const tickerData = useMarketStore((state) => state.tickerData[poolId || ''])

  const { data: securityInfo } = useSecurityInfo({
    address: baseLpDetail?.baseToken || '',
    chainId: baseLpDetail?.chainId as number,
  })

  return (
    <div className="ml-[48px] flex flex-nowrap items-center gap-[48px] leading-[1] whitespace-nowrap">
      <div className="flex-shrink-0">
        <p className="text-[12px] font-normal text-[#9397A3]">
          <Tooltips
            title={t`The real-time ${pool?.baseSymbol || '--'} price from an oracle, used as the reference for all market calculations`}
          >
            <span className="border-b-[1px] border-dashed border-b-[#848E9C] select-none">
              <Trans>Underlying Price</Trans>
            </span>
          </Tooltips>
        </p>
        <p className="mt-[8px] text-[13px] font-medium text-white">
          $
          {tickerData?.price
            ? formatNumber(tickerData?.price, {
                showUnit: false,
              })
            : '--'}
        </p>
      </div>
      <div className="flex-shrink-0">
        <p className="text-[12px] font-normal text-[#9397A3]">
          <Tooltips title={t`The total value of all assets currently deposited in this vault.`}>
            <span className="border-b-[1px] border-dashed border-b-[#848E9C] select-none">
              <Trans>TVL</Trans>
            </span>
          </Tooltips>
        </p>
        <p className="mt-[8px] text-[13px] font-medium text-white">
          $
          {baseLpDetail?.tvl
            ? formatNumber(baseLpDetail?.tvl, {
                showUnit: false,
              })
            : '--'}
        </p>
      </div>
      <div className="flex-shrink-0">
        <p className="text-[12px] font-normal text-[#9397A3]">
          <Tooltips
            title={t`The projected annual rate of return based on recent performance. This rate is variable and not a guarantee of future results.`}
          >
            <span className="border-b-[1px] border-dashed border-b-[#848E9C] select-none">
              <Trans>APR</Trans>
            </span>
          </Tooltips>
        </p>
        <p className="mt-[8px] text-[13px] font-medium text-white">
          <RiseFallTextPrecent
            value={Number(baseLpDetail?.apr ?? 0)}
            renderOptions={{
              decimals: 2,
              showSign: true,
            }}
          />
        </p>
      </div>

      {/* safe  */}
      {securityInfo?.count && securityInfo.count > 0 && (
        <Popover
          slotProps={{
            paper: {
              sx: {
                borderRadius: '12px',
              },
            },
          }}
          trigger={
            <div className="flex-shrink-0" role="button">
              <p className="flex items-center whitespace-nowrap text-[#9397A3]">
                <span className={'text-[12px]'}>
                  <Trans>Safe</Trans>
                </span>
                <b className="ml-[4px] inline-flex rotate-[-90deg]">
                  <ArrowDown color="#9397A3" size={12} />
                </b>
              </p>
              <p className="mt-[8px] flex items-center whitespace-nowrap text-[#00E3A5]">
                <Security color="#00E3A5" size={13} />
                <span className="ml-[4px] text-[13px] leading-[1] font-[500]">
                  {securityInfo?.count}/{securityInfo?.count}
                </span>
              </p>
            </div>
          }
        >
          <SafeList
            chainId={baseLpDetail?.chainId as number}
            address={baseLpDetail?.baseToken || ''}
          />
        </Popover>
      )}
    </div>
  )
}
