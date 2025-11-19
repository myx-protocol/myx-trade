import { t } from '@lingui/core/macro'
import clsx from 'clsx'
import { useState } from 'react'
import { AreaCharts } from './AreaCharts'
import { ChartInterval } from '@/pages/Earn/type.ts'

export const Charts = () => {
  const resolutionOptions: {
    label: string
    value: ChartInterval
  }[] = [
    { label: t`Day`, value: ChartInterval.day },
    { label: t`Week`, value: ChartInterval.week },
    { label: t`All`, value: ChartInterval.all },
  ]
  const [resolution, setResolution] = useState<ChartInterval>(ChartInterval.all)

  return (
    <div className="mt-[4px] bg-[#101114]">
      {/* title */}
      <div className="p-[20px]">
        {/* resolution selector */}
        <div
          className={clsx(
            'flex items-center gap-[15px] text-[14px] leading-[1] font-medium text-[#9397A3]',
          )}
        >
          {resolutionOptions.map((option) => (
            <div
              key={option.value}
              role="button"
              className={clsx({
                'text-[#00E3A5]': option.value === resolution,
              })}
              onClick={() => setResolution(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </div>
      <AreaCharts interval={resolution} />
    </div>
  )
}
