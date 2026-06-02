import React, { memo } from 'react'
import { Trans } from '@lingui/react/macro'
import { ConfirmDialogFooter, DialogBase } from '.'
import type { DialogBaseProps } from '.'

import { Box } from '@mui/material'
import { BigWaningLine } from '@/components/Icon'

type WarningDialogContentProps = {
  tipText?: React.ReactNode | undefined
  tipTextTitle?: React.ReactNode | undefined
  icon?: React.ReactNode
}

const WarningDialogContent = ({
  tipText,
  tipTextTitle = <Trans>Are you sure to</Trans>,
  icon = <BigWaningLine size={56} />,
}: WarningDialogContentProps) => {
  return (
    <Box className={'flex flex-col items-center'}>
      <Box className={'text-secondary pt-[20px] pb-[20px]'}>{icon}</Box>
      {tipTextTitle && (
        <p className={'text-[20px] leading-[1.5] font-[700] text-white'}>{tipTextTitle}</p>
      )}
      {tipText && <div className={'mt-[12px]'}>{tipText}</div>}
    </Box>
  )
}

type WarningDialogProps = WarningDialogContentProps &
  DialogBaseProps & {
    children?: React.ReactNode
    footer?: boolean
  }

export const WarningDialog = memo(
  ({
    tipText,
    onConfirm,
    onClose,
    confirmDisabled,
    confirmText,
    tipTextTitle,
    icon,
    children,
    footer = true,
    ...args
  }: WarningDialogProps) => {
    return (
      <DialogBase
        {...args}
        onClose={onClose}
        footer={
          footer ? (
            <ConfirmDialogFooter
              confirmText={confirmText}
              confirmDisabled={confirmDisabled}
              onConfirm={onConfirm}
              onClose={onClose}
            />
          ) : null
        }
      >
        <WarningDialogContent
          icon={icon}
          tipText={tipText}
          tipTextTitle={tipTextTitle}
        ></WarningDialogContent>
        {children}
      </DialogBase>
    )
  },
)
