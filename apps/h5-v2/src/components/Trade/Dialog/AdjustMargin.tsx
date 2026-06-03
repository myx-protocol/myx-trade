import { DialogBase } from '@/components/UI/DialogBase'
import { Trans } from '@lingui/react/macro'
import { useMemo, useState } from 'react'
import { MenuItem, Select as MuiSelect } from '@mui/material'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { isHex, padHex, toHex } from 'viem'
import { Tooltips } from '@/components/UI/Tooltips'
import Up from '@/components/Icon/set/Up'
import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { t } from '@lingui/core/macro'
import { DirectionEnum } from '@myx-trade/sdk'
import clsx from 'clsx'
import { parseBigNumber } from '@/utils/bn'
import { ethers } from 'ethers'
import {
  autoPriceDecimals,
  displayAmount,
  formatNumber,
  getSuperDecimalScale,
  isSuperDecimal,
} from '@/utils/number'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { toast } from '@/components/UI/Toast'
import { useGetFundingFee } from '@/hooks/calculate/use-get-fundingfee'
import useSWR from 'swr'
import { useCalculateLiqPrice } from '@/hooks/calculate/use-get-liq-price'
import { useMarketStore } from '../store/MarketStore'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { useGetTradingFeeInfo } from '@/hooks/calculate/use-get-trading-fee'
import { useWalletStore } from '@/store/wallet/createStore'
import { useGetAccountAssets } from '@/hooks/balance/use-get-account-assets'
import useGlobalStore from '@/store/globalStore'
import { getQuoteTokenInfo } from '@/config/token'
import { showErrorToast } from '@/config/error'
import { useGetSeamlessAuthStatus } from '@/hooks/seamless/use-get-seamless-auth-status'
import { useCheckSeamlessAllowance } from '@/hooks/seamless/use-check-seamless-allowance'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck'
import { useCheckUserVipInfo } from '@/hooks/use-check-user-vip-info'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { TradeMode } from '@/pages/Trade/types'
import type { SeamlessAccount } from '@/store/seamless/initialState'

import { buildAdjustMarginToastParts, renderOrderToastContent } from '@/utils/order/action-toast'
import { PoolTxType, usePoolTxRecordsStore } from '@/store/poolTxRecords'

function AdjustMarginSelect({
  adjustType,
  setAdjustType,
}: {
  adjustType: 'increase' | 'decrease'
  setAdjustType: (adjustType: 'increase' | 'decrease') => void
}) {
  return (
    <MuiSelect
      value={adjustType}
      sx={{
        outline: 'none',
        color: 'white',
        fontSize: '12px',
        width: '100px',
        lineHeight: 1,
        fontWeight: 500,
        '& .MuiOutlinedInput-notchedOutline': {
          outline: 'none',
          border: 'none',
        },
        '& .MuiOutlinedInput-input': {
          paddingRight: '24px',
          paddingLeft: '12px',
          paddingTop: '16px',
          paddingBottom: '16px',
          minHeight: '12px',
          borderRadius: '8px',
          background: '#202129',
        },
        '& .MuiSvgIcon-root': {
          color: 'white',
          right: '12px',
        },
      }}
      MenuProps={{
        sx: {
          '& .MuiPaper-root': {
            backgroundColor: '#202129',
            color: 'white',
          },
          '& .MuiMenuItem-root': {
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#202129 !important',
            '&:hover': {
              backgroundColor: '#18191F !important',
            },
            '&.Mui-selected': {
              backgroundColor: '#18191F !important',
            },
          },
        },
      }}
      onChange={(e) => {
        console.log(e)
        setAdjustType(e.target.value as 'increase' | 'decrease')
      }}
    >
      <MenuItem value="increase" className="text-[12px]">
        <Trans>Increase</Trans>
      </MenuItem>
      <MenuItem value="decrease">
        <Trans>Decrease</Trans>
      </MenuItem>
    </MuiSelect>
  )
}

