import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useCallback } from 'react'

const contractTypes = {
  ForwardRequest: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint48' },
    { name: 'data', type: 'bytes' },
  ],
}

export const useForwardSeamlessTransaction = (chainId?: number) => {
  const { client } = useMyxSdkClient(chainId)
  const { activeSeamlessWallet } = useSeamlessStore()

  const forwardSeamlessTransaction = useCallback(
    async ({
      chainId,
      masterAddress,
      seamlessAddress,
      forwardFeeToken,
      functionName,
      orderParams,
      value,
      gas = '800000',
    }: {
      chainId: number
      masterAddress: string
      seamlessAddress: string
      forwardFeeToken: string
      functionName: string
      orderParams: any
      value?: string
      gas?: string
    }) => {
      const sign = async ({
        domain,
        functionHash,
        to,
        nonce,
        deadline,
      }: {
        domain: any
        functionHash: string
        to: string
        nonce: string
        deadline: number
      }): Promise<string> => {
        const signText = await activeSeamlessWallet.signTypedData(
          { ...domain, chainId: parseInt(domain.chainId as string) },
          contractTypes,
          {
            from: activeSeamlessWallet.address,
            to,
            value: value ?? '0',
            gas,
            nonce,
            deadline,
            data: functionHash,
          },
        )

        return signText
      }

      const rs = await client?.seamless.forwardTxInFront({
        chainId,
        masterAddress,
        seamlessAddress,
        signFunction: sign,
        forwardFeeToken,
        functionName,
        orderParams,
        value: value ?? '0',
        gas,
      })

      return rs
    },
    [client, chainId, activeSeamlessWallet],
  )

  return {
    forwardSeamlessTransaction,
  }
}
