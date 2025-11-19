import { Toaster as HotToast, ToastBar, resolveValue, toast } from 'react-hot-toast'
import { useEffect } from 'react'
import type { Renderable, Toast } from 'react-hot-toast'
import { SuccessIcon, InfoIcon, WrongIcon } from '@/components/UI/Icon'

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
          height: '70px',
          minHeight: '70px',
          boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.20)',
          color: 'white',
          margin: 0,
        },
        className: 'p-4px',
        // success: {
        //   icon: <div className='w-36px h-36px bg-brand' />,
        // },
        // error: {
        //   icon: <div className='w-36px h-36px bg-trade-sell' />,
        // },

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
    <div className="flex h-[70px] w-full items-center py-[4px]">
      <div
        className="flex h-[70px] w-[48px] items-center justify-center"
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
          <SuccessIcon className="w-28px h-28px" />
        ) : toaster.type === 'error' ? (
          <WrongIcon className="w-28px h-28px" />
        ) : (
          <InfoIcon className="w-28px h-28px" />
        )}
      </div>
      {/* <div style={{ padding: '4px 8px' }}>{content.message}</div> */}
      {resolveValue(content.message, content)}

      <div className="text-text-secondary" onClick={() => toast.dismiss(toaster.id)}>
        <div className="w-16px h-16px bg-text-secondary" />
      </div>
    </div>
  )
}
