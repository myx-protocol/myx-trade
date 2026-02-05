import { Trans } from '@lingui/react/macro'
import { ArrowDown } from '../Icon'
import GoplusLogo from '@/assets/images/third/goplus-logo.svg'
import Security from '../Icon/set/Security'
import Danger from '../Icon/set/Danger'
import { isValidSafeItem, useSecurityInfo } from '@/api'
import { decimalToPercent } from '@/utils/number'
import Big from 'big.js'
import WarningLine from '@/components/Icon/set/WarningLine.tsx'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config.ts'
import { FlexRowLayout } from '../FlexRowLayout'
import clsx from 'clsx'
import { Tooltips } from '../UI/Tooltips'
import { t } from '@lingui/core/macro'

interface SafeListProps {
  chainId: number
  address: string
  poolId: string
  className?: string
}

export const SafeList = ({ chainId, address, poolId, className = '' }: SafeListProps) => {
  const { data: securityInfo } = useSecurityInfo({ chainId, address })
  const { poolConfig } = useGetPoolConfig(poolId, chainId as number)
  if (!securityInfo || !poolConfig) return null
  return (
    <div className={className}>
      <FlexRowLayout
        left={
          <p className="text-[14px] font-medium text-white">
            <Trans>Degen Audit</Trans>
          </p>
        }
        right={
          <div
            className={clsx('flex items-center gap-[4px]', {
              'text-green': securityInfo?.is_safe,
              'text-danger': !securityInfo?.is_safe,
            })}
          >
            <Security className="shrink-0" size={13} />
            <span className="ml-[4px]">
              {securityInfo?.security_count}/{securityInfo?.count}
            </span>
          </div>
        }
      />
      {/* issues */}
      <div className="mt-[16px] flex flex-col gap-[14px] text-[12px] font-normal text-white">
        {/* risk rating */}
        <div className="flex items-center justify-between">
          <p className="text-[#848E9C]">
            <Trans>Risk Rating</Trans>
          </p>
          <div className="flex items-center gap-[4px]">
            <p className="">{poolConfig?.levelName}</p>
            <Tooltips
              title={t`Determined by factors such as asset liquidity. Higher risk assets typically entail higher manipulation costs, greater price slippage risk, and stricter risk control requirements.`}
            >
              <WarningLine size={14} color="#fff" />
            </Tooltips>
          </div>
        </div>
        {/* open source */}
        {securityInfo?.is_open_source && (
          <div className="flex items-center justify-between">
            <p className="text-[#848E9C]">
              <Trans>Open Source</Trans>
            </p>
            <div className="flex items-center gap-[6px]">
              <span>
                {securityInfo.is_open_source === '1' ? <Trans>Yes</Trans> : <Trans>No</Trans>}
              </span>
              <span className="flex">
                {securityInfo.is_open_source === '1' ? (
                  <Security color="#00E3A5" size={13} />
                ) : (
                  <Danger color="#EC605A" size={13} />
                )}
              </span>
            </div>
          </div>
        )}

        {/* proxy contract */}
        {isValidSafeItem(securityInfo?.is_proxy) && (
          <div className="flex items-center justify-between">
            <p className="text-[#848E9C]">
              <Trans>Proxy Contract</Trans>
            </p>
            <div className="flex items-center gap-[6px]">
              <span>{securityInfo.is_proxy === '1' ? <Trans>Yes</Trans> : <Trans>No</Trans>}</span>
              <span className="flex">
                {securityInfo.is_proxy === '0' ? (
                  <Security color="#00E3A5" size={13} />
                ) : (
                  <Danger color="#EC605A" size={13} />
                )}
              </span>
            </div>
          </div>
        )}

        {/* Mintable */}
        {isValidSafeItem(securityInfo?.is_mintable) && (
          <div className="flex items-center justify-between">
            <p className="text-[#848E9C]">
              <Trans>Mintable</Trans>
            </p>
            <div className="flex items-center gap-[6px]">
              <span>
                {securityInfo.is_mintable === '1' ? <Trans>Yes</Trans> : <Trans>No</Trans>}
              </span>
              <span className="flex">
                {securityInfo.is_mintable === '0' ? (
                  <Security color="#00E3A5" size={13} />
                ) : (
                  <Danger color="#EC605A" size={13} />
                )}
              </span>
            </div>
          </div>
        )}

        {/* Blacklist*/}
        {isValidSafeItem(securityInfo?.is_blacklisted) && (
          <div className="flex items-center justify-between">
            <p className="text-[#848E9C]">
              <Trans>Blacklist</Trans>
            </p>
            <div className="flex items-center gap-[6px]">
              {securityInfo.is_blacklisted === '1' ? <Trans>Yes</Trans> : <Trans>No</Trans>}
              <span>
                {securityInfo.is_blacklisted === '0' ? (
                  <Security color="#00E3A5" size={13} />
                ) : (
                  <Danger color="#EC605A" size={13} />
                )}
              </span>
            </div>
          </div>
        )}
        {/* Whitelist*/}
        {isValidSafeItem(securityInfo?.is_whitelisted) && (
          <div className="flex items-center justify-between">
            <p className="text-[#848E9C]">
              <Trans>Whitelist</Trans>
            </p>
            <div className="flex items-center gap-[6px]">
              {securityInfo.is_whitelisted === '1' ? <Trans>Yes</Trans> : <Trans>No</Trans>}
              <span>
                {securityInfo.is_whitelisted === '0' ? (
                  <Security color="#00E3A5" size={13} />
                ) : (
                  <Danger color="#EC605A" size={13} />
                )}
              </span>
            </div>
          </div>
        )}
        {/* Buy Tax */}
        {isValidSafeItem(securityInfo?.buy_tax) && (
          <div className="flex items-center justify-between">
            <p className="text-[#848E9C]">
              <Trans>Buy Tax</Trans>
            </p>
            <div className="flex items-center gap-[6px]">
              {securityInfo.buy_tax !== '0' ? <Trans>Yes</Trans> : <Trans>No</Trans>}
              <span>
                {securityInfo.buy_tax === '0' ? (
                  <Security color="#00E3A5" size={13} />
                ) : (
                  <Danger color="#EC605A" size={13} />
                )}
              </span>
            </div>
          </div>
        )}
        {/* Buy Tax */}
        {isValidSafeItem(securityInfo?.sell_tax) && (
          <div className="flex items-center justify-between">
            <p className="text-[#848E9C]">
              <Trans>Sell Tax</Trans>
            </p>
            <div className="flex items-center gap-[6px]">
              {securityInfo.sell_tax !== '0' ? <Trans>Yes</Trans> : <Trans>No</Trans>}
              <span>
                {securityInfo.sell_tax === '0' ? (
                  <Security color="#00E3A5" size={13} />
                ) : (
                  <Danger color="#EC605A" size={13} />
                )}
              </span>
            </div>
          </div>
        )}
        {/* Top 10 Holders  */}
        {isValidSafeItem(securityInfo?.top10_holders_percentage) && (
          <div className="flex items-center justify-between">
            <p className="text-[#848E9C]">
              <Trans>Top 10 Holders</Trans>
            </p>
            <div className="flex items-center gap-[6px]">
              <span>
                {decimalToPercent(securityInfo.top10_holders_percentage, {
                  decimals: 2,
                  removeTrailingZeros: true,
                  showSign: false,
                })}
              </span>
              <span>
                {Big(securityInfo.top10_holders_percentage).lt(0.5) ? (
                  <Security color="#00E3A5" size={13} />
                ) : (
                  <Danger color="#EC605A" size={13} />
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* third platform logo */}
      <div className="mt-[12px] flex justify-center">
        <img src={GoplusLogo} alt="goplus" className="h-[12px] w-[60px]" />
      </div>
    </div>
  )
}
