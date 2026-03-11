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

export function didUserReject(error: any): boolean {
  return (
    error?.code === ErrorCode.USER_REJECTED_REQUEST
    // || (connection.type === ConnectionTypeEnum.WALLET_CONNECT_V2 && error?.toString?.() === ErrorCode.WC_V2_MODAL_CLOSED)
    // || (connection.type === ConnectionTypeEnum.COINBASE_WALLET && error?.toString?.() === ErrorCode.CB_REJECTED_REQUEST)
  )
}

export async function getErrorTextFormError(error: any) {
  if (didUserReject(error)) {
    return {
      error: Errors[ErrorCode.USER_REJECTED_REQUEST],
    }
  }
  
  const decodeErrorResult = await errorDecoder.decode(error)
  console.log(decodeErrorResult)
  if (decodeErrorResult.type === ErrorType.UserRejectError || decodeErrorResult.name === "ACTION_REJECTED") {
    return {
      error: Errors[ErrorCode.USER_REJECTED_REQUEST],
    }
  }
  if (decodeErrorResult.type === ErrorType.CustomError) {
    const errorKey = Object.keys(customErrorMapping).find((k) =>  k.toLowerCase() === decodeErrorResult.selector.toLowerCase())
    if (errorKey) {
      return {
        error:{
          code:  errorKey,
          message:  customErrorMapping[errorKey]
        },
      }
    }
    return {
      error: {
        code: error?.code,
        message: error?.reason || decodeErrorResult.reason || error.message
      },
    }
  }
  
  // console.error(error)
  
  return {
    error: {
      code: decodeErrorResult.type,
      message: decodeErrorResult.reason
    },
  }
}
