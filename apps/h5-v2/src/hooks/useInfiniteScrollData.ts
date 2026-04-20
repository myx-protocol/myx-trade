import { DEFAULT_LIMIT } from '@/request'
import { useCallback, useState } from 'react'

interface PaginationParams {
  limit?: number
  before?: number
  after?: number
}

export type InfiniteScrollGetData<T = Record<string, any>> = (
  pageParams: PaginationParams,
) => Promise<T[] | null>

type InfiniteScrollDataProps<T = Record<string, any>> = {
  getData: InfiniteScrollGetData<T>
  limit?: number
}

export const useInfiniteScrollData = <T extends Record<string, any>>({
  getData,
  limit = DEFAULT_LIMIT,
}: InfiniteScrollDataProps<T>) => {
  const [data, setData] = useState<T[]>([])
  const [after, setAfter] = useState<number | undefined>(undefined)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const getDataCallback = useCallback(async () => {
    if (!hasMore || isLoading) return
    try {
      setIsLoading(true)
      const reuqestLimit = limit + 1
      const data = await getData({ limit: reuqestLimit, after })
      console.log(data, 'data')
      if (!data) {
        setHasMore(false)
      } else {
        setHasMore(data.length === reuqestLimit)
        const dataList = data.slice(0, limit)
        setData((pre) => [...pre, ...(dataList || [])])
        setAfter(dataList[dataList.length - 1].id)
      }
    } catch (error) {
      console.error('[useInfiniteScrollData] getData error', error)
    } finally {
      setIsLoading(false)
    }
  }, [getData, limit, after, hasMore, isLoading])

  const reset = useCallback(() => {
    setData([])
    setAfter(undefined)
    setHasMore(true)
    setIsLoading(false)
  }, [])

  return { data, isLoading, hasMore, getData: getDataCallback, reset }
}
