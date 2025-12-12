import WalletIcon from '@/assets/home/wallet-icon.png'
import { Copy } from '@/components/Copy'
import { ArrowDown } from '@/components/Icon'
import { PrimaryButton } from '@/components/UI/Button'
import { formatNumber } from '@/utils/number'
import { truncateAddress } from '@/utils/string'
import { Trans } from '@lingui/react/macro'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'

export const AccountInfo = () => {
  const { address } = useWalletConnection()
  return (
    <div className="mt-[9px] w-full px-[16px]">
      {/* wallet */}
      <div className="flex items-center">
        <img src={WalletIcon} className="w-[20px]" />
        <div className="ml-[6px] flex items-center">
          <p className="text-[14px] leading-[1] font-medium text-[#CED1D9]">
            {truncateAddress(address || '')}
          </p>
          <span className="ml-[4px] flex" role="button">
            <ArrowDown size={14} color="#CED1D9" />
          </span>
        </div>
        <div className="ml-[10px] border-l-[1px] border-[#31333D] pl-[10px]">
          <Copy content="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" />
        </div>
      </div>
      {/* balance */}
      <div className="mt-[10px] flex w-full items-center gap-[17px]">
        <p className="line-clamp-2 flex-[1_1_0%] text-[28px] font-bold break-all">
          {formatNumber(10000000, {
            showUnit: false,
          })}
          <span className="ml-[4px] flex-shrink-0 text-[14px] leading-[28px]">USDC</span>
        </p>
        <PrimaryButton
          style={{
            flexShrink: 0,
            borderRadius: '6px',
            height: '32px',
            fontSize: '12px',
            fontWeight: 500,
            width: '107px',
          }}
        >
          <Trans>Deposit</Trans>
        </PrimaryButton>
      </div>
    </div>
  )
}
