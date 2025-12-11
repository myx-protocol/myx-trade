import { DontShowAgain } from '@/components/Trade/components/DontShowAgain'
import { PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { type ReactNode } from 'react'

interface DialogConfirmFooterProps {
  onConfirm: () => void
  loading?: boolean
  showDontShowAgain: boolean
  setDontShowAgain: (show: boolean) => void
  confirmText?: ReactNode
}

export const DialogConfirmFooter = ({
  onConfirm,
  loading,
  showDontShowAgain,
  confirmText = <Trans>Confirm</Trans>,
  setDontShowAgain,
}: DialogConfirmFooterProps) => {
  return (
    <div className="">
      <PrimaryButton
        style={{
          fontSize: '14px',
          lineHeight: 1,
          fontWeight: 500,
          padding: '14px',
          width: '100%',
          borderRadius: '999px',
        }}
        onClick={onConfirm}
        loading={loading}
      >
        {confirmText}
      </PrimaryButton>
      <div className="mt-[12px] flex justify-center">
        <DontShowAgain
          onChange={(show: boolean) => setDontShowAgain?.(!show)}
          checked={showDontShowAgain}
        />
      </div>
    </div>
  )
}
