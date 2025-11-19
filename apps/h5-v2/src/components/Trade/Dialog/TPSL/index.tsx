import { DialogBase } from '@/components/UI/DialogBase'
import { Tab, Tabs } from '@/components/UI/Tabs'
import { t } from '@lingui/core/macro'
import { TPSLTabTypeEnum } from './types'
import { useState } from 'react'
import { PriceInfo } from './components/PriceInfo'
import { TpslFormGroup } from './components/TpslFormGroup'
import { TpslSlippage } from './components/TpslSlippage'
import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'

export const TPSLDialog = () => {
  const [activeTab, setActiveTab] = useState<TPSLTabTypeEnum>(TPSLTabTypeEnum.TPOrSL)
  return (
    <DialogBase
      title={`止盈止损`}
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
        {/* tabs */}
        <div className="mt-[6px]">
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value as TPSLTabTypeEnum)}
            sx={{
              borderBottom: '1px solid #31333D',
            }}
          >
            <Tab value={TPSLTabTypeEnum.TPOrSL} label={t`止盈/止损`}></Tab>
            <Tab value={TPSLTabTypeEnum.TPAndSL} label={t`止盈&止损`}></Tab>
          </Tabs>
        </div>

        {/* price */}
        <PriceInfo currentPrice={1233.45} forceTpPrice={1233.45} />
        {/* tpsl type */}
        <TpslFormGroup />
        <TpslFormGroup />
        <TpslSlippage />
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
