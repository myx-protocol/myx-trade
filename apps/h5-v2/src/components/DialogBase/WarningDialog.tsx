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
  tipTextClassName?: string
}

const WarningDialogContent = ({
  tipText,
  tipTextTitle = <Trans>Are you sure to</Trans>,
  icon = <BigWaningLine size={56} />,
  tipTextClassName = '',
}: WarningDialogContentProps) => {
  return (
    <Box className={'flex flex-col items-center'}>
      <Box className={'text-secondary pt-[20px] pb-[20px]'}>{icon}</Box>
      {tipTextTitle && <p className={'text-[16px] leading-[1.5] text-white'}>{tipTextTitle}</p>}
      {tipText && <div className={`mt-[12px] ${tipTextClassName}`}>{tipText}</div>}
    </Box>
  )
}

type WarningDialogProps = WarningDialogContentProps &
  DialogBaseProps & {
    children?: React.ReactNode
    footer?: boolean
    tipTextClassName?: string
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
    tipTextClassName = '',
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
          tipTextClassName={tipTextClassName}
        ></WarningDialogContent>
        {children}
      </DialogBase>
    )
  },
)
