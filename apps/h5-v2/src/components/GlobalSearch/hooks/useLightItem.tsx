import { useCallback, useState } from 'react'
import { useKeyPress } from 'ahooks'

interface SelectItem {
  index: number
  chainId: number
  poolId: string
}

interface UseSelectItem<
  T extends {
    chainId: number
    poolId: string
  },
> {
  dataList: T[]
  onSelect: (item: T) => void
}

export const useKeyPressSelect = <
  T extends {
    chainId: number
    poolId: string
  },
>({
  dataList,
  onSelect,
}: UseSelectItem<T>) => {
  const [lightItem, setLightItem] = useState<SelectItem>({
    index: -1,
    chainId: 0,
    poolId: '',
  })

  const getNextItem = () => {
    if (lightItem.index < dataList.length - 1) {
      return {
        item: dataList[lightItem.index + 1],
        index: lightItem.index + 1,
      }
    }
    return {
      item: dataList[0],
      index: 0,
    }
  }
  const getPrevItem = () => {
    if (lightItem.index > 0) {
      return {
        item: dataList[lightItem.index - 1],
        index: lightItem.index - 1,
      }
    }
    return {
      item: dataList[dataList.length - 1],
      index: dataList.length - 1,
    }
  }

  useKeyPress('downarrow', () => {
    const nextItem = getNextItem()
    if (nextItem) {
      setLightItem({
        index: nextItem.index,
        chainId: nextItem.item.chainId,
        poolId: nextItem.item.poolId,
      })
    }
  })

  useKeyPress('uparrow', () => {
    const prevItem = getPrevItem()
    if (prevItem) {
      setLightItem({
        index: prevItem.index,
        chainId: prevItem.item.chainId,
        poolId: prevItem.item.poolId,
      })
    }
  })

  useKeyPress('enter', () => {
    if (!lightItem.chainId || !lightItem.poolId) {
      return
    }
    onSelect?.(dataList[lightItem.index])
  })
  const onReset = useCallback(() => {
    setLightItem({
      index: -1,
      chainId: 0,
      poolId: '',
    })
  }, [])
  return {
    lightItem,
    onReset,
  }
}
