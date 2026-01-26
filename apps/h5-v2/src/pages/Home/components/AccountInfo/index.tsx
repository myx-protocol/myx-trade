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
import { Tooltips } from '@/components/UI/Tooltips'
import useGlobalStore from '@/store/globalStore'
import { ReceiveDialog } from '@/components/ReceiveDialog'
import { useState } from 'react'
import useSWR from 'swr'
import { parseBigNumber } from '@/utils/bn'

export const AccountInfo = () => {
  const { address } = useWalletConnection()
  const homeStore = useHomeStore()
  const { client, clientIsAuthenticated } = useMyxSdkClient(homeStore.chainId)
  const { setAccountDialogOpen } = useGlobalStore()
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const { poolList } = useGlobalStore()

  const { data: accountBalance, isLoading } = useSWR(
    address && client && clientIsAuthenticated && poolList.length > 0
      ? ['home-getAccountBalance', homeStore.chainId, address, poolList]
      : null,
    async () => {
      const res = await client?.account.getWalletQuoteTokenBalance(homeStore.chainId, address)
      const pool = poolList.find((item: any) => item.chainId === homeStore.chainId)

      return parseBigNumber(res?.data?.toString() || '0')
        .div(parseBigNumber(10).pow(pool?.quoteDecimals ?? 6))
        .toString()
    },
  )

  console.log('accountBalance-->', accountBalance)

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
      <div className="mt-[10px] flex w-full items-center">
        <Tooltips
          title={formatNumber(accountBalance ?? '0', {
            showUnit: false,
          })}
        >
          <p className="flex-[1_1_0%] truncate text-[28px] font-bold">
            {isLoading
              ? '--'
              : `$ ${formatNumber(accountBalance ?? '0', {
                  showUnit: false,
                })}`}
          </p>
        </Tooltips>
        <p className="mr-[17px] shrink-0 text-[28px] font-bold">USDC</p>

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
