import { Trans } from '@lingui/react/macro'
import { Box, Button } from '@mui/material'
import { TipsFill, WalletLine } from '@/components/Icon'
import { NumericInputWithAdornment } from '@/pages/Earn/components/Trade/NumericInput.tsx'
import ArrowDownLong from '@/components/Icon/set/ArrowDownLong.tsx'
import { Describe, DescribeItem } from '@/components/Describe.tsx'
import { TradeButton } from '@/components/TradeButton.tsx'
import { Card } from '@/pages/Earn/components/Trade/Card.tsx'
import { CustomCheckBox } from '@/components/CheckBox.tsx'
import { useCallback, useContext, useMemo, useState } from 'react'
import { t } from '@lingui/core/macro'
import { EstRate } from '@/pages/Earn/components/Trade/EstRate.tsx'
import { PriceImpact } from '@/pages/Earn/components/Trade/PriceImpact.tsx'
import { TradeContext } from '@/pages/Earn/components/Trade/Context.ts'
import { PoolContext } from '@/pages/Earn/context.ts'
import { useQuery } from '@tanstack/react-query'
import { formatUnits, getBalanceOf, quote as Quote, Market, pool as Pool } from '@myx-trade/sdk'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { useAccount } from 'wagmi'
import { isSafeNumber } from '@/utils'
import { getAssetIcon } from '@/utils/coin.tsx'
import toast from 'react-hot-toast'

