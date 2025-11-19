import React, { memo } from 'react'
import { Trans } from '@lingui/react/macro'
import { ConfirmDialogFooter, DialogBase } from '.'
import type { DialogBaseProps } from '.'

import { Box } from '@mui/material'
import WarningLine from '@/components/Icon/set/WarningLine.tsx'

type WarningDialogContentProps = {
  tipText?: React.ReactNode | undefined
  tipTextTitle?: React.ReactNode | undefined
  icon?: React.ReactNode
}

const WarningDialogContent = ({
  tipText,
  tipTextTitle = <Trans>Are you sure to</Trans>,
  icon = <WarningLine size={56} />,
}: WarningDialogContentProps) => {
  return (
    <Box className={'flex flex-col items-center'}>
      <Box className={'text-secondary pt-[20px] pb-[20px]'}>{icon}</Box>
      {tipTextTitle && <p className={'text-basic-white leading-[1.5]'}>{tipTextTitle}</p>}
      {tipText && <p className={'text-warning mt-[8px] leading-[1]'}>{tipText}</p>}
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
