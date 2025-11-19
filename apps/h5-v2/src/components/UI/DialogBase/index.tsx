import { Dialog, DialogContent, DialogTitle, type SxProps, type Theme } from '@mui/material'
import CloseIcon from '@/components/Icon/set/Close'
import { merge } from 'lodash-es'

export const DialogBase = ({
  open,
  onClose,
  children,
  sx,
  title,
  width,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  sx?: SxProps<Theme>
  title?: string
  width?: number
}) => {
  return (
    <Dialog
      sx={merge(
        {
          '& .MuiDialog-paper': {
            minWidth: '390px',
            backgroundColor: '#18191F',
            borderRadius: '16px',
            padding: '24px 20px',
            border: '1px solid #31333D',
            width,
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
    </Dialog>
  )
}
