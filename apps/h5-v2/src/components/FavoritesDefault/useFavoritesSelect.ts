import { useCallback, useState } from 'react'

const getKey = (chainId: number, poolId: string) => {
  return `${chainId}-${poolId}`
}

export const useFavoritesSelect = () => {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const add = useCallback((chainId: number, poolId: string) => {
    setSelected((prev) => ({
      ...prev,
      [chainId + poolId]: true,
    }))
  }, [])
  const remove = useCallback((chainId: number, poolId: string) => {
    setSelected((prev) => {
      const key = getKey(chainId, poolId)
      return {
        ...prev,
        [key]: false,
      }
    })
  }, [])
  const toggle = useCallback((chainId: number, poolId: string) => {
    setSelected((prev) => {
      const key = getKey(chainId, poolId)
      return {
        ...prev,
        [key]: !prev[key],
      }
    })
  }, [])
  const isSelected = useCallback(
    (chainId: number, poolId: string) => {
      const key = getKey(chainId, poolId)
      return selected[key]
    },
    [selected],
  )
  const getSelectedItems = useCallback(() => {
    return Object.entries(selected)
      .filter(([key, value]) => value)
      .map(([key, value]) => {
        const [chainId, poolId] = key.split('-')
        return {
          chainId: Number(chainId),
          poolId: poolId,
        }
      })
  }, [selected])
  const selectedCount = useCallback(() => {
    return Object.values(selected).filter((value) => value).length
  }, [selected])
  return {
    add,
    remove,
    toggle,
    isSelected,
    getSelectedItems,
    selectedCount,
  }
}
