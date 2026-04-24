import { Trans } from '@lingui/react/macro'

import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { useState, useMemo, useEffect } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { Direction, OperationType, OrderType, TimeInForce, TriggerType } from '@myx-trade/sdk'
import { ethers } from 'ethers'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { t } from '@lingui/core/macro'
import { parseBigNumber } from '@/utils/bn'
import {
  autoPriceDecimals,
  isSuperDecimal,
  formatNumber,
  getSuperDecimalScale,
} from '@/utils/number'
import { toast } from '@/components/UI/Toast'
import { getSlippage, setSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { InputWrapper } from '@/components/Trade/components/InputWrapper'
import { Slider, TextField, Tooltip } from '@mui/material'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { TradeSelect } from '@/components/Trade/components/Select'
import { AmountUnitEnum } from '@/components/Trade/type'
import clsx from 'clsx'
import useGlobalStore from '@/store/globalStore'
import { useCheckUserVipInfo } from '@/hooks/use-check-user-vip-info'
import { EditText } from '@/components/EditText'
import { tradePubSub } from '@/utils/pubsub'
import { showErrorToast } from '@/config/error'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck'
import { useForwardSeamlessTransaction } from '@/hooks/seamless/use-forward-seamless-transaction'
import { TradeMode } from '@/pages/Trade/types'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useGetSeamlessAuthStatus } from '@/hooks/seamless/use-get-seamless-auth-status'
import type { SeamlessAccount } from '@/store/seamless/initialState'
import { getMyxBrokerAddressByChainId } from '@/config/brokerAddress'
import { buildClosePositionToastParts, renderOrderToastContent } from '@/utils/order/action-toast'

const AmountSliderMarks = [
  { value: 0, label: '0%' },
  { value: 20, label: '20%' },
  { value: 40, label: '40%' },
  { value: 60, label: '60%' },
  { value: 80, label: '80%' },
  { value: 100, label: '100%' },
]

const ValueLabelComponent = (props: any) => {
  const { children, value } = props
  return (
    <Tooltip
      enterTouchDelay={0}
      placement="top"
      title={
        <span
          style={{
            background: '#fff',
            color: '#101114',
            fontWeight: 500,
            fontSize: '12px',
            borderRadius: '4px',
            padding: '4px 8px',
            boxShadow: '0 2px 8px 0 #18191c',
            minWidth: '40px',
            minHeight: '20px',
            display: 'inline-block',
            textAlign: 'center',
          }}
        >
          {value}%
        </span>
      }
      slotProps={{
        tooltip: {
          sx: {
            background: 'transparent',
            boxShadow: 'none',
            p: 0,
            mt: -2,
          },
        },
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -8],
              },
            },
          ],
        },
      }}
    >
      {children}
    </Tooltip>
  )
}

