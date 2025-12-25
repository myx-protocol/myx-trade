import { t } from '@lingui/core/macro'
import { DialogBase } from '../UI/DialogBase'
import useGlobalStore from '@/store/globalStore'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { encryptionAddress } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { formatNumber } from '@/utils/number'
import { TradeMode } from '@/pages/Trade/types'
import { InfoButton, PrimaryButton } from '../UI/Button'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useGetAccountAssets } from '@/hooks/balance/use-get-account-assets'
import avatarIcon from '@/assets/icon/wallet/avatar.svg'
import CopyIcon from '../UI/Icon/CopyIcon'
import { toast } from '../UI/Toast'
import { useTradePanelStore } from '../Trade/TradePanel/store'

export const AccountDialog = () => {
  const {
    accountDialogOpen,
    setAccountDialogOpen,
    tradeMode,
    setTradeMode,
    setSeamlessPasswordDialogOpen,
    setUnlockAccountDialogOpen,
  } = useGlobalStore()
  const { address } = useWalletConnection()
  const { symbolInfo } = useGlobalStore()
  const { setReceiveDialogOpen } = useTradePanelStore()
  const { seamlessAccountList } = useSeamlessStore()
  const { client } = useMyxSdkClient(symbolInfo?.chainId)
  const { disconnect } = useWalletConnection()
  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)

  return (
    <DialogBase
      title={t`Wallet`}
      open={accountDialogOpen}
      onClose={() => setAccountDialogOpen(false)}
      sx={{
        '& .MuiDialog-paper': {
          paddingLeft: 0,
          paddingRight: 0,
          width: '390px',
        },
        '& .MuiDialogTitle-root': {
          paddingLeft: '20px',
          marginRight: '20px',
        },
      }}
    >
      <div className="mt-[34px] flex items-center justify-between gap-[4px] px-[16px]">
        <div className="flex items-center gap-[10px]">
          <img src={avatarIcon} className="h-[32px] w-[32px] rounded-[50%]" />
          <div className="ml-[10px] flex flex-col gap-[4px]">
            <div className="flex items-center gap-[10px]">
              <span className="text-[14px] font-[500] text-[white]">
                {encryptionAddress(address)}
              </span>
              <CopyIcon
                size={16}
                onClick={() => {
                  navigator.clipboard.writeText(address || '')
                  toast.success({
                    title: t`Copied to clipboard`,
                  })
                }}
              />
            </div>
            <div className="flex items-center gap-[4px]">
              <span className="mt-[2px] text-[14px] font-[500] text-[#848E9C]">
                {formatNumber(accountAssets?.availableMargin?.toString() ?? '0', {
                  decimals: 2,
                  showUnit: false,
                })}{' '}
                {symbolInfo?.quoteSymbol}
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-[4px]">
            <p
              className="rounded-[4px] px-[8px] py-[4px] text-[12px] font-[500]"
              style={{
                color: tradeMode === TradeMode.Classic ? 'white' : '#848E9C',
                backgroundColor: tradeMode === TradeMode.Classic ? '#00E3A5' : '#202129',
              }}
              onClick={async () => {
                await client?.seamless.startSeamlessMode({ open: false })
                setTradeMode(TradeMode.Classic)
              }}
            >{t`Classic`}</p>
            <p
              className="rounded-[4px] px-[8px] py-[4px] text-[14px] font-[500]"
              style={{
                color: tradeMode === TradeMode.Seamless ? 'white' : '#848E9C',
                backgroundColor: tradeMode === TradeMode.Seamless ? '#00E3A5' : '#202129',
              }}
              onClick={async () => {
                setAccountDialogOpen(false)

                if (seamlessAccountList.length === 0) {
                  setSeamlessPasswordDialogOpen(true)
                  return
                }

                setUnlockAccountDialogOpen(true)
              }}
            >{t`Seamless`}</p>
          </div>
        </div>
      </div>
      <div className="mt-[74px] flex flex-col items-center gap-[10px] px-[16px]">
        <PrimaryButton
          className="w-full"
          style={{ height: '44px', borderRadius: '44px' }}
          onClick={() => {
            setReceiveDialogOpen(true)
          }}
        >
          <Trans>Deposit</Trans>
        </PrimaryButton>
        <InfoButton
          className="w-full"
          style={{ height: '44px', borderRadius: '44px', color: '#FF3B30' }}
          onClick={async () => {
            await disconnect()
            setAccountDialogOpen(false)
          }}
        >
          <Trans>Log Out Wallet</Trans>
        </InfoButton>
      </div>
    </DialogBase>
  )
}
