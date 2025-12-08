import { useMemo, useRef, useState } from 'react'
import { IndicatorMap, IndicatorType, type IIndicatorMap } from '../const'
import type { IChartingLibraryWidget } from '@public/charting_library/charting_library'
import { useMount, useUnmount } from 'ahooks'
import clsx from 'clsx'
import { klinePubSub } from '@/utils/pubsub'

export const StudyList = () => {
  const { mainList, secondList } = useMemo(() => {
    const mainList: IIndicatorMap[] = []
    const secondList: IIndicatorMap[] = []
    Object.values(IndicatorMap).forEach((item) => {
      if (item.type === IndicatorType.Main) {
        mainList.push(item)
      } else {
        secondList.push(item)
      }
    })
    return { mainList, secondList }
  }, [])

  const [studyMap, setStudyMap] = useState<Record<string, boolean>>({})
  const widgetRef = useRef<IChartingLibraryWidget>(null)

  const onKlineReady = (widget: IChartingLibraryWidget) => {
    const chart = widget.activeChart()
    widgetRef.current = widget
    if (!chart) return
    const studies = chart?.getAllStudies() || []

    const studyMap: Record<string, boolean> = {}
    studies.forEach((item) => {
      studyMap[item.name] = true
    })
    setStudyMap(studyMap)
  }

  useMount(() => {
    klinePubSub.on('kline:ready', onKlineReady)
  })

  useUnmount(() => {
    klinePubSub.off('kline:ready', onKlineReady)
  })

  const onStudySelect = (item: IIndicatorMap) => {
    const chart = widgetRef.current?.activeChart()
    if (!chart) return
    const studies = chart?.getAllStudies() || []
    const study = studies.find((_item: any) => _item.name === item.name)
    if (!study) {
      chart.createStudy(...item.create)
    } else {
      chart.removeEntity(study.id)
    }
    setStudyMap((prev) => ({ ...prev, [item.name]: !prev[item.name] }))
  }
  return (
    <div className="flex w-full items-center justify-start overflow-x-auto">
      {/* main */}
      <div className="relative flex gap-[16px] py-[5px] pr-[16px] pl-[16px] text-[12px] text-[#848E9C]">
        {mainList.map((item) => (
          <div
            key={item.name}
            className={clsx({ 'text-white': studyMap[item.name] })}
            role="button"
            onClick={() => onStudySelect(item)}
          >
            {item.symbol}
          </div>
        ))}

        {/* divider */}
        <div className="h-[12px] w-px bg-[#4D515C]"></div>
      </div>
      {/* second */}
      <div className="flex gap-[16px] py-[5px] pr-[16px] text-[12px] text-[#848E9C]">
        {secondList.map((item) => (
          <div
            key={item.name}
            className={clsx({ 'text-white': studyMap[item.name] })}
            role="button"
            onClick={() => onStudySelect(item)}
          >
            {item.symbol}
          </div>
        ))}
      </div>
    </div>
  )
}
