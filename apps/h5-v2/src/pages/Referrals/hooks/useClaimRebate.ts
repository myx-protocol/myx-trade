import { useState } from 'react'
import { useCountDown } from 'ahooks'
import { useReferralStore } from '@/store/referrals'
import type { ChainId } from '@/config/chain'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import type { Address } from 'viem'

export function useClaimReferralRebate() {
  const [claimChainId, setClaimChainId] = useState<ChainId>()
  const [targetDate, setTargetDate] = useState<number>()

  const { fetchRefBonus, fetchRefBonusInfoByChain, accessToken } = useReferralStore()
  const { chainId } = useWalletConnection()

  const { seamlessAccountList, activeSeamlessAddress } = useSeamlessStore()
  const seamlessAccount = seamlessAccountList.find(
    (a) => a.seamlessAddress === activeSeamlessAddress,
  )
  const activeSeamlessAccountAuthStatus = chainId
    ? seamlessAccount?.authorized?.[chainId]?.authorized
    : false

  const handleFresh = async () => {
    if (accessToken) {
      await fetchRefBonus()
      await fetchRefBonusInfoByChain()
    }
  }

  const [countdown] = useCountDown({
    targetDate,
    onEnd: handleFresh,
  })

  const { client, clientIsAuthenticated } = useMyxSdkClient(claimChainId)

  const onClaimReferralRebate = async (tokenAddress: Address) => {
    if (!claimChainId || !client || !clientIsAuthenticated) return

    try {
      // const checkBalanceRs = await handleCheckSeamlessGas()
      // if (!checkBalanceRs) return

      await client.referrals.claimRebate(tokenAddress)
      handleFresh()

      // let response
      // if (seamlessAccount && activeSeamlessAccountAuthStatus) {
      //   // await handleAction(
      //   //   SEAMLESS_ACCOUNT_ACTION_TYPE.CLAIM_REFERRAL_FEE,
      //   //   [FeeCollector_ADDRESS[claimChainId]],
      //   //   {
      //   //     info: { type: TransactionType.CLAIM_REFERRAL_FEE },
      //   //     value: '0'
      //   //   }
      //   // )
      //   handleFresh()
      // } else {
      //   // const FeeCollectorContract = ...

      //   // response = await FeeCollectorContract.claimReferralFee()
      //   // addTransaction(response, {
      //   //   type: TransactionType.CLAIM_REFERRAL_FEE
      //   // })

      //   // response.wait().then(() => handleFresh())
      //   console.warn(
      //     'Claim referral rebate not implemented for standard wallet yet (missing contract/ABI)',
      //   )
      // }

      setTargetDate(Date.now() + 1000 * 60)
    } catch (err: any) {
      throw new Error(err)
    }
  }

  return {
    countdown,
    claimChainId,
    setClaimChainId,
    onClaimReferralRebate,
  }
}
