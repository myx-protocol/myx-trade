import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import IconEdit from '@/components/Icon/set/EditSimply'
import { DialogConfirmFooter } from '../components/DialogConfirmFooter'

export const MarketCloseConfirmDialog = ({
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
        {/* order info */}
        <div className="flex flex-col gap-[12px] text-[14px] font-normal text-[#848E9C]">
          <FlexRowLayout
            left={<Trans>可平数量</Trans>}
            right={
              <p className="font-medium text-white">
                {formatNumber(1233.21, {
                  showUnit: false,
                })}
              </p>
            }
          />
          <FlexRowLayout
            left={<Trans>开仓价格</Trans>}
            right={
              <p className="font-medium text-white">
                $
                {formatNumber(1233.21, {
                  showUnit: false,
                })}
              </p>
            }
          />
          <FlexRowLayout
            left={<Trans>委托价格</Trans>}
            right={
              <div className="flex items-center gap-[4px]">
                <p className="font-medium text-white">
                  {formatNumber(1233.21, {
                    showUnit: false,
                  })}
                </p>
              </div>
            }
          />
          <FlexRowLayout
            left={<Trans>预计滑点</Trans>}
            right={
              <div className="flex items-center gap-[4px]">
                <p className="font-medium text-white">0.1%</p>
                <span className="flex">
                  <IconEdit size={12} color="#fff" />
                </span>
              </div>
            }
          />
          <FlexRowLayout
            left={<Trans>预计盈亏</Trans>}
            right={
              <p className="text-rise font-medium text-white">
                {formatNumber(1233.21, {
                  showUnit: false,
                })}
              </p>
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
