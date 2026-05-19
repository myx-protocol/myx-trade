import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { TPSLInput } from '@/components/Trade/TradePanel/TPSL/TPSLInput'
import { TpSlTypeEnum } from '@/components/Trade/type'
import { formatNumber } from '@/utils/number'
import { clampBigNumber, parseBigNumber } from '@/utils/bn'
import { TradeButton } from '@/components/Button/TradeButton'
import { PercentSlider } from '@/components/PercentSlider'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  type AddTpSLParams,
  COMMON_LP_AMOUNT_DECIMALS,
  COMMON_PRICE_DECIMALS,
  formatUnits,
  parseUnits,
  pool as Pool,
  TriggerType,
} from '@myx-trade/sdk'
import { PoolType } from '@/request/type'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { parseTriggerPrice } from '@/utils/TpSl'
import Big from 'big.js'
import { toast } from '@/components/UI/Toast'
import { showErrorToast } from '@/config/error'
import { NumericInput } from '@/components/Dialog/NumberInput'
import { getMarketPoolPrice } from '@/request'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { Drawer } from '@/components/Drawer'
import { styled } from '@mui/material'

const DEFAULT_SLIPPAGE = 0.01

const AMOUNT_INPUT_SX = {
  '.MuiInputBase-root': {
    fontSize: '18px',
    fontWeight: 'bold',
    padding: 0,
    height: '18px',
    backgroundColor: 'transparent',
  },
} as const

const StyledDrawer = styled(Drawer)`
  .MuiPaper-root {
    padding-bottom: 0;
    padding-top: 0;
  }
`

const EstPnlDisplay = memo(({ value }: { value: string }) => (
  <div className="flex items-center justify-between">
    <p className="text-[12px] text-[#848E9C]">
      <Trans>Est. PnL</Trans>
    </p>
    <p
      className="text-[12px] font-medium"
      style={{
        color:
          value && Number(value) !== 0 ? (Number(value) > 0 ? '#00E3A5' : '#EC605A') : '#848E9C',
      }}
    >
      {value ? `$${formatNumber(value, { showUnit: false })}` : '$--'}
    </p>
  </div>
))
EstPnlDisplay.displayName = 'EstPnlDisplay'
// --- Types ---
export interface TPSLDialogProps {
  open: boolean
  onClose: () => void
  poolId: string
  chainId: number
  poolType: PoolType
  amount: string
  baseSymbol: string
  quoteSymbol: string
  costPrice?: string
  poolName?: string
}

