import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  styled,
} from '@mui/material'
import React, { forwardRef, memo, type ReactNode, type Ref } from 'react'
import { CloseIcon } from '@/components/Icon'
import { isNull } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useDialogHandle } from '@/hooks/useDialogHandle.ts'
import { DialogSuspense } from '@/components/Loading'

type DialogTitleBaseProps = {
  title?: React.ReactNode | string | null
  showCloseIcon?: boolean
  onClose?: (e: any) => void
}

export type DialogFooterBaseProps = {
  footer?: React.ReactNode | null
  onClose?: DialogTitleBaseProps['onClose']
  onConfirm?: any
  confirmDisabled?: boolean
  confirmText?: React.ReactNode | string
}
export type DialogBaseProps = {
  children?: React.ReactNode
  contentClassname?: string
} & Omit<DialogProps, 'title'> &
  DialogTitleBaseProps &
  DialogFooterBaseProps

export const DialogThemeStyles = styled(Dialog)`
  .MuiDialog-container {
    padding-left: 20px;
    padding-right: 20px;

    &.MuiDialog-scrollPaper {
      .MuiDialog-paper {
        max-height: 70vh;
      }
    }
  }

  .MuiPaper-root {
    margin: 0;
    width: 100%;
    max-width: 390px;

    border-radius: 16px;
    background: ${(props) => props.theme.color.baseBg};
    border: 1px solid ${(props) => props.theme.color.borderDark};

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;

      span {
        font-size: 16px;
      }
    }

    .MuiDialogContent-root {
      padding: 20px;
      color: ${(props) => props.theme.color.TextColor00};
    }
  }
`

export const DialogTheme = forwardRef((props: DialogProps, ref: Ref<HTMLDivElement>) => {
  return <DialogThemeStyles ref={ref} disableAutoFocus disableRestoreFocus {...props} />
})
DialogTheme.displayName = 'DialogTheme'

const DialogCustomBase = styled(DialogTheme)`
  .MuiPaper-root {
    width: 390px;
    z-index: 500;

    .MuiDialogContent-root {
      padding: 20px;
    }

    @media (max-width: 768px) {
      max-width: 100%;
      width: 100%;
    }
  }
`

const DialogActionsDefault = styled(DialogActions)`
  padding: 0px;
`

export const DialogTitleTheme = memo(
  ({
    children,
    onClose,
    className,
    divider = false,
  }: {
    children: ReactNode
    divider?: boolean
    onClose?: any
    className?: string
  }) => {
    return (
      <Box
        sx={{
          position: 'relative',
          '&::after': {
            content: divider ? `""` : undefined, // 注意：外层反引号 + 内层单引号 + 双引号
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
            height: '1px',
            transformOrigin: 'center',
            transform: 'scaleY(0.5)',
            backgroundColor: 'var(--dark-border)',
          },
        }}
        color={'var(--basic-white)'}
        className={className}
        display={'flex'}
        padding={divider ? '20px 16px' : '24px 16px 12px'}
        justifyContent={'space-between'}
        alignItems={'center'}
        fontSize={'16px'}
        fontWeight={500}
        lineHeight={1}
        position={'relative'}
      >
        <Box>{children}</Box>
        {onClose ? (
          <Box className={'scale-200 transform'} onClick={onClose}>
            <Box className={'text-secondary scale-50 transform cursor-pointer'}>
              <CloseIcon size={16} />
            </Box>
          </Box>
        ) : null}
      </Box>
    )
  },
)
export const DialogNoTitleTheme = memo(({ onClose }: { onClose?: any }) => {
  return (
    <Box>
      <Box
        className={'items-centerpx-[20px] flex justify-end text-[#FFFFFF]'}
        padding={'16px 16px 0'}
      >
        {onClose ? <CloseIcon size={16} onClick={onClose} /> : null}
      </Box>
    </Box>
  )
})

DialogTitleTheme.displayName = 'DialogTitleTheme'

DialogNoTitleTheme.displayName = 'DialogNoTitleTheme'

const DialogTitleBase = ({ title, showCloseIcon = true, onClose }: DialogTitleBaseProps) => {
  if (isNull(title)) {
    return <></>
  }
  // Need to deal with the problem when the incoming title is a <Trans> component
  // Further improve applicability

  return (
    <DialogTitleTheme divider onClose={showCloseIcon ? onClose : null}>
      {title}
    </DialogTitleTheme>
  )
}

const DialogFooterBase = ({
  onClose,
  onConfirm,
  footer,
  confirmDisabled,
  confirmText,
}: DialogFooterBaseProps) => {
  const {
    loading,
    onConfirm: onConfirmHandle,
    onClose: onCloseConfirm,
  } = useDialogHandle({ onConfirm, onClose })

  if (isNull(footer)) return <Box pt={'40px'}></Box>
  if (React.isValidElement(footer)) {
    return footer
  }
  return (
    <DialogActions sx={{ padding: '0 16px' }}>
      <Button onClick={onCloseConfirm}>
        <Trans>取消</Trans>
      </Button>
      <Button disabled={confirmDisabled} loading={loading} onClick={onConfirmHandle}>
        {confirmText || <Trans>确认</Trans>}
      </Button>
    </DialogActions>
  )
}

export const DialogBase = ({
  title,
  footer,
  onConfirm,
  onClose,
  showCloseIcon,
  open,
  confirmDisabled,
  children,
  contentClassname,
}: DialogBaseProps) => {
  const onCloseBefore = (e: any) => {
    onClose?.(e)
  }
  return (
    <DialogCustomBase open={open} disableRestoreFocus disableAutoFocus>
      <DialogTitleBase title={title} showCloseIcon={showCloseIcon} onClose={onCloseBefore} />
      <DialogSuspense>
        <DialogContent className={contentClassname}>{children}</DialogContent>
        <DialogActionsDefault>
          <DialogFooterBase
            confirmDisabled={confirmDisabled}
            footer={footer}
            onClose={onCloseBefore}
            onConfirm={onConfirm}
          />
        </DialogActionsDefault>
      </DialogSuspense>
    </DialogCustomBase>
  )
}

type DialogFullLoadingButtonProps = Omit<DialogFooterBaseProps, 'confirmText'> & {
  className?: string
  children?: React.ReactNode | string
}

export const DialogFullLoadingButton = memo(
  ({
    onConfirm,
    onClose,
    confirmDisabled,
    className,
    children,
    ...loadingButtonProps
  }: DialogFullLoadingButtonProps) => {
    const { loading, onConfirm: onConfirmHandle } = useDialogHandle({ onConfirm, onClose })

    return (
      <Button
        className={`gradient`}
        disabled={confirmDisabled}
        loading={loading}
        loadingPosition={'start'}
        fullWidth
        onClick={onConfirmHandle}
        {...loadingButtonProps}
      >
        {children || <Trans>Confirm</Trans>}
      </Button>
    )
  },
)

export const ConfirmDialogFooter = memo(
  ({
    confirmText,
    ...fullButtonProps
  }: DialogFooterBaseProps & {
    className?: string
  }) => {
    return (
      <Box className={'flex-1 p-[16px]'}>
        <DialogFullLoadingButton {...fullButtonProps}>{confirmText}</DialogFullLoadingButton>
      </Box>
    )
  },
)
