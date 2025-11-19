import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { Trans } from '@lingui/react/macro'

interface HelperDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const HelperDialog = ({ isOpen, onClose }: HelperDialogProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#18191F',
          border: '1px solid #31333D',
          borderRadius: '8px',
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between p-4 border-b border-gray-600">
        <span className="text-white text-lg font-medium">
          <Trans>Beginner's Guide</Trans>
        </span>
        <IconButton onClick={onClose} className="text-gray-400 hover:text-white" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="p-6">
        <div className="text-white">
          <p className="text-base mb-4">
            <Trans>Welcome to MYX! This is a placeholder for the beginner's guide.</Trans>
          </p>
          <p className="text-sm text-gray-300">
            <Trans>More detailed help content will be available soon.</Trans>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
