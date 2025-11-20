import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useState } from 'react'
import useSWR from 'swr'
import { getPools } from '@/api'

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