export const AdjustMarginDialog = ({ position }: { position: any }) => {
  const [open, setOpen] = useState(false)
  const { tickerData } = useMarketStore()
  const { poolList } = useGlobalStore()
  const [loading, setLoading] = useState(false)
  const accountAssets = useGetAccountAssets(position.chainId, position.poolId)
  const { getFundingFee } = useGetFundingFee(position.poolId, position.chainId as number)
  const marketPrice = tickerData[position.poolId]?.price.toString() ?? '0'
  const { poolConfig } = useGetPoolConfig(position.poolId, position.chainId)
  const assetClass = poolConfig?.levelConfig?.assetClass ?? 0
  const maintainCollateralRate = poolConfig?.levelConfig?.maintainCollateralRate.toString() ?? '0'
  const [adjustMargin, setAdjustMargin] = useState('')
  const { client } = useMyxSdkClient(position.chainId)
  const [adjustType, setAdjustType] = useState<'increase' | 'decrease'>('increase')
  const tradingFee = useGetTradingFeeInfo({
    size: position.size,
    price: marketPrice,
    assetClass,
    chainId: position.chainId,
  })

  const { checkWalletChainId } = useWalletChainCheck()
  const { isMatch, asyncVipInfo, asyncVipLevelLoading } = useCheckUserVipInfo()
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  const { checkSeamlessAllowance } = useCheckSeamlessAllowance()
  const { seamlessAccountList, activeSeamlessAddress, activeSeamlessWallet } = useSeamlessStore()
  const { tradeMode } = useGlobalStore()
  const { activeAddress } = useWalletStore()

  const decimalScale = useMemo(() => {
    if (isSuperDecimal(marketPrice)) {
      return getSuperDecimalScale(Number(marketPrice))
    } else {
      return autoPriceDecimals(Number(marketPrice))
    }
  }, [marketPrice])

  const targetCollateralAmount = useMemo(() => {
    return adjustType === 'increase'
      ? parseBigNumber(position.collateralAmount).plus(parseBigNumber(adjustMargin)).toString()
      : parseBigNumber(position.collateralAmount).minus(parseBigNumber(adjustMargin)).toString()
  }, [adjustType, adjustMargin, position.collateralAmount])

  const caculateOriginLiqPrice = useCalculateLiqPrice({
    poolId: position.poolId,
    chainId: position.chainId,
    size: position.size,
    price: marketPrice,
    assetClass: assetClass,
    entryPrice: position.entryPrice,
    collateralAmount: position.collateralAmount,
    fundingRateIndexEntry: position.fundingRateIndex,
    direction: position.direction,
    maintainMarginRate: maintainCollateralRate,
  })

  const caculateLiqPrice = useCalculateLiqPrice({
    poolId: position.poolId,
    chainId: position.chainId,
    size: position.size,
    price: marketPrice,
    assetClass: assetClass,
    entryPrice: position.entryPrice,
    collateralAmount: targetCollateralAmount,
    fundingRateIndexEntry: position.fundingRateIndex,
    direction: position.direction,
    maintainMarginRate: maintainCollateralRate,
  })

  const pool = useMemo(() => {
    return poolList.find((item: any) => item.poolId === position?.poolId)
  }, [poolList, position?.poolId])

  const { data: fundingFee } = useSWR(
    `getFundingFee-${position.positionId}`,
    async () => {
      const rs = await getFundingFee(position.fundingRateIndex, position.size, position.direction)

      return rs
    },
    {
      refreshInterval: 10000,
    },
  )

  const maxDecreaseAmount = useMemo(() => {
    let pnl
    if (position.direction === DirectionEnum.Long) {
      pnl =
        parseBigNumber(marketPrice)
          .minus(parseBigNumber(position.entryPrice))
          .mul(parseBigNumber(position.size)) ?? '0'
    } else {
      pnl =
        parseBigNumber(position.entryPrice)
          .minus(parseBigNumber(marketPrice))
          .mul(parseBigNumber(position.size)) ?? '0'
    }

    const positionLeverage = parseBigNumber(position.userLeverage ?? '1').gt(0)
      ? position.userLeverage
      : 1

    const safeLeverage = parseBigNumber(positionLeverage).gt(
      parseBigNumber(poolConfig?.levelConfig?.leverage ?? '1'),
    )
      ? parseBigNumber(poolConfig?.levelConfig?.leverage ?? '1')
      : parseBigNumber(positionLeverage)

    //可减少金额 = 仓位保证金 - 持仓数量 * 入场价 / 杠杆 + 资金费 - 交易手续费 + 盈亏
    const originMargin = parseBigNumber(position.entryPrice)
      .mul(parseBigNumber(position.size))
      .div(safeLeverage)

    const couldDecreaseAmount = parseBigNumber(position.freeAmount)
      .minus(originMargin)
      .plus(parseBigNumber(fundingFee ?? '0'))
      .minus(parseBigNumber(tradingFee ?? '0'))
      .plus(pnl)

    if (couldDecreaseAmount.lte(0)) {
      return '0'
    }

    if (parseBigNumber(position.freeAmount).gt(couldDecreaseAmount)) {
      return couldDecreaseAmount.toString()
    }

    return position.freeAmount ?? '0'
  }, [
    position.collateralAmount,
    fundingFee,
    marketPrice,
    tradingFee,
    position.direction,
    position.entryPrice,
    position.size,
  ])

  const displayCollateralAmountChange = useMemo(() => {
    if (adjustType === 'increase') {
      const targetCollateralAmount = parseBigNumber(position.collateralAmount)
        .plus(parseBigNumber(adjustMargin))
        .toString()
      return displayAmount(targetCollateralAmount)
    } else {
      const stringAmount = parseBigNumber(position.collateralAmount)
        .minus(parseBigNumber(adjustMargin))
        .gt(0)
        ? parseBigNumber(position.collateralAmount).minus(parseBigNumber(adjustMargin)).toString()
        : '0'
      return displayAmount(stringAmount)
    }
  }, [adjustType, adjustMargin, position.collateralAmount])

  const paidOrigin = useMemo(() => {
    if (adjustType === 'decrease') {
      return {}
    }

    const quoteProfit = parseBigNumber(accountAssets?.quoteProfit?.toString() ?? '0')
    const freeMargin = parseBigNumber(accountAssets.freeMargin ?? '0')
    if (parseBigNumber(adjustMargin).lte(quoteProfit)) {
      return {
        quoteProfit: adjustMargin,
      }
    }
    let diff = parseBigNumber(adjustMargin).minus(quoteProfit)

    if (diff.lte(freeMargin)) {
      return {
        quoteProfit: quoteProfit.toString(),
        freeMargin: diff.toString(),
      }
    }

    diff = parseBigNumber(adjustMargin).minus(quoteProfit).minus(freeMargin)

    return {
      walletBalance: diff.toString(),
      freeMargin: freeMargin.toString(),
      quoteProfit: quoteProfit.toString(),
    }
  }, [
    adjustType,
    accountAssets?.walletBalance,
    accountAssets?.quoteProfit,
    adjustMargin,
    accountAssets.freeMargin,
  ])

  const { addRecord } = usePoolTxRecordsStore()

  return (
    <>
      <InfoButton
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '6px',
          fontWeight: 500,
          lineHeight: 1,
        }}
      >
        <Trans>Margin</Trans>
      </InfoButton>
      {open && (
        <DialogBase title={t`Adjust Margin`} open={open} onClose={() => setOpen(false)}>
          {/* pair level info */}
          <p
            className={clsx(
              'mt-[6px] text-[14px] leading-[1] font-bold',
              position?.direction === DirectionEnum.Long ? 'text-rise' : 'text-fall',
            )}
          >
            <span>
              {position?.baseSymbol}/{position?.quoteSymbol}
            </span>
            <span className="ml-[4px] text-[14px]">{position?.userLeverage}x</span>
          </p>

          {/* margin */}
          <div className="border-b border-[#31333D] py-[20px] leading-[1]">
            <div className="flex items-center justify-between text-[12px] font-medium text-[#9397A3]">
              <p>
                <Trans>Margin</Trans>
              </p>
              <p className="text-[#CED1D9]">
                {displayAmount(position?.collateralAmount)} {position?.quoteSymbol}
              </p>
            </div>

            {/* liquidation price */}
            <div className="mt-[8px] flex items-center justify-between text-[12px] font-medium text-[#9397A3]">
              <p>
                <Trans>Liq. Price</Trans>
              </p>
              <p>
                {parseBigNumber(caculateOriginLiqPrice ?? '0').eq(0)
                  ? '--'
                  : displayAmount(caculateOriginLiqPrice ?? '0')}
              </p>
            </div>
          </div>

          {/* form */}

          <div className="mt-[20px] leading-[1]">
            {/* title */}
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-medium text-[#fff]">
                <Trans>Adjust Margin</Trans>
              </p>
              <div className="text-[12px] font-medium">
                <span className="text-[#848E9C]">
                  <Trans>Max</Trans>
                </span>
                <span className="ml-[4px] text-[#CED1D9]">
                  {adjustType === 'increase'
                    ? displayAmount(accountAssets?.availableMargin?.toString() ?? '0', 6)
                    : displayAmount(maxDecreaseAmount, 6)}{' '}
                  {position?.quoteSymbol}
                </span>
              </div>
            </div>

            {/* form items */}
            <div className="mt-[12px] flex h-[44px] items-center gap-[8px]">
              <AdjustMarginSelect
                adjustType={adjustType}
                setAdjustType={(type: 'increase' | 'decrease') => {
                  setAdjustMargin('')
                  setAdjustType(type)
                }}
              />
              <div className="relative flex h-[44px] flex-[1_1_0%] rounded-[8px] bg-[#202129] px-[12px]">
                <NumberInputPrimitive
                  placeholder={t`Please enter the amount.`}
                  value={adjustMargin}
                  decimalScale={decimalScale}
                  onValueChange={(e) => setAdjustMargin(e.value)}
                />
                <div
                  className="absolute top-[50%] right-[12px] translate-y-[-50%] cursor-pointer text-[12px] text-[#00E3A5]"
                  onClick={() => {
                    if (adjustType === 'increase') {
                      setAdjustMargin(accountAssets?.availableMargin?.toString() ?? '0')
                    } else {
                      setAdjustMargin(maxDecreaseAmount)
                    }
                  }}
                >
                  <Trans>Max</Trans>
                </div>
              </div>
            </div>

            {/* pay */}
            {adjustType === 'increase' && (
              <div>
                <div className="mt-[16px] flex items-center justify-between text-[12px] font-medium">
                  <p className="text-[#9397A3]">
                    <Trans>Pay</Trans>
                  </p>
                  <div className="flex gap-[4px]">
                    <img
                      src={getQuoteTokenInfo(position.chainId, pool.quoteToken)?.logoUrl}
                      alt=""
                      className="h-[16px] w-[16px]"
                    />
                    <Tooltips
                      title={`${formatNumber(adjustMargin, { showUnit: false })} ${position?.quoteSymbol}`}
                    >
                      <p className="cursor-help border-b-[1px] border-dashed border-[#fff] text-[#CED1D9]">
                        {`${formatNumber(adjustMargin, { showUnit: false })} ${position?.quoteSymbol}`}
                      </p>
                    </Tooltips>
                  </div>
                </div>
                {parseBigNumber(adjustMargin).gt(0) && (
                  <div className="mt-[8px]">
                    {parseBigNumber(paidOrigin.walletBalance ?? '0').gt(0) && (
                      <p className="text-right text-[12px] text-[#848E9C]">{t`Paid from Wallet: ${displayAmount(paidOrigin?.walletBalance ?? '0', 6)} ${position?.quoteSymbol}`}</p>
                    )}
                    {parseBigNumber(paidOrigin.quoteProfit ?? '0').gt(0) && (
                      <p className="mt-[4px] text-right text-[12px] text-[#848E9C]">{t`Paid from Locked Realized PnL: ${displayAmount(paidOrigin?.quoteProfit ?? '0', 6)} ${position?.quoteSymbol}`}</p>
                    )}
                    {parseBigNumber(paidOrigin.freeMargin ?? '0').gt(0) && (
                      <p className="mt-[4px] text-right text-[12px] text-[#848E9C]">{t`Paid from Free Margin: ${displayAmount(paidOrigin?.freeMargin ?? '0', 6)} ${position?.quoteSymbol}`}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* tips */}
          <div className="mt-[24px] border-t-[1px] border-t-[#31333D] py-[20px]">
            {/* adjusted margin */}
            <div className="flex items-center justify-between text-[12px] font-medium text-[#9397A3]">
              <p>
                <Trans>Adjusted Margin</Trans>
              </p>
              <div className="flex">
                <span className="text-[#CED1D9]">
                  {displayCollateralAmountChange} {position?.quoteSymbol}
                </span>
                {!parseBigNumber(adjustMargin).eq(0) && (
                  <>
                    {adjustType === 'increase' ? (
                      <Up size={16} color="#00E3A5" />
                    ) : (
                      <Up size={16} color="#EC605A" className="rotate-180" />
                    )}
                  </>
                )}
              </div>
            </div>
            {/* liquidation price */}
            <div className="mt-[8px] flex items-center justify-between text-[12px] font-medium text-[#9397A3]">
              <p>
                <Trans>Liq. Price</Trans>
              </p>
              <div className="flex">
                <span className="text-[#CED1D9]">{displayAmount(caculateLiqPrice ?? '0')}</span>
                <span>
                  {parseBigNumber(caculateLiqPrice).gt(parseBigNumber(caculateOriginLiqPrice)) ? (
                    <Up size={16} color="#00E3A5" />
                  ) : (
                    <Up size={16} color="#EC605A" className="rotate-180" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* buttons */}
          <div className="pt-[20px]">
            <PrimaryButton
              style={{
                borderRadius: '44px',
                height: '44px',
                width: '100%',
                fontSize: '14px',
                fontWeight: 500,
              }}
              loading={loading || asyncVipLevelLoading}
              onClick={async () => {
                if (parseBigNumber(adjustMargin).eq(0)) {
                  toast.error({ title: t`Adjust margin amount cannot be 0` })
                  return
                }

                if (
                  adjustType === 'decrease' &&
                  parseBigNumber(adjustMargin).gt(parseBigNumber(maxDecreaseAmount))
                ) {
                  toast.error({
                    title: t`Adjust margin amount is greater than the maximum decrease amount`,
                  })
                  return
                }
                if (
                  adjustType === 'increase' &&
                  parseBigNumber(adjustMargin).gt(
                    parseBigNumber(accountAssets?.availableMargin?.toString() ?? '0'),
                  )
                ) {
                  toast.error({ title: t`Adjust margin amount is greater than the total balance` })
                  return
                }
                if (parseBigNumber(adjustMargin).eq(0)) {
                  toast.error({ title: t`Adjust margin amount cannot be 0` })
                  return
                }

                const adjustAmountFormat = parseBigNumber(adjustMargin)
                  .mul(adjustType === 'increase' ? 1 : -1)
                  .toString()
                setLoading(true)

                await checkWalletChainId(position?.chainId as number)

                if (!isMatch) {
                  const rs = await asyncVipInfo(
                    pool?.quoteToken as string,
                    position?.chainId as string,
                  )

                  if (!rs) {
                    setLoading(false)
                    return
                  }
                }

                try {
                  const toBytes32 = (value: string): `0x${string}` => {
                    if (isHex(value)) return padHex(value as `0x${string}`, { size: 32 })
                    return padHex(toHex(value), { size: 32 })
                  }

                  if (tradeMode === TradeMode.Seamless) {
                    const seamlessAccount = seamlessAccountList.find(
                      (item: SeamlessAccount) => item.masterAddress === activeSeamlessAddress,
                    )

                    if (!seamlessAccount) {
                      toast.error({ title: t`Seamless account not found` })
                      return
                    }

                    const isAuthorizedRes = await getSeamlessAuthStatus({
                      masterAddress: activeSeamlessAddress,
                      seamlessAddress: seamlessAccount?.seamlessAddress as string,
                      chainId: position.chainId,
                      tokenAddress: pool?.quoteToken as string,
                    })

                    const isAuthorized = isAuthorizedRes?.data?.auth

                    if (!isAuthorized) {
                      toast.error({ title: t`Seamless account not authorized` })
                      return
                    }

                    const isAllowed = await checkSeamlessAllowance({
                      chainId: position.chainId,
                      masterAddress: activeSeamlessAddress,
                      seamlessAddress: seamlessAccount?.seamlessAddress as string,
                      quoteToken: pool?.quoteToken as string,
                      amount: parseBigNumber(adjustAmountFormat).gt(0)
                        ? ethers.parseUnits(adjustAmountFormat, pool?.quoteDecimals ?? 6).toString()
                        : '0',
                    })
                    if (!isAllowed) return

                    let depositAmount = parseBigNumber(0)

                    const assetsRes = await client?.account.getAvailableMarginBalance({
                      poolId: position.poolId,
                      chainId: position.chainId,
                      address: seamlessAccount.masterAddress,
                    })

                    const availableMargin = parseBigNumber(
                      assetsRes?.code === 0 ? (assetsRes?.data?.toString() ?? '0') : '0',
                    ).div(10 ** (pool?.quoteDecimals ?? 6))

                    let diff = parseBigNumber(0)
                    const used = parseBigNumber(adjustAmountFormat)

                    if (
                      availableMargin.lt(parseBigNumber(adjustAmountFormat)) &&
                      adjustType === 'increase'
                    ) {
                      diff = used.minus(availableMargin).lt(0)
                        ? parseBigNumber(0)
                        : used.minus(availableMargin)
                      depositAmount = diff
                    }

                    const rs = await client?.seamless.adjustCollateral({
                      chainId: position.chainId,
                      seamlessAddress: seamlessAccount.seamlessAddress,
                      forwardFeeToken: pool?.quoteToken as string,
                      poolId: position.poolId,
                      positionId: toBytes32(position.positionId),
                      adjustAmount: ethers
                        .parseUnits(adjustAmountFormat, pool?.quoteDecimals ?? 6)
                        .toString(),
                      depositData: {
                        token: pool?.quoteToken ?? '',
                        amount: depositAmount.mul(10 ** (pool?.quoteDecimals ?? 6)).toString(),
                      },
                      signFunction: ({ domain, types, primaryType, message }) =>
                        activeSeamlessWallet.signTypedData(
                          { ...domain, chainId: parseInt(domain.chainId as string) },
                          types,
                          message,
                        ),
                    })

                    if (rs?.code === 0) {
                      const _parts = buildAdjustMarginToastParts({
                        adjustType,
                        amount: adjustMargin,
                        baseSymbol: position.baseSymbol,
                        quoteSymbol: pool?.quoteSymbol ?? position.quoteSymbol,
                      })
                      toast.success({
                        title: _parts.title,
                        content: renderOrderToastContent(_parts),
                      })

                      const { txId, hash } = rs.data as { txId: string; hash: string }
                      addRecord({
                        poolId: position.poolId,
                        chainId: position.chainId,
                        type: PoolTxType.Adjust_Margin,
                        txId,
                        txHash: hash,
                      })

                      setAdjustMargin('')
                      setAdjustType('increase')
                      setOpen(false)
                    } else {
                      showErrorToast(client?.utils.formatErrorMessage(rs))
                    }

                    setLoading(false)
                    return
                  }

                  const data = {
                    poolId: position.poolId,
                    positionId: toBytes32(position.positionId),
                    adjustAmount: ethers
                      .parseUnits(adjustAmountFormat, pool?.quoteDecimals ?? 6)
                      .toString(),
                    quoteToken: pool?.quoteToken ?? '',
                    chainId: position.chainId,
                    address: activeAddress,
                  }

                  const rs = await client?.position.adjustCollateral(data)
                  if (rs?.code === 0) {
                    const { txId, hash } = rs.data as { txId: string; hash: string }

                    addRecord({
                      poolId: position.poolId,
                      chainId: position.chainId,
                      type: PoolTxType.Adjust_Margin,
                      txId,
                      txHash: hash,
                    })
                    const _parts = buildAdjustMarginToastParts({
                      adjustType,
                      amount: adjustMargin,
                      baseSymbol: position.baseSymbol,
                      quoteSymbol: pool?.quoteSymbol ?? position.quoteSymbol,
                    })
                    toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
                    setAdjustMargin('')
                    setAdjustType('increase')
                    setOpen(false)
                  } else {
                    showErrorToast(client?.utils.formatErrorMessage(rs))
                  }
                } catch (error) {
                  showErrorToast(error)
                } finally {
                  setLoading(false)
                }
              }}
            >
              <Trans>Confirm</Trans>
            </PrimaryButton>
          </div>
        </DialogBase>
      )}
    </>
  )
}
