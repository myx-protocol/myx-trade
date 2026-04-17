import { DialogBase } from '@/components/UI/DialogBase'
import { TpSlTabTypeEnum } from './types'
import { useCallback, useMemo, useState } from 'react'
import { PriceInfo } from './components/PriceInfo'
import { TpslFormGroup } from './components/TpslFormGroup'
import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { formatNumber } from '@/utils/number'
import { useMarketStore } from '../../store/MarketStore'
import { useOrderTPSLStore } from './store'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { parseBigNumber } from '@/utils/bn'
import { ethers } from 'ethers'
import { Direction, OperationType, OrderType, TimeInForce, TriggerType } from '@myx-trade/sdk'
import { toast } from '@/components/UI/Toast'
import { verifyTpSlPrice } from '@/utils/verify'
import { showErrorToast } from '@/config/error'
import { t } from '@lingui/core/macro'
import { EditIcon } from '@/components/UI/Icon'
import useGlobalStore from '@/store/globalStore'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useForwardSeamlessTransaction } from '@/hooks/seamless/use-forward-seamless-transaction'
import { TradeMode } from '@/pages/Trade/types'
import { useGetAllQuoteTokenAuthStatus } from '@/hooks/seamless/use-get-seamless-auth-status'
import { useGetActivePoolList } from '../../hooks/use-get-pool-list'
import type { SeamlessAccount } from '@/store/seamless/initialState'
import { getMyxBrokerAddressByChainId } from '@/config/brokerAddress'
import { buildTpSlToastParts, renderOrderToastContent } from '@/utils/order/action-toast'
import { getSlippage, SlippageTypeEnum } from '@/utils/slippage'
import type { PositionTpSlOrderParams } from '@myx-trade/sdk'

