import WalletIcon from '@/assets/home/wallet-icon.png'
import { Copy } from '@/components/Copy'
import { ArrowDown } from '@/components/Icon'
import { PrimaryButton } from '@/components/UI/Button'
import { formatNumber } from '@/utils/number'
import { truncateAddress } from '@/utils/string'
import { Trans } from '@lingui/react/macro'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useHomeStore } from '../../store'
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from 'ethers'
import { Tooltips } from '@/components/UI/Tooltips'
import useGlobalStore from '@/store/globalStore'
import { ReceiveDialog } from '@/components/ReceiveDialog'
import { useState } from 'react'

export const AccountInfo = () => {
  const { address } = useWalletConnection()
  const homeStore = useHomeStore()
  const { client, clientIsAuthenticated } = useMyxSdkClient(homeStore.chainId)
  const { setAccountDialogOpen } = useGlobalStore()
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const { data: accountBalance, isLoading } = useQuery({
    enabled: Boolean(client && clientIsAuthenticated),
    queryKey: ['home-getAccountBalance', homeStore.chainId, address],
    queryFn: async () => {
      return client?.account.getWalletQuoteTokenBalance(homeStore.chainId, address)
    },
    select: (data) => {
      return formatUnits(data?.data || '0', 6).toString()
    },
  })

  return (
    <div className="mt-[9px] w-full px-[16px]">
      {/* wallet */}
      <div className="flex items-center">
        <img src={WalletIcon} className="w-[20px]" />
        <div className="ml-[6px] flex items-center">
          <p className="text-[14px] leading-[1] font-medium text-[#CED1D9]">
            {truncateAddress(address || '')}
          </p>
          <span
            className="ml-[4px] flex"
            role="button"
            onClick={() => {
              setAccountDialogOpen(true)
            }}
          >
            <ArrowDown size={14} color="#CED1D9" />
          </span>
        </div>
        <div className="ml-[10px] border-l-[1px] border-[#31333D] pl-[10px]">
          <Copy content={address || ''} />
        </div>
      </div>
      {/* balance */}
      <div className="mt-[10px] flex w-full items-center gap-[17px]">
        <Tooltips
          title={formatNumber(accountBalance ?? '0', {
            showUnit: false,
          })}
        >
          <p className="flex-[1_1_0%] truncate text-[28px] font-bold">
            {isLoading
              ? '--'
              : formatNumber(accountBalance ?? '0', {
                  showUnit: false,
                })}
            <span className="ml-[4px] flex-shrink-0 text-[14px] leading-[28px]">USDC</span>
          </p>
        </Tooltips>

        <PrimaryButton
          style={{
            flexShrink: 0,
            borderRadius: '6px',
            height: '32px',
            fontSize: '12px',
            fontWeight: 500,
            width: '91px',
          }}
          onClick={() => setReceiveDialogOpen(true)}
        >
          <Trans>Deposit</Trans>
        </PrimaryButton>
        <ReceiveDialog
          address={address as string}
          chainId={homeStore.chainId}
          open={receiveDialogOpen}
          onClose={() => setReceiveDialogOpen(false)}
          symbol="USDC"
        />
      </div>
    </div>
  )
}
