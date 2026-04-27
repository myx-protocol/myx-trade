import { DialogBase } from '@/components/UI/DialogBase'
import { t } from '@lingui/core/macro'
import useGlobalStore from '@/store/globalStore'
import { Trans } from '@lingui/react/macro'
import { useGetAllQuoteTokenAuthStatus } from '@/hooks/seamless/use-get-seamless-auth-status'
import LogoUSDC from '@/assets/icon/chainIcon/usdc.svg'
import LogoUSDT from '@/assets/icon/chainIcon/usdt.svg'
import { CHAIN_INFO } from '@/config/chainInfo'
import { encryptionAddress } from '@/utils'
import { Switch } from '@/components/UI/Switch'
import { Copy } from '@/components/Copy'
import { toast } from '@/components/UI/Toast'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { showErrorToast } from '@/config/error'
import { useState } from 'react'

export const ManageAuthorizedTokensDialog = () => {
  const { manageAuthorizedTokensDialogOpen, setManageAuthorizedTokensDialogOpen } = useGlobalStore()
  const { quoteTokenAuthStatus } = useGetAllQuoteTokenAuthStatus()
  const { activeSeamlessAddress, seamlessAccountList } = useSeamlessStore()
  const { client } = useMyxSdkClient()
  const [loading, setLoading] = useState(false)

  return (
    <DialogBase
      title={t`Manage Authorized Tokens`}
      open={manageAuthorizedTokensDialogOpen}
      onClose={() => setManageAuthorizedTokensDialogOpen(false)}
      sx={{
        '& .MuiDialog-paper': {
          paddingLeft: 0,
          paddingRight: 0,
          width: '390px',
          maxHeight: '60vh',
          minHeight: '400px',
        },
        '& .MuiDialogTitle-root': {
          paddingLeft: '20px',
          marginRight: '20px',
        },
      }}
    >
      <p className="px-[20px] pt-[4px] text-[14px] leading-[14px] leading-[120%] font-medium text-[#848E9C]">
        <Trans>Enable or disable seamless authorization for your assets.</Trans>
      </p>
      <div className="mt-[8px] px-[20px]">
        {quoteTokenAuthStatus?.map((item) => {
          const chainInfo = CHAIN_INFO[item.chainId]
          return (
            <div
              key={item.quoteToken}
              className="flex items-center justify-between gap-[12px] py-[12px]"
            >
              <div className="relative h-[36px] w-[36px]">
                <img
                  className="h-[36px] w-[36px] rounded-[50%]"
                  src={item.quoteSymbol === 'USDC' ? LogoUSDC : LogoUSDT}
                  alt=""
                />
                <img
                  src={chainInfo?.logoUrl}
                  alt=""
                  className="absolute right-0 bottom-0 z-[1] h-[12px] w-[12px] rounded-[50%]"
                />
              </div>
              <div className="flex-1">
                <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                  {item.quoteSymbol}
                </p>
                <div
                  className="mt-[4px] flex items-center gap-[4px] text-[12px] leading-[12px] text-[#848E9C]"
                  onClick={() => {
                    navigator.clipboard.writeText(item.quoteToken)
                    toast.success({
                      title: t`Copy success`,
                    })
                  }}
                >
                  <span>{encryptionAddress(item.quoteToken)}</span>
                  <Copy content={item.quoteToken} className="cursor-pointer" />
                </div>
              </div>
              <Switch
                disabled={loading}
                checked={item.auth}
                onChange={async () => {
                  const activeSeamlessAccount = seamlessAccountList.find(
                    (item) => item.masterAddress === activeSeamlessAddress,
                  )
                  try {
                    setLoading(true)
                    const rs = await client?.seamless.authorizeSeamlessAccount({
                      approve: !item.auth,
                      seamlessAddress: activeSeamlessAccount?.seamlessAddress as string,
                      chainId: item.chainId as number,
                      forwardFeeToken: item.quoteToken as string,
                    })

                    if (rs?.code === 0) {
                      toast.success({
                        title: t`Authorize success`,
                      })
                    } else if (rs?.message !== 'User Rejected') {
                      toast.error({
                        title: t`Authorize failed`,
                      })
                    }
                  } catch (e) {
                    showErrorToast(e)
                  } finally {
                    setLoading(false)
                  }
                }}
              />
            </div>
          )
        })}
      </div>
    </DialogBase>
  )
}