export const Redeem = () => {
  const { pool, quoteLpDetail, chainId, poolId, price } = useContext(PoolContext)
  const { slippage, setSlippage } = useContext(TradeContext)
  const { address: account } = useAccount()
  const [retainLPShare, setRetailLpShare] = useState(true)
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const { data: balance, refetch } = useQuery({
    queryKey: [{ key: 'getQuoteBalance' }, chainId, poolId, account],
    refetchInterval: 5000,
    queryFn: async () => {
      if (!poolId || !account || !chainId) return ''
      if (!pool) return ''

      if (pool?.quotePoolToken && account) {
        const bigintBalance = await getBalanceOf(+chainId, account, pool?.quotePoolToken)
        // todo api 未返回 quoteDecimals
        const _balance = formatUnits(bigintBalance, Market[chainId].lpDecimals)
        return formatNumberPrecision(_balance, COMMON_PRICE_DISPLAY_DECIMALS, false, false)
      }
    },
  })

  const { data: userShare } = useQuery({
    queryKey: [{ key: 'userShare' }, poolId, pool, chainId],
    enabled: !!poolId && !!pool?.quotePoolToken && !!chainId,
    queryFn: async () => {
      if (!poolId || !pool || !chainId) return ''
      const result = await Pool.getUserGenesisShare(
        chainId,
        pool?.quotePoolToken,
        account as string,
      )

      if (result) {
        const _balance = formatUnits(result, Market[chainId].lpDecimals)
        return formatNumberPrecision(_balance, COMMON_PRICE_DISPLAY_DECIMALS, false, false)
      }
      return ''
    },
  })

  const trueBalance = useMemo(() => {
    if (retainLPShare) {
      if (isSafeNumber(balance) && isSafeNumber(userShare)) {
        const _balance = Number(balance) - Number(userShare)
        return _balance < 0 ? _balance : _balance
      }
      return ''
    } else {
      return balance
    }
  }, [balance, userShare, retainLPShare])

  const isInsufficient = useMemo(() => {
    if (isSafeNumber(amount) && isSafeNumber(trueBalance)) {
      if (Number(amount) > Number(trueBalance)) return true
      return false
    }
    return false
  }, [trueBalance, amount])

  const onHandleMax = useCallback(() => {
    if (balance) {
      setAmount(balance)
    }
  }, [balance])

  const onAmountChange = useCallback(({ floatValue }: { value: string; floatValue?: number }) => {
    setAmount(floatValue?.toString() || '')
  }, [])

  const onHandleRedeem = useCallback(async () => {
    try {
      setLoading(true)
      if (!chainId || !poolId || !amount) return
      await Quote.withdraw({
        chainId: +chainId,
        poolId,
        amount: Number(amount),
        slippage: Number(slippage),
      })

      toast.success(t`Successfully redeem`)
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
              <Trans>Amount to Redeem</Trans>
              <Box className={'flex items-center gap-[4px] text-[12px]'}>
                <WalletLine size={14} />
                <span>
                  {formatNumberPrecision(trueBalance, COMMON_PRICE_DISPLAY_DECIMALS)}{' '}
                  {quoteLpDetail?.mBaseQuoteSymbol}
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
            <Box
              className={
                'bg-deep border-dark-border flex items-center gap-[2px] rounded-[30px] border-1 py-[4px] pr-[6px] pl-[4px]'
              }
            >
              <img
                src={quoteLpDetail?.tokenIcon}
                alt={quoteLpDetail?.mBaseQuoteSymbol}
                className={'aspect-square h-[20px] w-[20px] rounded-full'}
              />
              <span className={'leading-[1] font-[500] text-white'}>
                {quoteLpDetail?.mBaseQuoteSymbol}
              </span>
            </Box>
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
                <Trans>You Will Receive</Trans>
              </Box>
            </>
          }
        >
          <Box className={'flex items-center justify-between'}>
            <Box className={'flex items-end gap-[8px] leading-[1] font-[700]'}>
              <span className={'text-[32px] text-white'}>
                {amount && price
                  ? formatNumberPrecision(
                      Number(amount) * Number(price),
                      COMMON_PRICE_DISPLAY_DECIMALS,
                    )
                  : '--'}
              </span>
            </Box>
            <Box
              className={
                'bg-deep border-dark-border flex items-center gap-[2px] rounded-[30px] border-1 py-[4px] pr-[6px] pl-[4px]'
              }
            >
              <img
                src={getAssetIcon(pool?.quoteSymbol as string)}
                alt={pool?.quoteSymbol}
                className={'aspect-square h-[20px] w-[20px] rounded-full'}
              />
              <span className={'leading-[1] font-[500] text-white'}>{pool?.quoteSymbol}</span>
            </Box>
          </Box>
        </Card>
      </Box>
      <Box className={'flex flex-col'}>
        <Box className={'flex items-center gap-[4px] p-[4px]'}>
          <CustomCheckBox
            type={'normal'}
            label={<Trans>Retain Genesis LP Share</Trans>}
            checked={retainLPShare}
            onChange={(value: boolean) => {
              setRetailLpShare(value)
            }}
          />

          <TipsFill size={14} />
        </Box>

        <Box className={'border-base mt-[4px] flex gap-[4px] rounded-[8px] border-1 p-[12px]'}>
          <Box className={'mt-[2px]'}>
            <TipsFill size={14} />
          </Box>
          <p className={'text-regular text-[12px] leading-[1.5]'}>
            <Trans>
              This will burn... and you will permanently forfeit the right to your 2% share of
              trading fees.
            </Trans>
          </p>
        </Box>

        {isInsufficient && (
          <Box className={'mt-[4px] text-[14px] leading-[1]'}>
            <p className={'text-wrong'}>
              <Trans>Insufficient balance</Trans>
            </p>
          </Box>
        )}
        <Box className={'mt-[8px] mb-[4px] w-full'}>
          <TradeButton
            variant="contained"
            className={'w-full'}
            disabled={!amount || isInsufficient}
            loading={loading}
            onClick={onHandleRedeem}
          >
            <Trans>Redeem</Trans>
          </TradeButton>
        </Box>
      </Box>
      <Describe>
        <DescribeItem title={<Trans>Total PnL</Trans>}>
          <span>1234.12 {quoteLpDetail?.quoteSymbol}</span>
        </DescribeItem>

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
