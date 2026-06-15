import {customErrorMapping} from './customErrorMap.js'


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
export function isUserRejected(error: any): boolean {
  let err = error
  
  while (err) {
    // 1️⃣ viem standard
    if (err.name === 'UserRejectedRequestError') return true
    
    // 2️⃣ EIP-1193 standard
    if (err.code === ErrorCode.USER_REJECTED_REQUEST) return true
    
    // 3️⃣ message fallback (compatible with various wallets)
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

interface DecodedCustomError {
  selector: string
  message: string
}

/**
 * Try to extract a 4-byte custom error selector from a hex string
 * and look it up in customErrorMapping.
 * Returns { selector, message } or null if not found.
 */
function tryDecodeCustomError(hexData: string): DecodedCustomError | null {
  if (!hexData || typeof hexData !== 'string') return null
  // Match a 0x-prefixed hex string that is at least 10 chars (0x + 8 hex = 4-byte selector)
  const match = hexData.match(/(0x[0-9a-fA-F]{8,})/)
  if (!match) return null
  const selector = match[1].slice(0, 10).toLowerCase()
  const errorKey = Object.keys(customErrorMapping).find(
    (k) => k.toLowerCase() === selector
  )
  return errorKey ? { selector, message: customErrorMapping[errorKey] } : null
}

/**
 * Recursively search an error and all its causes for raw hex error data,
 * checking: err.data, err.details, err.message, err.shortMessage
 */
function tryDecodeCustomErrorFromError(err: any): DecodedCustomError | null {
  let current = err
  while (current) {
    // 1. err.data (string hex or object with hex)
    if (typeof current.data === 'string') {
      const decoded = tryDecodeCustomError(current.data)
      if (decoded) return decoded
    }
    // 2. err.details (viem v2.48+ puts raw hex here)
    if (typeof current.details === 'string') {
      const decoded = tryDecodeCustomError(current.details)
      if (decoded) return decoded
    }
    // 3. err.message / err.shortMessage may contain embedded hex
    for (const field of ['message', 'shortMessage'] as const) {
      if (typeof current[field] === 'string') {
        const decoded = tryDecodeCustomError(current[field])
        if (decoded) return decoded
      }
    }
    current = current.cause
  }
  return null
}

/**
 * Detect the "missing revert data" pattern from ethers.js wrapped inside viem.
 * When estimateGas fails with CALL_EXCEPTION and data=null, the original RPC
 * error is lost by the ethers adapter layer.
 */
function isMissingRevertData(err: any): boolean {
  let current = err
  while (current) {
    for (const field of ['message', 'details', 'shortMessage'] as const) {
      const str = current[field]
      if (
        typeof str === 'string' &&
        str.includes('missing revert data')
      ) {
        return true
      }
    }
    current = current.cause
  }
  return false
}

function extractMessage(err: any): string {
  if (!err) return 'Unknown error'
  
  // 🔥 1️⃣ viem custom error (highest priority)
  if (err?.data?.errorName) {
    return `${err.data.errorName}()`
  }
  
  // Some versions put the error in metaMessages
  if (Array.isArray(err?.metaMessages)) {
    const match = err.metaMessages.find((m: string) =>
      m.includes('Error:')
    )
    if (match) {
      return match.replace('Error: ', '').trim()
    }
  }
  
  // 🔥 2️⃣ Extract hex selector from details / data / message and look up in customErrorMapping
  const customError = tryDecodeCustomErrorFromError(err)
  if (customError) {
    return customError.message
  }
  
  // 🔥 2.5️⃣ missing revert data (ethers adapter swallowed the original RPC error)
  if (isMissingRevertData(err)) {
    return 'Transaction estimation failed. Please verify your balance and transaction details.'
  }
  
  // 3️⃣ Recurse into cause
  if (err?.cause) {
    return extractMessage(err.cause)
  }
  
  // 4️⃣ reason (some RPCs)
  if (err?.reason) {
    return err.reason
  }
  
  // 5️⃣ shortMessage (fallback)
  if (err?.shortMessage) {
    return err.shortMessage
  }
  
  // 6️⃣ message (last resort)
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
  
  // First try to decode custom contract error from hex data, using selector as code
  const customError = tryDecodeCustomErrorFromError(error)
  if (customError) {
    return {
      error: {
        code: customError.selector,
        message: customError.message,
      },
    }
  }
  
  const message = extractMessage(error)
  
  return {
    error: {
      code: error?.code || error?.name || 'Unknown Error',
      message,
    },
  }
}
