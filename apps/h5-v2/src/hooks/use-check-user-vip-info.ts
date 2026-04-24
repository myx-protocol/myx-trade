import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from './wallet/useWalletConnection'
import { useParams } from 'react-router-dom'
import { useCallback, useMemo, useState } from 'react'
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
  const routeChainId = useMemo(() => {
    const normalizedChainId = Number(chainId)
    return Number.isFinite(normalizedChainId) ? normalizedChainId : 0
  }, [chainId])
  const { client, clientIsAuthenticated } = useMyxSdkClient(routeChainId)
  const { address } = useWalletConnection()
  const { activeSeamlessAddress, seamlessAccountList } = useSeamlessStore()
  const { tradeMode } = useGlobalStore()
  const [isLoading, setLoading] = useState(false)
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  const { forwardSeamlessTransaction } = useForwardSeamlessTransaction(routeChainId)

  const account = tradeMode === TradeMode.Seamless ? activeSeamlessAddress : address
  const normalizeChainId = useCallback(
    (targetChainId?: string | number) => {
      const normalizedChainId =
        typeof targetChainId === 'string' ? Number(targetChainId) : targetChainId

      if (normalizedChainId && Number.isFinite(normalizedChainId)) {
        return normalizedChainId
      }

      return routeChainId
    },
    [routeChainId],
  )

  const getVipInfo = useCallback(
    async ({
      isSign,
      deadline,
      nonce,
      targetChainId,
    }: {
      isSign?: boolean
      deadline: number
      nonce: number
      targetChainId?: string | number
    }) => {
      const resolvedChainId = normalizeChainId(targetChainId)
      const vipInfoResByBackend = await getVipInfoByBackEnd({
        access: { account: account as string },
        isSign: !!isSign,
        chainId: resolvedChainId,
        deadline,
        nonce: parseInt(nonce.toString()) + 1,
      })
      const vipInfoByBackend = (vipInfoResByBackend.data ?? {}) as VipInfoByBackend

      return vipInfoByBackend
    },
    [account, normalizeChainId],
  )

  const getVipInfoFromContract = useCallback(
    async (targetChainId?: string | number) => {
      const resolvedChainId = normalizeChainId(targetChainId)
      const vipInfoResByBackend = await client?.account.getAccountVipInfo(
        resolvedChainId,
        account as string,
      )
      const vipInfoByContract = (vipInfoResByBackend?.data ?? {}) as UserVipInfoContract

      return vipInfoByContract
    },
    [account, client, normalizeChainId],
  )

  const getVipMatchStatus = useCallback(
    async (targetChainId?: string | number) => {
      if (!account || !client) {
        return false
      }

      const vipInfoByContract = await getVipInfoFromContract(targetChainId)
      if (!vipInfoByContract?.deadline && !vipInfoByContract?.nonce) {
        return false
      }

      const vipInfo = await getVipInfo({
        isSign: false,
        deadline: vipInfoByContract.deadline,
        nonce: vipInfoByContract.nonce,
        targetChainId,
      })

      console.log('vipInfo-->', vipInfo)
      console.log('vipInfoByContract-->', vipInfoByContract)

      const backendVipTier = vipInfo?.vipTier?.toString() ?? '0'
      const contractVipTier = vipInfoByContract?.[0]?.toString?.() ?? '0'
      const backendRebateAddr = (vipInfo?.rebateAddr ?? zeroAddress).toLowerCase()
      const contractRebateAddr = (vipInfoByContract?.[1] ?? zeroAddress).toLowerCase()

      return (
        backendVipTier === contractVipTier &&
        backendRebateAddr === contractRebateAddr &&
        vipInfo?.rebatePct?.toString() === vipInfoByContract?.[2]?.toString() &&
        vipInfo?.rebateReferrerPct?.toString() === vipInfoByContract?.[3]?.toString()
      )
    },
    [account, client, getVipInfo, getVipInfoFromContract],
  )

  const checkVipInfo = useCallback(async () => {
    return getVipMatchStatus()
  }, [getVipMatchStatus])

  const { data: isMatch, mutate: mutateVipMatch } = useSWR(
    account && clientIsAuthenticated && routeChainId
      ? { key: 'getVipInfo', account, chainId: routeChainId }
      : null,
    async () => {
      return getVipMatchStatus()
    },
    {
      refreshInterval: 60000,
    },
  )

  const asyncVipInfo = useCallback(
    async (quoteToken: string, chainId: string | number) => {
      try {
        setLoading(true)
        const resolvedChainId = normalizeChainId(chainId)
        const userVipInfoByContract = await getVipInfoFromContract(resolvedChainId)
        if (!userVipInfoByContract?.deadline && !userVipInfoByContract?.nonce) {
          return false
        }
        const vipInfo = await getVipInfo({
          isSign: true,
          deadline: userVipInfoByContract.deadline,
          nonce: userVipInfoByContract.nonce,
          targetChainId: resolvedChainId,
        })
        if (!vipInfo?.signature) {
          return false
        }

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
            chainId: resolvedChainId,
            tokenAddress: quoteToken as string,
          })

          const isAuthorized = isAuthorizedRes?.data?.auth
          if (!isAuthorized) {
            toast.error({ title: t`Seamless account not authorized` })
            return false
          }

          const hasEnoughGas = await client?.utils.checkSeamlessGas(
            seamlessAccount.masterAddress,
            resolvedChainId,
            quoteToken,
          )
          if (!hasEnoughGas) {
            toast.error({ title: t`Insufficient balance to pay execution fee` })
            return false
          }
          const currentFeeDataEpoch = await client?.account.getCurrentFeeDataEpoch(resolvedChainId)

          const rs = await forwardSeamlessTransaction({
            chainId: resolvedChainId,
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
            await mutateVipMatch(true, false)
            return true
          }

          await mutateVipMatch(false, false)
          showErrorToast(client?.utils.formatErrorMessage(rs))
          return false
        }

        const rs = await client?.account.setUserFeeData(
          address as string,
          resolvedChainId,
          userVipInfoByContract?.deadline as number,
          {
            tier: vipInfo?.vipTier as unknown as number,
            referrer: vipInfo?.rebateAddr as string,
            totalReferralRebatePct: vipInfo?.rebatePct as number,
            referrerRebatePct: vipInfo?.rebateReferrerPct as number,
            nonce: vipInfo?.nonce as unknown as string,
            expiry: vipInfo?.vipExpireTime,
          },
          vipInfo?.signature as string,
        )

        console.log('rs-->', rs)
        if (rs?.code !== 0) {
          await mutateVipMatch(false, false)
          showErrorToast(client?.utils.formatErrorMessage(rs))
          return false
        }

        await mutateVipMatch(true, false)
        return true
      } catch (error) {
        await mutateVipMatch(false, false)
        showErrorToast(error)
      } finally {
        setLoading(false)
      }
    },
    [
      activeSeamlessAddress,
      address,
      client,
      forwardSeamlessTransaction,
      getSeamlessAuthStatus,
      getVipInfo,
      getVipInfoFromContract,
      mutateVipMatch,
      normalizeChainId,
      seamlessAccountList,
      tradeMode,
    ],
  )

  return {
    isMatch: isMatch !== false,
    getVipInfoFromContract,
    asyncVipLevelLoading: isLoading,
    getVipInfo,
    checkVipInfo,
    asyncVipInfo,
  }
}
