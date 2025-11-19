import { Trans } from '@lingui/react/macro'
import { ArrowDown } from '../Icon'
import GoplusLogo from '@/assets/images/third/goplus-logo.svg'
import Security from '../Icon/set/Security'
import Danger from '../Icon/set/Danger'

export const SafeList = () => {
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
        <div className="flex items-center justify-between">
          <p className="text-[#848E9C]">
            <Trans>NoMint</Trans>
          </p>
          <div className="flex items-center gap-[6px]">
            <span>
              <Trans>Yes</Trans>
            </span>
            <span className="flex">
              <Security color="#00E3A5" size={13} />
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[#848E9C]">
            <Trans>Blacklist</Trans>
          </p>
          <div className="flex items-center gap-[6px]">
            <span>
              <Trans>Yes</Trans>
            </span>
            <span className="flex">
              <Security color="#00E3A5" size={13} />
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[#848E9C]">
            <Trans>Burnt</Trans>
          </p>
          <div className="flex items-center gap-[6px]">
            <span>
              <Trans>Yes</Trans>
            </span>
            <span className="flex">
              <Security color="#00E3A5" size={13} />
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[#848E9C]">
            <Trans>Top10</Trans>
          </p>
          <div className="flex items-center gap-[6px]">
            <span>
              <Trans>No</Trans>
            </span>
            <span className="flex">
              <Danger color="#EC605A" size={13} />
            </span>
          </div>
        </div>
      </div>

      {/* third platform logo */}
      <div className="mt-[12px] flex justify-center">
        <img src={GoplusLogo} alt="goplus" className="h-[12px] w-[60px]" />
      </div>
    </div>
  )
}
