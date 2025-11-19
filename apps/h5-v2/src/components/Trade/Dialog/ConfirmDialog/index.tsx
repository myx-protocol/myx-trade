import { DialogTheme } from '@/components/DialogBase'
import { CloseIcon } from '@/components/Icon'
import type { ReactNode } from 'react'
import WarningLineIcon from '@/components/Icon/set/WarningLine'
import { Trans } from '@lingui/react/macro'
import { PrimaryButton } from '@/components/UI/Button'

interface ConfirmDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  message: ReactNode
}

export const ConfirmDialog = ({ open, onCancel, onConfirm, message }: ConfirmDialogProps) => {
  return (
    <DialogTheme open={open} onClose={onCancel}>
      <div className="flex items-center justify-end p-[20px]">
        <span role="button" onClick={onCancel}>
          <CloseIcon size={16} color="#fff" />
        </span>
      </div>
      {/* body */}
      <div className="mt-[20px] p-[20px]">
        <div className="flex flex-col items-center leading-[1]">
          <WarningLineIcon size={56} color="#848E9C" />
          <p className="mt-[20px] text-center text-[16px] font-medium text-white">
            <Trans>Are you sure to</Trans>
          </p>
          {!!message && (
            <div className="text-warning mt-[8px] text-center text-[16px] font-medium">
              {message}
            </div>
          )}
        </div>
        <div className="mt-[40px]">
          <PrimaryButton
            onClick={onConfirm}
            style={{
              width: '100%',
              borderRadius: '1000px',
              fontSize: '14px',
              padding: '14px',
              lineHeight: 1,
            }}
          >
            <Trans>Confirm</Trans>
          </PrimaryButton>
        </div>
      </div>
    </DialogTheme>
  )
}
