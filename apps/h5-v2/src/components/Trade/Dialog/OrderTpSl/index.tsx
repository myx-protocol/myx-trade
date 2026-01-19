import { DialogBase } from '@/components/UI/DialogBase'
import { TpSlTabTypeEnum } from './types'
import { useCallback, useState } from 'react'
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
import { Direction } from '@myx-trade/sdk'
import { toast } from '@/components/UI/Toast'
import { verifyTpSlPrice } from '@/utils/verify'
import { t } from '@lingui/core/macro'

export const OrderTpSlButton = ({ order, poolInfo }: { order: any; poolInfo: any }) => {
  const [open, setOpen] = useState(false)
  const { address } = useWalletConnection()
  const { activeTab, tpPrice, slPrice, tpSize, slSize, reset } = useOrderTPSLStore()
  const { tickerData } = useMarketStore()
  const marketPrice = tickerData[order.poolId]?.price ?? 0
  const { client } = useMyxSdkClient(order.chainId)
  const [loading, setLoading] = useState(false)

  const handleConfirm = useCallback(async () => {
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

    if (activeTab === TpSlTabTypeEnum.TPOrSL) {
      if (order.direction === Direction.LONG) {
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
          ethers.parseUnits(order.price, 30).toString(),
          data.tpPrice,
          order.direction,
          'tp',
        )

        if (!tpVerify) {
          return
        }
      }

      if (!parseBigNumber(slPrice).eq(0) && !parseBigNumber(slSize).eq(0)) {
        data.slPrice = ethers.parseUnits(slPrice, 30).toString()
        data.slSize = ethers.parseUnits(slSize, poolInfo.baseDecimals).toString()

        const slVerify = verifyTpSlPrice(
          ethers.parseUnits(order.price, 30).toString(),
          data.slPrice,
          order.direction,
          'sl',
        )
        if (!slVerify) {
          return
        }
      }
    }

    try {
      setLoading(true)

      const rs = await client?.order.updateOrderTpSl(
        data,
        poolInfo?.quoteToken,
        order.chainId as number,
        address ?? '',
        order.marketId as string,
      )

      if (rs?.code === 0) {
        toast.success({
          title: 'Update order success',
        })
        reset()
        setOpen(false)
      } else {
        toast.error({
          title: t`${client?.utils.formatErrorMessage(rs)}`,
        })
      }
    } catch (error) {
      toast.error({
        title: t`${client?.utils.formatErrorMessage(error)}`,
      })
    } finally {
      setLoading(false)
    }
  }, [tpPrice, slPrice, tpSize, slSize, client, setOpen, activeTab, order, address, poolInfo])

  return (
    <>
      <InfoButton
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: '6px',
          fontWeight: 500,
          lineHeight: 1,
        }}
        onClick={() => setOpen(true)}
      >
        <Trans>Edit</Trans>
      </InfoButton>
      <DialogBase
        title={`Modify Order`}
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
          {/* tabs */}
          {/* <div className="mt-[6px]">
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
          </div> */}

          {/* price */}
          <PriceInfo
            currentPrice={formatNumber(marketPrice, { showUnit: false })}
            entryPrice={formatNumber(order.price, { showUnit: false })}
          />
          {/* tpsl type */}
          <TpslFormGroup order={order} type={'tp'} />
          {activeTab === TpSlTabTypeEnum.TPAndSL && <TpslFormGroup order={order} type={'sl'} />}
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
