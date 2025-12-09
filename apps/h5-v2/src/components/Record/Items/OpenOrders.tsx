import { RiseFallText } from '@/components/RiseFallText'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { Tag } from '@/components/Tag/index'
import { InfoButton } from '@/components/UI/Button'
import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import dayjs from 'dayjs'

export const OpenOrderItem = () => {
  return (
    <div className="w-full border-b border-[#202129] px-[16px] py-[20px]">
      <div className="flex items-center justify-between">
        {/* symbol info */}
        <div>
          <p className="text-[16px] font-semibold text-white">BTC/USDT</p>
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
        {/* time */}
        <p className="text-[12px] text-[#848E9C]">{dayjs().format('YYYY/MM/DD HH:mm:ss')}</p>
      </div>
      {/* info */}
      <div className="mt-[20px]">
        <div className="grid grid-cols-3 justify-between gap-[16px] text-[12px] text-[#848E9C]">
          {/* left */}
          {/* margin */}
          <div>
            <p>
              <Trans>Margin(USDT)</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(12.12, { showUnit: false })}
            </p>
          </div>
          {/* amount */}
          <div>
            <p>
              <Trans>Amount</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(12.12, { showUnit: false })}
            </p>
          </div>
          {/* price */}
          <div className="text-center">
            <p>
              <Trans>Price</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(12.12, { showUnit: false })}
            </p>
          </div>
        </div>
      </div>

      {/* buttons */}
      <div className="mt-[20px] flex justify-center gap-[8px]">
        <InfoButton
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          <Trans>Edit</Trans>
        </InfoButton>
        <InfoButton
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          <Trans>Cancel</Trans>
        </InfoButton>
      </div>
    </div>
  )
}
