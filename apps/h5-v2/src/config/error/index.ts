import { MYXSDKErrorMapping, type SDKError } from './MYX_SDK_ERRORS.tsx'
import { toast } from '@/components/UI/Toast'

const isSDKError = (err: any): err is SDKError => {
  return (
    err && typeof err === 'object' && err.error === 'object' && typeof err.error.code === 'string'
  )
}

export const showErrorToast = (error?: any) => {
  // string
  if (typeof error === 'string') {
    toast.error({ title: error })
    return
  }
  if ('error' in error && typeof error.error === 'string') {
    toast.error({ title: error.error })
    return
  }
  console.error(error)
  // SDKError
  if (isSDKError(error)) {
    const { code, message } = error.error
    if (MYXSDKErrorMapping[code as keyof typeof MYXSDKErrorMapping]) {
      toast.error({ title: MYXSDKErrorMapping[code as keyof typeof MYXSDKErrorMapping] })
      return
    }
    toast.error({ title: message || code })
    return
  }

  // fallback
  console.error(error)
  if (error) {
    toast.error({
      title: (error as any)?.message || (error as any)?.code || String(error),
    })
  }
}
