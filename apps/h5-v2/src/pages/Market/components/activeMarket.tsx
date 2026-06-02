import Box from '@mui/material/Box'
import { Trans } from '@lingui/react/macro'
import { TokenInfo } from '@/pages/Market/components/TokenInfo.tsx'
import { WalletLine } from '@/components/Icon'
import { Tips } from '@/pages/Market/components/tips.tsx'
import { formatUnits, getBalanceOf, market as _Market, pool as Pool } from '@myx-trade/sdk'
import { useCallback, useContext, useState } from 'react'
import { TokenContext } from '@/pages/Market/context.ts'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Button } from '@mui/material'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import type { QuoteLpDetail } from '@/request/lp/type.ts'
import { getQuoteLPDetail } from '@/request'
import { formatNumber } from '@/utils/number.ts'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { getAssetIcon } from '@/utils/coin.tsx'
import { showErrorToast } from '@/config/error'
// import { useContext } from 'react'
// import { TokenContext } from '@/pages/Market/context.ts'

export const ActiveMarket = ({ onNext }: { onNext: () => void }) => {
  const { chainId } = useParams()
  const { address: account } = useWalletConnection()
  const { poolId, market } = useContext(TokenContext)
  const onAction = useWalletActions()
  const [loading, setLoading] = useState<boolean>(false)
  // const market = useMemo(() => {
  //   if(chainId) {
  //     return markets?.find(_market => _market.chainId === )
  //   }
  // }, [chainId, markets])
  const { data: fee } = useQuery({
    queryKey: [{ key: 'market_fee_Info' }, chainId, market],
    enabled: !!market?.marketId,
    queryFn: async () => {
      if (!chainId || !market?.marketId) return null
      const result = await _Market.getOracleFee(+chainId, market?.marketId)
      console.log(result)

      return result ? formatUnits(result, market.quoteDecimals) : undefined
    },
  })
  const { data: quoteLpDetail } = useQuery({
    queryKey: [{ key: 'QuotePoolDetail' }, chainId, poolId],
    queryFn: async () => {
      if (!chainId || !poolId) return {} as QuoteLpDetail
      const response = await getQuoteLPDetail(chainId as unknown as number, poolId)
      if (response.data) {
        return response.data
      }
      return {} as QuoteLpDetail
    },
  })

  const { data: balance } = useQuery({
    queryKey: [{ key: 'balance' }, account, chainId, quoteLpDetail?.quoteToken],
    queryFn: async () => {
      const address = quoteLpDetail?.quoteToken

      if (!address || !account || !chainId) return
      try {
        const bigintBalance = await getBalanceOf(+chainId, account, address)
        const _balance = formatUnits(bigintBalance, quoteLpDetail?.quoteDecimals)
        return _balance
      } catch (e) {
        console.error(e)
      }
    },
  })

  const onReprime = useCallback(async () => {
    try {
      if (!poolId || !chainId || !market) return
      setLoading(true)
      const checked = await onAction()
      if (!checked) return
      await Pool.reprime(+chainId, poolId, market?.marketId)
      toast.success({ title: t`Pool reprime` })
      onNext?.()
    } catch (e) {
      console.error(e)
      showErrorToast(e)
    } finally {
      setLoading(false)
    }
  }, [poolId, chainId, market, onNext, onAction])
  return (
    <Box className={'flex flex-1 flex-col'}>
      <h2 className={'text-[18px] leading-[1] font-[700] text-white'}>
        <Trans>Activate Your Trading Contract</Trans>
      </h2>

      <Box
        className={
          'bg-base-bg mt-[20px] flex items-center justify-between gap-[12px] rounded-[12px] px-[16px] py-[20px]'
        }
      >
        <TokenInfo />
        <Box className={'flex flex-col items-end gap-[4px] leading-[1]'}>
          <h3 className={'text-[14px] font-[700] text-white'}>
            ${quoteLpDetail?.marketCap ? formatNumber(quoteLpDetail?.marketCap) : '--'}
          </h3>
          <span className={'text-secondary text-[12px]'}>mcap</span>
        </Box>
      </Box>

      <Box className={'mt-[24px] flex flex-col'}>
        <label
          className={'text-regular flex items-center gap-[4px] text-[16px] leading-[1] font-[500]'}
        >
          <Trans>Pay with {quoteLpDetail?.quoteSymbol}</Trans>
        </label>

        <Box
          className={
            'bg-base-bg mt-[16px] flex flex-col gap-[12px] rounded-[12px] px-[16px] py-[20px]'
          }
        >
          <Box className={'flex items-center justify-between gap-[10px]'}>
            <span className={'text-[24px] leading-[1] font-[700] text-white'}>{fee}</span>
            <Box className={'flex items-center gap-[4px]'}>
              <img
                className={'aspect-square h-[20px] w-[20px] rounded-full'}
                src={quoteLpDetail?.quoteSymbol ? getAssetIcon(quoteLpDetail?.quoteSymbol) : ''}
              />
              <span className={'text-[16px] leading-[1] font-[500] text-white'}>
                {quoteLpDetail?.quoteSymbol || '--'}
              </span>
            </Box>
          </Box>
          <Box className={'flex items-center justify-between gap-[8px]'}>
            <Box className={'text-regular flex-1 font-[500]'}>
              ${formatNumberPrecision(balance, COMMON_PRICE_DISPLAY_DECIMALS)}
            </Box>
            <Box className={'flex flex-1 items-center justify-end gap-[4px]'}>
              <WalletLine className={'text-secondary'} size={14} />
              <span className={'font-[500]'}>
                {formatNumberPrecision(balance, COMMON_PRICE_DISPLAY_DECIMALS)}
              </span>
              <span className={'font-[500]'}>{quoteLpDetail?.quoteSymbol}</span>
            </Box>
          </Box>
        </Box>
      </Box>

      {Number(balance) < Number(fee) && (
        <Box className={'mt-[12px] text-[14px] leading-[1]'}>
          <p className={'text-wrong'}>
            <Trans>Insufficient balance</Trans>
          </p>
        </Box>
      )}

      <Tips className={'mt-[12px]'}>
        <Trans>
          This fee is for the oracle service. Activation will be completed within 24 hours after
          payment.
        </Trans>
      </Tips>

      <Box className={'mt-[32px]'}>
        <Button
          loading={loading}
          className={'gradient primary long mx-auto w-full rounded'}
          onClick={onReprime}
          loadingPosition="start"
          disabled={loading || Number(balance) < Number(fee)}
        >
          <Trans>Activate Market</Trans>
        </Button>
      </Box>
    </Box>
  )
}
