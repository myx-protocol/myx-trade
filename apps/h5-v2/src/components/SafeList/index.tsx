import { Trans } from '@lingui/react/macro'
import { ArrowDown } from '../Icon'
import GoplusLogo from '@/assets/images/third/goplus-logo.svg'
import Security from '../Icon/set/Security'
import Danger from '../Icon/set/Danger'
import { useSecurityInfo } from '@/api'
import { formatNumberPercent } from '@/utils/formatNumber'
import { decimalToPercent } from '@/utils/number'
import Big from 'big.js'

interface SafeListProps {
  chainId: number
  address: string
}

export const SafeList = ({ chainId, address }: SafeListProps) => {
  const { data: securityInfo } = useSecurityInfo({ chainId, address })
  if (!securityInfo) return null
  return (
    <div className="min-w-[240px] p-[20px] leading-[1]">
      <div className="flex items-center justify-between text-white">
        <p className="text-[12px] font-medium">
          <Trans>Degen Audit</Trans>
        </p>
        <span className="inline-flex">
          <ArrowDown size={12} />
        </span>
      </div>

      {/* issues */}
      <div className="mt-[12px] flex flex-col gap-[12px] text-[12px] font-normal text-white">
        {/* open source */}
        {securityInfo.is_open_source && (
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
        {securityInfo.is_proxy && (
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
        {securityInfo.is_mintable && (
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
        {securityInfo.is_blacklisted && (
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
        {securityInfo.is_whitelisted && (
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
        {securityInfo.buy_tax && (
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
        {securityInfo.sell_tax && (
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
        {securityInfo.top10_holders_percentage && (
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
