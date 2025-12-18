import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useReferralStore } from '@/store/referrals'
import { RewardsCard } from './components/RewardsCard'
import { Hero } from './components/Hero'
import { MyRebate } from './components/MyRebate'
import { RecordCard } from './components/Record'
import { ReceiveInviteDialog } from './components/ReceiveInviteDialog'
import { ReceiveConfirmDialog } from './components/ReceiveConfirmDialog'
import { isSupportedChainFn } from '@/config/chain'
import { useAccessParams } from '@/hooks/useAccessParams'
const Referrals = () => {
  const { isConnected, address, chainId, switchChain } = useWalletConnection()
  const [ratio, setRatio] = useState<number>(0)

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const code = searchParams.get('invitationCode') ?? ''

  const {
    setReceiveInviteDialogOpen,
    setReceiveConfirmDialogOpen,
    fetchRefReferrerInfo,
    setAccessParams,
    accessToken,
  } = useReferralStore()

  const accessParams = useAccessParams()

  useEffect(() => {
    if (accessParams) {
      setAccessParams(accessParams.accessToken, accessParams.account || '')
    }
  }, [accessParams, setAccessParams])

  useEffect(() => {
    const checkReferral = async () => {
      if (code && address && accessToken) {
        await fetchRefReferrerInfo()
        const currentReferrer = useReferralStore.getState().referrerInfo
        if (!currentReferrer?.referrer) {
          setReceiveInviteDialogOpen(true)
        }
      }
    }
    checkReferral()
  }, [code, address, accessToken, fetchRefReferrerInfo, setReceiveInviteDialogOpen])

  // Logic to handle chain switch if needed
  useEffect(() => {
    if (isConnected && chainId && !isSupportedChainFn(chainId)) {
      // Optional: Auto switch or show notification
    }
  }, [isConnected, chainId])

  return (
    <div className="flex justify-center bg-[#0B090B] px-4 pb-[50px] lg:px-5">
      <div className="flex w-full flex-col items-center lg:min-w-[1440px]">
        <Hero />
        <div className="w-full lg:max-w-[1196px]">
          <div className="mt-10 flex flex-col px-0 lg:mt-5 lg:px-4">
            {isConnected ? (
              <>
                <MyRebate />
                <RecordCard />
              </>
            ) : (
              <RewardsCard />
            )}
          </div>
          <ReceiveInviteDialog
            code={code}
            close={(refereeRatio: number) => {
              setRatio(refereeRatio)
              setReceiveConfirmDialogOpen(true)
            }}
          />
          <ReceiveConfirmDialog refereeRatio={ratio} />
        </div>
      </div>
    </div>
  )
}

export default Referrals
