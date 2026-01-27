import { MYXSDKErrorMapping, type SDKError } from './MYX_SDK_ERRORS.tsx'
import { toast } from '@/components/UI/Toast'
import { CommonErrorMapping } from '@/config/error/CommonErrorMapping.tsx'

const isSDKError = (err: any): err is SDKError => {
  return err && err.error
}

export const showErrorToast = (error?: any) => {
  // string
  if (typeof error === 'string') {
    if (CommonErrorMapping[error]) {
      toast.error({ title: CommonErrorMapping[error] })
      return
    }
    toast.error({ title: error })
    return
  }
  if ('error' in error && typeof error.error === 'string') {
    if (error.error && CommonErrorMapping[error.error]) {
      toast.error({ title: CommonErrorMapping[error.error] })
      return
    }
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

    if (message && CommonErrorMapping[message]) {
      toast.error({ title: CommonErrorMapping[message] })
      return
    }
    toast.error({ title: message || code })
    return
  }

  // fallback
  console.error(error, JSON.stringify(error))
  if (error) {
    if (error?.name && CommonErrorMapping[error.name]) {
      toast.error({ title: CommonErrorMapping[error.name] })
      return
    }
    toast.error({
      title: (error as any)?.message || (error as any)?.code || String(error),
    })
  }
}
