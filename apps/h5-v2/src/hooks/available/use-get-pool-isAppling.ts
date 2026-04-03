import { getPoolIsAppealing } from '@/api'
import useSWR from 'swr'

export enum AppealRecordTabType {
  MyAppeals = 'my_appeals',
  AgainstMe = 'against_me',
  MyPaid = 'my_paid',
}

export enum AppealMarginTokenType {
  BASE = 'base',
  QUOTE = 'quote',
  NONE = 'none',
}

export enum AppealDetailType {
  None = 0,
  Dispute = 1,
  Appeal = 2,
}

export enum AppealStatus {
  None = 0,
  isAppealing = 1,
}

export const useGetPoolIsAppealing = (poolId: string, chainId: number) => {
  const { data: isAppealing } = useSWR(
    poolId ? ['getPoolIsAppealing', poolId, chainId] : null,
    async () => {
      const res = await getPoolIsAppealing(poolId as string, chainId as number)
      const status = res?.data as AppealStatus

      if (status === AppealStatus.isAppealing) {
        return true
      }

      return false
    },
    {
      refreshInterval: 5000,
    },
  )

  return {
    isAppealing: !!isAppealing,
  }
}
