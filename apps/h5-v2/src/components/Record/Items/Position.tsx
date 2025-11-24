import { Trans } from '@lingui/react/macro'
import { Tag } from '@/components/Tag/index'
import { Share } from '@/components/Icon'
import { InfoButton } from '@/components/UI/Button'
import { formatNumber } from '@/utils/number'
import { RiseFallText } from '@/components/RiseFallText'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'

export const PositionItem = () => {
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
              <Trans>Isolated 5x</Trans>
            </Tag>
          </div>
        </div>
        {/* time */}
        {/* <p className="text-[12px] text-[#848E9C]">{dayjs().format('YYYY/MM/DD HH:mm:ss')}</p> */}
        <div role="button" className="shrink-0 text-white">
          <Share size={16} />
        </div>
      </div>
      {/* info */}
      <div className="mt-[16px]">
        <div className="grid grid-cols-3 justify-between gap-[16px] text-[12px] text-[#848E9C]">
          {/* left */}
          {/* unPnl */}
          <div>
            <p>
              <Trans>unPnl</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              <RiseFallText value={12.12} />
            </p>
          </div>
          {/* roe */}
          <div className="text-center">
            <p>
              <Trans>Roe</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              <RiseFallTextPrecent value={12.12} />
            </p>
          </div>
          {/* Margin ratio */}
          <div className="text-right">
            <p>
              <Trans>Margin ratio</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              <RiseFallTextPrecent value={12.12} />
            </p>
          </div>
          {/* size */}
          <div>
            <p>
              <Trans>Size(BTC)</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(12.12, { showUnit: false })}
            </p>
          </div>
          {/* entry price */}
          <div className="text-center">
            <p>
              <Trans>Entry price</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(12.12, { showUnit: false })}
            </p>
          </div>
          {/* margin amount */}
          <div className="text-right">
            <p>
              <Trans>Margin(USDT)</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(12.12, { showUnit: false })}
            </p>
          </div>
          {/* funding fee usdt */}
          <div>
            <p>
              <Trans>Funding fee(USDT)</Trans>
            </p>
            <p className="mt-[4px] text-[14px] font-medium text-white">
              {formatNumber(12.12, { showUnit: false })}
            </p>
          </div>
          {/* liquidation price */}
          <div className="text-center">
            <p>
              <Trans>Liq.Price</Trans>
            </p>
            <p className="text-warning mt-[4px] text-[14px] font-medium">
              {formatNumber(12.12, { showUnit: false })}
            </p>
          </div>
          {/* auto tp price */}
          <div className="text-right">
            <p>
              <Trans>Auto TP Price</Trans>
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
          }}
        >
          <Trans>Margin</Trans>
        </InfoButton>
        <InfoButton
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 500,
          }}
        >
          <Trans>TP/SL</Trans>
        </InfoButton>
        <InfoButton
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '6px',
            fontWeight: 500,
          }}
        >
          <Trans>Close</Trans>
        </InfoButton>
      </div>
    </div>
  )
}