// --- Content Component ---
const TPSLDialogContent = memo(
  ({
    open,
    onClose,
    poolId,
    chainId,
    poolType,
    amount,
    baseSymbol,
    quoteSymbol,
    costPrice,
    poolName,
  }: TPSLDialogProps) => {
    const onAction = useWalletActions()
    const isBase = poolType === PoolType.base

    // TP state
    const [tpType, setTpType] = useState<TpSlTypeEnum>(TpSlTypeEnum.Pnl)
    const [tpValue, setTpValue] = useState('')

    // SL state
    const [slType, setSlType] = useState<TpSlTypeEnum>(TpSlTypeEnum.Pnl)
    const [slValue, setSlValue] = useState('')

    // Amount / slider — redeemAmountValue is the raw input string (can be '' when cleared)
    const [redeemAmountValue, setRedeemAmountValue] = useState(amount || '0')
    const [slippage, setSlippage] = useState('1')

    const [loading, setLoading] = useState(false)

    // Ticker data for oracle price
    const tickerData = useMarketStore((state) => state.tickerData[poolId || ''])
    // const oraclePrice = tickerData?.price

    // Fetch LP price (exchange rate) from pool contract
    const { data: poolInfo } = useQuery({
      queryKey: ['tpsl_pool_info', chainId, poolId, tickerData?.price, poolType],
      enabled: !!poolId && !!chainId && open,
      queryFn: async () => {
        let oraclePrice = tickerData?.price || '0'
        if (!tickerData?.price) {
          const res = await getMarketPoolPrice(+chainId, poolId)
          if (res?.data) {
            oraclePrice = res.data
          }
        }
        const price = oraclePrice || '0'
        if (!price || Big(price).eq(0)) {
          return null
        }
        const result = await Pool.getPoolInfo(
          chainId,
          poolId,
          parseUnits(price, COMMON_PRICE_DECIMALS),
        )
        // console.log('-----tpsl dialog get poolinfo', poolType, result)
        if (result) {
          const pool = poolType === PoolType.base ? result.basePool : result.quotePool
          return {
            lpPrice: formatUnits(pool.poolTokenPrice, COMMON_PRICE_DECIMALS),
            exchangeRate: formatUnits(pool.exchangeRate, COMMON_LP_AMOUNT_DECIMALS),
          }
        }
        return null
      },
      refetchInterval: 10000,
      placeholderData: keepPreviousData,
    })

    const lpPrice = poolInfo?.lpPrice || ''

    // For calculations, treat '' as '0'
    const redeemAmount = redeemAmountValue || '0'

    const handleAmountValueChange = useCallback(
      (values: { value: string }) => {
        if (values.value === '') {
          setRedeemAmountValue('')
        } else if (values.value && parseBigNumber(amount).gt(0)) {
          try {
            const clamped = clampBigNumber(values.value, amount, '0')
            const clampedStr = clamped.toString()
            // Only update if the numeric value actually changed to avoid render loops
            // Preserve the raw input string (e.g. "5." or "5.0") when the numeric value is equivalent
            setRedeemAmountValue((prev) => {
              try {
                if (prev !== '' && new Big(prev).eq(clamped)) {
                  // If clamped value equals the current value numerically,
                  // keep the user's raw input to avoid fighting with react-number-format
                  return prev
                }
              } catch {
                // prev is not a valid number, update
              }
              return clampedStr
            })
          } catch {
            // invalid input, ignore
          }
        }
      },
      [amount],
    )

    const handleAmountBlur = useCallback(() => {
      setRedeemAmountValue((prev) => prev || '0')
    }, [])

    // Calculate size in quote
    const sizeInQuote = useMemo(() => {
      if (!redeemAmount || !lpPrice) return '--'
      return parseBigNumber(redeemAmount).mul(parseBigNumber(lpPrice)).toString()
    }, [redeemAmount, lpPrice])

    // Est. PnL for TP
    const tpEstPnl = useMemo(() => {
      if (!tpValue || !costPrice || !redeemAmount) return ''
      try {
        const triggerPrice = parseTriggerPrice({
          type: tpType,
          value: tpValue,
          currentPrice: costPrice,
          amount: redeemAmount,
        })
        if (!triggerPrice || Number(triggerPrice) <= 0) return ''
        const pnl = new Big(triggerPrice).minus(new Big(costPrice)).mul(new Big(redeemAmount))
        return pnl.toString()
      } catch {
        return ''
      }
    }, [tpValue, tpType, costPrice, redeemAmount])

    // Est. PnL for SL
    const slEstPnl = useMemo(() => {
      if (!slValue || !costPrice || !redeemAmount) return ''
      try {
        const adjustedValue =
          slValue && slType !== TpSlTypeEnum.PRICE ? new Big(slValue).mul(-1).toString() : slValue
        const triggerPrice = parseTriggerPrice({
          type: slType,
          value: adjustedValue,
          currentPrice: costPrice,
          amount: redeemAmount,
        })
        if (!triggerPrice || Number(triggerPrice) <= 0) return ''
        const pnl = new Big(triggerPrice).minus(new Big(costPrice)).mul(new Big(redeemAmount))
        return pnl.toString()
      } catch {
        return ''
      }
    }, [slValue, slType, costPrice, redeemAmount])

    // Labels based on poolType
    const tpLabel = isBase ? <Trans>TP</Trans> : <Trans>回撤保护</Trans>
    const slLabel = isBase ? <Trans>SL</Trans> : <Trans>自动赎回</Trans>

    // TP/SL Placeholders
    const [tpPlaceHolder, slPlaceHolder] = useMemo(() => {
      const renderPlaceHolder = (type: TpSlTypeEnum, isSL?: boolean) => {
        switch (type) {
          case TpSlTypeEnum.ROI:
            return 'ROI(%)'
          case TpSlTypeEnum.Change:
            return 'Change(%)'
          case TpSlTypeEnum.Pnl:
            return `PnL(${quoteSymbol})`
          case TpSlTypeEnum.PRICE:
          default:
            if (isBase) {
              return isSL ? `SL(${quoteSymbol})` : `TP(${quoteSymbol})`
            }
            return isSL ? t`自动赎回(${quoteSymbol})` : t`回撤保护(${quoteSymbol})`
        }
      }
      return [renderPlaceHolder(tpType), renderPlaceHolder(slType, true)]
    }, [tpType, slType, quoteSymbol, isBase])

    // Reset state when dialog opens
    useEffect(() => {
      if (open) {
        setTpType(TpSlTypeEnum.Pnl)
        setSlType(TpSlTypeEnum.Pnl)
        setTpValue('')
        setSlValue('')
        setRedeemAmountValue(amount || '0')
        setSlippage('1')
      }
    }, [open])

    // Handle confirm
    const handleConfirm = useCallback(async () => {
      try {
        setLoading(true)
        if (!chainId || !poolId) return
        const checked = await onAction(chainId)
        if (!checked) return

        const tpsl: Array<{ triggerType: TriggerType; triggerPrice: number }> = []

        if (tpValue) {
          const triggerPrice = parseTriggerPrice({
            type: tpType,
            value: tpValue,
            currentPrice: lpPrice,
            amount: redeemAmount,
          })
          if (triggerPrice && Number(triggerPrice) > 0) {
            tpsl.push({
              triggerType: TriggerType.GTE,
              triggerPrice: Number(triggerPrice),
            })
          }
        }

        if (slValue) {
          const adjustedValue =
            slValue && slType !== TpSlTypeEnum.PRICE ? new Big(slValue).mul(-1).toString() : slValue
          const triggerPrice = parseTriggerPrice({
            type: slType,
            value: adjustedValue,
            currentPrice: lpPrice,
            amount: redeemAmount,
          })
          if (triggerPrice && Number(triggerPrice) > 0) {
            tpsl.push({
              triggerType: TriggerType.LTE,
              triggerPrice: Number(triggerPrice),
            })
          }
        }

        if (tpsl.length === 0) {
          toast.error({ title: t`Please set at least one TP/SL` })
          setLoading(false)
          return
        }

        const filteredTpsl = tpsl
          .filter((item) => item.triggerPrice && Number(item.triggerPrice) > 0)
          .map((item) => {
            return {
              triggerType: item.triggerType,
              triggerPrice: Number(item.triggerPrice),
              amount: Number(redeemAmount),
            }
          })

        const params = {
          chainId,
          poolId,
          slippage: Number(slippage) / 100 || DEFAULT_SLIPPAGE,
          tpsl: filteredTpsl,
          poolType: poolType as unknown as AddTpSLParams['poolType'],
        }

        console.log('TPSL Dialog params:', params)
        await Pool.addTpSl(params as AddTpSLParams)

        toast.success({ title: t`Successfully set TP/SL` })
        onClose()
      } catch (error) {
        showErrorToast(error)
      } finally {
        setLoading(false)
      }
    }, [
      chainId,
      poolId,
      tpValue,
      tpType,
      slValue,
      slType,
      lpPrice,
      redeemAmount,
      slippage,
      onClose,
      onAction,
    ])

    const displayPoolName = isBase
      ? t`${baseSymbol}${quoteSymbol} Base Vault`
      : t`${baseSymbol}${quoteSymbol} Stable Vault`

    return (
      <div>
        {/* Order Info Section */}
        <div className="flex flex-col gap-[8px] px-[20px] py-[12px]">
          <div className="flex items-center gap-[4px]">
            <p className="text-[12px] font-semibold text-white">{displayPoolName}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[#848E9C]">
              <Trans>数量</Trans>
            </p>
            <p className="text-[12px] font-medium text-[#CED1D9]">
              {formatNumber(amount, { showUnit: false })} {poolName}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[#848E9C]">
              <Trans>成本价</Trans>
            </p>
            <p className="text-[12px] font-medium text-[#CED1D9]">
              ${formatNumber(costPrice || '0', { showUnit: false })}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[#848E9C]">
              <Trans>当前价格</Trans>
            </p>
            <p className="text-[12px] font-medium text-[#CED1D9]">
              ${lpPrice ? formatNumber(lpPrice, { showUnit: false }) : '--'}
            </p>
          </div>
        </div>

        {/* TP/SL Sections */}
        <div className="flex flex-col gap-[20px] px-0 pt-[20px] pb-[24px]">
          <div className="flex flex-col gap-[20px]">
            {/* TP Section */}
            <div className="flex flex-col gap-[12px] px-[20px]">
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center gap-[4px]">
                  <span className="text-[12px] font-medium text-white">{tpLabel}</span>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <div className="flex gap-[8px]">
                    <TPSLInput
                      type={tpType}
                      value={tpValue}
                      source="lp"
                      onChange={setTpValue}
                      onTypeChange={setTpType}
                      quoteToken={quoteSymbol}
                      placeHolder={tpPlaceHolder}
                      inputPrefix={tpType === TpSlTypeEnum.PRICE ? '' : '+'}
                      allowNegative={false}
                      inputSuffix={
                        tpType === TpSlTypeEnum.ROI || tpType === TpSlTypeEnum.Change
                          ? '%'
                          : undefined
                      }
                    />
                  </div>
                  <EstPnlDisplay value={tpEstPnl} />
                </div>
              </div>
            </div>

            {/* SL Section */}
            <div className="flex flex-col gap-[12px]">
              <div className="flex items-center gap-[4px] px-[20px]">
                <span className="text-[12px] font-medium text-white">{slLabel}</span>
              </div>

              <div className="flex flex-col gap-[8px] px-[20px]">
                <div className="flex gap-[8px]">
                  <TPSLInput
                    type={slType}
                    value={slValue}
                    source="lp"
                    onChange={setSlValue}
                    onTypeChange={setSlType}
                    quoteToken={quoteSymbol}
                    placeHolder={slPlaceHolder}
                    inputPrefix={slType === TpSlTypeEnum.PRICE ? '' : '-'}
                    allowNegative={false}
                    inputSuffix={
                      slType === TpSlTypeEnum.ROI || slType === TpSlTypeEnum.Change
                        ? '%'
                        : undefined
                    }
                  />
                </div>
                <EstPnlDisplay value={slEstPnl} />
              </div>
            </div>
          </div>

          {/* Amount Section with Slider */}
          <div className="flex flex-col gap-[12px]">
            <div className="flex flex-col gap-[12px] px-[20px]">
              {/* Slippage Row */}
              {/*<div
                  className={`flex h-[44px] items-center justify-between rounded-[8px] px-[12px] ${
                    slippageFocused
                      ? 'border-[0.5px] border-white bg-[#18191F] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.8)]'
                      : 'border-[0.5px] border-transparent bg-[#202129]'
                  }`}
                  onClick={() => slippageInputRef.current?.focus()}
                >
                  <div className="flex items-center gap-[4px]">
                    <span className="text-[12px] leading-[1] text-[#848E9C]">
                      <Trans>预计滑点</Trans>
                    </span>
                    <Tooltips
                      title={t`The estimated deviation of your execution price from the current market price.`}
                    >
                      <span className="text-secondary inline-flex cursor-pointer">
                        <TipsOutLine size={12} />
                      </span>
                    </Tooltips>
                  </div>
                  <SlippageInput
                    inputRef={slippageInputRef}
                    value={slippage}
                    onChange={setSlippage}
                    onFocus={() => setSlippageFocused(true)}
                    onBlur={() => setSlippageFocused(false)}
                  />
                </div>*/}

              {/* Amount Card */}
              <div className="flex flex-col gap-[12px] rounded-[10px] bg-[#202129] px-[12px] py-[14px] leading-[1]">
                <div className="text-[12px] font-medium text-[#848E9C]">
                  <Trans>Amount</Trans>
                </div>
                <div className="flex h-[18px] items-center justify-between gap-[8px] leading-[1]">
                  <div className="min-w-0 flex-1">
                    <NumericInput
                      value={redeemAmountValue}
                      onValueChange={handleAmountValueChange}
                      onBlur={handleAmountBlur}
                      className="w-full"
                      sx={AMOUNT_INPUT_SX}
                    />
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-[2px] rounded-[30px]">
                    <span className="text-[12px] font-medium text-[#CED1D9]">{poolName}</span>
                  </div>
                </div>

                {/* Slider inside card */}
                <div className={'px-[6px]'}>
                  <PercentSlider
                    value={redeemAmount}
                    max={amount || '0'}
                    onChange={(val) => {
                      setRedeemAmountValue(val.toString())
                    }}
                  />
                </div>
              </div>

              {/* Size info */}
              <div className="flex items-center justify-between px-[4px]">
                <p className="text-[12px] text-[#848E9C]">Size</p>
                <p className="text-[12px] font-medium text-[#CED1D9]">
                  {sizeInQuote !== '--'
                    ? `${formatNumber(sizeInQuote, { showUnit: false })} ${quoteSymbol}`
                    : '--'}
                </p>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="px-[20px]">
              <TradeButton
                variant="contained"
                loading={loading}
                onClick={handleConfirm}
                className="!h-[44px] w-full !rounded-[24px] !text-[14px]"
                disabled={!lpPrice || (!tpValue && !slValue) || new Big(redeemAmount || '0').lte(0)}
              >
                <Trans>Confirm</Trans>
              </TradeButton>
            </div>
          </div>
        </div>
      </div>
    )
  },
)
TPSLDialogContent.displayName = 'TPSLDialogContent'

// --- Main Component ---
export const TPSLDialog = memo(({ open, onClose, ...rest }: TPSLDialogProps) => {
  const isBase = rest.poolType === PoolType.base
  const dialogTitle = isBase ? t`TP/SL` : t`回撤保护/自动赎回`

  return (
    <StyledDrawer
      showPuller={false}
      open={open}
      onClose={() => onClose()}
      onOpen={() => {}}
      anchor="bottom"
      title={dialogTitle}
    >
      <TPSLDialogContent open={open} onClose={onClose} {...rest} />
    </StyledDrawer>
  )
})
TPSLDialog.displayName = 'TPSLDialog'
