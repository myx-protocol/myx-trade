import { DangerButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'

export const OpenShort = () => {
  return (
    <div className="w-full flex-col justify-end">
      <div className="flex items-center justify-end text-[12px]">
        <p className="text-tooltip text-[#848E9C]">
          <Trans>Margin</Trans>
        </p>
        <p className="ml-[4px] font-medium text-white">0.00 USDT</p>
      </div>
      <div className="mt-[12px]">
        <DangerButton
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
          <Trans>Open Short</Trans>
        </DangerButton>
      </div>
    </div>
  )
}
