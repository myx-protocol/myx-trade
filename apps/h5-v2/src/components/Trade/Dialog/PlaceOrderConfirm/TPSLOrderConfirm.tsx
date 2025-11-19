/**
 * ≤
 * ≥
 *
 */

import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Trans } from '@lingui/react/macro'

export const TPSLOrderConfirm = () => {
  // const
  return (
    <div className="mt-[20px] flex flex-col gap-[10px] border-b-[1px] border-[#31333D] pb-[20px] text-[12px] leading-[1] font-normal text-[#9397A3]">
      <FlexRowLayout
        left={<Trans>市价止盈</Trans>}
        right={<p className="font-medium text-white">13.75 USDT /0.023 BTC</p>}
      />
      <FlexRowLayout
        left={<Trans>市价止盈</Trans>}
        right={<p className="text-green font-medium">+0.23 USDT</p>}
      />
      <FlexRowLayout
        left={<Trans>市价止损</Trans>}
        right={<p className="font-medium text-white">13.75 USDT /0.023 BTC</p>}
      />
      <FlexRowLayout
        left={<Trans>市价止损</Trans>}
        right={<p className="text-fall font-medium">-0.23 USDT</p>}
      />
    </div>
  )
}
