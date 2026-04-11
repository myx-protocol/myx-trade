import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from './wallet/useWalletConnection'
import { useParams } from 'react-router-dom'
import { useCallback, useState } from 'react'
import { useGetAccountVipInfoByContract } from './use-get-account-vip-info-by-contract'
import { showErrorToast } from '@/config/error'
import useGlobalStore from '@/store/globalStore'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useGetSeamlessAuthStatus } from './seamless/use-get-seamless-auth-status'
import { useForwardSeamlessTransaction } from './seamless/use-forward-seamless-transaction'
import { TradeMode } from '@/pages/Trade/types'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import type { SeamlessAccount } from '@/store/seamless/initialState'
import useSWR from 'swr'
import { getVipInfoByBackEnd } from '@/api/account'
import type { UserVipInfoContract, VipInfoByBackend } from '@/types/vip'
import { zeroAddress } from 'viem'

export const useCheckUserVipInfo = () => {
  const { chainId } = useParams()
  const { client, clientIsAuthenticated } = useMyxSdkClient(parseInt(chainId as string))
  const { address } = useWalletConnection()
  const { activeSeamlessAddress, seamlessAccountList } = useSeamlessStore()
  const { tradeMode } = useGlobalStore()
  const [isLoading, setLoading] = useState(false)
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  const { forwardSeamlessTransaction } = useForwardSeamlessTransaction(parseInt(chainId as string))

  const account = tradeMode === TradeMode.Seamless ? activeSeamlessAddress : address

  const getVipInfo = useCallback(
    async ({ isSign, deadline, nonce }: { isSign?: boolean; deadline: number; nonce: number }) => {
      const vipInfoResByBackend = await getVipInfoByBackEnd({
        access: { account: account as string },
        isSign: !!isSign,
        chainId: parseInt(chainId as string),
        deadline,
        nonce: parseInt(nonce.toString()) + 1,
      })
      const vipInfoByBackend = (vipInfoResByBackend.data ?? {}) as VipInfoByBackend

      return vipInfoByBackend
    },
    [account, chainId, account],
  )

  const getVipInfoFromContract = useCallback(async () => {
    const vipInfoResByBackend = await client?.account.getAccountVipInfo(
      parseInt(chainId as string),
      account as string,
    )
    const vipInfoByContract = (vipInfoResByBackend?.data ?? {}) as UserVipInfoContract

    return vipInfoByContract
  }, [account, client, chainId])

  const checkVipInfo = useCallback(async () => {
    const vipInfoByContract = await getVipInfoFromContract()

    const vipInfo = await getVipInfo({
      isSign: false,
      deadline: vipInfoByContract.deadline,
      nonce: vipInfoByContract.nonce,
    })
    const isMatched =
      vipInfo?.vipTier === vipInfoByContract?.[0] &&
      vipInfo?.rebatePct?.toString() === vipInfoByContract?.[2]?.toString() &&
      vipInfo?.rebateReferrerPct?.toString() === vipInfoByContract?.[3]?.toString()
    return isMatched
  }, [getVipInfo, getVipInfoFromContract])

  const { data: isMatch } = useSWR(
    account && clientIsAuthenticated && chainId ? { key: 'getVipInfo', account, chainId } : null,
    async () => {
      const vipInfoByContract = await getVipInfoFromContract()
      const vipInfo = await getVipInfo({
        isSign: false,
        deadline: vipInfoByContract.deadline,
        nonce: vipInfoByContract.nonce,
      })

      const isMatched =
        vipInfo?.vipTier === vipInfoByContract?.[0] &&
        vipInfo?.rebatePct?.toString() === vipInfoByContract?.[2]?.toString() &&
        vipInfo?.rebateReferrerPct?.toString() === vipInfoByContract?.[3]?.toString()

      return isMatched
    },
    {
      refreshInterval: 60000,
    },
  )

  const asyncVipInfo = useCallback(
    async (quoteToken: string, chainId: string) => {
      try {
        setLoading(true)
        const userVipInfoByContract = await getVipInfoFromContract()
        const vipInfo = await getVipInfo({
          isSign: true,
          deadline: userVipInfoByContract.deadline,
          nonce: userVipInfoByContract.nonce,
        })

        if (tradeMode === TradeMode.Seamless) {
          const seamlessAccount = seamlessAccountList.find(
            (item: SeamlessAccount) => item.masterAddress === activeSeamlessAddress,
          )
          if (!seamlessAccount) {
            return false
          }

          const isAuthorizedRes = await getSeamlessAuthStatus({
            masterAddress: seamlessAccount.masterAddress,
            seamlessAddress: seamlessAccount?.seamlessAddress as string,
            chainId: parseInt(chainId as string),
            tokenAddress: quoteToken as string,
          })

          const isAuthorized = isAuthorizedRes?.data?.auth
          if (!isAuthorized) {
            toast.error({ title: t`Seamless account not authorized` })
            return false
          }

          const hasEnoughGas = await client?.utils.checkSeamlessGas(
            seamlessAccount.masterAddress,
            parseInt(chainId as string),
            quoteToken,
          )
          if (!hasEnoughGas) {
            toast.error({ title: t`Insufficient balance to pay execution fee` })
            return false
          }
          const currentFeeDataEpoch = await client?.account.getCurrentFeeDataEpoch(
            parseInt(chainId as string),
          )

          const rs = await forwardSeamlessTransaction({
            chainId: parseInt(chainId as string),
            masterAddress: seamlessAccount.masterAddress,
            seamlessAddress: seamlessAccount.seamlessAddress,
            forwardFeeToken: quoteToken as string,
            functionName: 'setUserFeeData',
            orderParams: [
              {
                user: vipInfo?.account as string,
                nonce: vipInfo?.nonce as unknown as string,
                deadline: vipInfo?.deadline as number,
                feeDataEpoch: currentFeeDataEpoch,
                feeData: {
                  tier: vipInfo?.vipTier,
                  referrer: (vipInfo?.rebateAddr as string) || zeroAddress,
                  totalReferralRebatePct: vipInfo?.rebatePct as number,
                  referrerRebatePct: vipInfo?.rebateReferrerPct as number,
                },
                signature: vipInfo?.signature as string,
              },
            ],
          })

          if (rs?.code === 0) {
            return true
          }

          showErrorToast(client?.utils.formatErrorMessage(rs))
          return false
        }

        const rs = await client?.account.setUserFeeData(
          address as string,
          parseInt(chainId as string),
          userVipInfoByContract?.deadline as number,
          {
            tier: vipInfo?.vipTier as unknown as number,
            referrer: vipInfo?.rebateAddr as string,
            totalReferralRebatePct: vipInfo?.rebatePct as number,
            referrerRebatePct: vipInfo?.rebateReferrerPct as number,
            nonce: vipInfo?.nonce as unknown as string,
          },
          vipInfo?.signature as string,
        )

        console.log('rs-->', rs)
        if (rs?.code !== 0) {
          showErrorToast(client?.utils.formatErrorMessage(rs))
          return false
        }

        return true
      } catch (error) {
        showErrorToast(error)
      } finally {
        setLoading(false)
      }
    },
    [getVipInfo, getVipInfoFromContract, setLoading, chainId],
  )

  return {
    isMatch: !!isMatch,
    getVipInfoFromContract,
    asyncVipLevelLoading: isLoading,
    getVipInfo,
    checkVipInfo,
    asyncVipInfo,
  }
}
