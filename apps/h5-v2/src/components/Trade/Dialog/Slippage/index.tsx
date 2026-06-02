import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import IconWarningOutline from '@/components/Icon/set/WarningOutline'
import { Tooltips } from '@/components/UI/Tooltips'
import { Trans } from '@lingui/react/macro'
import { SlippageInput } from './SlippageInput'
import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { useEffect, useState } from 'react'
import { getSlippage, setSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { t } from '@lingui/core/macro'
import useGlobalStore from '@/store/globalStore'

interface SlippageDialogProps {
  open: boolean
  onClose: () => void
  onChange: () => void
  defaultSlippage: number
}

export const SlippageDialog = ({
  open,
  onClose,
  defaultSlippage = 0.003,
  onChange,
}: SlippageDialogProps) => {
  const { symbolInfo } = useGlobalStore()
  const [openSlippageValue, setOpenSlippageValue] = useState<string>('0')
  const [closeSlippageValue, setCloseSlippageValue] = useState<string>('0')
  const [tpSlSlippageValue, setTpSlSlippageValue] = useState<string>('0')

  useEffect(() => {
    const openSlippage =
      getSlippage({
        chainId: symbolInfo?.chainId ?? 0,
        poolId: symbolInfo?.poolId ?? '',
        type: SlippageTypeEnum.OPEN,
      }) ?? defaultSlippage
    const closeSlippage =
      getSlippage({
        chainId: symbolInfo?.chainId ?? 0,
        poolId: symbolInfo?.poolId ?? '',
        type: SlippageTypeEnum.CLOSE,
      }) ?? defaultSlippage

    const tpSlSlippage =
      getSlippage({
        chainId: symbolInfo?.chainId ?? 0,
        poolId: symbolInfo?.poolId ?? '',
        type: SlippageTypeEnum.TPSL,
      }) ?? defaultSlippage
    setOpenSlippageValue(`${openSlippage * 100}`)
    setCloseSlippageValue(`${closeSlippage * 100}`)
    setTpSlSlippageValue(`${tpSlSlippage * 100}`)
  }, [symbolInfo])

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
            <Tooltips title={t`开仓滑点设置`}>
              <span className="inline-flex">
                <IconWarningOutline size={12} />
              </span>
            </Tooltips>
          </div>
          <SlippageInput
            defaultValue={defaultSlippage * 100}
            value={openSlippageValue}
            onChange={(value) => setOpenSlippageValue(value)}
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
            value={closeSlippageValue}
            onChange={(value) => setCloseSlippageValue(value)}
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
            value={tpSlSlippageValue}
            onChange={(value) => setTpSlSlippageValue(value)}
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
            onClick={() => {
              setSlippage({
                chainId: symbolInfo?.chainId ?? 0,
                poolId: symbolInfo?.poolId ?? '',
                type: SlippageTypeEnum.OPEN,
                slippage: parseFloat(openSlippageValue) / 100,
              })
              setSlippage({
                chainId: symbolInfo?.chainId ?? 0,
                poolId: symbolInfo?.poolId ?? '',
                type: SlippageTypeEnum.CLOSE,
                slippage: parseFloat(closeSlippageValue) / 100,
              })
              setSlippage({
                chainId: symbolInfo?.chainId ?? 0,
                poolId: symbolInfo?.poolId ?? '',
                type: SlippageTypeEnum.TPSL,
                slippage: parseFloat(tpSlSlippageValue) / 100,
              })
              onChange()
            }}
          >
            <Trans>确认</Trans>
          </PrimaryButton>
        </div>
      </div>
    </DialogTheme>
  )
}
