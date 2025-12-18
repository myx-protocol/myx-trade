import { useMediaBreakpoint } from '@/hooks/useMediaBreakpoint'
import { MobileSelectReferral } from './MobileSelectReferral'
import { DesktopSelectReferral } from './DesktopSelectReferral'

const SelectReferral = () => {
  const { lg } = useMediaBreakpoint()
  return <>{lg ? <DesktopSelectReferral /> : <MobileSelectReferral />}</>
}

export default SelectReferral
