import { DontShowAgain } from '@/components/Trade/components/DontShowAgain'
import { PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { useState, type ReactNode } from 'react'

interface OnConfirmData {
  dontShowAgain?: boolean
}

interface DialogConfirmFooterProps {
  onConfirm: (data: OnConfirmData) => void
  showDontShowAgain?: boolean
  confirmText?: ReactNode
}

export const DialogConfirmFooter = ({
  onConfirm,
  showDontShowAgain,
  confirmText = <Trans>Confirm</Trans>,
}: DialogConfirmFooterProps) => {
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const handleConfirm = () => {
    onConfirm({ dontShowAgain })
  }
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
        onClick={handleConfirm}
      >
        {confirmText}
      </PrimaryButton>
      <div className="mt-[12px] flex justify-center">
        {showDontShowAgain && <DontShowAgain onChange={setDontShowAgain} checked={dontShowAgain} />}
      </div>
    </div>
  )
}
