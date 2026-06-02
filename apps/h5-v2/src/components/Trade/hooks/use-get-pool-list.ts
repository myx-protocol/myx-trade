import { useState } from 'react'
import useSWR from 'swr'
import { getActivePools, getPools } from '@/api'

export const useGetPoolList = () => {
  const [poolList, setPoolList] = useState<any[]>([])

  useSWR(
    ['get_pool_list'],
    async () => {
      const rs = await getPools()

      setPoolList(rs?.data ?? [])
    },
    {
      refreshInterval: 10000,
    },
  )

  return {
    poolList,
  }
}

export const useGetActivePoolList = () => {
  const { data } = useSWR(
    ['get_pool_list'],
    async () => {
      const rs = await getActivePools()

      return rs?.data ?? []
    },
    {
      refreshInterval: 10000,
    },
  )

  return {
    poolList: data ?? [],
  }
}
