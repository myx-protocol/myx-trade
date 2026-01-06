import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Trans } from '@lingui/react/macro'
import Security from '@/components/Icon/set/Security'
import { useSecurityInfo } from '@/api'
import { decimalToPercent } from '@/utils/number'
import Big from 'big.js'
import GoplusLogo from '@/assets/images/third/goplus-logo.svg'
import Danger from '@/components/Icon/set/Danger'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import WarningLine from '@/components/Icon/set/WarningLine'
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
