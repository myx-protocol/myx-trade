import { styled, SwipeableDrawer, Box, type SwipeableDrawerProps } from '@mui/material'
import { CloseIcon } from '@/components/Icon'
import type { ReactNode } from 'react'

export const StyledDrawer = styled(SwipeableDrawer)`
  .MuiPaper-root {
    background-color: var(--base-bg);
    padding-bottom: 12px;
    padding-top: 12px;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }
  .drawer-header {
    display: flex;
    justify-content: space-between;
    padding: 20px 0 12px 0;
  }
`
const Puller = styled('div')(({ theme }) => ({
  width: 40,
  height: 4,
  backgroundColor: 'var(--placeholder-text)',
  borderRadius: 3,
  position: 'absolute',
  top: 4,
  left: 'calc(50% - 20px)',
  // ...theme.applyStyles('dark', {
  //   backgroundColor: grey[900],
  // }),
}))
export type TDrawerProps = SwipeableDrawerProps & { title?: ReactNode; children: ReactNode }

export const Drawer = ({
  open,
  onOpen,
  onClose,
  children,
  title,
  anchor = 'bottom',
}: TDrawerProps) => {
  const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  return (
    <StyledDrawer
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      anchor={anchor}
    >
      <Puller onClick={(e) => onClose(e)} />

      <Box className={'bg-base-bg'} display={'flex'} flexDirection={'column'} gap={'24px'}>
        {title && (
          <Box className={'drawer-header'}>
            <span className={'text-basic-white leading-[1] font-[20px] font-[500]'}>{title}</span>
            <Box
              width={'16px'}
              height={'16px'}
              onClick={(e) => onClose?.(e)}
              className={'text-secondary'}
            >
              <CloseIcon size={16} />
            </Box>
          </Box>
        )}

        <Box className={'drawer-body'}>{children}</Box>
      </Box>
    </StyledDrawer>
  )
}
