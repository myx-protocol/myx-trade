import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import IconWarningOutline from '@/components/Icon/set/WarningOutline'
import { Tooltips } from '@/components/UI/Tooltips'
import { Trans } from '@lingui/react/macro'
import { SlippageInput } from './SlippageInput'
import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { useTradePanelStore } from '../../TradePanel/store'

interface SlippageDialogProps {
  open: boolean
  onClose: () => void
  defaultSlippage: number
}

export const SlippageDialog = ({ open, onClose, defaultSlippage = 0.003 }: SlippageDialogProps) => {
  const {
    openPositionSlippage,
    setOpenPositionSlippage,
    closePositionSlippage,
    setClosePositionSlippage,
    tpSlSlippage,
    setTpSlSlippage,
  } = useTradePanelStore()

  return (
    <DialogTheme open={open} onClose={onClose}>
      <DialogTitleTheme onClose={onClose}>
        <Trans>交易滑点设置</Trans>
      </DialogTitleTheme>
      <div className="flex flex-col gap-[14px] px-[16px] pt-[12px] pb-[24px] text-[12px] leading-[1] font-normal text-[#848E9C]">
        <div className="flex items-center gap-[24px]">
          <div className="flex w-[100px] flex-shrink-0 gap-[2px]">
            <p>
              <Trans>开仓滑点设置</Trans>
            </p>
            <Tooltips title="开仓滑点设置">
              <span className="inline-flex">
                <IconWarningOutline size={12} />
              </span>
            </Tooltips>
          </div>
          <SlippageInput
            defaultValue={defaultSlippage * 100}
            value={openPositionSlippage * 100}
            onChange={(value) => setOpenPositionSlippage(value / 100)}
            maxSlippage={100}
          />
        </div>
        <div className="flex items-center gap-[24px]">
          <div className="flex w-[100px] flex-shrink-0 gap-[2px]">
            <p>
              <Trans>平仓滑点设置</Trans>
            </p>
            <Tooltips title="平仓滑点设置">
              <span className="inline-flex">
                <IconWarningOutline size={12} />
              </span>
            </Tooltips>
          </div>
          <SlippageInput
            defaultValue={defaultSlippage * 100}
            value={closePositionSlippage * 100}
            onChange={(value) => setClosePositionSlippage(value / 100)}
            maxSlippage={100}
          />
        </div>

        <div className="flex items-center gap-[24px]">
          <div className="flex w-[100px] flex-shrink-0 gap-[2px]">
            <p>
              <Trans>止盈止损滑点</Trans>
            </p>
            <Tooltips title="平仓滑点设置">
              <span className="inline-flex">
                <IconWarningOutline size={12} />
              </span>
            </Tooltips>
          </div>
          <SlippageInput
            defaultValue={defaultSlippage * 100}
            value={tpSlSlippage * 100}
            onChange={(value) => setTpSlSlippage(value / 100)}
            maxSlippage={100}
          />
        </div>
        {/* footer */}
        <div className="mt-[28px] flex items-center gap-[12px]">
          <InfoButton
            className="w-full"
            style={{
              borderRadius: '99999px',
              paddingTop: '14.5px',
              paddingBottom: '14.5px',
              lineHeight: 1,
              fontSize: '13px',
              fontWeight: 500,
            }}
            onClick={() => onClose()}
          >
            <Trans>取消</Trans>
          </InfoButton>
          <PrimaryButton
            className="w-full"
            style={{
              borderRadius: '99999px',
              paddingTop: '14.5px',
              paddingBottom: '14.5px',
              lineHeight: 1,
              fontSize: '13px',
              fontWeight: 500,
            }}
            onClick={() => onClose()}
          >
            <Trans>确认</Trans>
          </PrimaryButton>
        </div>
      </div>
    </DialogTheme>
  )
}
