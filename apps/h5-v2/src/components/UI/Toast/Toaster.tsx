import { Toaster as HotToast, ToastBar, resolveValue, toast } from 'react-hot-toast'
import { useEffect } from 'react'
import type { Renderable, Toast } from 'react-hot-toast'
import { InfoIcon } from '@/components/UI/Icon'
import errorIcon from '@/assets/icon/commons/error.svg'
import successIcon from '@/assets/icon/commons/success.svg'

export const Toaster = () => {
  return (
    <HotToast
      toastOptions={{
        style: {
          zIndex: 9999,
          width: '379px',
          maxWidth: '379px',
          background: '#2D3138',
          borderRadius: '12px',
          height: '73px',
          minHeight: '73px',
          boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.20)',
          color: 'white',
          margin: 0,
          padding: '4px',
        },
        duration: 5000,
        position: 'top-right',
      }}
    >
      {(toaster) => {
        // console.log(toaster)
        return (
          <ToastBar toast={toaster}>
            {(content) => {
              return <ToastBarContent content={content} toaster={toaster} />
            }}
          </ToastBar>
        )
      }}
    </HotToast>
  )
}

function ToastBarContent({
  toaster,
  content,
}: {
  toaster: Toast
  content: {
    icon: Renderable
    message: Renderable
  }
}) {
  useEffect(() => {
    const handle = () => toast.dismiss(toaster.id)
    const timer = setTimeout(handle, toaster.duration)
    return () => clearTimeout(timer)
  }, [toaster.duration, toaster.id])

  return (
    <div className="flex h-[65px] w-full items-center">
      <div
        className="flex h-[65px] w-[46px] items-center justify-center"
        style={{
          background:
            toaster.type === 'success'
              ? '#00E3A50D'
              : toaster.type === 'error'
                ? '#FF4D4F0D'
                : '#1C1D24',
          borderRadius: '10px 0 0 10px',
        }}
      >
        {/* {content.icon} */}
        {toaster.type === 'success' ? (
          <div>
            <img src={successIcon} alt="success" className="w-8px h-8px" />
          </div>
        ) : toaster.type === 'error' ? (
          <div>
            <img src={errorIcon} alt="error" className="w-8px h-8px" />
          </div>
        ) : (
          <div>
            <InfoIcon className="w-16px h-16px" />
          </div>
        )}
      </div>
      {resolveValue(content.message, content)}

      <div className="text-text-secondary" onClick={() => toast.dismiss(toaster.id)}>
        <div className="w-16px h-16px bg-text-secondary" />
      </div>
    </div>
  )
}
