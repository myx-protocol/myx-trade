import { useMemo, useRef, useEffect } from 'react'

export type SortOrder = 'asc' | 'desc' | 'none'

export interface SortConfig<T> {
  /**
   * 排序字段，如果为 undefined 或 direction 为 'none'，则不排序
   */
  by?: keyof T
  /**
   * 排序方向
   */
  direction: SortOrder
}

export interface UseSortDataOptions<T> {
  /**
   * 原始数据数组
   */
  data: T[]
  /**
   * 排序配置
   */
  sort: SortConfig<T>
  /**
   * 字段值提取器，用于自定义字段值的获取逻辑
   * 例如：当字段是 'basePrice' 时，可以从 tickerData 中获取实时价格
   */
  getFieldValue?: (item: T, field: keyof T) => string | number | undefined
}

/**
 * 通用的数据排序 Hook
 *
 * 特性：
 * - 只在排序配置（sort.by 或 sort.direction）变化时重新排序
 * - 当原始数据（data）变化时，会使用相同的排序规则重新排序
 * - getFieldValue 函数中的外部数据（如 tickerData）变化时不会触发重新排序
 *
 * @example
 * ```tsx
 * const sortedData = useSortData({
 *   data: marketList,
 *   sort: { by: 'basePrice', direction: 'asc' },
 *   getFieldValue: (item, field) => {
 *     if (field === 'basePrice') {
 *       // tickerData 变化不会触发重新排序，只在用户点击排序时使用当前值排序
 *       return tickerData[item.poolId]?.price || item.basePrice
 *     }
 *     return item[field]
 *   }
 * })
 * ```
 */
export function useSortData<T>({ data, sort, getFieldValue }: UseSortDataOptions<T>): T[] {
  // 使用 ref 存储 getFieldValue，避免将其放入依赖数组
  // 这样 getFieldValue 中引用的外部数据（如 tickerData）变化时不会触发重新排序
  const getFieldValueRef = useRef(getFieldValue)

  // 始终更新 ref，确保排序时使用最新的 getFieldValue
  useEffect(() => {
    getFieldValueRef.current = getFieldValue
  }, [getFieldValue])

  return useMemo(() => {
    // 如果没有排序配置或方向为 none，返回原数组的副本
    if (!sort.by || sort.direction === 'none' || !data.length) {
      return [...data]
    }

    // 创建数组副本并排序（避免修改原数组）
    const sorted = [...data].sort((a, b) => {
      // 使用自定义字段值提取器，如果没有则使用默认值
      let aValue: string | number | undefined
      let bValue: string | number | undefined

      if (getFieldValueRef.current) {
        aValue = getFieldValueRef.current(a, sort.by!)
        bValue = getFieldValueRef.current(b, sort.by!)
      } else {
        aValue = a[sort.by!] as string | number | undefined
        bValue = b[sort.by!] as string | number | undefined
      }

      // 处理空值情况
      if (aValue === undefined || aValue === null) return 1
      if (bValue === undefined || bValue === null) return -1

      // 转换为数字进行比较
      const aNum = Number(aValue)
      const bNum = Number(bValue)

      // 如果转换失败，按原始值比较
      if (isNaN(aNum) || isNaN(bNum)) {
        const aStr = String(aValue)
        const bStr = String(bValue)
        if (sort.direction === 'asc') {
          return aStr.localeCompare(bStr)
        }
        return bStr.localeCompare(aStr)
      }

      // 数字比较
      if (sort.direction === 'asc') {
        return aNum - bNum
      }
      return bNum - aNum
    })

    return sorted
    // 只依赖 data、sort.by 和 sort.direction
    // getFieldValueRef 中的 getFieldValue 变化不会触发重新排序
  }, [data, sort.by, sort.direction])
}
