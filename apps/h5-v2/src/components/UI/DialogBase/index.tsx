import { Dialog, DialogContent, DialogTitle, Drawer, type SxProps, type Theme } from '@mui/material'
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
        }}
      >
        {title && <p className="w-full text-[20px] leading-[1] font-bold text-[white]">{title}</p>}
        <span
          className="absolute right-[0] inline-flex text-[#848E9C]"
          role="button"
          onClick={onClose}
        >
          <CloseIcon size={16} />
        </span>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: '0',
        }}
      >
        {children}
      </DialogContent>
    </Drawer>
  )
}
