import { ConfirmDialogFooter, DialogBase } from '.'
import type { DialogBaseProps } from '.'
import { memo } from 'react'

export const ConfirmDialog = memo(
  ({ onConfirm, onClose, confirmDisabled, confirmText, ...args }: DialogBaseProps) => {
    return (
      <DialogBase
        {...args}
        onClose={onClose}
        footer={
          <ConfirmDialogFooter
            confirmText={confirmText}
            confirmDisabled={confirmDisabled}
            onConfirm={onConfirm}
            onClose={onClose}
          />
        }
      ></DialogBase>
    )
  },
)
