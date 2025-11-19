import { InfoButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import dayjs from 'dayjs'

export const TpslOrderItem = () => {
  return (
    <div className="rounded-[10px] border-[1px] border-[#31333D] p-[16px] leading-[1]">
      {/* title */}
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-medium text-white">
          <Trans>止损-最新</Trans>
        </p>
        <p className="text-[12px] font-medium text-[#848E9C]">
          {dayjs().format('YYYY-MM-DD HH:mm:ss')}
        </p>
      </div>
      {/* info */}
      <div className="mt-[16px] flex justify-between gap-[24px] text-[12px] leading-[1.2] font-normal">
        <div className="flex flex-col items-start">
          <p className="text-[12px] leading-[1.2] text-[#848E9C]">
            <Trans>触发价格</Trans>
          </p>
          <p className="mt-[4px] leading-[#CED1D9] text-[#CED1D9]">123123</p>
        </div>
        <div className="flex flex-col items-start">
          <p className="text-[12px] leading-[1.2] text-[#848E9C]">
            <Trans>触发价格</Trans>
          </p>
          <p className="mt-[4px] leading-[#CED1D9] text-[#CED1D9]">123123</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[12px] leading-[1.2] text-[#848E9C]">
            <Trans>触发价格</Trans>
          </p>
          <p className="mt-[4px] leading-[#CED1D9] text-[#CED1D9]">123123</p>
        </div>
      </div>
      {/* operation */}
      <div className="mt-[16px] flex items-center justify-between gap-[8px]">
        <InfoButton
          style={{
            width: '100%',
            height: '32px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: 1,
            background: '#202129',
          }}
        >
          <Trans>修改</Trans>
        </InfoButton>
        <InfoButton
          style={{
            width: '100%',
            height: '32px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: 1,
            background: '#202129',
          }}
        >
          <Trans>删除</Trans>
        </InfoButton>
      </div>
    </div>
  )
}
