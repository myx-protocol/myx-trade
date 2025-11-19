import { Drawer } from '@/components/UI/Drawer'
import { Trans } from '@lingui/react/macro'
import IconArrowRight from '@/assets/svg/arrowRight.svg?react'
import { Switch } from '@/components/UI/Switch'
import { openUrl } from '@/utils'
import { MYX_GIT_BOOK_LINK } from '@/config'
import useGlobalStore from '@/store/globalStore'
import { TradeMode } from '@/pages/Trade/types'

interface SettingDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SettingDrawer = ({ open, onOpenChange }: SettingDrawerProps) => {
  const { tradeMode, setChangeModeDialogOpen } = useGlobalStore()
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => onOpenChange(false)}
      sx={{
        width: '360px',
        borderTopLeftRadius: '16px',
        borderBottomLeftRadius: '16px',
      }}
    >
      <div className="pt-[48px]">
        {/* basic setting */}
        <div className="mb-[8px] text-[14px] font-medium text-[#848E9C]">
          <Trans>基础设置</Trans>
        </div>
        {/* basic setting items */}
        {/* vip tickers */}
        <div className="flex cursor-pointer items-center justify-between py-[16px]">
          <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
            <Trans>VIP Redeem Code</Trans>
          </p>
          <IconArrowRight className="h-[16px] w-[16px]" />
        </div>
        {/* Slippage */}
        <div className="flex cursor-pointer items-center justify-between py-[16px]">
          <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
            <Trans>通用滑点容忍设置</Trans>
          </p>
          <IconArrowRight className="h-[16px] w-[16px]" />
        </div>
        {/* open Position Confirmation */}
        <div className="flex items-center justify-between py-[16px]">
          <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
            <Trans>开仓二次确认</Trans>
          </p>
          <Switch />
        </div>
        {/* close position confirmation */}
        <div className="flex items-center justify-between py-[16px]">
          <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
            <Trans>平仓二次确认</Trans>
          </p>
          <Switch />
        </div>

        {/* split line */}
        <div className="mt-[24px] mb-[40px] h-[1px] w-full bg-[#31333D]"></div>

        {/* trade settings */}
        <div className="mb-[8px] text-[14px] font-medium text-[#848E9C]">
          <Trans>Trading Setting</Trans>
        </div>
        {/* account mode setting*/}
        <div className="flex items-center justify-between py-[16px]">
          <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
            <Trans>Account Mode</Trans>
          </p>
          <p
            className="flex cursor-pointer items-center text-[14px] leading-[14px] font-medium text-[#848E9C]"
            onClick={() => setChangeModeDialogOpen(true)}
          >
            <span>
              {tradeMode === TradeMode.Classic ? <Trans>Classic</Trans> : <Trans>Seamless</Trans>}
            </span>
            <IconArrowRight className="h-[16px] w-[16px]" />
          </p>
        </div>
        {tradeMode === TradeMode.Seamless && (
          <>
            <div className="flex items-center justify-between py-[16px]">
              <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                <Trans>Seamless Trading</Trans>
              </p>
              <div className="flex cursor-pointer items-center text-[14px] leading-[14px] font-medium text-[#848E9C]">
                <div className="flex items-center">
                  <span className="text-[14px] leading-[14px] font-medium text-[#00E3A5]">
                    <Trans>Authorize</Trans>
                  </span>
                  {/* {false && <span className="text-[#848E9C] text-[14px] leading-[14px] font-medium"><Trans>Revoke</Trans></span>} */}
                  <IconArrowRight className="h-[16px] w-[16px]" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-[16px]">
              <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                <Trans>Reset Password</Trans>
              </p>
              <p className="flex cursor-pointer items-center text-[14px] leading-[14px] font-medium text-[#848E9C]">
                <IconArrowRight className="h-[16px] w-[16px]" />
              </p>
            </div>
            <div className="flex items-center justify-between py-[16px]">
              <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                <Trans>Export Seamless Key</Trans>
              </p>
              <p className="flex cursor-pointer items-center text-[14px] leading-[14px] font-medium text-[#848E9C]">
                <IconArrowRight className="h-[16px] w-[16px]" />
              </p>
            </div>
          </>
        )}

        {/* split line */}
        <div className="mt-[24px] mb-[40px] h-[1px] w-full bg-[#31333D]"></div>

        {/* other settings */}
        <div className="mb-[8px] text-[14px] font-medium text-[#848E9C]">
          <Trans>其他</Trans>
        </div>
        {/* transaction history */}
        <div className="flex cursor-pointer items-center justify-between py-[16px]">
          <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
            <Trans>On-Chain Transaction History</Trans>
          </p>
          <IconArrowRight className="h-[16px] w-[16px]" />
        </div>
        {/* gitbook */}
        <div
          className="flex cursor-pointer items-center justify-between py-[16px]"
          onClick={() => openUrl(MYX_GIT_BOOK_LINK)}
        >
          <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
            <Trans>文档</Trans>
          </p>
          <IconArrowRight className="h-[16px] w-[16px]" />
        </div>
        {/* datas */}
        <div className="flex cursor-pointer items-center justify-between py-[16px]">
          <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
            <Trans>数据</Trans>
          </p>
          <IconArrowRight className="h-[16px] w-[16px]" />
        </div>
      </div>
    </Drawer>
  )
}
