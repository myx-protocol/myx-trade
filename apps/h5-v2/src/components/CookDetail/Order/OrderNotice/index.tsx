import IconWarning from '@/components/Icon/set/Warning'
import { usePoolContext } from '@/pages/Cook/hook'
export const OrderNotice = () => {
  const { baseLpDetail } = usePoolContext()

  return (
    <div className="mt-[20px] flex items-start gap-[6px] rounded-[8px] bg-[rgba(255,202,64,0.1)] px-[12px] py-[16px]">
      <IconWarning size={16} color="#CED1D9" className="flex-shrink-0 translate-y-[2px]" />
      <p className="text-[12px] leading-[1.5] font-medium text-white">
        Act fast! Just <span className={'text-warning'}>$223</span>{' '}
        {baseLpDetail?.mBaseQuoteSymbol || '--'} Genesis Shares are left. Secure your lifetime{' '}
        <span className={'text-warning'}>2%</span> share of all trading fees!
      </p>
    </div>
  )
}
