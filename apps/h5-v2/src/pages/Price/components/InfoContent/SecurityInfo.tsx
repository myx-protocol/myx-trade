import useGlobalStore from '@/store/globalStore'
import { SafeList } from '@/components/SafeList'

export const SecurityInfo = () => {
  const { symbolInfo } = useGlobalStore()
  return (
    <SafeList
      chainId={symbolInfo?.chainId as number}
      poolId={symbolInfo?.poolId || ''}
      address={symbolInfo?.baseToken || ''}
    />
  )
}
