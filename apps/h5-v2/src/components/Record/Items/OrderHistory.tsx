import { Trans } from '@lingui/react/macro'
import { Tag } from '@/components/Tag/index'
import { Share } from '@/components/Icon'
import { InfoButton } from '@/components/UI/Button'
import { formatNumber } from '@/utils/number'
import { RiseFallText } from '@/components/RiseFallText'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import dayjs from 'dayjs'
import { FlexRowLayout } from '@/components/FlexRowLayout'

export const OrderHistoryItem = () => {
  return (
    <div className="w-full border-b border-[#202129] px-[16px] py-[20px]">
      <div className="flex items-center justify-between">
        {/* symbol info */}
        <div>
          <p className="text-[14px] font-medium text-white">BTC/USDT</p>
          <div className="mt-[4px] flex gap-[4px]">
            <Tag type="success">
              <Trans>Long</Trans>
            </Tag>
            <Tag type="info">
              <Trans>Limit</Trans>
            </Tag>
            <Tag type="info">
              <Trans>Isolated 5x</Trans>
            </Tag>
          </div>
        </div>
        {/* right */}
        <div className="flex shrink-0 flex-col items-end gap-[6px] text-[12px] text-[#848E9C]">
          <p>Canceled</p>
          <p>{dayjs().format('YYYY/MM/DD HH:mm:ss')}</p>
        </div>
      </div>
      {/* info */}
      <div className="mt-[16px] flex flex-col gap-[8px] text-[12px] text-[#848E9C]">
        <FlexRowLayout
          left={<Trans>Amount(BTC)</Trans>}
          right={
            <div className="text-[13px] font-medium">
              <span className="text-white">--</span>
              <span className="px-[2px]">/</span>
              <span>{formatNumber(12.12, { showUnit: false })}</span>
            </div>
          }
        />
        <FlexRowLayout
          left={<Trans>Price/Price</Trans>}
          right={
            <div className="text-[13px] font-medium">
              <span className="text-white">--</span>
              <span className="px-[2px]">/</span>
              <span>{formatNumber(12.12, { showUnit: false })}</span>
            </div>
          }
        />
        <FlexRowLayout
          left={<Trans>Fee(USDT)</Trans>}
          right={
            <div className="text-[13px] font-medium">
              <span className="text-white">--</span>
            </div>
          }
        />
      </div>
    </div>
  )
}
