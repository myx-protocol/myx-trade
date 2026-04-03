import { useGetPoolList } from '@/components/Trade/hooks/use-get-pool-list'
import { showErrorToast } from '@/config/error'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useCallback } from 'react'
import useSWR from 'swr'
import useGlobalStore from '@/store/globalStore'
import { TradeMode } from '@/pages/Trade/types'

export const useGetSeamlessAuthStatus = () => {
  const { client } = useMyxSdkClient()

  const getSeamlessAuthStatus = useCallback(
    async ({
      masterAddress,
      seamlessAddress,
      chainId,
      tokenAddress,
    }: {
      masterAddress: string
      seamlessAddress: string
      chainId: number
      tokenAddress: string
    }) => {
      try {
        const isAuthorized = await client?.seamless.onCheckRelayer(
          masterAddress,
          seamlessAddress,
          chainId,
          tokenAddress,
        )
        return {
          code: 0,
          data: {
            auth: isAuthorized,
          },
        }
      } catch (e) {
        showErrorToast(client?.utils.formatErrorMessage(e))
      }
    },
    [client],
  )

  return {
    getSeamlessAuthStatus,
  }
}

export const useGetAllQuoteTokenAuthStatus = () => {
  const { poolList } = useGetPoolList()
  const { activeSeamlessAddress, seamlessAccountList } = useSeamlessStore()
  const { tradeMode } = useGlobalStore()
  const activeSeamlessAccount = seamlessAccountList.find(
    (item) => item.masterAddress === activeSeamlessAddress,
  )

  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()

  const { data } = useSWR(
    tradeMode === TradeMode.Seamless && activeSeamlessAccount
      ? {
          key: 'quoteTokenAuthStatus',
          tradeMode,
        }
      : null,
    async () => {
      const list = poolList.reduce(
        (
          prev: { baseSymbol: string; quoteSymbol: string; quoteToken: string; chainId: number }[],
          item: { baseSymbol: string; quoteSymbol: string; quoteToken: string; chainId: number },
        ) => {
          if (
            !prev.find(
              (prevItem) =>
                prevItem.quoteToken === item.quoteToken && prevItem.chainId === item.chainId,
            )
          ) {
            prev.push({
              baseSymbol: item.baseSymbol,
              quoteSymbol: item.quoteSymbol,
              quoteToken: item.quoteToken,
              chainId: item.chainId,
            })
          }

          return [...prev]
        },
        [],
      )

      const authArray = await Promise.all(
        list.map(
          async (item: {
            baseSymbol: string
            quoteSymbol: string
            quoteToken: string
            chainId: number
          }) => {
            const rs = await getSeamlessAuthStatus({
              seamlessAddress: activeSeamlessAccount?.seamlessAddress as string,
              chainId: item.chainId,
              tokenAddress: item.quoteToken,
              masterAddress: activeSeamlessAccount?.masterAddress as string,
            })

            return {
              ...item,
              auth: rs?.data?.auth,
            }
          },
        ),
      )

      return authArray
    },
    {
      refreshInterval: 3000,
    },
  )

  return {
    quoteTokenAuthStatus: data ?? [],
  }
}
