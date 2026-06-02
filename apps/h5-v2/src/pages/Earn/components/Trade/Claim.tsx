import { Box } from '@mui/material'
import { Card } from '@/pages/Earn/components/Trade/Card.tsx'
import { Trans } from '@lingui/react/macro'
import { useCallback, useContext, useState } from 'react'
import { PoolContext } from '@/pages/Earn/context.ts'
import { TradeButton } from '@/components/Button/TradeButton.tsx'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { quote as Quote, formatUnits } from '@myx-trade/sdk'
import { toast } from '@/components/UI/Toast'
import { useQuery } from '@tanstack/react-query'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { showErrorToast } from '@/config/error'
import { t } from '@lingui/core/macro'

export const Claim = () => {
  const { quoteLpDetail, poolId, chainId } = useContext(PoolContext)
  const [loading, setLoading] = useState<boolean>(false)
  const { address: account } = useWalletConnection()
  const onAction = useWalletActions()

  const { data: reward, refetch } = useQuery({
    queryKey: [{ key: 'getBaseLpAssetRewards' }, poolId, chainId, account],
    enabled: !!chainId && !!poolId && !!account,
    queryFn: async () => {
      if (!chainId || !account || !poolId) return ''
      let rewards = ''
      try {
        const rs = await Quote.getRewards({
          poolId: poolId,
          chainId: chainId,
          account: account as `0x${string}`,
        })
        console.log('Reward', rs)
        if (rs === 0n) {
          rewards = '0'
        } else if (rs) {
          rewards = formatUnits(rs, quoteLpDetail?.quoteDecimals)
        }
      } catch (_e) {
        console.error(_e)
      }
      return rewards
    },
    refetchInterval: 5000,
  })

  const onHandleClaim = useCallback(async () => {
    if (!poolId || !account || !reward || Number(reward) < 0) return
    try {
      setLoading(true)
      const checked = await onAction()
      if (!checked) {
        return
      }
      await Quote.claimQuotePoolRebate({ chainId: chainId, poolId: poolId })
      toast.success({ title: t`Claim successfully claimed` })
      refetch?.()
    } catch (e) {
      showErrorToast(e)
    } finally {
      setLoading(false)
    }
  }, [chainId, poolId, account, refetch, onAction, reward])

  return (
    <Box className={'mt-[8px] flex flex-col gap-[6px]'}>
      <Box className={'relative z-[1] flex flex-col gap-[6px]'}>
        <Card
          title={
            <span className={'text-secondary'}>
              <Trans>Amount</Trans>
            </span>
          }
          className={'border-dark-border bg-base-bg border-1'}
        >
          <Box className={'flex items-center justify-end gap-[12px]'}>
            <span className={'text-warning flex gap-[.5em] text-[20px] font-[700]'}>
              {formatNumberPrecision(reward, COMMON_PRICE_DISPLAY_DECIMALS)}{' '}
              <span>{quoteLpDetail?.quoteSymbol}</span>
            </span>
          </Box>
        </Card>
      </Box>

      <Box className={'mb-[4px] w-full'}>
        <TradeButton
          variant="contained"
          className={'w-full'}
          disabled={!reward || Number(reward) <= 0}
          loading={loading}
          onClick={onHandleClaim}
          loadingPosition="start"
        >
          <Trans>Claim</Trans>
        </TradeButton>
      </Box>
    </Box>
  )
}
