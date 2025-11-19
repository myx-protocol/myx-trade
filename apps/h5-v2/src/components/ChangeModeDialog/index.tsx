import { t } from '@lingui/core/macro'
import { DialogBase } from '../UI/DialogBase'
import useGlobalStore from '@/store/globalStore'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { encryptionAddress } from '@/utils'
import { Trans } from '@lingui/react/macro'
import { useGetWalletBalance } from '@/hooks/balance/use-get-wallet-balance'
import { parseBigNumber } from '@/utils/bn'
import { useMemo } from 'react'
import { ethers } from 'ethers'
import { useGetAccountPoolAssets } from '@/hooks/balance/use-get-account-pool-Assets'
import { useTradePageStore } from '../Trade/store/TradePageStore'
import { formatNumber } from '@/utils/number'
import { TradeMode } from '@/pages/Trade/types'
import { InfoButton, PrimaryButton } from '../UI/Button'
import disable from '@/assets/icon/commons/disable.svg'
import enable from '@/assets/icon/commons/enable.svg'

export const ChangeModeDialog = () => {
  const { changeModeDialogOpen, setChangeModeDialogOpen, tradeMode, setTradeMode } =
    useGlobalStore()
  const { address } = useWalletConnection()
  const tokenBalanceString = useGetWalletBalance()
  const { symbolInfo } = useTradePageStore()
  const walletBalance =
    ethers.formatUnits(tokenBalanceString, symbolInfo?.quoteDecimals ?? 6) ?? '0'
  const accountPoolAssets = useGetAccountPoolAssets(symbolInfo?.poolId as string)

  const totalBalance = useMemo(() => {
    const freeAmount =
      ethers.formatUnits(accountPoolAssets?.freeAmount ?? '0', symbolInfo?.quoteDecimals ?? 6) ??
      '0'

    return parseBigNumber(walletBalance ?? 0)
      .plus(parseBigNumber(freeAmount))
      .toString()
  }, [walletBalance, accountPoolAssets, symbolInfo?.quoteDecimals])

  return (
    <DialogBase
      title={t`Choose Your Account Mode`}
      open={changeModeDialogOpen}
      onClose={() => setChangeModeDialogOpen(false)}
      sx={{
        '& .MuiDialog-paper': {
          paddingLeft: 0,
          paddingRight: 0,
          width: '640px',
        },
        '& .MuiDialogTitle-root': {
          paddingLeft: '20px',
          marginRight: '20px',
        },
      }}
    >
      <div className="flex flex-col gap-[16px] p-[16px]">
        <p className="mt-[6px] text-[#9397a3]">
          <Trans>
            Connected wallet: {encryptionAddress(address)}. Please select your preferred trading
            mode.
          </Trans>
        </p>
        <div className="flex gap-[12px]">
          <div
            className="rounded-[12px] border-[1px] bg-[#202129] px-[20px] py-[24px]"
            style={{
              borderColor: tradeMode === TradeMode.Classic ? '#9397A3' : 'transparent',
            }}
          >
            <p className="item-center flex h-[30px] gap-[6px]">
              <span className="text-[18px] font-[700] text-[white]">
                <Trans>Classic Account</Trans>
              </span>
              {tradeMode === TradeMode.Classic && (
                <p className="ml-[6px] flex items-center rounded-[4px] border-[1px] border-[#9397A3] px-[8px] py-[4px] text-[10px] leading-[10px] text-[#9397A3]">
                  <Trans>Recent</Trans>
                </p>
              )}
            </p>
            <div>
              <span className="mt-[12px] text-[18px] font-[700] text-[white]">
                $
                {formatNumber(totalBalance, {
                  decimals: 2,
                  showUnit: false,
                })}
              </span>{' '}
              <span className="ml-[4px] text-[12px] leading-[12px] text-[#9397A3]">
                <Trans>Available</Trans>(Arbitrum)
              </span>
            </div>
            <div className="h-[40px]">
              <p className="mt-[12px] font-[500] text-[white]">
                <Trans>User who prefer classic DeFi UX</Trans>
              </p>
            </div>
            <div className="mt-[12px]">
              {tradeMode === TradeMode.Classic && (
                <InfoButton
                  className="w-full"
                  disabled
                  style={{ height: '36px', borderRadius: '40px' }}
                >
                  <Trans>Your Current Mode</Trans>
                </InfoButton>
              )}
              {tradeMode === TradeMode.Seamless && (
                <PrimaryButton
                  className="w-full"
                  style={{ height: '36px', borderRadius: '40px' }}
                  onClick={() => {
                    setTradeMode(TradeMode.Classic)
                    setChangeModeDialogOpen(false)
                  }}
                >
                  <Trans>Choose</Trans>
                </PrimaryButton>
              )}
            </div>
            <div className="mt-[24px]">
              <p className="text-[12px] font-[500] text-[#9397A3]">
                <Trans>Custody</Trans>
              </p>
              <p className="mt-[8px] text-[14px] font-[500] text-[white]">
                <Trans>EOA Wallet</Trans>
              </p>
            </div>
            <div className="mt-[24px]">
              <p className="text-[12px] font-[500] text-[#9397A3]">
                <Trans>Auto-Signatures</Trans>
              </p>
              <div className="mt-[8px] flex items-center gap-[4px] text-[14px] font-[500] text-[white]">
                <img src={disable} className="h-[10px] w-[10px]" />
                <span className="text-[white]">
                  <Trans>Per trade</Trans>
                </span>
              </div>
            </div>
            <div className="mt-[24px]">
              <p className="text-[12px] font-[500] text-[#9397A3]">
                <Trans>Gasless trading</Trans>
              </p>
              <div className="mt-[8px] flex items-center gap-[4px] text-[14px] font-[500] text-[white]">
                <img src={disable} className="h-[10px] w-[10px]" />
                <span className="text-[white]">
                  <Trans>No</Trans>
                </span>
              </div>
            </div>
            <div className="mt-[24px]">
              <p className="text-[12px] font-[500] text-[#9397A3]">
                <Trans>Wallet connection</Trans>
              </p>
              <div className="mt-[8px] flex items-center gap-[4px] text-[14px] font-[500] text-[white]">
                <img src={disable} className="h-[10px] w-[10px]" />
                <span className="text-[white]">
                  <Trans>Required</Trans>
                </span>
              </div>
            </div>
            <div className="mt-[24px]">
              <p className="text-[12px] font-[500] text-[#9397A3]">
                <Trans>Bridge/Swap</Trans>
              </p>
              <div className="mt-[8px] flex items-center gap-[4px] text-[14px] font-[500] text-[white]">
                <img src={disable} className="h-[10px] w-[10px]" />
                <span className="text-[white]">
                  <Trans>Manual</Trans>
                </span>
              </div>
            </div>
          </div>
          <div
            className="rounded-[12px] border-[1px] bg-[#202129] px-[20px] py-[24px]"
            style={{
              borderColor: tradeMode === TradeMode.Seamless ? '#9397A3' : 'transparent',
            }}
          >
            <p className="item-center flex h-[30px] gap-[6px]">
              <span className="text-[18px] font-[700] text-[white]">
                <Trans>Seamless Account</Trans>
              </span>
              {tradeMode === TradeMode.Seamless && (
                <p className="ml-[6px] flex items-center rounded-[4px] border-[1px] border-[#9397A3] px-[8px] text-[10px] leading-[10px] text-[#9397A3]">
                  <Trans>Recent</Trans>
                </p>
              )}
            </p>
            <div>
              <span className="mt-[12px] text-[18px] font-[700] text-[white]">
                $
                {formatNumber(totalBalance, {
                  decimals: 2,
                  showUnit: false,
                })}
              </span>{' '}
              <span className="ml-[4px] text-[12px] leading-[12px] text-[#9397A3]">
                <Trans>Available</Trans>(Arbitrum)
              </span>
            </div>
            <div className="h-[40px]">
              <p className="mt-[12px] font-[500] text-[white]">
                <Trans>Frequent traders on one chain</Trans>
              </p>
            </div>
            <div className="mt-[12px]">
              {tradeMode === TradeMode.Seamless && (
                <InfoButton
                  className="w-full"
                  disabled
                  style={{ height: '36px', borderRadius: '40px' }}
                >
                  <Trans>Your Current Mode</Trans>
                </InfoButton>
              )}
              {tradeMode === TradeMode.Classic && (
                <PrimaryButton
                  className="w-full"
                  style={{ height: '36px', borderRadius: '40px' }}
                  onClick={() => {
                    setTradeMode(TradeMode.Seamless)
                    setChangeModeDialogOpen(false)
                  }}
                >
                  <Trans>Choose</Trans>
                </PrimaryButton>
              )}
            </div>
            <div className="mt-[24px]">
              <p className="text-[12px] font-[500] text-[#9397A3]">
                <Trans>Custody</Trans>
              </p>
              <p className="mt-[8px] text-[14px] font-[500] text-[white]">
                <Trans>EOA Wallet</Trans>
              </p>
            </div>
            <div className="mt-[24px]">
              <p className="text-[12px] font-[500] text-[#9397A3]">
                <Trans>Auto-Signatures</Trans>
              </p>
              <div className="mt-[8px] flex items-center gap-[4px] text-[14px] font-[500] text-[white]">
                <img src={enable} className="h-[10px] w-[10px]" />
                <span className="text-[white]">
                  <Trans>Auto-Signed</Trans>
                </span>
              </div>
            </div>
            <div className="mt-[24px]">
              <p className="text-[12px] font-[500] text-[#9397A3]">
                <Trans>Gasless trading</Trans>
              </p>
              <div className="mt-[8px] flex items-center gap-[4px] text-[14px] font-[500] text-[white]">
                <img src={enable} className="h-[10px] w-[10px]" />
                <span className="text-[white]">
                  <Trans>Yes</Trans>
                </span>
              </div>
            </div>
            <div className="mt-[24px]">
              <p className="text-[12px] font-[500] text-[#9397A3]">
                <Trans>Wallet connection</Trans>
              </p>
              <div className="mt-[8px] flex items-center gap-[4px] text-[14px] font-[500] text-[white]">
                <img src={enable} className="h-[10px] w-[10px]" />
                <span className="text-[white]">
                  <Trans>Not Required</Trans>
                </span>
              </div>
            </div>
            <div className="mt-[24px]">
              <p className="text-[12px] font-[500] text-[#9397A3]">
                <Trans>Bridge/Swap</Trans>
              </p>
              <div className="mt-[8px] flex items-center gap-[4px] text-[14px] font-[500] text-[white]">
                <img src={disable} className="h-[10px] w-[10px]" />
                <span className="text-[white]">
                  <Trans>Manual</Trans>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogBase>
  )
}
