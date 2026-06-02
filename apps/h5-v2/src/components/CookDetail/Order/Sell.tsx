import { Trans } from '@lingui/react/macro'
import Wallet from '@/components/Icon/set/Wallet.tsx'
import { CookCoin } from '@/components/CookDetail/CookCoin'
import IconArrowDownLong from '@/components/Icon/set/ArrowDownLong.tsx'
import IconHelp from '@/components/Icon/set/Help.tsx'
import { OrderOptions } from '@/components/CookDetail/Order/OrderOptions'
import { Box } from '@mui/material'
import { SellButton } from '@/components/Button/SellButton.tsx'
import { FormControlLabel } from '@/components/UI/FormControlLabel'
import { CheckBox } from '@/components/UI/CheckBox'
import { useCookOrderStore } from '@/components/CookDetail/Order/store.ts'
import { usePoolContext } from '@/pages/Cook/hook'
import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { InsufficientBalance } from '@/pages/Earn/components/Trade/Error'
import {
  getBalanceOf,
  base as Base,
  formatUnits,
  pool as Pool,
  COMMON_LP_AMOUNT_DECIMALS,
  parseUnits,
} from '@myx-trade/sdk'
import { formatNumberPercent } from '@/utils/formatNumber'
import { isSafeNumber } from '@/utils'
import { getAssetIcon } from '@/utils/coin.tsx'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import { NumericInputWithAdornment } from '@/pages/Earn/components/Trade/NumericInput.tsx'
import { TipsFill } from '@/components/Icon'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { Tooltips } from '@/components/UI/Tooltips'
import { showErrorToast } from '@/config/error'
import { ConnectButton } from '@/components/ConnectButton.tsx'
import Big from 'big.js'
import { formatNumber } from '@/utils/number.ts'
import { usePoolTxRecordsStore } from '@/store/poolTxRecords'
import { useWaitExecutionResult } from '@/hooks/execution/useWaitExecutionResult'
import { ExecutionProgressState } from '@/hooks/execution/Progress'
import { PoolTxType } from '@/store/poolTxRecords'
const inputStyle = {
  htmlInput: {
    style: {
      fontSize: 20,
      fontWeight: 700,
    },
  },
}

