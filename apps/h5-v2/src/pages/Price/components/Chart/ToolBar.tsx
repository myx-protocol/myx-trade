import { dropDownMenuOptions, resolutionDefaultList } from '@/components/Trade/Charts/const'
import { formatResolutionToDisplayText } from '@/components/Trade/Charts/lib/datafeed'
import { Resolution } from '@/components/Trade/Charts/Toolbar/Resolution'
import { usePriceStore } from '../../store'
import clsx from 'clsx'
import type { ResolutionString } from '@public/charting_library/charting_library'
import { ArrowDown, ChartStudy, SortDown } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import { Popover } from '@/components/UI/Popover'
import { useState } from 'react'

const resolutionOptions: Array<{ label: string; value: string | number }> = dropDownMenuOptions.map(
  (item) => ({
    label: formatResolutionToDisplayText(item) as string,
    value: item,
  }),
)

const fixedResolutionList: Array<{ label: string; value: string | number }> =
  resolutionDefaultList.map((item) => ({
    label: formatResolutionToDisplayText(item) as string,
    value: item,
  }))

export const ToolBar = () => {
  const { activeResolution, setActiveResolution, fixedResolution } = usePriceStore()

  const handleResolutionChange = (value: string | number) => {
    setActiveResolution(value as ResolutionString)
    // tradePubSub.emit('kline:resolution:change', value)
  }

  const [dropdownOpen, setDropdownOpen] = useState(false)
  return (
    <div className="flex items-center justify-between px-[16px] pb-[4px]">
      <div className="flex items-center gap-[10px]">
        {fixedResolutionList.map((item) => (
          <div
            key={item.value}
            role="button"
            onClick={() => setActiveResolution(item.value as ResolutionString)}
            className={clsx(
              'rounded-[50px] px-[8px] py-[5px] text-[12px] font-normal text-[#848E9C]',
              {
                'bg-[#202129] font-medium text-white': activeResolution === item.value,
              },
            )}
          >
            {item.label}
          </div>
        ))}
        {/*  */}
        <Popover
          open={dropdownOpen}
          onOpenChange={setDropdownOpen}
          trigger={
            <div
              role="button"
              onClick={() => setDropdownOpen(true)}
              className={clsx(
                'flex items-center justify-center gap-[2px] rounded-[50px] px-[8px] py-[5px] text-[12px] font-normal text-[#848E9C]',
              )}
            >
              <span>
                <Trans>more</Trans>
              </span>
              <SortDown size={6} color="#9A9B9F" />
            </div>
          }
        >
          <div className="flex flex-col rounded-[4px] bg-[#202129] py-[4px] text-[12px] font-medium text-[#848E9C]">
            {resolutionOptions.map((item) => (
              <div
                key={item.value}
                className={clsx('px-[12px] py-[12px] text-center', {
                  'bg-[#18191F] text-white': activeResolution === item.value,
                })}
                role="button"
                onClick={() => {
                  handleResolutionChange(item.value)
                  setDropdownOpen(false)
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </Popover>
      </div>

      <div className="shrink-0" role="button">
        <ChartStudy size={16} color="#fff" />
      </div>
    </div>
  )
}
