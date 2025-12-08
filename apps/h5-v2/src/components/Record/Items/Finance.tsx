import { Trans } from '@lingui/react/macro'
import { Tag } from '@/components/Tag/index'
import { Share } from '@/components/Icon'
import { InfoButton } from '@/components/UI/Button'
import { formatNumber } from '@/utils/number'
import { RiseFallText } from '@/components/RiseFallText'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import dayjs from 'dayjs'
import SortDownIcon from '@/components/Icon/set/SortDown'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Copy } from '@/components/Copy'
import { truncateString } from '@/utils/string'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { TradeFlowItem } from '@myx-trade/sdk'
import { t } from '@lingui/core/macro'
import { TradeFlowTypeEnum } from '@myx-trade/sdk'
import Big from 'big.js'

export const FinanceItem = ({ item }: { item: TradeFlowItem }) => {
  const [open, setOpen] = useState(false)

  const amountBig = useMemo(
    () =>
      Big(item.collateralAmount || '0')
        .add(item.realizedPnl || '0')
        .add(item.fundingFee || '0')
        .add(item.executionFee || '0')
        .add(item.tradingFee || '0'),
    [item],
  )
  return (
    <div className="w-full border-b border-[#202129] p-[16px]">
      <div
        className="flex items-center justify-between"
        role="button"
        onClick={() => setOpen(!open)}
      >
        {/* symbol info */}
        <div>
          <p className="text-[14px] font-medium text-white">
            {item.baseSymbol}/{item.quoteSymbol}
          </p>
          <div className="mt-[4px] flex items-center gap-[4px]">
            <Tag type="success">
              <Trans>{item.type === TradeFlowTypeEnum.Increase ? t`开仓` : t`平仓`}</Trans>
            </Tag>
            <p className="text-[12px] text-[#6D7180]">
              {dayjs.unix(item.txTime).format('M/D HH:mm:ss')}
            </p>
          </div>
        </div>
        {/* time */}
        <div className="flex shrink-0 flex-col items-end gap-[10px]">
          {/* value */}
          <p className="text-[14px] font-medium text-white">
            {formatNumber(amountBig.toNumber(), {
              showSign: true,
              showUnit: false,
            })}
            <span className="ml-[2px]">{item.quoteSymbol}</span>
          </p>
          {/* pnl */}
          <div className="flex items-center">
            <span className="text-[11px] text-[#9397A3]">
              <Trans>PnL</Trans>
            </span>
            <p className="mr-[2px] ml-[8px]">
              <RiseFallText
                value={item.realizedPnl}
                renderOptions={{
                  showUnit: false,
                  showSign: true,
                }}
                suffix={<span className="ml-[2px]">{item.quoteSymbol}</span>}
              />
            </p>
            <span role="button" className="shrink-0">
              <SortDownIcon size={6} color="#848E9C" />
            </span>
          </div>
        </div>
      </div>
      {/* info */}
      {open && (
        <motion.div
          className="mt-[16px] flex flex-col gap-[10px] text-[12px] text-[#9397A3]"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          <FlexRowLayout
            left={<Trans>Funding Fee</Trans>}
            right={
              <p className="font-medium text-white">
                <RiseFallText
                  value={item.fundingFee}
                  renderOptions={{
                    showUnit: false,
                    showSign: true,
                  }}
                  suffix={<span className="ml-[2px]">{item.quoteSymbol}</span>}
                />
              </p>
            }
          />
          <FlexRowLayout
            left={<Trans>Execution Fee</Trans>}
            right={
              <p className="font-medium text-white">
                <RiseFallText
                  value={item.executionFee}
                  renderOptions={{
                    showUnit: false,
                    showSign: true,
                  }}
                  suffix={<span className="ml-[2px]">{item.quoteSymbol}</span>}
                />
              </p>
            }
          />
          <FlexRowLayout
            left={<Trans>Fee</Trans>}
            right={
              <p className="font-medium text-white">
                <RiseFallText
                  value={item.tradingFee}
                  renderOptions={{
                    showUnit: false,
                    showSign: true,
                  }}
                  suffix={<span className="ml-[2px]">{item.quoteSymbol}</span>}
                />
              </p>
            }
          />
          <FlexRowLayout
            left={<Trans>Hash</Trans>}
            right={
              <p className="flex items-center gap-[4px] font-medium text-white">
                <span>{truncateString(item.txHash || '', 10, 4)}</span>
                <Copy content={item.txHash || ''} />
              </p>
            }
          />
        </motion.div>
      )}
    </div>
  )
}
