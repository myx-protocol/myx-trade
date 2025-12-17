import { useGetSignatureFromMode } from '@/hooks/signature/use-get-signature'
import { useQuery } from '@tanstack/react-query'
import { fetchRebateInfo, fetchWaitRebateDetail } from '@/api/vip'
import {
  fetchWaitRebateDetailResponse,
  fetchWaitRebateDetailType,
  RebateInfoType,
} from '@/api/vip/type.d'
import { useAppStore } from '@/store/app/createStore.ts'
import { getSupportedChainIdsByEnv } from '@/config/chain.ts'

export function useVipRebatesInfo() {
  const signature = useGetSignatureFromMode()
  const { account } = useAppStore()

  const { data, isLoading } = useQuery({
    queryKey: [
      {
        key: 'api.vip.SummaryUsingGet',
        signature,
        account,
      },
    ],
    queryFn: async () => {
      if (!account || !signature) return {} as RebateInfoType
      const res = await fetchRebateInfo()
      return res?.data ?? ({} as RebateInfoType)
    },
    refetchInterval: 10000,
  })

  return {
    rebateInfo: data,
    hasRebateInfoInfo: !!data,
    rebateInfoInfoLoading: isLoading,
  }
}

export function useFetchVipWaitRebatesClaim() {
  const signature = useGetSignatureFromMode()
  const { account } = useAppStore()

  const { data, isLoading } = useQuery({
    queryKey: [
      {
        key: 'api.vip.fetchWaitRebateDetail',
        signature,
        account,
      },
    ],
    queryFn: async () => {
      if (!account || !signature) return [] as fetchWaitRebateDetailType[]
      const rs: fetchWaitRebateDetailResponse = await fetchWaitRebateDetail()

      return (rs?.data ?? ([] as fetchWaitRebateDetailType[])).filter((data) =>
        getSupportedChainIdsByEnv().includes(data.chainId),
      )
    },
    refetchInterval: 10000,
  })

  return {
    rebates: data ?? [],
    rebatesLoading: isLoading,
  }
}
