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

export const useCheckUserVipInfo = (positionChainId?: string) => {
  const { chainId: currentChainId } = useParams()
  const chainId = positionChainId ?? currentChainId
  const { client, clientIsAuthenticated } = useMyxSdkClient(parseInt(chainId as string))
  const { address } = useWalletConnection()
  const { getAccountVipInfoByContract } = useGetAccountVipInfoByContract(chainId)
  const [isVipInfoSynced, setIsVipInfoSynced] = useState(true)
  const [isVipInfoSyncing, setIsVipInfoSyncing] = useState(false)
  const { activeSeamlessAddress, seamlessAccountList } = useSeamlessStore()
  const { tradeMode } = useGlobalStore()
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  const { forwardSeamlessTransaction } = useForwardSeamlessTransaction(parseInt(chainId as string))

  const getBackendVipInfo = useCallback(async () => {
    if (
      !client ||
      !clientIsAuthenticated ||
      (tradeMode === TradeMode.Seamless && !activeSeamlessAddress) ||
      (tradeMode === TradeMode.Classic && !address) ||
      !chainId
    )
      return null
    const addressToUse = tradeMode === TradeMode.Seamless ? activeSeamlessAddress : address
    const userVipInfoByContract = await getAccountVipInfoByContract()
    const nonce = parseInt(userVipInfoByContract?.nonce as unknown as string) + 1
    const res = await client?.account.getAccountVipInfoByBackend(
      addressToUse as string,
      parseInt(chainId as string),
      userVipInfoByContract?.deadline as number,
      nonce.toString(),
    )

    return {
      vipInfo: res?.data ?? {},
      nonce,
      userVipInfoByContract,
    }
  }, [
    client,
    clientIsAuthenticated,
    address,
    chainId,
    getAccountVipInfoByContract,
    activeSeamlessAddress,
    tradeMode,
  ])

  const checkUserVipInfo = useCallback(async () => {
    if (
      !client ||
      !clientIsAuthenticated ||
      (tradeMode === TradeMode.Seamless && !activeSeamlessAddress) ||
      (tradeMode === TradeMode.Classic && !address) ||
      !chainId
    ) {
      setIsVipInfoSynced(false)
      return false
    }

    const backendRs = await getBackendVipInfo()
    if (!backendRs) {
      setIsVipInfoSynced(false)
      return false
    }

    const { vipInfo, userVipInfoByContract } = backendRs
    const isMatched =
      vipInfo?.vipTier?.toString() === userVipInfoByContract?.tier?.toString() &&
      vipInfo?.rebatePct?.toString() ===
        userVipInfoByContract?.totalReferralRebatePct?.toString() &&
      vipInfo?.rebateReferrerPct?.toString() ===
        userVipInfoByContract?.referrerRebatePct?.toString()

    setIsVipInfoSynced(isMatched)
    return isMatched
  }, [
    client,
    clientIsAuthenticated,
    address,
    chainId,
    getBackendVipInfo,
    activeSeamlessAddress,
    tradeMode,
  ])

  useSWR(
    ((tradeMode === TradeMode.Seamless && activeSeamlessAddress) ||
      (tradeMode === TradeMode.Classic && address)) &&
      client &&
      clientIsAuthenticated &&
      chainId
      ? ['checkUserVipInfo', address, activeSeamlessAddress, chainId]
      : null,
    checkUserVipInfo,
    {
      refreshInterval: 3600000,
      revalidateOnFocus: false,
    },
  )

  const asyncVipLevelInfo = useCallback(
    async (quoteToken: string) => {
      try {
        if (
          !client ||
          !clientIsAuthenticated ||
          (tradeMode === TradeMode.Seamless && !activeSeamlessAddress) ||
          (tradeMode === TradeMode.Classic && !address) ||
          !chainId
        )
          return false
        if (isVipInfoSynced) return true
        const backendRs = await getBackendVipInfo()
        if (!backendRs) return false
        const { vipInfo, nonce, userVipInfoByContract } = backendRs

        setIsVipInfoSyncing(true)
        if (tradeMode === TradeMode.Seamless) {
          const seamlessAccount = seamlessAccountList.find(
            (item: SeamlessAccount) => item.masterAddress === activeSeamlessAddress,
          )
          if (!seamlessAccount) {
            return false
          }
          const isAuthorizedRes = await getSeamlessAuthStatus({
            masterAddress: activeSeamlessAddress,
            seamlessAddress: seamlessAccount?.seamlessAddress as string,
            chainId: parseInt(chainId as string),
            tokenAddress: quoteToken as string,
          })

          const isAuthorized = isAuthorizedRes?.data?.auth
          if (!isAuthorized) {
            toast.error({ title: t`Seamless account not authorized` })
            return false
          }

          const userVipInfoByContract = await getAccountVipInfoByContract()

          console.log('seamless-->', {
            user: activeSeamlessAddress as string,
            nonce: nonce.toString(),
            deadline: userVipInfoByContract?.deadline as number,
            feeData: {
              tier: vipInfo?.vipTier as number,
              referrer: vipInfo?.rebateAddr as string,
              totalReferralRebatePct: vipInfo?.rebatePct as number,
              referrerRebatePct: vipInfo?.rebateReferrerPct as number,
            },
            signature: vipInfo?.signature as string,
          })

          const rs = await forwardSeamlessTransaction({
            chainId: parseInt(chainId as string),
            masterAddress: activeSeamlessAddress,
            seamlessAddress: seamlessAccount.seamlessAddress,
            forwardFeeToken: quoteToken as string,
            functionName: 'setUserFeeData',
            orderParams: [
              {
                user: activeSeamlessAddress as string,
                nonce: nonce.toString(),
                deadline: userVipInfoByContract?.deadline as number,
                feeData: {
                  tier: vipInfo?.vipTier as number,
                  referrer: vipInfo?.rebateAddr as string,
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
            tier: vipInfo?.vipTier as number,
            referrer: vipInfo?.rebateAddr as string,
            totalReferralRebatePct: vipInfo?.rebatePct as number,
            referrerRebatePct: vipInfo?.rebateReferrerPct as number,
            nonce: nonce.toString(),
          },
          vipInfo?.signature as string,
        )

        if (rs?.code !== 0) {
          showErrorToast(client?.utils.formatErrorMessage(rs))
          return false
        }
        setIsVipInfoSynced(true)
        return true
      } catch (error) {
        showErrorToast(error)
        return false
      } finally {
        setIsVipInfoSyncing(false)
      }
    },
    [client, clientIsAuthenticated, address, chainId, getBackendVipInfo],
  )

  return {
    asyncVipLevelInfo,
    isVipInfoSyncing,
  }
}
