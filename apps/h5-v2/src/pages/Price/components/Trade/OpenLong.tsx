import { PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'

export const OpenLong = () => {
  return (
    <div className="">
      <div className="flex items-center text-[12px]">
        <p className="text-tooltip text-[#848E9C]">
          <Trans>Margin</Trans>
        </p>
        <p className="ml-[4px] font-medium text-white">0.00 USDT</p>
      </div>
      <div className="mt-[12px]">
        <PrimaryButton
          style={{
            width: '100%',
            height: '45px',
            fontSize: '13px',
            fontWeight: 'bold',
            paddingLeft: '20px',
            paddingRight: '20px',
            borderRadius: '8px',
          }}
        >
          <Trans>Open Long</Trans>
        </PrimaryButton>
      </div>
    </div>
  )
}
