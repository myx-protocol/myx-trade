import { usePositionStore } from '@/store/position/createStore'
import { Trans } from '@lingui/react/macro'
import { InfoIcon } from '@/components/UI/Icon'
import { PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useState } from 'react'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import {
  COMMON_PRICE_DECIMALS,
  Direction,
  OrderType,
  TimeInForce,
  TriggerType,
} from '@myx-trade/sdk'
import { getSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { ethers } from 'ethers'
import { useGetPoolList } from '@/components/Trade/hooks/use-get-pool-list'
import { useGetTradingFee } from '@/hooks/calculate/use-get-trading-fee'
import { parseBigNumber } from '@/utils/bn'

export const CloseAllPositionDialog = () => {
  const { getTradingFee } = useGetTradingFee()
  const { closeAllPositionDialogOpen, setCloseAllPositionDialogOpen, selectChainId } =
    usePositionStore()
  const { client } = useMyxSdkClient(Number(selectChainId))
  const [loading, setLoading] = useState(false)
  const { symbolInfo } = useTradePageStore()
  const { address } = useWalletConnection()
  const { tickerData } = useMarketStore()
  const positions = useGetPositionList(true)
  const { poolList } = useGetPoolList()

  return (
    <DialogBase
      open={closeAllPositionDialogOpen}
      onClose={() => setCloseAllPositionDialogOpen(false)}
    >
      <InfoIcon width={56} height={56} className="mx-auto mt-[40px]" />
      <p className="mt-[20px] text-center text-[16px] leading-[16px] text-[white]">
        <Trans>Please confirm whether to</Trans>
      </p>
      <p className="mt-[5px] text-center text-[16px] leading-[16px] text-[#F29D39]">
        <Trans>close all positions at market price?</Trans>
      </p>
      <div className="left-0 mt-[40px] flex w-full justify-center px-[20px]">
        <PrimaryButton
          onClick={async () => {
            console.log('positions-->', positions)

            if (positions.length === 0) {
              toast.error({ title: t`No positions` })
              return
            }

            try {
              const tradingFeeList = await Promise.all(
                positions.map(async (position: any) => {
                  const pool = poolList.find(
                    (poolItem: any) => position.poolId === poolItem?.poolId,
                  )

                  const marketPrice = tickerData[position.poolId]?.price.toString() ?? '0'
                  const fee = await getTradingFee({
                    size: position.size,
                    price: marketPrice,
                    assetClass: pool?.assetClass ?? 0,
                  })

                  return parseBigNumber(fee)
                    .mul(10 ** (pool?.quoteDecimals ?? 6))
                    .toString()
                }),
              )

              const totalTradingFee = tradingFeeList.reduce((acc: string, fee: string) => {
                return parseBigNumber(acc).plus(parseBigNumber(fee)).toString()
              }, '0')

              const formattedTradingFee = parseBigNumber(totalTradingFee).toFixed(0)

              setLoading(true)
              const data = positions.map((position: any) => {
                const pool = poolList.find((poolItem: any) => position.poolId === poolItem?.poolId)

                const marketPrice = tickerData[position.poolId]?.price.toString() ?? '0'
                const closePositionSlippage = getSlippage({
                  chainId: position?.chainId ?? 0,
                  poolId: position?.poolId ?? '',
                  type: SlippageTypeEnum.CLOSE,
                })

                return {
                  chainId: position.chainId as number,
                  address: address as `0x${string}`,
                  poolId: position?.poolId as string,
                  positionId: position?.positionId as string,
                  orderType: OrderType.MARKET,
                  triggerType: TriggerType.NONE,
                  direction: position.direction as Direction,
                  collateralAmount: '0',
                  size: ethers.parseUnits(position.size.toString(), pool?.baseDecimals).toString(),
                  price: ethers.parseUnits(marketPrice, COMMON_PRICE_DECIMALS).toString(),
                  timeInForce: TimeInForce.IOC,
                  postOnly: false,
                  slippagePct: ethers
                    .parseUnits((closePositionSlippage ?? 0).toString(), 4)
                    .toString(), // 转换为精度4位
                  executionFeeToken: symbolInfo?.quoteToken as string,
                  leverage: position.userLeverage,
                  tpSize: '0',
                  tpPrice: '0',
                  slSize: '0',
                  slPrice: '0',
                }
              })

              const rs = await client?.order.closeAllPositions(
                Number(selectChainId),
                data,
                formattedTradingFee,
              )

              if (rs?.code === 0) {
                toast.success({ title: t`Close all positions success` })
                setCloseAllPositionDialogOpen(false)
              } else {
                toast.error({ title: t`Close all positions failed`, content: rs?.message })
              }
            } catch (error) {
              console.log(error)
            } finally {
              setLoading(false)
            }
          }}
          className="w-full"
          loading={loading}
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
  )
}