export const ClosePositionButton = ({
  position,
  marketPrice,
  symbolInfo,
  style,
}: {
  position: any
  marketPrice: string
  symbolInfo: any
  style: React.CSSProperties
}) => {
  const { client } = useMyxSdkClient(position?.chainId)
  const [loading, setLoading] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [useSlider, setUseSlider] = useState(true) // 默认使用滑块模式
  const [sliderValue, setSliderValue] = useState(100) // 默认100%
  const [price, setPrice] = useState('')
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET)
  const [amount, setAmount] = useState(position.size) // 默认是 position.size
  const { checkWalletChainId } = useWalletChainCheck()
  const { forwardSeamlessTransaction } = useForwardSeamlessTransaction(symbolInfo?.chainId)
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  const { seamlessAccountList, activeSeamlessAddress } = useSeamlessStore()
  const { isMatch, asyncVipInfo, asyncVipLevelLoading } = useCheckUserVipInfo()
  const closePositionSlippage = getSlippage({
    chainId: position?.chainId ?? 0,
    poolId: position?.poolId ?? '',
    type: SlippageTypeEnum.CLOSE,
  })
  const { address } = useWalletConnection()
  const closeAmount = formatNumber(position.size ?? '0', { showUnit: false }) ?? '0'
  const [amountUnit, setAmountUnit] = useState<AmountUnitEnum>(AmountUnitEnum.BASE)

  const { tradeMode } = useGlobalStore()

  const decimalScale = useMemo(() => {
    if (isSuperDecimal(marketPrice)) {
      return getSuperDecimalScale(Number(marketPrice))
    } else {
      return autoPriceDecimals(Number(marketPrice))
    }
  }, [marketPrice])
  // 当 Dialog 打开时，重置为默认值
  useEffect(() => {
    if (closeDialogOpen) {
      setUseSlider(true)
      setSliderValue(100)
      setAmount(position.size)
    }
  }, [closeDialogOpen, position.size])

  // 滑块值变化时，更新 amount
  useEffect(() => {
    if (useSlider) {
      const calculatedAmount = parseBigNumber(position.size).mul(sliderValue).div(100)

      if (amountUnit === AmountUnitEnum.BASE) {
        setAmount(calculatedAmount.toString())
      } else {
        setAmount(calculatedAmount.mul(parseBigNumber(price)).toString())
      }
    }
  }, [sliderValue, useSlider, position.size, amountUnit, price])

  const pnl = useMemo(() => {
    // 计算实际的 base 数量
    let baseAmount
    if (amountUnit === AmountUnitEnum.BASE) {
      baseAmount = parseBigNumber(amount || '0')
    } else {
      // QUOTE 模式：需要除以 price 得到 base 数量
      const currentPrice = price || marketPrice
      baseAmount = parseBigNumber(amount || '0').div(parseBigNumber(currentPrice || '1'))
    }

    // 使用实际的平仓价格（限价单用 price，市价单用 marketPrice）
    const closePrice =
      orderType === OrderType.LIMIT
        ? parseBigNumber(price || marketPrice)
        : parseBigNumber(marketPrice)

    const entryPrice = parseBigNumber(position.entryPrice)

    // 根据方向计算 pnl
    if (position.direction === Direction.LONG) {
      // 做多：(平仓价 - 开仓价) * 数量
      return closePrice.minus(entryPrice).mul(baseAmount)
    } else {
      // 做空：(开仓价 - 平仓价) * 数量
      return entryPrice.minus(closePrice).mul(baseAmount)
    }
  }, [price, marketPrice, amount, amountUnit, position.entryPrice, position.direction, orderType])

  return (
    <>
      <InfoButton
        style={style}
        onClick={() => {
          setCloseDialogOpen(true)
        }}
      >
        <Trans>Close</Trans>
      </InfoButton>

      <DialogBase
        sx={{
          '& .MuiDialog-paper': {
            width: '390px',
          },
        }}
        title={position.direction === Direction.LONG ? t`Close Long` : t`Close Short`}
        open={closeDialogOpen}
        onClose={() => setCloseDialogOpen(false)}
      >
        <div className="mt-[10px] flex items-center gap-[4px] text-[16px] leading-[16px] text-[#EC605A]">
          <p>
            {position?.baseSymbol}/{position?.quoteSymbol}
          </p>
          <p>{position.userLeverage}x</p>
        </div>
        <div className="mt-[10px] flex h-[40px] items-center gap-[24px] border-b border-[#31333D]">
          <div
            className="cursor-pointer text-[14px]"
            onClick={() => setOrderType(OrderType.MARKET)}
          >
            <p
              className="text-[16px] leading-[40px] font-[500]"
              style={{
                color: orderType === OrderType.MARKET ? 'white' : '#848E9C',
                borderBottom:
                  orderType === OrderType.MARKET ? '2px solid white' : '2px solid transparent',
              }}
            >
              {' '}
              <Trans>Market</Trans>
            </p>
          </div>
          <div className="cursor-pointer text-[14px]" onClick={() => setOrderType(OrderType.LIMIT)}>
            <p
              className="text-[16px] leading-[40px] font-[500]"
              style={{
                color: orderType === OrderType.LIMIT ? 'white' : '#848E9C',
                borderBottom:
                  orderType === OrderType.LIMIT ? '2px solid white' : '2px solid transparent',
              }}
            >
              {' '}
              <Trans>Limit</Trans>
            </p>
          </div>
        </div>

        {/* ------price input------ */}

        <InputWrapper
          className="mt-[12px] mb-[6px]"
          title={
            <div className="flex items-center">
              <p className="text-[#CED1D9]">
                <Trans>Price</Trans>
              </p>
            </div>
          }
        >
          <div className="flex justify-between gap-[12px] leading-[1]">
            <NumberInputPrimitive
              onValueChange={(e) => {
                setPrice(e.value)
              }}
              decimalScale={decimalScale}
              disabled={orderType === OrderType.MARKET}
              value={orderType === OrderType.MARKET ? marketPrice : price}
              className="w-full flex-grow-[1] text-[20px] font-bold text-[#CED1D9]"
            />
            <div className="flex flex-shrink-0 items-center font-medium">
              {OrderType.MARKET !== orderType && (
                <p
                  className="text-[12px] text-[#00E3A5]"
                  role="button"
                  onClick={() => setPrice(marketPrice?.toString() ?? '0')}
                >
                  <Trans>Last</Trans>
                </p>
              )}
              <div className="ml-[12px] border-l-[1px] border-[#31333D] pl-[12px]">
                <TradeSelect
                  value={orderType}
                  onChange={(value) => {
                    const orderType = value.target.value as OrderType
                    setOrderType(orderType)
                  }}
                  options={[
                    { label: <Trans>Limit</Trans>, value: OrderType.LIMIT },
                    { label: <Trans>Market</Trans>, value: OrderType.MARKET },
                  ]}
                />
              </div>
            </div>
          </div>
        </InputWrapper>

        <InputWrapper
          className="mb-[6px]"
          title={
            <div className="flex items-center">
              <p className="text-[#848E9C]">
                <Trans>Amount</Trans>
              </p>
            </div>
          }
        >
          <div className="flex justify-between gap-[12px] leading-[1]">
            <div className="flex-grow-[1]">
              {useSlider ? (
                <TextField
                  variant="standard"
                  value={`${sliderValue}%`}
                  onFocus={() => {
                    setUseSlider(false)
                  }}
                  InputProps={{
                    disableUnderline: true,
                  }}
                  sx={{
                    flex: 1,
                    background: 'transparent',
                    mr: 2,
                    '& .MuiInputBase-input': {
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#fff',
                      background: 'transparent',
                      p: 0,
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#6D7180',
                      opacity: 1,
                      fontSize: '18px',
                      fontWeight: 500,
                    },
                  }}
                />
              ) : (
                <NumberInputPrimitive
                  value={amount}
                  max={
                    amountUnit === AmountUnitEnum.BASE
                      ? position.size
                      : parseBigNumber(position.size)
                          .mul(parseBigNumber(price || marketPrice))
                          .toNumber()
                  }
                  className="w-full text-[20px] font-bold text-[#fff]"
                  onFocus={() => {
                    setUseSlider(false)
                    // 当 amountUnit 是 QUOTE 时，显示 amount * price
                    if (amountUnit === AmountUnitEnum.QUOTE) {
                      const baseAmount = parseBigNumber(amount).div(
                        parseBigNumber(price || marketPrice),
                      )
                      const quoteAmount = baseAmount.mul(parseBigNumber(price || marketPrice))
                      setAmount(quoteAmount.toString())
                    }
                  }}
                  onValueChange={({ value, floatValue }) => {
                    setAmount(value)
                    // 根据输入的 amount 更新滑块百分比
                    if (floatValue !== undefined && position.size) {
                      let percentage
                      if (amountUnit === AmountUnitEnum.BASE) {
                        percentage = (floatValue / Number(position.size)) * 100
                      } else {
                        // QUOTE 模式：需要先转换为 BASE 再计算百分比
                        const baseValue = floatValue / Number(price || marketPrice)
                        percentage = (baseValue / Number(position.size)) * 100
                      }
                      setSliderValue(Math.min(100, Math.max(0, percentage)))
                    }
                  }}
                  onBlur={() => {
                    // 失去焦点时检查是否超过最大值
                    const inputValue = Number(amount)
                    let maxSize
                    if (amountUnit === AmountUnitEnum.BASE) {
                      maxSize = Number(position.size)
                    } else {
                      // QUOTE 模式：最大值是 position.size * price
                      maxSize = parseBigNumber(position.size)
                        .mul(parseBigNumber(price || marketPrice))
                        .toNumber()
                    }

                    if (inputValue > maxSize) {
                      setAmount(maxSize.toString())
                      setSliderValue(100)
                    }
                  }}
                  thousandSeparator=","
                  inputMode="decimal"
                  placeholder={''}
                />
              )}
            </div>
            <div className="flex flex-shrink-0 items-center font-medium">
              <TradeSelect
                value={amountUnit}
                onChange={(value) => {
                  const amountUnit = value.target.value as AmountUnitEnum
                  setAmountUnit(amountUnit)
                  const formatAmount =
                    amountUnit === AmountUnitEnum.BASE
                      ? position.size
                      : parseBigNumber(position.size).mul(parseBigNumber(price)).toString()
                  setAmount(formatAmount)
                  setSliderValue(100)
                  setUseSlider(true)
                }}
                options={[
                  { label: position.baseSymbol, value: AmountUnitEnum.BASE },
                  { label: position.quoteSymbol, value: AmountUnitEnum.QUOTE },
                ]}
              />
            </div>
          </div>
          <div className="mt-[12px] overflow-hidden px-[6px]">
            <Slider
              value={sliderValue}
              onChange={(_, newValue) => {
                setUseSlider(true)
                setSliderValue(newValue as number)
              }}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              slots={{
                valueLabel: ValueLabelComponent,
              }}
              sx={{
                width: '100%',
                boxSizing: 'border-box',
                height: '12px',
                borderRadius: '9px',
                padding: 0,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  background: '#fff',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 1,
                  background: '#272830',
                  borderRadius: 9,
                  boxSizing: 'border-box',
                },
                '& .MuiSlider-track': {
                  background: 'linear-gradient(90deg, #4cb86a 0%, #3ba07b 100%)',
                  borderRadius: 9,
                },
                '@media (pointer: coarse)': {
                  padding: '0px!important',
                },
              }}
            />
            <div className="mt-[6px] flex justify-between">
              {AmountSliderMarks.map((m) => (
                <p
                  key={m.value}
                  className={clsx(
                    'text-center text-[10px] font-medium',
                    sliderValue >= m.value ? 'text-white' : 'text-[#4D515C]',
                  )}
                >
                  {m.label}
                </p>
              ))}
            </div>
          </div>
        </InputWrapper>
        {/* ------------ */}
        <div className="mt-[10px] flex items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Position Amount</Trans>
          </p>
          <p className="text-[14px] font-[500] text-[white]">{closeAmount}</p>
        </div>
        <div className="mt-[10px] flex items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Close Amount</Trans>
          </p>
          <p className="text-[14px] font-[500] text-[white]">
            {amountUnit === AmountUnitEnum.BASE
              ? formatNumber(amount, { showUnit: false })
              : formatNumber(
                  parseBigNumber(amount)
                    .div(parseBigNumber(price || marketPrice))
                    .toString(),
                  { showUnit: false },
                )}
          </p>
        </div>
        <div className="mt-[10px] flex items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Current Price</Trans>
          </p>
          <p className="text-[14px] font-[500] text-[white]">
            ${formatNumber(marketPrice, { showUnit: false })}
          </p>
        </div>
        <div className="mt-[10px] flex items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Est. Slippage</Trans>
          </p>
          <EditText
            value={`${((closePositionSlippage ?? 0) * 100).toFixed(2)}`}
            unit="%"
            onChange={(newSlippage, closeEdit) => {
              setSlippage({
                chainId: symbolInfo?.chainId ?? 0,
                poolId: symbolInfo?.poolId ?? '',
                type: SlippageTypeEnum.CLOSE,
                slippage: parseBigNumber(newSlippage).div(100).toNumber(),
              })
              tradePubSub.emit('trade:slippage:change', {
                chainId: symbolInfo?.chainId ?? 0,
                poolId: symbolInfo?.poolId ?? '',
              })
              closeEdit?.()
            }}
          />
          {/* <p className="text-[14px] font-[500] text-[white]">
            {(closePositionSlippage ?? 0) * 100}%
          </p> */}
        </div>
        <div className="mt-[12px] flex items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Est. Pnl</Trans>
          </p>
          <p
            className="text-[14px] font-[500]"
            style={{ color: parseBigNumber(pnl).gt(0) ? '#00E3A5' : '#EC605A' }}
          >
            {formatNumber(pnl.toString(), { showUnit: false })} {symbolInfo?.quoteSymbol}
          </p>
        </div>

        <div className="left-0 mt-[40px] flex w-full justify-center px-[20px]">
          <PrimaryButton
            onClick={async () => {
              try {
                setLoading(true)

                await checkWalletChainId(position?.chainId as number)

                if (!isMatch) {
                  const rs = await asyncVipInfo(
                    symbolInfo?.quoteToken as string,
                    position?.chainId as string,
                  )

                  if (!rs) {
                    setLoading(false)
                    return
                  }
                }

                let triggerType: TriggerType = TriggerType.NONE
                if (orderType === OrderType.LIMIT) {
                  if (position.direction === Direction.LONG) {
                    triggerType = TriggerType.GTE
                  } else {
                    triggerType = TriggerType.LTE
                  }
                }

                const formatAmount =
                  amountUnit === AmountUnitEnum.BASE
                    ? amount
                    : parseBigNumber(amount).div(parseBigNumber(price)).toString()

                const size = parseBigNumber(formatAmount)
                  .mul(10 ** (symbolInfo?.baseDecimals ?? 1))
                  .toFixed(0)

                if (tradeMode === TradeMode.Seamless) {
                  const seamlessAccount = seamlessAccountList.find(
                    (item: SeamlessAccount) => item.masterAddress === activeSeamlessAddress,
                  )
                  if (!seamlessAccount) {
                    return
                  }

                  const isAuthorizedRes = await getSeamlessAuthStatus({
                    masterAddress: activeSeamlessAddress,
                    seamlessAddress: seamlessAccount.seamlessAddress,
                    chainId: symbolInfo.chainId as number,
                    tokenAddress: symbolInfo?.quoteToken as string,
                  })

                  const isAuthorized = isAuthorizedRes?.data?.auth

                  if (!isAuthorized) {
                    toast.error({ title: t`Seamless account not authorized` })
                    return
                  }

                  const placeOrderSaltAsOne = ethers.zeroPadValue(ethers.toBeHex(1n), 32)

                  console.log({
                    chainId: symbolInfo.chainId as number,
                    masterAddress: activeSeamlessAddress,
                    seamlessAddress: seamlessAccount.seamlessAddress,
                    forwardFeeToken: symbolInfo?.quoteToken as string,
                    functionName: position.tokenId
                      ? 'placeOrderWithPosition'
                      : 'placeOrderWithSalt',
                    orderParams: [
                      position.tokenId ? position.positionId : placeOrderSaltAsOne.toString(),
                      {
                        token: symbolInfo?.quoteToken as string,
                        amount: '0',
                      },
                      {
                        user: address as `0x${string}`,
                        poolId: position.poolId,
                        orderType: orderType,
                        triggerType: triggerType,
                        direction: position.direction,
                        collateralAmount: '0',
                        size,
                        price: ethers.parseUnits(price.toString(), 30).toString(),
                        timeInForce: TimeInForce.IOC,
                        postOnly: false,
                        slippagePct: ethers
                          .parseUnits((closePositionSlippage ?? 0).toString(), 4)
                          .toString(), // 转换为精度4位
                        operation: OperationType.DECREASE,
                        leverage: position.userLeverage,
                        tpSize: '0',
                        tpPrice: '0',
                        slSize: '0',
                        slPrice: '0',
                      },
                    ],
                  })

                  const rs = await forwardSeamlessTransaction({
                    chainId: symbolInfo.chainId as number,
                    masterAddress: activeSeamlessAddress,
                    seamlessAddress: seamlessAccount.seamlessAddress,
                    forwardFeeToken: symbolInfo?.quoteToken as string,
                    functionName: position.tokenId
                      ? 'placeOrderWithPosition'
                      : 'placeOrderWithSalt',
                    orderParams: [
                      position.tokenId ? position.positionId : '1',
                      {
                        token: symbolInfo?.quoteToken as string,
                        amount: '0',
                      },
                      {
                        user: address as `0x${string}`,
                        poolId: position.poolId,
                        orderType: orderType,
                        triggerType: triggerType,
                        direction: position.direction,
                        collateralAmount: '0',
                        size,
                        price: ethers.parseUnits(price.toString(), 30).toString(),
                        timeInForce: TimeInForce.IOC,
                        postOnly: false,
                        slippagePct: ethers
                          .parseUnits((closePositionSlippage ?? 0).toString(), 4)
                          .toString(), // 转换为精度4位
                        operation: OperationType.DECREASE,
                        leverage: position.userLeverage,
                        tpSize: '0',
                        tpPrice: '0',
                        slSize: '0',
                        slPrice: '0',
                        broker: getMyxBrokerAddressByChainId(symbolInfo.chainId as number),
                      },
                    ],
                  })

                  if (rs?.code === 0) {
                    const _parts = buildClosePositionToastParts({
                      direction: position.direction,
                      size: formatAmount,
                      price: price || marketPrice,
                      orderType,
                      baseSymbol: position.baseSymbol,
                      quoteSymbol: position.quoteSymbol,
                    })
                    toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
                    setCloseDialogOpen(false)
                  } else {
                    showErrorToast(client?.utils.formatErrorMessage(rs))
                  }

                  return
                }

                const rs = await client?.order.createDecreaseOrder({
                  chainId: position.chainId,
                  address: address as `0x${string}`,
                  poolId: position.poolId,
                  positionId: position.tokenId ? position.positionId : '',
                  orderType: orderType,
                  triggerType: triggerType,
                  direction: position.direction,
                  collateralAmount: '0',
                  size,
                  price: ethers.parseUnits(price.toString(), 30).toString(),
                  timeInForce: TimeInForce.IOC,
                  postOnly: false,
                  slippagePct: ethers
                    .parseUnits((closePositionSlippage ?? 0).toString(), 4)
                    .toString(), // 转换为精度4位
                  executionFeeToken: symbolInfo?.quoteToken as string,
                  leverage: position.userLeverage,
                })
                if (rs?.code === 0) {
                  const _parts = buildClosePositionToastParts({
                    direction: position.direction,
                    size: formatAmount,
                    price: price || marketPrice,
                    orderType,
                    baseSymbol: position.baseSymbol,
                    quoteSymbol: position.quoteSymbol,
                  })
                  toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
                  setCloseDialogOpen(false)
                } else {
                  showErrorToast(client?.utils.formatErrorMessage(rs))
                }
              } catch (e) {
                showErrorToast(e)
              } finally {
                setLoading(false)
              }
            }}
            loading={loading || asyncVipLevelLoading}
            className="w-full"
            style={{
              borderRadius: '44px',
              height: '44px',
            }}
          >
            <span className="text-[14px] font-[500] text-[#FFFFFF]">
              <Trans>Confirm</Trans>
            </span>
          </PrimaryButton>
        </div>
      </DialogBase>
    </>
  )
}