export const Sell = () => {
  const { retainGenesisLPShares, setRetainGenesisLPShares, slippage } = useCookOrderStore()
  const { pool, baseLpDetail, chainId, poolId, genesisFeeRate, poolInfoRefetch } = usePoolContext()
  const { address: account } = useWalletConnection()
  const onAction = useWalletActions()
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
        return _balance
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
    queryKey: [{ key: 'previewUserWithdrawData' }, amount, poolId, account, pool],
    enabled: !!amount && !!account && !!poolId && !!pool,
    queryFn: async () => {
      if (!account || !poolId || !amount || !pool) return
      const res = await Base.previewUserWithdrawData({
        chainId,
        amount,
        account,
        poolId,
      })
      console.log(res)
      if (res && pool) {
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
        const _balance = new Big(balance || 0).minus(new Big(userShareBase || 0)).toString()
        return Number(_balance) < 0 ? '0' : _balance
      }
      return balance
    } else {
      return balance
    }
  }, [balance, userShareBase, retainGenesisLPShares])

  const isInsufficient = useMemo(() => {
    if (amount && trueBalance) {
      if (new Big(amount).gt(trueBalance)) return true
      return false
    }
    return false
  }, [trueBalance, amount])

  const burned = useMemo(() => {
    if (retainGenesisLPShares) return ''
    if (isInsufficient) return ''
    if (!amount || !balance || !userShareBase) return ''
    const value = new Big(amount).minus(new Big(balance).minus(new Big(userShareBase))).toString()
    console.log('value', value)
    return value
  }, [retainGenesisLPShares, balance, userShareBase, amount, isInsufficient])

  const { data: withdrawableLpAmount } = useQuery({
    queryKey: [{ key: 'withdrawableLpAmount' }, amount, poolId, account, isInsufficient],
    enabled: !!amount && !!account && !isInsufficient && !!poolId && Number(amount) > 0,
    queryFn: async () => {
      if (!account || !poolId || !amount || isInsufficient || Number(amount) <= 0) return
      const res = await Base.withdrawableLpAmount({
        chainId,
        poolId,
      })
      console.log(`withdrawableLpAmount: ${res}, ${formatUnits(res, COMMON_LP_AMOUNT_DECIMALS)}`)
      return res
    },
  })

  const onHandleMax = useCallback(() => {
    if (trueBalance) {
      setAmount(trueBalance)
    }
  }, [trueBalance])

  const onAmountChange = useCallback(
    ({ floatValue, value }: { value: string; floatValue?: number }) => {
      setAmount(value || '')
    },
    [],
  )

  const { addRecord } = usePoolTxRecordsStore()
  const { waitExecutionResult } = useWaitExecutionResult()

  const onHandleSell = useCallback(async () => {
    try {
      setLoading(true)
      if (!chainId || !poolId || !amount) return
      const checked = await onAction()
      if (!checked) return
      console.log(amount, formatUnits(withdrawableLpAmount || 0n, COMMON_LP_AMOUNT_DECIMALS))
      if (
        withdrawableLpAmount !== undefined &&
        parseUnits(amount, COMMON_LP_AMOUNT_DECIMALS) > withdrawableLpAmount
      ) {
        toast.error({
          title: t`Some funds are locked in active trades. Max available to sell: [${formatNumber(formatUnits(withdrawableLpAmount, COMMON_LP_AMOUNT_DECIMALS), { showUnit: false })}] LP.`,
        })
        return
      }
      const res = await Base.withdraw({
        chainId: +chainId,
        poolId,
        amount: amount,
        slippage: Number(slippage),
      })
      if (res) {
        addRecord({
          chainId: +chainId,
          txId: res.txId,
          poolId,
          type: PoolTxType.WithdrawBase,
          txHash: res.hash,
        })
        waitExecutionResult({
          chainId: +chainId,
          poolId,
          txId: res.txId,
          onExecutionResult: (data) => {
            if (data.state === ExecutionProgressState.Finalized) {
              toast.success({ title: t`Successfully sell` })
              refetch?.()
              poolInfoRefetch()
            } else if (data.state === ExecutionProgressState.Cancel) {
              toast.error({ title: t`Order Canceled` })
            }
          },
        })
        toast.success({ title: t`Order Submitted` })
      }
      setAmount('')
    } catch (e) {
      showErrorToast(e)
    } finally {
      setLoading(false)
    }
  }, [
    chainId,
    amount,
    slippage,
    poolId,
    onAction,
    poolInfoRefetch,
    withdrawableLpAmount,
    addRecord,
    waitExecutionResult,
  ])

  return (
    <div className="mt-[12px]">
      <div className="bg-base relative rounded-[10px] px-[12px] py-[16px] leading-[1]">
        {/* title */}
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-normal text-[#CED1D9]">
            <Trans>Sell</Trans>
          </p>
          {/* <s[an>] */}
          <p className="flex items-center gap-[4px]">
            <Wallet size={14} color="#848E9C" />
            <span className="text-[12px] font-medium text-[#CED1D9]">
              {formatNumber(trueBalance, {
                showUnit: false,
              })}{' '}
              {baseLpDetail?.mBaseQuoteSymbol}
            </span>
          </p>
        </div>

        {/* form input wrap */}
        <div className="mt-[12px] flex items-center">
          <div className="flex-1">
            <NumericInputWithAdornment
              className={'flex-1'}
              placeholder={t`Amount`}
              autoFocus={true}
              value={amount}
              onValueChange={onAmountChange}
              slotProps={inputStyle}
              min={0}
            />
          </div>
          {/* action */}
          <div className="ml-[6px] flex items-center gap-[12px]">
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

      <div className="border-base mt-[8px] rounded-[10px] border-1 px-[12px] py-[16px] leading-[1]">
        {/* title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-[14px] font-normal text-[#CED1D9]">
              <Trans>Receive</Trans>
            </p>
            <Tooltips
              title={t`Estimated redemption amount. Actual receipt is subject to slippage and price fluctuations.`}
            >
              <span className="ml-[4px] flex cursor-pointer">
                <IconHelp size={14} />
              </span>
            </Tooltips>
          </div>
        </div>

        {/* form input wrap */}
        <div className="mt-[12px] flex items-center">
          <div className="flex-[1_1_0%]">
            <span className="text-[20px] leading-[38px] font-bold text-white">
              {formatNumber(receive?.coin, {
                showUnit: false,
              })}
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
      <div className="border-base mt-[8px] rounded-[10px] border-1 px-[12px] py-[16px] leading-[1]">
        {/* title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-[14px] font-normal text-[#CED1D9]">
              <Trans>Profit</Trans>
            </p>
            <Tooltips title={t`Estimated realized PnL for this redemption.`}>
              <span className="ml-[4px] flex cursor-pointer">
                <IconHelp size={14} />
              </span>
            </Tooltips>
          </div>
        </div>

        {/* form input wrap */}
        <div className="mt-[12px] flex items-center">
          <div className="flex-[1_1_0%]">
            <span className="text-[20px] leading-[38px] font-bold text-white">
              {formatNumber(receive?.profit, {
                showUnit: false,
              })}
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
      <div className="mt-[8px]">
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
              <Tooltips
                title={t`When checked, the system will only redeem your regular LP shares.`}
              >
                <span className="ml-[4px] flex cursor-pointer">
                  <IconHelp size={12} />
                </span>
              </Tooltips>
            </div>
          }
        />
      </div>
      <OrderOptions />
      {isInsufficient && <InsufficientBalance className={'mt-[8px]'} />}

      {burned && Number(burned) > 0 && (
        <Box className={'border-base mt-[8px] flex gap-[4px] rounded-[8px] border-1 p-[12px]'}>
          <Box className={'text-third mt-[2px]'}>
            <TipsFill size={14} />
          </Box>
          <p className={'text-regular text-[12px] leading-[1.5]'}>
            <Trans>
              This will burn{' '}
              <span className={'text-warning'}>{formatNumber(burned, { showUnit: false })}</span>{' '}
              {baseLpDetail?.mBaseQuoteSymbol} and you will permanently forfeit the right to your{' '}
              <span className={'text-warning'}>
                {formatNumberPercent(genesisFeeRate, 0, false)}
              </span>{' '}
              share of trading fees.
            </Trans>
          </p>
        </Box>
      )}
      <Box className="mt-[12px] w-full">
        <ConnectButton>
          <SellButton
            id="cook_detail_submit_sell_btn_h5"
            data-analytics="cook_detail_submit_sell_btn_h5"
            variant="contained"
            className={'w-full'}
            disabled={!amount || isInsufficient || Number(amount) <= 0}
            loading={loading}
            onClick={onHandleSell}
          >
            <Trans>Sell</Trans>
          </SellButton>
        </ConnectButton>
      </Box>
    </div>
  )
}
