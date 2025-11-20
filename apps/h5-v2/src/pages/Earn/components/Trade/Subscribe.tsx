import { Trans } from '@lingui/react/macro'
import { Box, Button } from '@mui/material'
import { TipsFill, WalletLine } from '@/components/Icon'
import { NumericInputWithAdornment } from '@/pages/Earn/components/Trade/NumericInput.tsx'
import ArrowDownLong from '@/components/Icon/set/ArrowDownLong.tsx'
import { Describe, DescribeItem } from '@/components/Describe.tsx'
import { TradeButton } from '@/components/Button/TradeButton.tsx'
import { Card } from '@/pages/Earn/components/Trade/Card.tsx'
import { t } from '@lingui/core/macro'
import { quote as Quote, getBalanceOf, formatUnits, MarketPoolState } from '@myx-trade/sdk'
import { useCallback, useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { PoolContext } from '../../context'
import { useQuery } from '@tanstack/react-query'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { getAssetIcon } from '@/utils/coin.tsx'
import { EstRate } from '@/pages/Earn/components/Trade/EstRate.tsx'
import { PriceImpact } from '@/pages/Earn/components/Trade/PriceImpact.tsx'
import { TradeContext } from '@/pages/Earn/components/Trade/Context.ts'
import { isSafeNumber } from '@/utils'
import toast from 'react-hot-toast'
import { DefaultButton } from '@/components/Button/DefaultButton.tsx'

export const Subscribe = () => {
  const { chainId, poolId } = useParams()
  const { pool, quoteLpDetail } = useContext(PoolContext)
  const { address: account } = useAccount()
  const { slippage, setSlippage } = useContext(TradeContext)
  const [amount, setAmount] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)
  // const [balance, setBalance] = useState<string>('')

  const { data: balance, refetch } = useQuery({
    queryKey: [{ key: 'getQuoteBalance' }, chainId, poolId, account],
    refetchInterval: 5000,
    queryFn: async () => {
      if (!poolId || !account || !chainId) return ''
      if (!pool) return ''

      if (pool?.quoteToken && account) {
        const bigintBalance = await getBalanceOf(+chainId, account, pool?.quoteToken)
        // todo api 未返回 quoteDecimals
        const _balance = formatUnits(bigintBalance, pool.quoteDecimals)
        return formatNumberPrecision(_balance, COMMON_PRICE_DISPLAY_DECIMALS, false, false)
      }
    },
  })

  const isInsufficient = useMemo(() => {
    if (isSafeNumber(amount) && isSafeNumber(balance)) {
      if (Number(amount) > Number(balance)) return true
      return false
    }
    return false
  }, [balance, amount])

  const onHandleMax = useCallback(() => {
    if (balance) {
      setAmount(balance)
    }
  }, [balance])

  const onAmountChange = useCallback(({ floatValue }: { value: string; floatValue?: number }) => {
    setAmount(floatValue?.toString() || '')
  }, [])

  const onHandleSubscribe = useCallback(async () => {
    try {
      setLoading(true)
      if (!chainId || !poolId || !amount) return
      await Quote.deposit({
        chainId: +chainId,
        poolId,
        amount: Number(amount),
        slippage: Number(slippage),
      })
      toast.success(t`Successfully subscribe`)
      await refetch()
      setAmount('')
    } catch (error) {
      toast.error(JSON.stringify(error))
    } finally {
      setLoading(false)
    }
  }, [chainId, amount, slippage, poolId])
  return (
    <Box className={'mt-[8px] flex flex-col gap-[6px]'}>
      <Box className={'relative z-[1] flex flex-col gap-[6px]'}>
        <Card
          title={
            <>
              <Trans>Subscription Amount</Trans>
              <Box className={'flex items-center gap-[4px] text-[12px]'}>
                <WalletLine size={14} />
                <span>
                  {balance ? formatNumberPrecision(balance, COMMON_PRICE_DISPLAY_DECIMALS) : '--'}{' '}
                  {pool?.quoteSymbol}
                </span>
              </Box>
            </>
          }
        >
          <Box className={'flex items-center justify-between gap-[12px]'}>
            <NumericInputWithAdornment
              className={'flex-1'}
              placeholder={t`Amount`}
              autoFocus={true}
              value={amount}
              onValueChange={onAmountChange}
            />
            <Box className={'flex items-center gap-[12px]'}>
              <Button variant="text" className={'!min-w-[auto] !p-[0px]'} onClick={onHandleMax}>
                <Trans>Max</Trans>
              </Button>
            </Box>
            {pool?.quoteSymbol && (
              <Box
                className={
                  'bg-deep border-dark-border flex items-center gap-[2px] rounded-[30px] border-1 py-[4px] pr-[6px] pl-[4px]'
                }
              >
                <img
                  src={getAssetIcon(pool?.quoteSymbol)}
                  alt={'USD'}
                  className={'aspect-square h-[20px] w-[20px] rounded-full'}
                />
                <span className={'leading-[1] font-[500] text-white'}>{pool?.quoteSymbol}</span>
              </Box>
            )}
          </Box>
        </Card>

        <Box
          className={
            'bg-deep border-dark-border absolute top-[50%] left-[176px] z-[2] flex h-[48px] w-[48px] translate-y-[-50%] items-center justify-center rounded-[12px] border-[4px] text-white'
          }
        >
          <ArrowDownLong size={22} />
        </Box>

        <Card
          title={
            <>
              <Box className={'flex items-center gap-[4px]'}>
                <Trans>24h Estimated Earnings</Trans>
                <TipsFill size={14} />
              </Box>
            </>
          }
        >
          <Box className={'flex items-end gap-[8px] leading-[1] font-[700]'}>
            <span
              className={`text-[32px] text-white ${Number(quoteLpDetail?.apr) > 0 ? 'text-rise' : 'text-fall'}`}
            >
              {formatNumberPercent(quoteLpDetail?.apr)}
            </span>
            <span className={'text-secondary text-[16px]'}>
              {amount && quoteLpDetail?.apr
                ? formatNumberPrecision(
                    Number(amount) * Number(quoteLpDetail?.apr),
                    COMMON_PRICE_DISPLAY_DECIMALS,
                  )
                : '--'}{' '}
              {pool?.quoteSymbol}
            </span>
          </Box>
        </Card>
      </Box>
      {isInsufficient && (
        <Box className={'mt-[4px] text-[14px] leading-[1]'}>
          <p className={'text-wrong'}>
            <Trans>Insufficient balance</Trans>
          </p>
        </Box>
      )}
      <Box className="mt-[8px] mb-[4px] w-full">
        {quoteLpDetail?.state === MarketPoolState.PreBench ||
        quoteLpDetail?.state === MarketPoolState.Bench ? (
          <>
            <DefaultButton variant="contained" className={'w-full'} disabled>
              <Trans>暂停中</Trans>
            </DefaultButton>
          </>
        ) : (
          <TradeButton
            variant="contained"
            className={'w-full'}
            disabled={
              !amount ||
              isInsufficient ||
              pool?.state === MarketPoolState.PreBench ||
              pool?.state === MarketPoolState.Bench
            }
            loading={loading}
            onClick={onHandleSubscribe}
          >
            <Trans>Subscribe</Trans>
          </TradeButton>
        )}
      </Box>
      <Describe>
        <EstRate />

        <PriceImpact slippage={slippage} setSlippage={setSlippage} />

        <DescribeItem
          title={
            <span className={'underline decoration-dashed underline-offset-2'}>
              <Trans>Fee</Trans>
            </span>
          }
        >
          <Box
            className={
              'bg-brand-10 text-green border-green flex rounded-[20px] border-[0.5px] px-[8px] py-[4px]'
            }
          >
            <Trans>Free forever</Trans>
          </Box>
        </DescribeItem>
      </Describe>
    </Box>
  )
}
