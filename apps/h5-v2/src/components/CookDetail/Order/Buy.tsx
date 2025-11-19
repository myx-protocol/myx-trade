import { Trans } from '@lingui/react/macro'
import Wallet from '@/components/Icon/set/Wallet.tsx'
import { CookCoin } from '@/components/CookDetail/CookCoin'
import IconArrowDownLong from '@/components/Icon/set/ArrowDownLong.tsx'
import IconHelp from '@/components/Icon/set/Help.tsx'
import { useCookOrderStore } from '@/components/CookDetail/Order/store.ts'
import { OrderOptions } from '@/components/CookDetail/Order/OrderOptions'
import { Box } from '@mui/material'
import { TradeButton } from '@/components/TradeButton.tsx'
import { useAccount } from 'wagmi'
import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatUnits, getBalanceOf, base as Base } from '@myx-trade/sdk'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_BASE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { usePoolContext } from '@/pages/Cook/hook'
import { isSafeNumber } from '@/utils'
import { formatNumber } from '@/utils/number.ts'
import { useExchangeRate } from '@/pages/Cook/hook/rate.ts'
import { toast } from 'react-hot-toast'
import { t } from '@lingui/core/macro'
import { NumericInputWithAdornment } from '@/pages/Earn/components/Trade/NumericInput.tsx'

export const Buy = () => {
  const { slippage } = useCookOrderStore()
  const { chainId, baseLpDetail, pool, poolId, price } = usePoolContext()
  const { address: account } = useAccount()
  const [amount, setAmount] = useState<string>('')

  const [loading, setLoading] = useState<boolean>(false)
  const rate = useExchangeRate()

  const { data: balance, refetch } = useQuery({
    queryKey: [{ key: 'getBaseBalance' }, chainId, poolId, account],
    refetchInterval: 5000,
    queryFn: async () => {
      if (!poolId || !account || !chainId) return ''
      if (!pool) return ''

      if (pool?.baseToken && account) {
        const bigintBalance = await getBalanceOf(+chainId, account, pool?.baseToken)
        // todo api 未返回 quoteDecimals
        const _balance = formatUnits(bigintBalance, pool.baseDecimals)
        return formatNumberPrecision(_balance, COMMON_BASE_DISPLAY_DECIMALS, false, false)
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

  const onHandleBuy = useCallback(async () => {
    try {
      setLoading(true)
      if (!chainId || !poolId || !amount) return
      await Base.deposit({
        chainId: +chainId,
        poolId,
        amount: Number(amount),
        slippage: Number(slippage),
      })
      toast.success(t`Successfully buy`)
      await refetch()
      setAmount('')
    } catch (e) {
      toast.error(JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [chainId, amount, slippage, poolId])

  return (
    <>
      <Box className="mt-[12px]">
        <div className="relative rounded-[16px] bg-[#18191F] px-[12px] py-[20px] leading-[1]">
          {/* title */}
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-normal text-[#CED1D9]">
              <Trans>Pay</Trans>
            </p>
            {/* <s[an>] */}
            <p className="flex items-center gap-[4px]">
              <Wallet size={14} color="#848E9C" />
              <span className="text-[14px] font-medium text-[#CED1D9]">
                {formatNumberPrecision(balance, COMMON_BASE_DISPLAY_DECIMALS)}
                {pool?.baseSymbol}
              </span>
            </p>
          </div>

          {/* form input wrap */}
          <div className="mt-[12px] flex items-center">
            <div className="w-[166px]">
              <NumericInputWithAdornment
                className={'flex-1'}
                placeholder={t`Amount`}
                autoFocus={true}
                value={amount}
                onValueChange={onAmountChange}
              />
            </div>
            {/* action */}
            <div className="ml-[12px] flex items-center gap-[12px]">
              <div
                role="button"
                className="text-[14px] font-medium text-[#00E3A5]"
                onClick={onHandleMax}
              >
                <Trans>Max</Trans>
              </div>
              <CookCoin
                symbol={pool?.baseSymbol as string}
                logoUrl={baseLpDetail?.tokenIcon as string}
              />
            </div>
          </div>
          <div className="absolute bottom-0 left-[50%] translate-x-[-50%] translate-y-[37px] rounded-[12px] border-[4px] border-[#101114] bg-[#18191F] p-[13px] text-white">
            <IconArrowDownLong size={22} />
          </div>
        </div>

        <div className="mt-[4px] rounded-[16px] bg-[#18191F] px-[12px] py-[20px] leading-[1]">
          {/* title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-[14px] font-normal text-[#CED1D9]">
                <Trans>Receive</Trans>
              </p>
              <span className="ml-[4px] flex">
                <IconHelp size={14} />
              </span>
            </div>
          </div>

          {/* form input wrap */}
          <div className="mt-[12px] flex items-center">
            <div className="flex-[1_1_0%]">
              <span className="text-[32px] leading-[38px] font-bold text-white">
                {amount && rate ? formatNumber(Number(amount) * Number(rate)) : '--'}
              </span>
            </div>
            {/* action */}
            <div className="ml-[12px] flex items-center">
              <CookCoin
                symbol={baseLpDetail?.mBaseQuoteSymbol as string}
                logoUrl={baseLpDetail?.tokenIcon as string}
              />
            </div>
          </div>
        </div>

        <OrderOptions />

        {isInsufficient && (
          <Box className={'mt-[4px] text-[14px] leading-[1]'}>
            <p className={'text-wrong'}>
              <Trans>Insufficient balance</Trans>
            </p>
          </Box>
        )}
        <Box className="mt-[12px] w-full">
          <TradeButton
            variant="contained"
            className={'w-full'}
            disabled={!amount || isInsufficient}
            loading={loading}
            onClick={onHandleBuy}
          >
            <Trans>Buy</Trans>
          </TradeButton>
        </Box>
      </Box>
    </>
  )
}
