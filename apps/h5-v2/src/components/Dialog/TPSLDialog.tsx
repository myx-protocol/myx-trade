import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { TPSLInput } from '@/components/Trade/TradePanel/TPSL/TPSLInput'
import { TpSlTypeEnum } from '@/components/Trade/type'
import { formatNumber } from '@/utils/number'
import { parseBigNumber } from '@/utils/bn'
import { TradeButton } from '@/components/Button/TradeButton'
import { CustomCheckBox } from '@/components/CheckBox'
import { PercentSlider } from '@/components/PercentSlider'
import { useQuery } from '@tanstack/react-query'
import {
  pool as Pool,
  parseUnits,
  formatUnits,
  TriggerType,
  COMMON_PRICE_DECIMALS,
  COMMON_LP_AMOUNT_DECIMALS,
  type AddTpSLParams,
} from '@myx-trade/sdk'
import { PoolType } from '@/request/type'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { parseTriggerPrice } from '@/utils/TpSl'
import Big from 'big.js'
import { toast } from '@/components/UI/Toast'
import { showErrorToast } from '@/config/error'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { getMarketPoolPrice } from '@/request'
import { useWalletActions } from '@/hooks/useWalletActions.ts'

const DEFAULT_SLIPPAGE = 0.01
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

// --- Main Component ---
export const TPSLDialog = memo(
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
    const [tpEnabled, setTpEnabled] = useState(true)
    const [tpType, setTpType] = useState<TpSlTypeEnum>(TpSlTypeEnum.Pnl)
    const [tpValue, setTpValue] = useState('')

    // SL state
    const [slEnabled, setSlEnabled] = useState(true)
    const [slType, setSlType] = useState<TpSlTypeEnum>(TpSlTypeEnum.Pnl)
    const [slValue, setSlValue] = useState('')

    // Amount / slider
    const [sliderValue, setSliderValue] = useState(100)
    const [slippage, setSlippage] = useState('1')

    const [loading, setLoading] = useState(false)
    // const [slippageFocused, setSlippageFocused] = useState(false)
    // const slippageInputRef = useRef<HTMLInputElement>(null)

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
        if (result) {
          const pool = isBase ? result.basePool : result.quotePool
          return {
            lpPrice: formatUnits(pool.poolTokenPrice, COMMON_PRICE_DECIMALS),
            exchangeRate: formatUnits(pool.exchangeRate, COMMON_LP_AMOUNT_DECIMALS),
          }
        }
        return null
      },
      refetchInterval: 10000,
    })

    const lpPrice = poolInfo?.lpPrice || ''
    const exchangeRate = poolInfo?.exchangeRate || ''

    // Calculate actual redeem amount based on slider
    const redeemAmount = useMemo(() => {
      if (!amount) return '0'
      return parseBigNumber(amount).mul(sliderValue).div(100).toString()
    }, [amount, sliderValue])

    // Calculate size in quote
    const sizeInQuote = useMemo(() => {
      if (!redeemAmount || !lpPrice) return '--'
      return parseBigNumber(redeemAmount).mul(parseBigNumber(lpPrice)).toString()
    }, [redeemAmount, lpPrice])

    // Est. PnL for TP
    const tpEstPnl = useMemo(() => {
      if (!tpEnabled || !tpValue || !lpPrice || !redeemAmount) return ''
      try {
        const triggerPrice = parseTriggerPrice({
          type: tpType,
          value: tpValue,
          currentPrice: lpPrice,
          amount: redeemAmount,
        })
        if (!triggerPrice || Number(triggerPrice) <= 0) return ''
        const pnl = new Big(triggerPrice).minus(new Big(lpPrice)).mul(new Big(redeemAmount))
        return pnl.toString()
      } catch {
        return ''
      }
    }, [tpEnabled, tpValue, tpType, lpPrice, redeemAmount])

    // Est. PnL for SL
    const slEstPnl = useMemo(() => {
      if (!slEnabled || !slValue || !lpPrice || !redeemAmount) return ''
      try {
        const adjustedValue =
          slValue && slType !== TpSlTypeEnum.PRICE ? new Big(slValue).mul(-1).toString() : slValue
        const triggerPrice = parseTriggerPrice({
          type: slType,
          value: adjustedValue,
          currentPrice: lpPrice,
          amount: redeemAmount,
        })
        if (!triggerPrice || Number(triggerPrice) <= 0) return ''
        const pnl = new Big(triggerPrice).minus(new Big(lpPrice)).mul(new Big(redeemAmount))
        return pnl.toString()
      } catch {
        return ''
      }
    }, [slEnabled, slValue, slType, lpPrice, redeemAmount])

    // Labels based on poolType
    const tpLabel = isBase ? <Trans>TP</Trans> : <Trans>回撤保护</Trans>
    const slLabel = isBase ? <Trans>SL</Trans> : <Trans>自动赎回</Trans>
    const dialogTitle = isBase ? t`TP/SL` : t`回撤保护/自动赎回`

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
        setTpEnabled(true)
        setSlEnabled(true)
        setTpType(TpSlTypeEnum.Pnl)
        setSlType(TpSlTypeEnum.Pnl)
        setTpValue('')
        setSlValue('')
        setSliderValue(100)
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

        if (tpEnabled && tpValue) {
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

        if (slEnabled && slValue) {
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
      tpEnabled,
      tpValue,
      tpType,
      slEnabled,
      slValue,
      slType,
      lpPrice,
      redeemAmount,
      slippage,
      onClose,
      onAction,
    ])

    const displayPoolName = isBase
      ? t`m${baseSymbol}.${quoteSymbol} Base Vault`
      : t`m${quoteSymbol}.${baseSymbol} Stable Vault`

    return (
      <DialogTheme open={open} onClose={onClose}>
        <DialogTitleTheme onClose={onClose}>{dialogTitle}</DialogTitleTheme>
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
                {lpPrice ? formatNumber(lpPrice, { showUnit: false }) : '--'} {quoteSymbol}
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
                    <CustomCheckBox
                      type="em"
                      size={12}
                      checked={tpEnabled}
                      onChange={setTpEnabled}
                      label={<span className="text-[12px] font-medium text-white">{tpLabel}</span>}
                    />
                  </div>
                  {tpEnabled && (
                    <div className="flex flex-col gap-[8px]">
                      <div className="flex gap-[8px]">
                        <TPSLInput
                          type={tpType}
                          value={tpValue}
                          onChange={setTpValue}
                          onTypeChange={setTpType}
                          quoteToken={quoteSymbol}
                          placeHolder={tpPlaceHolder}
                          inputPrefix={tpType === TpSlTypeEnum.PRICE ? '' : '+'}
                          allowNegative={false}
                          source="lp"
                          inputSuffix={
                            tpType === TpSlTypeEnum.ROI || tpType === TpSlTypeEnum.Change
                              ? '%'
                              : undefined
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] text-[#848E9C]">Est. PnL</p>
                        <p
                          className="text-[12px] font-medium"
                          style={{
                            color:
                              tpEstPnl && Number(tpEstPnl) !== 0
                                ? Number(tpEstPnl) > 0
                                  ? '#00E3A5'
                                  : '#EC605A'
                                : '#848E9C',
                          }}
                        >
                          {tpEstPnl ? `$${formatNumber(tpEstPnl, { showUnit: false })}` : '$--'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SL Section */}
              <div className="flex flex-col gap-[12px]">
                <div className="flex items-center gap-[4px] px-[20px]">
                  <CustomCheckBox
                    type="em"
                    size={12}
                    checked={slEnabled}
                    onChange={setSlEnabled}
                    label={<span className="text-[12px] font-medium text-white">{slLabel}</span>}
                  />
                </div>
                {slEnabled && (
                  <div className="flex flex-col gap-[8px] px-[20px]">
                    <div className="flex gap-[8px]">
                      <TPSLInput
                        type={slType}
                        value={slValue}
                        onChange={setSlValue}
                        onTypeChange={setSlType}
                        quoteToken={quoteSymbol}
                        placeHolder={slPlaceHolder}
                        inputPrefix={slType === TpSlTypeEnum.PRICE ? '' : '-'}
                        allowNegative={false}
                        source="lp"
                        inputSuffix={
                          slType === TpSlTypeEnum.ROI || slType === TpSlTypeEnum.Change
                            ? '%'
                            : undefined
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-[#848E9C]">Est. PnL</p>
                      <p
                        className="text-[12px] font-medium"
                        style={{
                          color:
                            slEstPnl && Number(slEstPnl) !== 0
                              ? Number(slEstPnl) > 0
                                ? '#00E3A5'
                                : '#EC605A'
                              : '#848E9C',
                        }}
                      >
                        {slEstPnl ? `$${formatNumber(slEstPnl, { showUnit: false })}` : '$--'}
                      </p>
                    </div>
                  </div>
                )}
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
                      <input
                        type="text"
                        inputMode="numeric"
                        value={`${sliderValue}%`}
                        onChange={(e) => {
                          const num = parseInt(e.target.value.replace(/%/g, ''), 10)
                          if (!isNaN(num)) {
                            setSliderValue(Math.min(100, Math.max(0, num)))
                          } else if (e.target.value === '' || e.target.value === '%') {
                            setSliderValue(0)
                          }
                        }}
                        className="w-full bg-transparent text-[18px] leading-[1] font-bold text-white outline-none"
                      />
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-[2px] rounded-[30px]">
                      <span className="text-[12px] font-medium text-[#CED1D9]">{poolName}</span>
                    </div>
                  </div>

                  {/* Slider inside card */}
                  <div className={'px-[6px]'}>
                    <PercentSlider
                      value={sliderValue}
                      onChange={(val) => {
                        setSliderValue(val)
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
                  disabled={(!tpEnabled || !tpValue) && (!slEnabled || !slValue)}
                >
                  <Trans>Confirm</Trans>
                </TradeButton>
              </div>
            </div>
          </div>
        </div>
      </DialogTheme>
    )
  },
)

TPSLDialog.displayName = 'TPSLDialog'
