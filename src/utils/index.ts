// import { ChainId } from "@/config/chain"
// import { getContractAddressByChainId } from "@/config/address/index";
import { Contract, keccak256, toUtf8Bytes } from "ethers";

export type ChainDomainType = {
  name: string
  version: string
  chainId: string
  verifyingContract: string
}

// export function getChainDomainConfig(chainId: number, address: string): ChainDomainType | undefined {
//   return CHAIN_DOMAIN?.[chainId]?.[address]
// }

// type ChainDomainMapType = Record<number, Record<string, ChainDomainType>>


// const CHAIN_DOMAIN: ChainDomainMapType = {

//   // [ChainId.ARB_TESTNET]: {
//   //   [getContractAddressByChainId(ChainId.ARB_TESTNET).USDC]: {
//   //     name: 'USDC',
//   //     version: '2',
//   //     chainId: ChainId.ARB_TESTNET.toString(),
//   //     verifyingContract: getContractAddressByChainId(ChainId.ARB_TESTNET).USDC
//   //   },
//   // }
// }

export const getEIP712Domain = async (contract: Contract) => {
  try {
    // @ts-ignore
    const eip712Domain = await contract.eip712Domain()
    return {
      name: keccak256(toUtf8Bytes(eip712Domain.name)),
      version: keccak256(toUtf8Bytes(eip712Domain.version)),
      chainId: BigInt(eip712Domain.chainId), // 确保 chainId 是ForwarderGetStatus bigint 类型
      verifyingContract: eip712Domain.verifyingContract,
    }
  } catch (error) {
    throw new Error(`Error fetching EIP712 domain: ${error}`)
  }
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function waitRandom(min: number, max: number): Promise<void> {
  return wait(min + Math.round(Math.random() * Math.max(0, max - min)))
}

/** Thrown if the function is canceled before resolving. */
export class CanceledError extends Error {
  constructor() {
    super()
    this.name = 'CanceledError'
  }

  name = 'CanceledError'
  message = 'Retryable was canceled'
}

/** May be thrown to force a retry. */
export class RetryableError extends Error {
  constructor() {
    super()
    this.name = 'RetryableError'
  }

  name = 'RetryableError'
}

/** If the number of retries is 0, it is determined to time out. */
export class TimeoutError extends Error {
  constructor() {
    super()
    this.name = 'TimeoutError'
  }

  name = 'TimeoutError'
  message = 'Retryable was Timeout'
}

export interface RetryOptions {
  n: number
  minWait: number
  maxWait: number
}

/**
 * Retries a function until its returned promise successfully resolves, up to n times.
 * @param fn function to retry
 * @param n how many times to retry
 * @param minWait min wait between retries in ms
 * @param maxWait max wait between retries in ms
 */
export function retry<T>(
  fn: () => Promise<T>,
  { n, minWait, maxWait }: RetryOptions
): { promise: Promise<T>; cancel: () => void } {
  let completed = false
  let rejectCancelled: (error: Error) => void
  // eslint-disable-next-line no-async-promise-executor
  const promise = new Promise<T>(async (resolve, reject) => {
    rejectCancelled = reject
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let result: T
      try {
        result = await fn()
        if (!completed) {
          resolve(result)
          completed = true
        }
        break
      } catch (error) {
        if (completed) {
          break
        }
        if (n <= 0 || !(error instanceof RetryableError)) {
          if (error instanceof RetryableError) {
            reject(new TimeoutError())
          } else {
            reject(error)
          }

          completed = true
          break
        }
        n--
      }
      await waitRandom(minWait, maxWait)
    }
  })
  return {
    promise,
    cancel: () => {
      if (completed) return
      completed = true
      rejectCancelled(new CanceledError())
    },
  }
}