import { Trans } from '@lingui/react/macro'

import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { DialogBase } from '@/components/UI/DialogBase'
import { useState, useMemo } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { Direction, OrderType, TimeInForce, TriggerType } from '@myx-trade/sdk'
import { ethers } from 'ethers'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { t } from '@lingui/core/macro'
import { parseBigNumber } from '@/utils/bn'
import { formatNumber } from '@/utils/number'
import { getSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { useCheckUserVipInfo } from '@/hooks/use-check-user-vip-info'
import { toast } from '@/components/UI/Toast'

export const MarketClosePositionButton = ({
  position,
  marketPrice,
  symbolInfo,
}: {
  position: any
  marketPrice: string
  symbolInfo: any
}) => {
  const { client } = useMyxSdkClient()
  const [loading, setLoading] = useState(false)
  const [marketCloseDialogOpen, setMarketCloseDialogOpen] = useState(false)
  const { checkUserVipInfo } = useCheckUserVipInfo(position.chainId)
  const closePositionSlippage = getSlippage({
    chainId: position?.chainId ?? 0,
    poolId: position?.poolId ?? '',
    type: SlippageTypeEnum.CLOSE,
  })
  const { address } = useWalletConnection()
  const closeAmount =
    formatNumber(parseBigNumber(position.size).mul(parseBigNumber(marketPrice)).toString() ?? '0', {
      showUnit: false,
    }) ?? '0'
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
          console.log('position-->', position)
        }}
      >
        <Trans>Market Close</Trans>
      </InfoButton>

      <DialogBase
        title={position.direction === Direction.LONG ? t`Close Long` : t`Close Short`}
        open={marketCloseDialogOpen}
        onClose={() => setMarketCloseDialogOpen(false)}
      >
        <div className="mt-[10px] flex items-center gap-[4px] text-[16px] leading-[16px] text-[#EC605A]">
          <p>
            {position?.baseSymbol}/{position?.quoteSymbol}
          </p>
          <p>{position.userLeverage}x</p>
        </div>
        <div className="mt-[20px] flex items-center justify-between">
          <p className="text-[16px] leading-[16px] text-[#848E9C]">
            <Trans>Closeable Amount</Trans>
          </p>
          <p className="text-[16px] leading-[16px] text-[white]">{closeAmount}</p>
        </div>
        <div className="mt-[12px] flex items-center justify-between">
          <p className="text-[16px] leading-[16px] text-[#848E9C]">
            <Trans>Current Price</Trans>
          </p>
          <p className="text-[16px] leading-[16px] text-[white]">
            ${formatNumber(marketPrice, { showUnit: false })}
          </p>
        </div>
        <div className="mt-[12px] flex items-center justify-between">
          <p className="text-[16px] leading-[16px] text-[#848E9C]">
            <Trans>Price</Trans>
          </p>
          <p className="text-[16px] leading-[16px] text-[white]">
            <Trans>Market</Trans>
          </p>
        </div>
        <div className="mt-[12px] flex items-center justify-between">
          <p className="text-[16px] leading-[16px] text-[#848E9C]">
            <Trans>Est. Slippage</Trans>
          </p>
          <p className="text-[16px] leading-[16px] text-[white]">
            {closePositionSlippage ? closePositionSlippage * 100 : '--'}%
          </p>
        </div>
        <div className="mt-[12px] flex items-center justify-between">
          <p className="text-[16px] leading-[16px] text-[#848E9C]">
            <Trans>Est. Pnl</Trans>
          </p>
          <p
            className="text-[16px] leading-[16px]"
            style={{ color: pnl.toNumber() > 0 ? '#00E3A5' : '#EC605A' }}
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
                const rs = await client?.order.createDecreaseOrder({
                  chainId: position.chainId,
                  address: address as `0x${string}`,
                  poolId: position.poolId,
                  positionId: position.positionId,
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
                    .parseUnits(closePositionSlippage?.toString() ?? '0', 4)
                    .toString(), // 转换为精度4位
                  executionFeeToken: symbolInfo?.quoteToken as string,
                  leverage: position.userLeverage,
                })
                if (rs?.code === 0) {
                  toast.success({ title: t`Market close success` })
                  setMarketCloseDialogOpen(false)
                } else {
                  toast.error({ title: t`${client?.utils.formatErrorMessage(rs)}` })
                }
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
