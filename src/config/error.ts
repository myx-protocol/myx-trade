import {ErrorType, ErrorDecoder} from 'ethers-decode-error'
const errorDecoder = ErrorDecoder.create();

export enum ErrorCode {
  Invalid_Chain_ID = 1,
  Invalid_TOKEN_ADDRESS,
  Insufficient_Balance =3,
  Insufficient_Amount_Of_Approved,
  USER_REJECTED_REQUEST = 4001,
  
  Invalid_Base
}

export const Errors = {
  [ErrorCode.Invalid_Chain_ID]: `Invalid Chain`,
  [ErrorCode.Invalid_TOKEN_ADDRESS]: `Invalid Token Address`,
  [ErrorCode.USER_REJECTED_REQUEST]: `User Rejected`,
  [ErrorCode.Insufficient_Balance]: `Insufficient Balance`,
  [ErrorCode.Insufficient_Amount_Of_Approved]: `Insufficient Amount Of Approved`,
  [ErrorCode.Invalid_Base]: `Invalid Base Token`,
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
  if (decodeErrorResult.type === ErrorType.UserRejectError) {
    return {
      error: Errors[ErrorCode.USER_REJECTED_REQUEST],
    }
  }
  
  console.error(error)
  
  return {
    error: undefined,
  }
}
