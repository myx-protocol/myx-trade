import { useCookOrderStore } from '@/components/CookDetail/Order/store'
import { TipsFill } from '@/components/Icon'
import { isSafeNumber } from '@/utils'
import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import { COMMON_LP_AMOUNT_DECIMALS, formatUnits, getBalanceOf, pool as Pool } from '@myx-trade/sdk'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Big } from 'big.js'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'

interface CookRedeemGenesisBurnTipProps {
  enabled: boolean
  chainId: number
  poolId: string
  pool?: { basePoolToken?: string; baseDecimals?: number }
  genesisFeeRateDisplay: string
  lpSymbol?: string
  amount: string
}

export const CookRedeemGenesisBurnTip = ({
  enabled,
  chainId,
  poolId,
  pool,
  genesisFeeRateDisplay,
  lpSymbol,
  amount,
}: CookRedeemGenesisBurnTipProps) => {
  const { address: account } = useWalletConnection()
  const { retainGenesisLPShares } = useCookOrderStore()

  const { data: balance } = useQuery({
    queryKey: [
      { key: 'cook_redeem_genesis_balance' },
      chainId,
      poolId,
      account,
      pool?.basePoolToken,
    ],
    enabled: enabled && !!account && !!pool?.basePoolToken,
    queryFn: async () => {
      if (!pool?.basePoolToken || !account) return ''
      const bigintBalance = await getBalanceOf(chainId, account, pool.basePoolToken)
      return formatUnits(bigintBalance, COMMON_LP_AMOUNT_DECIMALS)
    },
  })

  const { data: userShareBase } = useQuery({
    queryKey: [{ key: 'cook_redeem_genesis_share' }, poolId, pool?.basePoolToken, account],
    enabled: enabled && !!pool?.basePoolToken && !!account,
    queryFn: async () => {
      if (!poolId || !pool?.basePoolToken || !account) return null
      const result = await Pool.getUserGenesisShare(chainId, pool.basePoolToken, account)
      if (result) return formatUnits(result, COMMON_LP_AMOUNT_DECIMALS)
      return null
    },
  })

  const isInsufficient = useMemo(() => {
    if (!isSafeNumber(amount) || !isSafeNumber(balance)) return false
    return Number(amount) > Number(balance)
  }, [amount, balance])

  const burned = useMemo(() => {
    if (!enabled || retainGenesisLPShares) return ''
    if (isInsufficient) return ''
    if (!amount || !balance || !userShareBase) return ''
    return new Big(amount).minus(new Big(balance).minus(new Big(userShareBase))).toString()
  }, [enabled, retainGenesisLPShares, isInsufficient, amount, balance, userShareBase])

  if (!enabled || !burned || Number(burned) <= 0) return null

  return (
    <Box className="mt-[12px] flex gap-[8px] rounded-[10px] border border-[#292B33] px-[16px] py-[12px]">
      <Box className="text-third mt-[2px]">
        <TipsFill size={14} />
      </Box>
      <p className="text-[12px] leading-[1.5] text-[#CED1D9]">
        <Trans>
          This will burn{' '}
          <span className="text-[#FFCD7A]">{formatNumber(burned, { showUnit: false })}</span>{' '}
          {lpSymbol || '--'} and you will permanently forfeit the right to your{' '}
          <span className="text-[#FFCD7A]">{genesisFeeRateDisplay}</span> share of trading fees.
        </Trans>
      </p>
    </Box>
  )
}
