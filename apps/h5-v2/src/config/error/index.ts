import { MYXSDKErrorMapping, type SDKError } from './MYX_SDK_ERRORS.tsx'
import { toast } from '@/components/UI/Toast'
import { CommonErrorMapping } from '@/config/error/CommonErrorMapping.tsx'
import { t } from '@lingui/core/macro'

export const isSDKError = (err: any): err is SDKError => {
  return err && err.error
}

/**
 * Detect user-initiated rejection across wallets (MetaMask, Bitget, OKX, WalletConnect, Coinbase, etc.)
 * - code 4001: EIP-1193 standard rejection code
 * - exact: Bitget sends bare "cancel" / "cancelled"
 * - substrings: covers all major wallet phrasing variations
 */
const isUserRejection = (msg: string, code?: number | string): boolean => {
  if (code === 4001 || code === '4001') return true
  const lower = msg.toLowerCase().trim()
  if (lower === 'cancel' || lower === 'cancelled' || lower === 'rejected') return true
  return (
    lower.includes('user reject') || // "User rejected", "user rejected the request"
    lower.includes('user denied') || // "User denied transaction signature"
    lower.includes('user cancelled') || // WalletConnect v2
    lower.includes('user canceled') ||
    lower.includes('rejected by user') ||
    lower.includes('user declined') ||
    lower.includes('user refused') ||
    lower.includes('denied by user') ||
    lower.includes('user abort') ||
    lower.includes('transaction was rejected') ||
    lower.includes('request rejected') ||
    lower.includes('signature request cancelled') // Coinbase
  )
}

export const showErrorToast = (error?: any) => {
  // string
  if (typeof error === 'string') {
    if (CommonErrorMapping[error]) {
      toast.error({ title: CommonErrorMapping[error] })
      return
    }
    if (isUserRejection(error)) {
      toast.error({ title: t`User Rejected` })
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
    if (isUserRejection(message ?? '', code)) {
      toast.error({ title: t`User Rejected` })
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
    // code 4001 check (direct or nested in cause)
    const code = error?.code ?? error?.cause?.code
    if (isUserRejection('', code)) {
      toast.error({ title: t`User Rejected` })
      return
    }

    // viem EstimateGasExecutionError / ContractFunctionExecutionError:
    // the revert selector lives in error.cause.data (or nested cause chain)
    const revertData: string = error?.cause?.data ?? error?.data ?? error?.cause?.cause?.data ?? ''
    if (revertData && typeof revertData === 'string') {
      const selector = revertData.slice(0, 10).toLowerCase()
      if (MYXSDKErrorMapping[selector]) {
        toast.error({ title: MYXSDKErrorMapping[selector] })
        return
      }
    }

    // message / details check — viem puts the raw wallet message in shortMessage / details
    const msg: string =
      error?.shortMessage || error?.details || error?.cause?.message || error?.message || ''
    if (msg && CommonErrorMapping[msg]) {
      toast.error({ title: CommonErrorMapping[msg] })
      return
    }
    if (msg && isUserRejection(msg, code)) {
      toast.error({ title: t`User Rejected` })
      return
    }
    toast.error({
      title: msg || String(code ?? '') || String(error),
    })
  }
}
