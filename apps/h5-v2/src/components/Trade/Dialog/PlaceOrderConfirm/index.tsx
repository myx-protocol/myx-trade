import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import { TPSLOrderConfirm } from './TPSLOrderConfirm'
import IconEdit from '@/components/Icon/set/EditSimply'
import { DialogConfirmFooter } from '../components/DialogConfirmFooter'

export const PlaceOrderConfirmDialog = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => {
  return (
    <DialogTheme open={open} onClose={onClose}>
      <DialogTitleTheme onClose={onClose} className="pb-[20px]!">
        <div className="leading-[1]">
          <p className="text-[20px] leading-[1] font-bold text-[white]">
            <Trans>市价买入/开多</Trans>
          </p>
          <p className="text-rise mt-[6px] text-[14px] font-bold">
            <span>MYXUSDT</span>
            <span className="ml-[4px]">15x</span>
          </p>
        </div>
      </DialogTitleTheme>
      <div className="px-[20px] pb-[24px]">
        {/* order info  */}
        <div className="rounded-[12px] bg-[#202129] px-[12px] py-[20px] text-[14px] leading-[1] font-medium text-[#CED1D9]">
          {/* top */}
          <div className="flex flex-col gap-[16px] border-b-[1px] border-[#31333D] pb-[20px]">
            <FlexRowLayout
              left={<Trans>委托价格</Trans>}
              right={
                <p className="font-bold text-white">
                  {formatNumber(2000, {
                    showUnit: false,
                  })}
                </p>
              }
            />
            <FlexRowLayout
              left={<Trans>委托数量</Trans>}
              right={
                <p className="font-bold text-white">
                  {formatNumber(2000, {
                    showUnit: false,
                  })}
                </p>
              }
            />
          </div>
          {/* bottom */}
          <div className="pt-[20px]">
            {/* title */}
            <FlexRowLayout
              left={<Trans>保证金</Trans>}
              right={
                <p className="font-bold text-white">
                  {formatNumber(2000, {
                    showUnit: false,
                  })}
                </p>
              }
            />
            {/* value */}
            <FlexRowLayout
              className="mt-[16px] text-[12px] font-normal text-[#9397A3]"
              left={<Trans>从钱包</Trans>}
              right={
                <p className="font-semibold text-white">
                  {formatNumber(2000, {
                    showUnit: false,
                  })}
                </p>
              }
            />
            {/* value */}
            <FlexRowLayout
              className="mt-[10px] text-[12px] font-normal text-[#9397A3]"
              left={<Trans>从保证金账户</Trans>}
              right={
                <p className="font-semibold text-white">
                  {formatNumber(2000, {
                    showUnit: false,
                  })}
                </p>
              }
            />
          </div>
        </div>
        {/* tpsl */}
        <TPSLOrderConfirm />
        {/* slippage */}
        <div className="mt-[20px] text-[12px] font-normal text-[#848E9C]">
          <FlexRowLayout
            left={<Trans>滑点</Trans>}
            right={
              <div className="flex items-center gap-[4px]">
                <p className="font-medium text-white">0.1%</p>
                <span className="flex">
                  <IconEdit size={12} color="#fff" />
                </span>
              </div>
            }
          />
        </div>
        <div className="mt-[20px]">
          <DialogConfirmFooter onConfirm={() => {}} showDontShowAgain />
        </div>
      </div>
    </DialogTheme>
  )
}
