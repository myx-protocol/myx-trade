import { Trans } from '@lingui/react/macro'
import { Box, Button } from '@mui/material'
import { TipsFill, WalletLine } from '@/components/Icon'
import { NumericInputWithAdornment } from '@/pages/Earn/components/Trade/NumericInput.tsx'
import ArrowDownLong from '@/components/Icon/set/ArrowDownLong.tsx'
import { Describe } from '@/components/Describe.tsx'
import { TradeButton } from '@/components/Button/TradeButton.tsx'
import { Card } from '@/pages/Earn/components/Trade/Card.tsx'
import { t } from '@lingui/core/macro'
import {
  quote as Quote,
  getBalanceOf,
  formatUnits,
  MarketPoolState,
  TriggerType,
} from '@myx-trade/sdk'
import { useCallback, useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PoolContext } from '../../context'
import { useQuery } from '@tanstack/react-query'
import { getAssetIcon } from '@/utils/coin.tsx'
import { EstRate } from '@/pages/Earn/components/Trade/EstRate.tsx'
import { isSafeNumber } from '@/utils'
import { toast } from '@/components/UI/Toast'
import { DefaultButton } from '@/components/Button/DefaultButton.tsx'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { Tooltips } from '@/components/UI/Tooltips'
import { Fee } from '@/pages/Earn/components/Trade/Fee.tsx'
import { showErrorToast } from '@/config/error'
import { decimalToPercent, formatNumber } from '@/utils/number.ts'
import { Change } from '@/components/Change'
import { ConnectButton } from '@/components/ConnectButton.tsx'
import { InsufficientBalance } from './Error.tsx'
import { PoolSecurityState } from '@/request/lp/type.ts'
import { TPSL } from '@/pages/Earn/components/Trade/TPSL.tsx'
import { useEarnOrderStore } from '@/pages/Earn/store'
import { parseTriggerPrice } from '@/utils/TpSl.ts'
import { TpSlTypeEnum } from '@/components/Trade/type.ts'
import Big from 'big.js'
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
export const Subscribe = () => {
  const { chainId, poolId } = useParams()
  const { pool, quoteLpDetail, poolInfoRefetch, riskLevelConfig, price } = useContext(PoolContext)
  const {
    slippage,
    setSlippage,
    tpType,
    tpValue,
    slValue,
    setSlValue,
    setTpValue,
    slType,
    tpSlOpen,
  } = useEarnOrderStore()
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

      if (pool?.quoteToken && account) {
        const bigintBalance = await getBalanceOf(+chainId, account, pool?.quoteToken)
        // todo api 未返回 quoteDecimals
        const _balance = formatUnits(bigintBalance, pool.quoteDecimals)
        return _balance
      }
    },
  })

  const isInsufficient = useMemo(() => {
    if (amount && balance) {
      if (new Big(amount).gt(balance)) return true
      return false
    }
    return false
  }, [balance, amount])

  const onHandleMax = useCallback(() => {
    if (balance) {
      setAmount(balance)
    }
  }, [balance])

  const onAmountChange = useCallback(({ value }: { value: string; floatValue?: number }) => {
    setAmount(value || '')
  }, [])

  const { addRecord } = usePoolTxRecordsStore()
  const { waitExecutionResult } = useWaitExecutionResult()

  const onHandleSubscribe = useCallback(async () => {
    try {
      setLoading(true)
      if (!chainId || !poolId || !amount) return
      const checked = await onAction()
      if (!checked) return

      if (riskLevelConfig?.securityState === PoolSecurityState.NOT_SECURITY) return

      const tpsl = tpSlOpen
        ? [
            {
              triggerType: TriggerType.GTE,
              triggerPrice: parseTriggerPrice({
                type: tpType,
                value: tpValue,
                currentPrice: price,
                amount,
              }),
            },
            {
              triggerType: TriggerType.LTE,
              triggerPrice: parseTriggerPrice({
                type: slType,
                value:
                  slValue && slType !== TpSlTypeEnum.PRICE
                    ? new Big(slValue).mul(-1).toString()
                    : slValue,
                currentPrice: price,
                amount,
              }),
            },
          ]
        : []

      const params = {
        chainId: +chainId,
        poolId,
        amount: amount,
        slippage: Number(slippage),
        tpsl: tpSlOpen
          ? tpsl
              .filter((item) => item.triggerPrice && Number(item.triggerPrice) > 0)
              .map((data) => {
                return {
                  triggerType: data.triggerType,
                  triggerPrice: Number(data.triggerPrice),
                }
              })
          : undefined,
      }

      console.log('Quote lp Deposit params:', params)
      const res = await Quote.deposit(params)
      if (res) {
        addRecord({
          chainId: +chainId,
          txId: res.txId,
          poolId,
          type: PoolTxType.DepositQuote,
          txHash: res.hash,
        })
        waitExecutionResult({
          chainId: +chainId,
          poolId: poolId,
          txId: res.txId,
          onExecutionResult: (data) => {
            if (data.state === ExecutionProgressState.Finalized) {
              toast.success({ title: t`Successfully subscribe` })
              refetch?.()
              poolInfoRefetch()
            } else if (data.state === ExecutionProgressState.Cancel) {
              toast.error({ title: t`Subscribe Order Canceled` })
            }
          },
        })
      }
      toast.success({ title: t`Subscribe Order Submitted` })
      setAmount('')
      setSlValue('')
      setTpValue('')
    } catch (error) {
      showErrorToast(error)
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
    riskLevelConfig,
    price,
    refetch,
    tpSlOpen,
    tpType,
    tpValue,
    slType,
    slValue,
    setTpValue,
    setSlValue,
    addRecord,
    waitExecutionResult,
  ])
  return (
    <>
      <Box className={'mt-[8px] flex flex-col gap-[6px]'}>
        <Box className={'relative z-[1] flex flex-col gap-[6px]'}>
          <Card
            title={
              <>
                <Trans>Subscription Amount</Trans>
                <Box className={'flex items-center gap-[4px] text-[12px]'}>
                  <WalletLine size={14} />
                  <span>
                    {formatNumber(balance, { showUnit: false })} {pool?.quoteSymbol}
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
                slotProps={inputStyle}
                min={0}
              />
              <Box className={'flex items-center gap-[12px]'}>
                <Button variant="text" className={'!min-w-[auto] !p-[0px]'} onClick={onHandleMax}>
                  <Trans>Max</Trans>
                </Button>
              </Box>
              {pool?.quoteSymbol && (
                <Box
                  className={
                    'bg-deep border-dark-border flex items-center gap-[2px] rounded-[30px] border-1 py-[3px] pr-[6px] pl-[4px] text-[14px]'
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
              'bg-base border-deep absolute top-[50%] left-[176px] z-[2] flex h-[48px] w-[48px] translate-y-[-50%] items-center justify-center rounded-[12px] border-[4px] text-white'
            }
          >
            <ArrowDownLong size={22} />
          </Box>

          <Card
            className={'border-base border-1 bg-transparent'}
            title={
              <>
                <Box className={'flex items-center gap-[4px]'}>
                  <Trans>24h Estimated Earnings</Trans>
                  <Tooltips
                    title={t`Estimated 24h yield based on pool trading activity over the last 24 hours. For reference only; returns are not guaranteed.`}
                  >
                    <TipsFill size={14} className={'cursor-pointer'} />
                  </Tooltips>
                </Box>
              </>
            }
          >
            <Box className={'flex items-end gap-[8px] leading-[1] font-[700]'}>
              <Change className={'text-[20px] text-white'} change={quoteLpDetail?.apr}>
                {isSafeNumber(quoteLpDetail?.apr)
                  ? decimalToPercent(quoteLpDetail?.apr as string)
                  : '--%'}
              </Change>

              <Change
                className={'text-secondary text-[14px]'}
                change={(Number(amount) * Number(quoteLpDetail?.apr)).toString()}
              >
                {isSafeNumber(amount) && isSafeNumber(quoteLpDetail?.apr)
                  ? formatNumber(Number(amount) * Number(quoteLpDetail?.apr), {
                      showUnit: false,
                    })
                  : '--'}{' '}
                {pool?.quoteSymbol}
              </Change>
            </Box>
          </Card>
        </Box>
        {/* TP/SL */}
        {pool?.quoteToken && <TPSL className="mt-[8px]" quoteSymbol={pool?.quoteSymbol} />}

        {isInsufficient && <InsufficientBalance className={'mt-[4px]'} />}
        <Box className="mt-[8px] mb-[4px] w-full">
          {quoteLpDetail?.state === MarketPoolState.PreBench ||
          quoteLpDetail?.state === MarketPoolState.Bench ? (
            <>
              <DefaultButton variant="contained" className={'w-full'} disabled>
                <Trans>暂停中</Trans>
              </DefaultButton>
            </>
          ) : (
            <ConnectButton>
              <TradeButton
                id="earn_detail_submit_subscribe_btn_h5"
                data-analytic="earn_detail_submit_subscribe_btn_h5"
                variant="contained"
                className={'w-full'}
                disabled={
                  !amount ||
                  isInsufficient ||
                  pool?.state === MarketPoolState.PreBench ||
                  pool?.state === MarketPoolState.Bench ||
                  Number(amount) <= 0 ||
                  riskLevelConfig?.securityState === PoolSecurityState.NOT_SECURITY
                }
                loading={loading}
                onClick={onHandleSubscribe}
                loadingPosition="start" // 图标显示在文字前面
              >
                <Trans>Subscribe</Trans>
              </TradeButton>
            </ConnectButton>
          )}
        </Box>
        <Describe>
          <EstRate />
          <Fee />
        </Describe>
      </Box>
    </>
  )
}
