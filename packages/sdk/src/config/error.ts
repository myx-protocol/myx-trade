import {ErrorType, ErrorDecoder} from 'ethers-decode-error'
import {customErrorMapping} from './customErrorMap.js'
const errorDecoder = ErrorDecoder.create();


export enum ErrorCode {
  Invalid_Chain_ID = 1,
  Invalid_TOKEN_ADDRESS,
  Insufficient_Balance = 3,
  Insufficient_Amount_Of_Approved,
  USER_REJECTED_REQUEST = 4001,
  Invalid_Base,
  Invalid_slippage,
  Invalid_Amount,
  Invalid_Pool_State,
  Invalid_Params,
  Invalid_Amount_Withdrawable_Lp_Amount
}

export const Errors = {
  [ErrorCode.Invalid_Chain_ID]: `Invalid Chain`,
  [ErrorCode.Invalid_TOKEN_ADDRESS]: `Invalid Token Address`,
  [ErrorCode.USER_REJECTED_REQUEST]: `User Rejected`,
  [ErrorCode.Insufficient_Balance]: `Insufficient Balance`,
  [ErrorCode.Insufficient_Amount_Of_Approved]: `Insufficient Amount Of Approved`,
  [ErrorCode.Invalid_Base]: `Invalid Base Token Address`,
  [ErrorCode.Invalid_slippage]: `Invalid Slippage`,
  [ErrorCode.Invalid_Amount]: `Invalid Amount`,
  [ErrorCode.Invalid_Pool_State]: `Invalid Pool State`,
  [ErrorCode.Invalid_Params]: `Invalid Params`,
  [ErrorCode.Invalid_Amount_Withdrawable_Lp_Amount]: `Invalid Amount Withdrawable LP Amount`,
}
function isUserRejected(error: any): boolean {
  let err = error
  
  while (err) {
    // 1️⃣ viem 标准
    if (err.name === 'UserRejectedRequestError') return true
    
    // 2️⃣ EIP-1193 标准
    if (err.code === ErrorCode.USER_REJECTED_REQUEST) return true
    
    // 3️⃣ message 兜底（兼容各种钱包）
    const msg = (err.message || '').toLowerCase()
    if (
      msg.includes('user rejected') ||
      msg.includes('user denied') ||
      msg.includes('rejected the request')
    ) {
      return true
    }
    
    err = err.cause
  }
  
  return false
}

function extractMessage(err: any): string {
  if (!err) return 'Unknown error'
  
  // 🔥 1️⃣ viem custom error（最关键）
  if (err?.data?.errorName) {
    return `${err.data.errorName}()`
  }
  
  // 有些版本在 metaMessages
  if (Array.isArray(err?.metaMessages)) {
    const match = err.metaMessages.find((m: string) =>
      m.includes('Error:')
    )
    if (match) {
      return match.replace('Error: ', '').trim()
    }
  }
  
  // 2️⃣ 递归 cause
  if (err?.cause) {
    return extractMessage(err.cause)
  }
  
  // 3️⃣ reason（部分 RPC）
  if (err?.reason) {
    return err.reason
  }
  
  // 4️⃣ shortMessage（兜底）
  if (err?.shortMessage) {
    return err.shortMessage
  }
  
  // 5️⃣ message（最后兜底）
  if (err?.message) {
    return err.message
  }
  
  return String(err)
}

export async function getErrorTextFormError(error: any) {
  if (typeof error === "string") {
    return { error }
  }
  
  if (isUserRejected(error)) {
    return { error: Errors[ErrorCode.USER_REJECTED_REQUEST] }
  }
  
  const message = extractMessage(error)
  
  return {
    error: {
      code: error?.code || error?.name || 'Unknown Error',
      message,
    },
  }
}
