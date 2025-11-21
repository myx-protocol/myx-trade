import { Trans } from '@lingui/react/macro'
import Wallet from '@/components/Icon/set/Wallet.tsx'
import { CookCoin } from '@/components/CookDetail/CookCoin'
import IconArrowDownLong from '@/components/Icon/set/ArrowDownLong.tsx'
import IconHelp from '@/components/Icon/set/Help.tsx'
import { OrderOptions } from '@/components/CookDetail/Order/OrderOptions'
import { Box } from '@mui/material'
import { SellButton } from '@/components/SellButton.tsx'
import { FormControlLabel } from '@/components/UI/FormControlLabel'
import { CheckBox } from '@/components/UI/CheckBox'
import { useCookOrderStore } from '@/components/CookDetail/Order/store.ts'
import { usePoolContext } from '@/pages/Cook/hook'
import { useCallback, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import {
  getBalanceOf,
  base as Base,
  formatUnits,
  COMMON_LP_AMOUNT_DECIMALS,
  pool as Pool,
} from '@myx-trade/sdk'
import { formatNumberPrecision } from '@/utils/formatNumber'
import { COMMON_BASE_DISPLAY_DECIMALS, COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { isSafeNumber } from '@/utils'
import { getAssetIcon } from '@/utils/coin.tsx'
import { toast } from 'react-hot-toast'
import { t } from '@lingui/core/macro'
import { NumericInputWithAdornment } from '@/pages/Earn/components/Trade/NumericInput.tsx'
import { OrderTips } from '@/components/CookDetail/Order/OrderTips'

export const Sell = () => {
  const { retainGenesisLPShares, setRetainGenesisLPShares, slippage } = useCookOrderStore()
  const { pool, baseLpDetail, chainId, poolId } = usePoolContext()
  const { address: account } = useAccount()
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  // const [balance, setBalance] = useState<string>('')

  const { data: balance, refetch } = useQuery({
    queryKey: [{ key: 'getQuoteBalance' }, chainId, poolId, account],
    refetchInterval: 5000,
    queryFn: async () => {
      if (!poolId || !account || !chainId) return ''
      if (!pool) return ''

      if (pool?.basePoolToken && account) {
        const bigintBalance = await getBalanceOf(+chainId, account, pool?.basePoolToken)
        // todo api 未返回 quoteDecimals
        const _balance = formatUnits(bigintBalance, COMMON_LP_AMOUNT_DECIMALS)
        return formatNumberPrecision(_balance, COMMON_BASE_DISPLAY_DECIMALS, false, false)
      }
    },
  })

  const { data: userShareBase } = useQuery({
    queryKey: [{ key: 'userShareBase' }, poolId, pool],
    enabled: !!poolId && !!pool?.basePoolToken,
    queryFn: async () => {
      if (!poolId || !pool) return null
      const result = await Pool.getUserGenesisShare(chainId, pool?.basePoolToken, account as string)

      if (result) {
        return formatUnits(result, COMMON_LP_AMOUNT_DECIMALS)
      }
      return
    },
  })

  const { data: receive } = useQuery({
    queryKey: [{ key: 'previewUserWithdrawData' }, amount, poolId, account],
    enabled: !!amount && !!account && !!poolId,
    queryFn: async () => {
      if (!account || !poolId || !account) return
      const res = await Base.previewUserWithdrawData({
        chainId,
        amount,
        account,
        poolId,
      })
      if (res) {
        return {
          coin: formatUnits(res?.baseAmountOut, pool?.baseDecimals),
          profit: formatUnits(res?.rebateAmount, pool?.quoteDecimals),
        }
      }
      return
    },
  })

  const trueBalance = useMemo(() => {
    if (retainGenesisLPShares) {
      if (isSafeNumber(balance) && isSafeNumber(userShareBase)) {
        const _balance = Number(balance) - Number(userShareBase)
        return _balance < 0 ? _balance : _balance
      }
      return ''
    } else {
      return balance
    }
  }, [balance, userShareBase, retainGenesisLPShares])

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

  const onHandleSell = useCallback(async () => {
    try {
      setLoading(true)
      if (!chainId || !poolId || !amount) return
      await Base.withdraw({
        chainId: +chainId,
        poolId,
        amount: Number(amount),
        slippage: Number(slippage),
      })
      toast.success(t`Successfully sell`)
      await refetch()
      setAmount('')
    } catch (e) {
      toast.error(JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }, [chainId, amount, slippage, poolId])

  return (
    <div className="mt-[12px]">
      <div className="relative rounded-[16px] bg-[#18191F] px-[12px] py-[20px] leading-[1]">
        {/* title */}
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-normal text-[#CED1D9]">
            <Trans>Sell</Trans>
          </p>
          {/* <s[an>] */}
          <p className="flex items-center gap-[4px]">
            <Wallet size={14} color="#848E9C" />
            <span className="text-[14px] font-medium text-[#CED1D9]">
              {formatNumberPrecision(trueBalance, COMMON_BASE_DISPLAY_DECIMALS)}{' '}
              {baseLpDetail?.mBaseQuoteSymbol}
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
              symbol={baseLpDetail?.mBaseQuoteSymbol as string}
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
              {receive?.coin
                ? formatNumberPrecision(receive.coin, COMMON_BASE_DISPLAY_DECIMALS)
                : '--'}
            </span>
          </div>
          {/* action */}
          <div className="ml-[12px] flex items-center">
            <CookCoin
              symbol={pool?.baseSymbol as string}
              logoUrl={baseLpDetail?.tokenIcon as string}
            />
          </div>
        </div>
      </div>
      <div className="mt-[4px] rounded-[16px] bg-[#18191F] px-[12px] py-[20px] leading-[1]">
        {/* title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-[14px] font-normal text-[#CED1D9]">
              <Trans>Profit</Trans>
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
              {receive?.profit
                ? formatNumberPrecision(receive.profit, COMMON_PRICE_DISPLAY_DECIMALS)
                : '--'}
            </span>
          </div>
          {/* action */}
          <div className="ml-[12px] flex items-center">
            <CookCoin
              symbol={pool?.quoteSymbol as string}
              logoUrl={getAssetIcon(pool?.quoteSymbol as string)}
            />
          </div>
        </div>
      </div>
      <div className="mt-[4px]">
        <FormControlLabel
          control={
            <CheckBox
              checked={retainGenesisLPShares}
              onChange={() => setRetainGenesisLPShares(!retainGenesisLPShares)}
            />
          }
          label={
            <div className="flex items-center">
              <p>
                <Trans>保留创世LP份额</Trans>
              </p>
              <span className="ml-[4px] flex">
                <IconHelp size={12} />
              </span>
            </div>
          }
        />
      </div>
      <OrderOptions />
      {isInsufficient && (
        <Box className={'mt-[4px] text-[14px] leading-[1]'}>
          <p className={'text-wrong'}>
            <Trans>Insufficient balance</Trans>
          </p>
        </Box>
      )}
      {/* todo 三种状态*/}
      <OrderTips />
      {/*todo 重新激活*/}
      <Box className="mt-[12px] w-full">
        <SellButton
          variant="contained"
          className={'w-full'}
          disabled={!amount || isInsufficient}
          loading={loading}
          onClick={onHandleSell}
        >
          <Trans>Sell</Trans>
        </SellButton>
      </Box>
    </div>
  )
}
