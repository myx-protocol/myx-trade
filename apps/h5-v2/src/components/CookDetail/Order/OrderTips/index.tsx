import IconHelp from '@/components/Icon/set/Help'
import { usePoolContext } from '@/pages/Cook/hook'
export const OrderTips = () => {
  const { baseLpDetail } = usePoolContext()
  return (
    <div className="mt-[8px] flex items-start gap-[4px] rounded-[8px] border-[1px] border-[#202129] p-[12px]">
      <IconHelp size={14} className="flex-shrink-0 translate-y-[2px]" />
      <p className="text-[12px] leading-[1.5] text-[#CED1D9]">
        Due to the monthly trading volume ($2,000 / $50,000) not meeting the requirement, the{' '}
        {baseLpDetail?.mBaseQuoteSymbol} market will be delisted in 23:23:23. After delisting, buys
        will be suspended. Your ability to sell will not be affected.{' '}
        <a className={'text-green'} href={''}>
          {' '}
          View Delisting Rules
        </a>
      </p>
    </div>
  )
}