export const OrderTpSlButton = ({
  order,
  poolInfo,
  isEdit = false,
  className,
  btnText,
  isSingle = false,
}: {
  order: any
  poolInfo: any
  isEdit?: boolean
  className?: string
  btnText?: string
  isSingle?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const { address } = useWalletConnection()
  const { activeTab, tpPrice, slPrice, tpSize, slSize, reset } = useOrderTPSLStore()
  const { tickerData } = useMarketStore()
  const marketPrice = tickerData[order.poolId]?.price ?? 0
  const { client } = useMyxSdkClient(order.chainId)
  const [loading, setLoading] = useState(false)
  const { poolList } = useGetActivePoolList()
  const pool = useMemo(() => {
    return poolList.find((item: any) => item.poolId === order.poolId)
  }, [poolList, order.poolId])
  const { tradeMode } = useGlobalStore()
  const { seamlessAccountList, activeSeamlessAddress } = useSeamlessStore()
  const { forwardSeamlessTransaction } = useForwardSeamlessTransaction(order.chainId)
  const { quoteTokenAuthStatus } = useGetAllQuoteTokenAuthStatus()
  const isSeamlessAuthorized = quoteTokenAuthStatus.find(
    (item) => item.quoteToken === pool?.quoteToken,
  )?.auth
  const tpSlSlippage = getSlippage({
    chainId: order?.chainId ?? 0,
    poolId: order?.poolId ?? '',
    type: SlippageTypeEnum.TPSL,
  })
  const comparePrice =
    order.positionEntryPrice && parseBigNumber(marketPrice.toString()).gt(0)
      ? marketPrice.toString()
      : (order.positionEntryPrice ?? order.price)

  const handleConfirm = useCallback(async () => {
    if (tpPrice && tpSize === '') {
      toast.error({ title: t`Please enter the TP size` })
      return
    }
    if (slPrice && slSize === '') {
      toast.error({ title: t`Please enter the SL size` })
      return
    }
    if (tpSize && tpPrice === '') {
      toast.error({ title: t`Please enter the TP price` })
      return
    }
    if (slSize && slPrice === '') {
      toast.error({ title: t`Please enter the SL price` })
      return
    }

    const data = {
      orderId: order.orderId,
      tpSize: '0',
      tpPrice: '0',
      slSize: '0',
      slPrice: '0',
      useOrderCollateral: false,
      executionFeeToken: poolInfo.quoteToken,
      size: ethers.parseUnits(order.size, poolInfo.baseDecimals).toString(),
      price: ethers.parseUnits(order.price, 30).toString(),
    }
    const nextTriggerType = parseBigNumber(tpPrice || '0').gt(parseBigNumber(comparePrice))
      ? TriggerType.GTE
      : TriggerType.LTE
    const shouldRecreateStopOrder =
      order.orderType === OrderType.STOP &&
      isSingle &&
      !!order.positionEntryPrice &&
      nextTriggerType !== order.triggerType
    const verifyReferencePrice = isSingle && order.positionEntryPrice ? comparePrice : order.price
    const positionId = order.positionTokenId ? order.positionId : ''
    const currentPositionId = order.positionTokenId ? order.positionId : '1'
    const leverage = order.positionUserLeverage ?? order.userLeverage ?? 0

    const recreateStopOrder = async () => {
      const isTpOrder =
        order.direction === Direction.LONG
          ? nextTriggerType === TriggerType.GTE
          : nextTriggerType === TriggerType.LTE

      const createData: PositionTpSlOrderParams = {
        chainId: order.chainId as number,
        address: address ?? '',
        poolId: order.poolId,
        positionId,
        executionFeeToken: poolInfo.quoteToken,
        direction: order.direction,
        tpPrice: '0',
        tpSize: '0',
        slPrice: '0',
        slSize: '0',
        tpTriggerType: TriggerType.NONE,
        slTriggerType: TriggerType.NONE,
        leverage,
        slippagePct: ethers.parseUnits((tpSlSlippage ?? 0).toString(), 4).toString(),
      }

      if (isTpOrder) {
        createData.tpPrice = ethers.parseUnits(tpPrice.toString(), 30).toString()
        createData.tpSize = ethers.parseUnits(tpSize.toString(), poolInfo.baseDecimals).toString()
        createData.tpTriggerType = nextTriggerType
      } else {
        createData.slPrice = ethers.parseUnits(tpPrice.toString(), 30).toString()
        createData.slSize = ethers.parseUnits(tpSize.toString(), poolInfo.baseDecimals).toString()
        createData.slTriggerType = nextTriggerType
      }

      if (tradeMode === TradeMode.Seamless && isSeamlessAuthorized) {
        const seamlessAccount = seamlessAccountList.find(
          (item: SeamlessAccount) => item.masterAddress === activeSeamlessAddress,
        )

        if (!seamlessAccount) {
          return { code: -1, message: 'Missing seamless account' }
        }

        const depositData = {
          amount: '0',
          token: pool?.quoteToken as string,
        }

        const orderData = {
          user: createData.address,
          poolId: createData.poolId,
          orderType: OrderType.STOP,
          triggerType: isTpOrder ? createData.tpTriggerType : createData.slTriggerType,
          operation: OperationType.DECREASE,
          direction: createData.direction,
          collateralAmount: '0',
          size: isTpOrder ? createData.tpSize : createData.slSize,
          price: isTpOrder ? createData.tpPrice : createData.slPrice,
          timeInForce: TimeInForce.IOC,
          postOnly: false,
          slippagePct: '0',
          leverage: 0,
          tpSize: '0',
          tpPrice: '0',
          slSize: '0',
          slPrice: '0',
          broker: getMyxBrokerAddressByChainId(createData.chainId),
        }

        return await forwardSeamlessTransaction({
          chainId: createData.chainId,
          masterAddress: activeSeamlessAddress,
          seamlessAddress: seamlessAccount.seamlessAddress,
          forwardFeeToken: pool?.quoteToken as string,
          functionName: order.positionTokenId ? 'placeOrderWithPosition' : 'placeOrderWithSalt',
          orderParams: [currentPositionId, depositData, orderData],
        })
      }

      return await client?.order.createPositionTpSlOrder(createData)
    }

    if (isSingle || activeTab === TpSlTabTypeEnum.TPOrSL) {
      if (order.orderType === OrderType.STOP) {
        data.price = ethers.parseUnits(tpPrice.toString(), 30).toString()
        data.size = ethers.parseUnits(tpSize.toString(), poolInfo.baseDecimals).toString()
      } else if (order.direction === Direction.LONG) {
        if (parseBigNumber(tpPrice).gt(parseBigNumber(order.price))) {
          data.tpPrice = ethers.parseUnits(tpPrice.toString(), 30).toString()
          data.tpSize = ethers.parseUnits(tpSize.toString(), poolInfo.baseDecimals).toString()
        } else {
          data.slPrice = ethers.parseUnits(tpPrice.toString(), 30).toString()
          data.slSize = ethers.parseUnits(tpSize.toString(), poolInfo.baseDecimals).toString()
        }
      } else {
        if (parseBigNumber(tpPrice).gt(parseBigNumber(order.price))) {
          data.slPrice = ethers.parseUnits(tpPrice, 30).toString()
          data.slSize = ethers.parseUnits(tpSize, poolInfo.baseDecimals).toString()
        } else {
          data.tpPrice = ethers.parseUnits(tpPrice, 30).toString()
          data.tpSize = ethers.parseUnits(tpSize, poolInfo.baseDecimals).toString()
        }
      }
    } else {
      if (!parseBigNumber(tpPrice).eq(0) && !parseBigNumber(tpSize).eq(0)) {
        data.tpPrice = ethers.parseUnits(tpPrice, 30).toString()
        data.tpSize = ethers.parseUnits(tpSize, poolInfo.baseDecimals).toString()

        const tpVerify = verifyTpSlPrice(
          ethers.parseUnits(verifyReferencePrice, 30).toString(),
          data.tpPrice,
          order.direction,
          'tp',
          isSingle ? 'current' : 'entry',
        )

        if (!tpVerify) {
          return
        }
      }

      if (!parseBigNumber(slPrice).eq(0) && !parseBigNumber(slSize).eq(0)) {
        data.slPrice = ethers.parseUnits(slPrice, 30).toString()
        data.slSize = ethers.parseUnits(slSize, poolInfo.baseDecimals).toString()

        const slVerify = verifyTpSlPrice(
          ethers.parseUnits(verifyReferencePrice, 30).toString(),
          data.slPrice,
          order.direction,
          'sl',
          isSingle ? 'current' : 'entry',
        )
        if (!slVerify) {
          return
        }
      }
    }

    try {
      setLoading(true)

      if (tradeMode === TradeMode.Seamless && isSeamlessAuthorized) {
        const seamlessAccount = seamlessAccountList.find(
          (item: SeamlessAccount) => item.masterAddress === activeSeamlessAddress,
        )

        if (!seamlessAccount) {
          return
        }

        if (shouldRecreateStopOrder) {
          const cancelRs = await forwardSeamlessTransaction({
            chainId: order.chainId as number,
            masterAddress: activeSeamlessAddress,
            seamlessAddress: seamlessAccount.seamlessAddress,
            forwardFeeToken: pool?.quoteToken as string,
            functionName: 'cancelOrder',
            orderParams: [order.orderId],
          })

          if (cancelRs?.code !== 0) {
            showErrorToast(client?.utils.formatErrorMessage(cancelRs))
            setLoading(false)
            return
          }

          const recreateRs = await recreateStopOrder()

          if (recreateRs?.code === 0) {
            const _parts = buildTpSlToastParts({
              direction: order.direction,
              size: order.size,
              baseSymbol: poolInfo?.baseSymbol ?? order.baseSymbol,
              quoteSymbol: poolInfo?.quoteSymbol ?? order.quoteSymbol,
            })
            toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
            reset()
            setOpen(false)
          } else {
            showErrorToast(client?.utils.formatErrorMessage(recreateRs))
          }

          setLoading(false)
          return
        }

        const networkFee = await client?.utils.getNetworkFee(
          pool?.marketId as string,
          order.chainId as number,
        )
        const depositData = {
          amount: networkFee,
          token: pool?.quoteToken as string,
        }

        const rs = await forwardSeamlessTransaction({
          chainId: order.chainId as number,
          masterAddress: activeSeamlessAddress,
          seamlessAddress: seamlessAccount.seamlessAddress,
          forwardFeeToken: pool?.quoteToken as string,
          functionName: 'updateOrder',
          orderParams: [
            depositData,
            {
              orderId: order.orderId,
              size: data.size,
              price: data.price,
              broker: getMyxBrokerAddressByChainId(order.chainId as number),
              tpsl: {
                tpSize: order.orderType === OrderType.STOP ? data.tpPrice : '0',
                tpPrice: order.orderType === OrderType.STOP ? data.tpPrice : '0',
                slSize: order.orderType === OrderType.STOP ? data.slPrice : '0',
                slPrice: order.orderType === OrderType.STOP ? data.slPrice : '0',
              },
            },
          ],
        })

        if (rs?.code === 0) {
          const _parts = buildTpSlToastParts({
            direction: order.direction,
            size: order.size,
            baseSymbol: poolInfo?.baseSymbol ?? order.baseSymbol,
            quoteSymbol: poolInfo?.quoteSymbol ?? order.quoteSymbol,
          })
          toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
          reset()
          setOpen(false)
        } else {
          showErrorToast(client?.utils.formatErrorMessage(rs))
        }

        setLoading(false)
        return
      }

      if (shouldRecreateStopOrder) {
        const cancelRs = await client?.order.cancelOrder(order.orderId.toString(), order.chainId)

        if (cancelRs?.code !== 0) {
          showErrorToast(client?.utils.formatErrorMessage(cancelRs))
          setLoading(false)
          return
        }

        const recreateRs = await recreateStopOrder()

        if (recreateRs?.code === 0) {
          const _parts = buildTpSlToastParts({
            direction: order.direction,
            size: order.size,
            baseSymbol: poolInfo?.baseSymbol ?? order.baseSymbol,
            quoteSymbol: poolInfo?.quoteSymbol ?? order.quoteSymbol,
          })
          toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
          reset()
          setOpen(false)
        } else {
          showErrorToast(client?.utils.formatErrorMessage(recreateRs))
        }

        setLoading(false)
        return
      }

      const rs = await client?.order.updateOrderTpSl(
        data,
        poolInfo?.quoteToken,
        order.chainId as number,
        address ?? '',
        order.marketId as string,
        order.orderType === OrderType.STOP,
      )

      if (rs?.code === 0) {
        const _parts = buildTpSlToastParts({
          direction: order.direction,
          size: order.size,
          baseSymbol: poolInfo?.baseSymbol ?? order.baseSymbol,
          quoteSymbol: poolInfo?.quoteSymbol ?? order.quoteSymbol,
        })
        toast.success({ title: _parts.title, content: renderOrderToastContent(_parts) })
        reset()
        setOpen(false)
      } else {
        showErrorToast(client?.utils.formatErrorMessage(rs))
      }
    } catch (error) {
      showErrorToast(error)
    } finally {
      setLoading(false)
    }
  }, [
    tpPrice,
    slPrice,
    tpSize,
    slSize,
    client,
    setOpen,
    activeTab,
    order,
    address,
    poolInfo,
    tradeMode,
    isSeamlessAuthorized,
    seamlessAccountList,
    activeSeamlessAddress,
    forwardSeamlessTransaction,
    pool?.marketId,
    pool?.quoteToken,
    reset,
    comparePrice,
    isSingle,
    marketPrice,
  ])

  return (
    <>
      {isEdit ? (
        <InfoButton
          className={`h-[30px] w-[44px] ${className || ''}`}
          onClick={() => setOpen(true)}
        >
          {btnText ? btnText : <EditIcon size={12} />}
        </InfoButton>
      ) : (
        <InfoButton
          className={className || ''}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 500,
            lineHeight: 1,
          }}
          onClick={() => setOpen(true)}
        >
          <Trans>Add TP/SL</Trans>
        </InfoButton>
      )}
      <DialogBase
        title={t`Edit TP/SL`}
        open={open}
        onClose={() => {
          setOpen(false)
        }}
        sx={{
          '& .MuiDialog-paper': {
            width: '390px',
            padding: '0',
            paddingTop: '24px',
            paddingBottom: '24px',
          },
          '& .MuiDialogTitle-root': {
            marginLeft: '20px',
            marginRight: '20px',
          },
        }}
      >
        <div className="px-[20px]">
          <div
            className={`flex items-center gap-[4px] text-[16px] leading-[16px] ${order.direction === Direction.LONG ? 'text-[#00E3A5]' : 'text-[#EC605A]'}`}
          >
            <p>
              {order?.baseSymbol}/{order?.quoteSymbol}
            </p>
            <p>{order.userLeverage}x</p>
          </div>
          {/* price */}
          <PriceInfo
            currentPrice={formatNumber(marketPrice, { showUnit: false })}
            entryPrice={formatNumber(order.positionEntryPrice ?? order.price, { showUnit: false })}
          />
          {/* tpsl type */}
          <TpslFormGroup order={order} type={'tp'} currentPrice={marketPrice} />
          {!isSingle && activeTab === TpSlTabTypeEnum.TPAndSL && (
            <TpslFormGroup order={order} type={'sl'} currentPrice={marketPrice} />
          )}
          {/* <TpslSlippage /> */}
          <div className="sticky bottom-0 flex items-center justify-between gap-[12px] bg-[#18191F] pt-[20px]">
            <InfoButton
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '14px',
                lineHeight: 1,
              }}
              onClick={() => setOpen(false)}
            >
              <Trans>取消</Trans>
            </InfoButton>
            <PrimaryButton
              loading={loading}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '14px',
                lineHeight: 1,
              }}
              onClick={async () => await handleConfirm()}
            >
              <Trans>确定</Trans>
            </PrimaryButton>
          </div>
        </div>
      </DialogBase>
    </>
  )
}
