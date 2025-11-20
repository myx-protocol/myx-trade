import { DialogBase } from '@/components/UI/DialogBase'
import { t } from '@lingui/core/macro'
import { useState } from 'react'
import { PriceInfo } from './components/PriceInfo'
import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { TradeSelect, type TradeSelectOption } from '../../components/Select'
import { TpslOrderItem } from './components/TpslOrderItem'

export const TpslPreviewDialog = () => {
  const [sortType, setSortType] = useState<'time' | 'price' | 'pnl'>('time')

  const handleSortTypeChange = (value: 'time' | 'price' | 'pnl') => {
    setSortType(value)
  }

  return (
    <DialogBase
      title={t`止盈止损`}
      open={false}
      onClose={() => {}}
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
        {/* price */}
        <PriceInfo
          currentPrice={'1233.45'}
          forceTpPrice={'1233.45'}
          entryPrice={'1233.45'}
          estimatedForceSlPrice={'1233.45'}
        />
        {/* tpsl type */}
        <div className="mt-[12px] flex items-center justify-between">
          <div className="flex h-[28px] items-center rounded-[9999px] bg-[#202129] px-[16px] py-[8px]">
            <TradeSelect
              sx={{
                color: '#CED1D9',
              }}
              options={
                [
                  {
                    label: t`按委托时间排序`,
                    value: 'time',
                  },
                  {
                    label: t`按价格排序`,
                    value: 'price',
                  },
                  {
                    label: t`按盈亏排序`,
                    value: 'pnl',
                  },
                ] as TradeSelectOption[]
              }
              value={sortType}
              onChange={(e) => handleSortTypeChange(e.target.value as 'time' | 'price' | 'pnl')}
            />
          </div>
          <div
            className="flex h-[28px] items-center rounded-[9999px] bg-[#202129] px-[16px] py-[8px]"
            role="button"
          >
            <span className="text-[12px] leading-[1] font-medium text-[#CED1D9]">
              <Trans>全部撤单</Trans>
            </span>
          </div>
        </div>

        <div className="mt-[12px] flex flex-col gap-[8px]">
          <TpslOrderItem />
          <TpslOrderItem />
        </div>

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
          >
            <Trans>取消</Trans>
          </InfoButton>
          <PrimaryButton
            style={{
              width: '100%',
              height: '44px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: 1,
            }}
          >
            <Trans>确定</Trans>
          </PrimaryButton>
        </div>
      </div>
    </DialogBase>
  )
}
