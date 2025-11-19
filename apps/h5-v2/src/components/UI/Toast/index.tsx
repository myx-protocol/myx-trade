/* eslint-disable react-refresh/only-export-components */
import { toast as hotToast } from 'react-hot-toast'
import { t } from '@lingui/core/macro'

export type ToastMessage = React.ReactNode
export type ToastOptions = {
  title?: React.ReactNode
  duration?: number
  type?: 'success' | 'error' | 'info'
  content?: string | React.ReactNode
}

const ToastContent = ({
  title,
  content,
}: {
  title: React.ReactNode
  type: 'success' | 'error' | 'info'
  content?: string | React.ReactNode
}) => {
  return (
    <div className="flex h-[70px] w-full items-center">
      <div className="flex flex-1 flex-col justify-center gap-[4px] py-[4px]">
        <div className="text-title-base text-[14px] text-white">{title}</div>
        {content && <div className="overflow-y-auto text-[14px] text-white">{content}</div>}
      </div>
    </div>
  )
}

export const toast = ({ title = t`info`, type = 'info', content }: ToastOptions = {}) => {
  hotToast.dismiss()

  hotToast(<ToastContent title={title} type={type} content={content} />, {
    style: {
      width: '379px',
      padding: '4px 8px',
      height: '77px',
    },
  })
}

toast.success = ({ title = t`success`, type = 'success', content }: ToastOptions = {}) => {
  hotToast.dismiss()
  hotToast.success(<ToastContent title={title} type={type} content={content} />, {
    style: {
      width: '379px',
      padding: '4px 8px',
      height: '77px',
    },
  })
}

toast.error = ({
  title = t`failed`,
  duration = 5000,
  type = 'error',
  content,
}: ToastOptions = {}) => {
  hotToast.dismiss()
  hotToast.error(<ToastContent title={title} type={type} content={content} />, {
    style: {
      width: '379px',
      padding: '4px 8px 4px 4px',
      height: '77px',
    },
    duration,
  })
}
