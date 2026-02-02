import {
  Dialog,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  type SxProps,
  type Theme,
} from '@mui/material'
import CloseIcon from '@/components/Icon/set/Close'
import { merge } from 'lodash-es'

export const DialogBase = ({
  open,
  onClose,
  children,
  sx,
  title,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  sx?: SxProps<Theme>
  title?: string
}) => {
  return (
    <Drawer
      anchor="bottom"
      sx={merge(
        {
          '& .MuiDrawer-paper': {
            width: '100%',
            // margin: '0 16px',
            backgroundColor: '#18191F',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            padding: '16px',
            border: '1px solid #31333D',
          },
        },
        sx,
      )}
      open={open}
      onClose={onClose}
    >
      <DialogTitle
        className="flex"
        sx={{
          padding: '0',
          position: 'relative',
          minHeight: '16px',
        }}
      >
        {title && <p className="w-full text-[20px] leading-[1] font-bold text-[white]">{title}</p>}
        <IconButton
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onClose()
          }}
          sx={{
            position: 'absolute',
            right: '-8px',
            top: '-8px',
            padding: '8px',
            minWidth: '40px',
            minHeight: '40px',
            color: '#848E9C',
            cursor: 'pointer',
            zIndex: 1000,
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            '&:hover': {
              backgroundColor: 'transparent',
            },
            '&:active': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
          disableRipple
        >
          <CloseIcon size={24} />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: '0',
          paddingBottom: '20px',
        }}
      >
        {children}
      </DialogContent>
    </Drawer>
  )
}
