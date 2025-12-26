import { Trans } from '@lingui/react/macro'

import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { useState, useMemo, useEffect } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { Direction, OrderType, TimeInForce, TriggerType } from '@myx-trade/sdk'
import { ethers } from 'ethers'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { t } from '@lingui/core/macro'
import { parseBigNumber } from '@/utils/bn'
import { formatNumber } from '@/utils/number'
import { toast } from '@/components/UI/Toast'
import { getSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { InputWrapper } from '@/components/Trade/components/InputWrapper'
import { Slider, TextField, Tooltip } from '@mui/material'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { TradeSelect } from '@/components/Trade/components/Select'
import { AmountUnitEnum } from '@/components/Trade/type'
import clsx from 'clsx'
import useGlobalStore from '@/store/globalStore'
import { useCheckUserVipInfo } from '@/hooks/use-check-user-vip-info'

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
  const { checkUserVipInfo } = useCheckUserVipInfo(position.chainId)
  const closePositionSlippage = getSlippage({
    chainId: position?.chainId ?? 0,
    poolId: position?.poolId ?? '',
    type: SlippageTypeEnum.CLOSE,
  })
  const { address } = useWalletConnection()
  const closeAmount = formatNumber(position.size ?? '0', { showUnit: false }) ?? '0'
  const [amountUnit, setAmountUnit] = useState<AmountUnitEnum>(AmountUnitEnum.BASE)

  const { poolList } = useGlobalStore()

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
          <p className="text-[14px] font-[500] text-[white]">
            {(closePositionSlippage ?? 0) * 100}%
          </p>
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
                await checkUserVipInfo()
                const pool = poolList.find((poolItem: any) => poolItem.poolId === position.poolId)
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
                const data = {
                  chainId: position.chainId,
                  address: address as `0x${string}`,
                  poolId: position.poolId,
                  positionId: position.tokenId ? position.positionId : 0,
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
                  executionFeeToken: pool?.quoteToken as string,
                  leverage: position.userLeverage,
                } as any

                const rs = await client?.order.createDecreaseOrder(data)
                if (rs?.code === 0) {
                  console.log('market close success')
                  toast.success({ title: t`Market close success` })
                  setCloseDialogOpen(false)
                } else {
                  console.log('market close failed')
                  toast.error({ title: t`${client?.utils.formatErrorMessage(rs)}` })
                }
                // todo toast
              } catch (e) {
                toast.error({ title: t`${client?.utils.formatErrorMessage(e)}` })
              } finally {
                setLoading(false)
              }
            }}
            loading={loading}
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
