import { useMemo, useRef, useState } from 'react'
import { IndicatorMap, IndicatorType, type IIndicatorMap } from '../const'
import type { IChartingLibraryWidget } from '@public/charting_library/charting_library'
import { useMount, useUnmount } from 'ahooks'
import clsx from 'clsx'
import { klinePubSub } from '@/utils/pubsub'
import { Drawer } from '@/components/UI/Drawer'
import { styled, Drawer as MuiDrawer } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { CloseIcon } from '@/components/Icon'

export const StyledDrawer = styled(MuiDrawer)`
  .MuiPaper-root {
    background-color: var(--base-bg);
    padding-left: 16px;
    padding-right: 16px;
    padding-bottom: 60px;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }
  .drawer-header {
    display: flex;
    justify-content: space-between;
    padding: 20px 0 12px 0;
  }
`

export const StudyListDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
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
    <StyledDrawer open={open} onClose={onClose} anchor="bottom">
      {/* <Box  className={'drawer-header'}>
         <span className={'font-[20px] font-[500] leading-[1] text-basic-white'}>
            {title}
          </span>
        <Box width={'16px'} height={'16px'} onClick={(e) => onClose?.(e, 'backdropClick')} className={'text-secondary'}>
          <CloseIcon size={16} />
        </Box>
      </Box>
      
      <Box className={'drawer-body'}>
        {children}
      </Box> */}
      <div className="flex flex-col">
        <div className="drawer-header text-white">
          <p className="text-[20px] font-medium">
            <Trans>Indicators</Trans>
          </p>
          <CloseIcon role="button" onClick={onClose} size={16} />
        </div>

        <div className="mt-[24px] flex flex-col gap-[32px]">
          {/* main list */}
          <div>
            <p className="text-[16px] font-medium text-[#ced1d9]">
              <Trans>Main-chart Indicators</Trans>
            </p>

            <div className="mt-[16px] grid grid-cols-4 gap-[4px]">
              {mainList.map((item) => (
                <div
                  key={item.name}
                  role="button"
                  className={clsx(
                    'flex min-h-[30px] items-center justify-center rounded-[4px] border-[1px] p-[4px] text-[12px]',
                    {
                      'border-green text-green': studyMap[item.name],
                      'border-[#31333d] text-[#848E9C]': !studyMap[item.name],
                    },
                  )}
                  onClick={() => onStudySelect(item)}
                >
                  {item.symbol}
                </div>
              ))}
            </div>
          </div>

          {/* second list */}
          <div>
            <p className="text-[16px] font-medium text-[#ced1d9]">
              <Trans>Sub-chart Indicators</Trans>
            </p>
            <div className="mt-[16px] grid grid-cols-4 gap-[4px]">
              {secondList.map((item) => (
                <div
                  key={item.name}
                  role="button"
                  className={clsx(
                    'flex min-h-[30px] items-center justify-center rounded-[4px] border-[1px] p-[4px] text-[12px]',
                    {
                      'border-green text-green': studyMap[item.name],
                      'border-[#31333d] text-[#848E9C]': !studyMap[item.name],
                    },
                  )}
                  onClick={() => onStudySelect(item)}
                >
                  {item.symbol}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* second */}
        {/* <div className="flex gap-[16px] py-[5px] pr-[16px] text-[12px] text-[#848E9C]">
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
        </div> */}
      </div>
    </StyledDrawer>
  )
}
