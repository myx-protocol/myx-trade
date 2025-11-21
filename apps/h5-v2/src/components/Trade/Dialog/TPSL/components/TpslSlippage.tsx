import EditSimply from '@/components/Icon/set/EditSimply'
import { Trans } from '@lingui/react/macro'
import { useEffect, useState } from 'react'
import YesIcon from '@/components/Icon/set/Yes'
import CloseIcon from '@/components/Icon/set/CloseIcon'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { useTradePanelStore } from '@/components/Trade/TradePanel/store'

export const TpslSlippage = () => {
  const [isEdit, setIsEdit] = useState(false)
  const [value, setValue] = useState(0)
  const { tpSlSlippage, setTpSlSlippage } = useTradePanelStore()

  useEffect(() => {
    setValue(tpSlSlippage * 100)
  }, [tpSlSlippage])

  return (
    <div className="mt-[20px] flex items-center justify-between text-[12px] leading-[1] font-normal text-[#848E9C]">
      <p>
        <Trans>最大滑点</Trans>
      </p>
      <div className="flex-shrink-0">
        {/* priview */}
        {isEdit ? (
          <div className="flex items-center gap-[4px]">
            <div
              className="flex h-[28px] w-[38px] items-center justify-center rounded-[4px] border-[1px] border-[#31333D]"
              role="button"
              onClick={() => setIsEdit(false)}
            >
              <CloseIcon size={14} color="#fff" />
            </div>
            <div className="flex h-[28px] w-[50px] items-center justify-center rounded-[4px] border-[1px] border-[#31333D]">
              <NumberInputPrimitive
                className="text-center"
                suffix="%"
                value={value}
                onValueChange={(value) => {
                  setValue(value.floatValue ?? 0)
                }}
              />
            </div>
            <div
              className="flex h-[28px] w-[38px] items-center justify-center rounded-[4px] border-[1px] border-[#31333D]"
              role="button"
              onClick={() => {
                if (value) {
                  setTpSlSlippage(value / 100)
                }

                setIsEdit(false)
              }}
            >
              <YesIcon size={14} color="#fff" />
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-[4px]"
            role="button"
            onClick={() => setIsEdit(true)}
          >
            <p className="font-medium text-white">{tpSlSlippage * 100}%</p>
            <EditSimply size={12} color="#fff" />
          </div>
        )}
      </div>
    </div>
  )
}
