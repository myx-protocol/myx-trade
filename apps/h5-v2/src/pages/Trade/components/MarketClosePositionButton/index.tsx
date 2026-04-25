import { Trans } from '@lingui/react/macro'

import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { useState, useMemo } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { Direction, OperationType, OrderType, TimeInForce, TriggerType } from '@myx-trade/sdk'
import { ethers } from 'ethers'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { t } from '@lingui/core/macro'
import { parseBigNumber } from '@/utils/bn'
import { formatNumber } from '@/utils/number'
import { getSlippage, getSlippageConfig, setSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { useCheckUserVipInfo } from '@/hooks/use-check-user-vip-info'
import { toast } from '@/components/UI/Toast'
import { showErrorToast } from '@/config/error'
import { TradeMode } from '../../types'
import type { SeamlessAccount } from '@/store/seamless/initialState'
import { EditText } from '@/components/EditText'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck'
import { useSeamlessStore } from '@/store/seamless/createStore'
import useGlobalStore from '@/store/globalStore'
import { useForwardSeamlessTransaction } from '@/hooks/seamless/use-forward-seamless-transaction'
import { useGetSeamlessAuthStatus } from '@/hooks/seamless/use-get-seamless-auth-status'
import { tradePubSub } from '@/utils/pubsub'
import { getMyxBrokerAddressByChainId } from '@/config/brokerAddress'
import { buildClosePositionToastParts, renderOrderToastContent } from '@/utils/order/action-toast'

export const MarketClosePositionButton = ({
  position,
  marketPrice,
  symbolInfo,
}: {
  position: any
  marketPrice: string
  symbolInfo: any
}) => {
  const { client } = useMyxSdkClient(position?.chainId)
  const [loading, setLoading] = useState(false)
  const [marketCloseDialogOpen, setMarketCloseDialogOpen] = useState(false)
  const { isMatch, asyncVipInfo, asyncVipLevelLoading } = useCheckUserVipInfo()
  const { checkWalletChainId } = useWalletChainCheck()
  const { poolConfig } = useGetPoolConfig(position?.poolId, position?.chainId)
  const closePositionSlippage =
    getSlippage({
      chainId: position?.chainId ?? 0,
      poolId: position?.poolId ?? '',
      type: SlippageTypeEnum.CLOSE,
    }) ?? getSlippageConfig(poolConfig?.level ?? 1)
  const { seamlessAccountList, activeSeamlessAddress } = useSeamlessStore()
  const { tradeMode } = useGlobalStore()
  const { forwardSeamlessTransaction } = useForwardSeamlessTransaction(symbolInfo?.chainId)
  const { getSeamlessAuthStatus } = useGetSeamlessAuthStatus()
  const { address } = useWalletConnection()
  const closeAmount = formatNumber(position.size ?? '0', { showUnit: false }) ?? '0'
  const pnl = useMemo(() => {
    if (position.direction === Direction.LONG) {
      return (
        parseBigNumber(marketPrice)
          .minus(parseBigNumber(position.entryPrice))
          .mul(parseBigNumber(position.size)) ?? '0'
      )
    } else {
      return (
        parseBigNumber(position.entryPrice)
          .minus(parseBigNumber(marketPrice))
          .mul(parseBigNumber(position.size)) ?? '0'
      )
    }
  }, [marketPrice, position.entryPrice, position.size, position.direction])

  return (
    <>
      <InfoButton
        onClick={() => {
          setMarketCloseDialogOpen(true)
        }}
      >
        <Trans>Market Close</Trans>
      </InfoButton>

      <DialogBase
        title={position.direction === Direction.LONG ? t`Close Long` : t`Close Short`}
        open={marketCloseDialogOpen}
        onClose={() => setMarketCloseDialogOpen(false)}
      >
        <div
          className="flex h-[22px] items-center gap-[4px] text-[16px] leading-[16px]"
          style={{ color: position.direction === Direction.LONG ? '#00E3A5' : '#EC605A' }}
        >
          <p>
            {position?.baseSymbol}/{position?.quoteSymbol}
          </p>
          <p>{position.userLeverage}x</p>
        </div>
        <div className="mt-[24px] flex h-[22px] items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Closeable Amount</Trans>
          </p>
          <p className="text-[14px] font-[500] text-[white]">{closeAmount}</p>
        </div>
        <div className="mt-[12px] flex h-[22px] items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Current Price</Trans>
          </p>
          <p className="text-[14px] font-[500] text-[white]">
            ${formatNumber(marketPrice, { showUnit: false })}
          </p>
        </div>
        <div className="mt-[12px] flex h-[22px] items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Price</Trans>
          </p>
          <p className="text-[14px] font-[500] text-[white]">
            <Trans>Market</Trans>
          </p>
        </div>
        <div className="mt-[12px] flex h-[22px] items-center justify-between">
          <p className="text-[14px] text-[#848E9C]">
            <Trans>Max Slippage</Trans>
          </p>
          <EditText
            value={`${(closePositionSlippage * 100).toFixed(2)}`}
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
        </div>
        <div className="mt-[12px] flex h-[22px] items-center justify-between">
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

        <div className="left-0 mt-[24px] flex w-full justify-center">
          <PrimaryButton
            onClick={async () => {
              await checkWalletChainId(position?.chainId as number)

              try {
                setLoading(true)

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

                  const rs = await forwardSeamlessTransaction({
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
                        orderType: OrderType.MARKET,
                        triggerType: TriggerType.NONE,
                        direction: position.direction,
                        collateralAmount: '0',
                        size: ethers
                          .parseUnits(position.size.toString(), symbolInfo?.baseDecimals)
                          .toString(),
                        price: ethers.parseUnits(marketPrice.toString(), 30).toString(),
                        timeInForce: TimeInForce.IOC,
                        postOnly: false,
                        slippagePct: ethers
                          .parseUnits(closePositionSlippage.toString(), 4)
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
                      size: position.size,
                      price: marketPrice,
                      orderType: OrderType.MARKET,
                      baseSymbol: position.baseSymbol,
                      quoteSymbol: position.quoteSymbol,
                    })
                    toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
                    setMarketCloseDialogOpen(false)
                  } else {
                    showErrorToast(client?.utils.formatErrorMessage(rs))
                  }

                  return
                }

                const rs = await client?.order.createDecreaseOrder({
                  chainId: position.chainId,
                  address: address as `0x${string}`,
                  poolId: position.poolId,
                  positionId: position.tokenId ? position.positionId : 0,
                  orderType: OrderType.MARKET,
                  triggerType: TriggerType.NONE,
                  direction: position.direction,
                  collateralAmount: '0',
                  size: ethers
                    .parseUnits(position.size.toString(), symbolInfo?.baseDecimals)
                    .toString(),
                  price: ethers.parseUnits(marketPrice.toString(), 30).toString(),
                  timeInForce: TimeInForce.IOC,
                  postOnly: false,
                  slippagePct: ethers.parseUnits(closePositionSlippage.toString(), 4).toString(), // 转换为精度4位
                  executionFeeToken: symbolInfo?.quoteToken as string,
                  leverage: position.userLeverage,
                })
                if (rs?.code === 0) {
                  const _parts = buildClosePositionToastParts({
                    direction: position.direction,
                    size: position.size,
                    price: marketPrice,
                    orderType: OrderType.MARKET,
                    baseSymbol: position.baseSymbol,
                    quoteSymbol: position.quoteSymbol,
                  })
                  toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
                  setMarketCloseDialogOpen(false)
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
