import { useMemo } from 'react'
import { IndicatorMap, IndicatorType, type IIndicatorMap } from '../const'

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
  return (
    <div className="flex w-full items-center justify-start overflow-x-auto">
      {/* main */}
      <div className="relative flex gap-[16px] py-[5px] pr-[16px] pl-[16px] text-[12px] text-[#848E9C]">
        {mainList.map((item) => (
          <div key={item.name} role="button">
            {item.symbol}
          </div>
        ))}

        {/* divider */}
        <div className="h-[12px] w-px bg-[#4D515C]"></div>
      </div>
      {/* second */}
      <div className="flex gap-[16px] py-[5px] pr-[16px] text-[12px] text-[#848E9C]">
        {secondList.map((item) => (
          <div key={item.name} role="button">
            {item.symbol}
          </div>
        ))}
      </div>
    </div>
  )
}
