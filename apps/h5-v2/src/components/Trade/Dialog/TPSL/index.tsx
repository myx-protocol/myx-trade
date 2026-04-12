import { DialogBase } from '@/components/UI/DialogBase'
import { Tab, Tabs } from '@/components/UI/Tabs'
import { t } from '@lingui/core/macro'
import { TpSlTabTypeEnum } from './types'
import { useCallback, useState } from 'react'
import { PriceInfo } from './components/PriceInfo'
import { TpslFormGroup } from './components/TpslFormGroup'
import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { formatNumber } from '@/utils/number'
import { useMarketStore } from '../../store/MarketStore'
import { usePositionTPSLStore } from './store'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { parseBigNumber } from '@/utils/bn'
import { ethers } from 'ethers'
import { Direction, OperationType, OrderType, TimeInForce, TriggerType } from '@myx-trade/sdk'
import { toast } from '@/components/UI/Toast'
import { verifyTpSlPrice } from '@/utils/verify'
import { useGetLiqPrice } from '@/hooks/calculate/use-get-liq-price'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import useSWR from 'swr'
import { showErrorToast } from '@/config/error'
import PlusIcon from '@/components/Icon/set/PlusIcon'
import { getSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { useGetAllQuoteTokenAuthStatus } from '@/hooks/seamless/use-get-seamless-auth-status'
import { useForwardSeamlessTransaction } from '@/hooks/seamless/use-forward-seamless-transaction'
import useGlobalStore from '@/store/globalStore'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { TradeMode } from '@/pages/Trade/types'
import type { SeamlessAccount } from '@/store/seamless/initialState'
import { getMyxBrokerAddressByChainId } from '@/config/brokerAddress'

export const RenderLiqPrice = ({
  position,
  marketPrice,
}: {
  position: any
  marketPrice: string
}) => {
  const { getLiqPrice } = useGetLiqPrice({ poolId: position.poolId, chainId: position.chainId })
  const { poolConfig } = useGetPoolConfig(position.poolId, position.chainId)

  const assetClass = poolConfig?.levelConfig?.assetClass ?? 0
  const { data: liqPrice } = useSWR(
    `getLiqPrice-${position.positionId}`,
    async () => {
      const rs = await getLiqPrice({
        entryPrice: position.entryPrice,
        collateralAmount: position.collateralAmount,

        size: position.size,
        price: marketPrice,
        assetClass: assetClass,
        fundingRateIndexEntry: position.fundingRateIndex,
        direction: position.direction,
        maintainMarginRate: poolConfig?.levelConfig?.maintainCollateralRate.toString() ?? '0',
      })

      return rs
    },
    {
      refreshInterval: 10000,
    },
  )
  return (
    <p className="text-[12px] text-[#F29D39]">
      {parseBigNumber(liqPrice ?? '0').eq(0)
        ? '--'
        : formatNumber(liqPrice ?? '0', { showUnit: false })}
    </p>
  )
}

export const TpSlButton = ({
  position,
  poolInfo,
  isAdd = false,
  addText,
  style,
  className,
  isPrimary,
}: {
  position: any
  poolInfo: any
  isAdd?: boolean
  addText?: string
  style?: Record<string, any>
  className?: string
  isPrimary?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const { address } = useWalletConnection()
  const { activeTab, setActiveTab, tpPrice, slPrice, tpSize, slSize, reset } =
    usePositionTPSLStore()
  const { tickerData } = useMarketStore()
  const marketPrice = tickerData[position.poolId]?.price ?? 0
  const { client } = useMyxSdkClient(position.chainId)
  const [loading, setLoading] = useState(false)
  const { tradeMode } = useGlobalStore()
  const { seamlessAccountList, activeSeamlessAddress } = useSeamlessStore()
  const { forwardSeamlessTransaction } = useForwardSeamlessTransaction(position.chainId)
  const { quoteTokenAuthStatus } = useGetAllQuoteTokenAuthStatus()
  const isSeamlessAuthorized = quoteTokenAuthStatus.find(
    (item: any) => item.quoteToken === poolInfo?.quoteToken,
  )?.auth

  const tpSlSlippage = getSlippage({
    chainId: position?.chainId ?? 0,
    poolId: position?.poolId ?? '',
    type: SlippageTypeEnum.TPSL,
  })
  const comparePrice = parseBigNumber(marketPrice.toString()).gt(0)
    ? marketPrice.toString()
    : position.entryPrice

  const handleConfirm = useCallback(async () => {
    let positionId = ''
    if (position.tokenId) {
      positionId = position.positionId
    }

    const data: any = {
      chainId: position.chainId,
      address,
      poolId: position.poolId,
      positionId,
      executionFeeToken: poolInfo.quoteToken,
      direction: position.direction,
      tpPrice: '0',
      tpSize: '0',
      slPrice: '0',
      slSize: '0',
      tpTriggerType: TriggerType.NONE,
      slTriggerType: TriggerType.NONE,
      leverage: position.userLeverage,
      slippagePct: ethers.parseUnits((tpSlSlippage ?? 0).toString(), 4).toString(),
    }

    if (activeTab === TpSlTabTypeEnum.TPOrSL) {
      if (position.direction === Direction.LONG) {
        if (parseBigNumber(tpPrice).gt(parseBigNumber(comparePrice))) {
          data.tpPrice = ethers.parseUnits(tpPrice.toString(), 30).toString()
          data.tpSize = ethers.parseUnits(tpSize.toString(), poolInfo.baseDecimals).toString()
          data.tpTriggerType = TriggerType.GTE
        } else {
          data.slPrice = ethers.parseUnits(tpPrice.toString(), 30).toString()
          data.slSize = ethers.parseUnits(tpSize.toString(), poolInfo.baseDecimals).toString()
          data.slTriggerType = TriggerType.LTE
        }
      } else {
        if (parseBigNumber(tpPrice).gt(parseBigNumber(comparePrice))) {
          data.slPrice = ethers.parseUnits(tpPrice, 30).toString()
          data.slSize = ethers.parseUnits(tpSize, poolInfo.baseDecimals).toString()
          data.slTriggerType = TriggerType.GTE
        } else {
          data.tpPrice = ethers.parseUnits(tpPrice, 30).toString()
          data.tpSize = ethers.parseUnits(tpSize, poolInfo.baseDecimals).toString()
          data.tpTriggerType = TriggerType.LTE
        }
      }
    } else {
      if (!parseBigNumber(tpPrice).eq(0) && !parseBigNumber(tpSize).eq(0)) {
        data.tpPrice = ethers.parseUnits(tpPrice, 30).toString()
        data.tpSize = ethers.parseUnits(tpSize, poolInfo.baseDecimals).toString()
        data.tpTriggerType =
          position.direction === Direction.LONG ? TriggerType.GTE : TriggerType.LTE
        const tpVerify = verifyTpSlPrice(
          ethers.parseUnits(comparePrice, 30).toString(),
          data.tpPrice,
          position.direction,
          'tp',
          'current',
        )
        if (!tpVerify) {
          return
        }
      }

      if (!parseBigNumber(slPrice).eq(0) && !parseBigNumber(slSize).eq(0)) {
        data.slPrice = ethers.parseUnits(slPrice, 30).toString()
        data.slSize = ethers.parseUnits(slSize, poolInfo.baseDecimals).toString()
        data.slTriggerType =
          position.direction === Direction.LONG ? TriggerType.LTE : TriggerType.GTE
        const slVerify = verifyTpSlPrice(
          ethers.parseUnits(comparePrice, 30).toString(),
          data.slPrice,
          position.direction,
          'sl',
          'current',
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

        const depositData = {
          amount: '0',
          token: poolInfo.quoteToken,
        }

        if (data.tpSize !== '0' && data.slSize !== '0') {
          const orderData = [
            {
              user: data.address,
              poolId: data.poolId,
              orderType: OrderType.STOP,
              triggerType: data.tpTriggerType,
              operation: OperationType.DECREASE,
              direction: data.direction,
              collateralAmount: '0',
              size: data.tpSize ?? '0',
              price: data.tpPrice ?? '0',
              timeInForce: TimeInForce.IOC,
              postOnly: false,
              slippagePct: data.slippagePct ?? '0',
              leverage: data.leverage,
              tpSize: '0',
              tpPrice: '0',
              slSize: '0',
              slPrice: '0',
              broker: getMyxBrokerAddressByChainId(data.chainId),
            },
            {
              user: data.address,
              poolId: data.poolId,
              orderType: OrderType.STOP,
              triggerType: data.slTriggerType,
              operation: OperationType.DECREASE,
              direction: data.direction,
              collateralAmount: '0',
              size: data.slSize ?? '0',
              price: data.slPrice ?? '0',
              timeInForce: TimeInForce.IOC,
              postOnly: false,
              slippagePct: data.slippagePct ?? '0',
              leverage: data.leverage,
              tpSize: '0',
              tpPrice: '0',
              slSize: '0',
              slPrice: '0',
              broker: getMyxBrokerAddressByChainId(data.chainId),
            },
          ]

          const currentPositionId = position.tokenId ? position.positionId : '1'

          const rs = await forwardSeamlessTransaction({
            chainId: data.chainId,
            masterAddress: activeSeamlessAddress,
            seamlessAddress: seamlessAccount.seamlessAddress,
            forwardFeeToken: poolInfo.quoteToken,
            functionName: position.tokenId ? 'placeOrdersWithPosition' : 'placeOrdersWithSalt',
            orderParams: [depositData, [currentPositionId, currentPositionId], orderData],
          })

          if (rs?.code === 0) {
            toast.success({ title: t`Submit tp/sl order success` })
            reset()
            setOpen(false)
          } else {
            showErrorToast(client?.utils.formatErrorMessage(rs))
          }

          setLoading(false)
          return
        }

        const orderData = {
          user: data.address,
          poolId: data.poolId,
          orderType: OrderType.STOP,
          triggerType: data.tpSize !== '0' ? data.tpTriggerType : data.slTriggerType,
          operation: OperationType.DECREASE,
          direction: data.direction,
          collateralAmount: '0',
          size: data.tpSize !== '0' ? (data.tpSize ?? '0') : (data.slSize ?? '0'),
          price: data.tpPrice !== '0' ? (data.tpPrice ?? '0') : (data.slPrice ?? '0'),
          timeInForce: TimeInForce.IOC,
          postOnly: false,
          slippagePct: data.slippagePct ?? '0',
          leverage: 0,
          tpSize: '0',
          tpPrice: '0',
          slSize: '0',
          slPrice: '0',
          broker: getMyxBrokerAddressByChainId(data.chainId),
        }

        const rs = await forwardSeamlessTransaction({
          chainId: data.chainId,
          masterAddress: activeSeamlessAddress,
          seamlessAddress: seamlessAccount.seamlessAddress,
          forwardFeeToken: poolInfo.quoteToken,
          functionName: position.tokenId ? 'placeOrderWithPosition' : 'placeOrderWithSalt',
          orderParams: ['1', depositData, orderData],
        })

        if (rs?.code === 0) {
          toast.success({ title: t`Submit tp/sl order success` })
          reset()
          setOpen(false)
        } else {
          showErrorToast(client?.utils.formatErrorMessage(rs))
        }

        setLoading(false)
        return
      }

      const rs = await client?.order.createPositionTpSlOrder(data)

      if (rs?.code === 0) {
        toast.success({ title: t`Submit tp/sl order success` })
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
    position,
    address,
    poolInfo,
    comparePrice,
  ])

  return (
    <>
      {isAdd ? (
        <>
          {isPrimary ? (
            <PrimaryButton
              onClick={() => setOpen(true)}
              style={style || {}}
              className={className || ''}
            >
              {addText ? addText : <PlusIcon size={16} />}
            </PrimaryButton>
          ) : (
            <InfoButton className={className || ''} onClick={() => setOpen(true)}>
              <PlusIcon size={16} />
            </InfoButton>
          )}
        </>
      ) : (
        <InfoButton
          onClick={() => setOpen(true)}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 500,
            ...(style || {}),
          }}
          className={className || ''}
        >
          <Trans>TP/SL</Trans>
        </InfoButton>
      )}
      <DialogBase
        title={`止盈止损`}
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
          // '& .MuiDialogTitle-root': {
          //   marginLeft: '20px',
          //   marginRight: '20px',
          // },
        }}
      >
        <div>
          {/* tabs */}
          <div className="mt-[6px]">
            <Tabs
              value={activeTab}
              onChange={(_, value) => {
                setActiveTab(value as TpSlTabTypeEnum)
              }}
              sx={{
                borderBottom: '1px solid #31333D',
              }}
            >
              <Tab value={TpSlTabTypeEnum.TPOrSL} label={t`TP/SL`}></Tab>
              <Tab value={TpSlTabTypeEnum.TPAndSL} label={t`TP&SL`}></Tab>
            </Tabs>
          </div>

          {/* price */}
          <PriceInfo
            currentPrice={formatNumber(marketPrice, { showUnit: false })}
            forceTpPrice={
              parseBigNumber(position.earlyClosePrice).eq(0)
                ? '--'
                : formatNumber(position.earlyClosePrice, { showUnit: false })
            }
            entryPrice={formatNumber(position.entryPrice, { showUnit: false })}
            estimatedForceSlPrice={
              <RenderLiqPrice position={position} marketPrice={marketPrice.toString()} />
            }
          />
          {/* tpsl type */}
          <TpslFormGroup position={position} autoFocus type={'tp'} currentPrice={marketPrice} />
          {activeTab === TpSlTabTypeEnum.TPAndSL && (
            <TpslFormGroup position={position} type={'sl'} currentPrice={marketPrice} />
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
