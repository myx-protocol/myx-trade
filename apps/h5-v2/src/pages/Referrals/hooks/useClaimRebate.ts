import { useState } from 'react'
import { useCountDown } from 'ahooks'
import { useReferralStore } from '@/store/referrals'
// import { useTransactionAdder } from '@/store/transactions/hooks'
// import { useSeamlessAccountTradeAction, SEAMLESS_ACCOUNT_ACTION_TYPE } from '@/hooks/seamless-account/use-seamless-account-trade'
// import { useSeamlessCheckBalance } from '@/hooks/seamless-account/use-seamless-check-balance'
// import { FeeCollector_ADDRESS } from '@/config/addresses'
// import { TransactionType } from '@/store/transactions/options'
import type { ChainId } from '@/config/chain'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useAccessParams } from '@/hooks/useAccessParams'

export function useClaimReferralRebate() {
  const [claimChainId, setClaimChainId] = useState<ChainId>()
  const [targetDate, setTargetDate] = useState<number>()
  // const { addTransaction } = useTransactionAdder()
  // const { handleAction } = useSeamlessAccountTradeAction()
  // const { handleCheckSeamlessGas } = useSeamlessCheckBalance()
  const { fetchRefBonus, fetchRefBonusInfoByChain, accessToken } = useReferralStore()
  const { chainId } = useWalletConnection()
  const accessParams = useAccessParams()

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

  const onClaimReferralRebate = async () => {
    if (!claimChainId) return

    try {
      // const checkBalanceRs = await handleCheckSeamlessGas()
      // if (!checkBalanceRs) return

      // let response
      if (seamlessAccount && activeSeamlessAccountAuthStatus) {
        // await handleAction(
        //   SEAMLESS_ACCOUNT_ACTION_TYPE.CLAIM_REFERRAL_FEE,
        //   [FeeCollector_ADDRESS[claimChainId]],
        //   {
        //     info: { type: TransactionType.CLAIM_REFERRAL_FEE },
        //     value: '0'
        //   }
        // )
        handleFresh()
      } else {
        // const FeeCollectorContract = ...

        // response = await FeeCollectorContract.claimReferralFee()
        // addTransaction(response, {
        //   type: TransactionType.CLAIM_REFERRAL_FEE
        // })

        // response.wait().then(() => handleFresh())
        console.warn(
          'Claim referral rebate not implemented for standard wallet yet (missing contract/ABI)',
        )
      }

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
