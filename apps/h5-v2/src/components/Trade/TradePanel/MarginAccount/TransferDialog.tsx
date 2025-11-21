import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { DialogBase } from '@/components/UI/DialogBase'
import { useMemo, useState } from 'react'
import { useTradePageStore } from '../../store/TradePageStore'
import { t } from '@lingui/core/macro'
import ChangePosition from '@/components/Icon/set/ChangePosition'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { useGetWalletBalance } from '@/hooks/balance/use-get-wallet-balance'
import { ethers } from 'ethers'
import { displayAmount } from '@/utils/number'
import { InfoIcon } from '@/components/UI/Icon'
import { toast } from 'react-hot-toast'
import { useGetAccountPoolAssets } from '@/hooks/balance/use-get-account-pool-Assets'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { parseBigNumber } from '@/utils/bn'
import usdcIcon from '@/assets/icon/chainIcon/usdc.svg'
import usdtIcon from '@/assets/icon/chainIcon/usdt.svg'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck'
import { useBoolean } from 'ahooks'

const TransferType = {
  Wallet: 'wallet',
  Account: 'account',
} as const

type TransferType = (typeof TransferType)[keyof typeof TransferType]

export const TransferDialogButton = () => {
  const [loading, setLoading] = useState(false)
  const { client } = useMyxSdkClient()
  const [open, setOpen] = useState(false)
  const { symbolInfo } = useTradePageStore()
  const [transferType, setTransferType] = useState<TransferType>(TransferType.Wallet)
  const [amount, setAmount] = useState<string>('')
  const walletBalance = useGetWalletBalance()
  const accountPoolAssets = useGetAccountPoolAssets(symbolInfo?.poolId as string)
  const walletBalanceString = useMemo(() => {
    return ethers.formatUnits(walletBalance, symbolInfo?.quoteDecimals ?? 6)
  }, [walletBalance, symbolInfo?.quoteDecimals])
  const accountPoolAssetsString = useMemo(() => {
    return ethers.formatUnits(accountPoolAssets.freeAmount, symbolInfo?.quoteDecimals ?? 6)
  }, [accountPoolAssets.freeAmount, symbolInfo?.quoteDecimals])

  const { checkWalletChainId } = useWalletChainCheck()

  const [isSwitchNetwork, { setTrue: setIsSwitchNetworkTrue, setFalse: setIsSwitchNetworkFalse }] =
    useBoolean(false)
  const handleTransfer = async () => {
    if (!symbolInfo?.chainId) return
    setIsSwitchNetworkTrue()
    checkWalletChainId(symbolInfo.chainId).then(() => {
      setIsSwitchNetworkFalse()
      setOpen(true)
    })
  }

  return (
    <>
      <InfoButton className="w-full" onClick={handleTransfer} loading={isSwitchNetwork}>
        <Trans>Transfer</Trans>
      </InfoButton>
      {open && (
        <DialogBase
          title={t`Transfer` + ' '}
          open={open}
          onClose={() => setOpen(false)}
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
          <div className="p-[16px]">
            <div className="flex items-center justify-between gap-[16px] rounded-[16px] bg-[#202129] p-[16px]">
              <div className="flex-1">
                <div className="flex w-full items-center gap-[12px] py-[10px]">
                  <p className="w-[40px] text-[14px] font-[400] text-[#848E9C]">
                    <Trans>From</Trans>
                  </p>
                  {transferType === TransferType.Wallet ? (
                    <span className="text-[14px] font-[500] text-[#fff]">
                      <Trans>Wallet</Trans>
                    </span>
                  ) : (
                    <span className="text-[14px] font-[500] text-[#fff]">
                      {symbolInfo?.baseSymbol}
                      {symbolInfo?.quoteSymbol} <Trans>Margin Account</Trans>
                    </span>
                  )}
                </div>
                <div className="w-full border-t-[1px] border-[#31333D]"></div>
                <div className="flex w-full items-center gap-[12px] py-[10px]">
                  <p className="w-[40px] text-[14px] font-[400] text-[#848E9C]">
                    <Trans>To</Trans>
                  </p>
                  {transferType === TransferType.Wallet ? (
                    <span className="text-[14px] font-[500] text-[#fff]">
                      {symbolInfo?.baseSymbol}
                      {symbolInfo?.quoteSymbol} <Trans>Margin Account</Trans>
                    </span>
                  ) : (
                    <span className="text-[14px] font-[500] text-[#fff]">
                      <Trans>Wallet</Trans>
                    </span>
                  )}
                </div>
              </div>
              <div
                className="cursor-pointer p-[4px]"
                onClick={() => {
                  setTransferType(
                    transferType === TransferType.Wallet
                      ? TransferType.Account
                      : TransferType.Wallet,
                  )
                  setAmount('')
                }}
              >
                <ChangePosition size={14} color="white" />
              </div>
            </div>
            <div className="mt-[8px] rounded-[16px] bg-[#202129] p-[16px]">
              <p className="text-[14px] font-[500] text-[#848E9C]">
                <Trans>Asset</Trans>
              </p>
              <div className="mt-[15px] flex items-center gap-[4px]">
                <img
                  src={symbolInfo?.quoteSymbol === 'USDT' ? usdtIcon : usdcIcon}
                  alt=""
                  className="h-[20px] w-[20px]"
                />
                <span className="text-[white]">{symbolInfo?.quoteSymbol}</span>
              </div>
            </div>
            <div className="mt-[8px] rounded-[16px] bg-[#202129] p-[16px]">
              <p className="text-[14px] font-[500] text-[#848E9C]">
                <Trans>Amount</Trans>
              </p>
              <div className="mt-[15px] flex items-center gap-[4px]">
                <NumberInputPrimitive
                  className="text-[24px] font-[500] text-[white]"
                  value={amount}
                  placeholder={t`Please Enter`}
                  inputMode="decimal"
                  decimalScale={2}
                  thousandSeparator=","
                  decimalSeparator="."
                  onValueChange={(e) => setAmount(e.value)}
                />
                <span
                  className="cursor-pointer text-[14px] font-[500] text-[#00E3A5]"
                  onClick={() => {
                    if (transferType === TransferType.Wallet) {
                      const walletBalanceString = ethers
                        .formatUnits(walletBalance, symbolInfo?.quoteDecimals ?? 6)
                        .toString()
                      setAmount(walletBalanceString)
                    } else {
                      setAmount(accountPoolAssetsString)
                    }
                  }}
                >
                  Max
                </span>
              </div>
            </div>
            <div className="mt-[18px] flex items-center justify-between rounded-[16px]">
              <span className="text-[14px] font-[500] text-[#848E9C]">
                <Trans>Available</Trans>
              </span>
              <div className="flex items-center gap-[8px]">
                {transferType === 'wallet' ? (
                  <span className="text-[white]">
                    {displayAmount(walletBalanceString)} {symbolInfo?.quoteSymbol}
                  </span>
                ) : (
                  <span className="text-[white]">
                    {displayAmount(accountPoolAssetsString)} {symbolInfo?.quoteSymbol}
                  </span>
                )}
                <InfoIcon className="h-[16px] w-[16px]" />
              </div>
            </div>
            <div className="mt-[20px]">
              <PrimaryButton
                loading={loading}
                className="w-full rounded-[44px]"
                style={{
                  height: '44px',
                  borderRadius: '44px',
                  fontWeight: '500',
                }}
                onClick={async () => {
                  if (amount === '') {
                    toast.error(t`Please Enter Amount`)
                    return
                  }
                  const formatAmount = ethers.parseUnits(amount, symbolInfo?.quoteDecimals ?? 6)

                  try {
                    setLoading(true)
                    if (transferType === TransferType.Wallet) {
                      if (
                        parseBigNumber(amount.toString()).gt(parseBigNumber(walletBalanceString))
                      ) {
                        toast.error(t`Insufficient Balance`)
                        return
                      }
                      const rs = await client?.account.deposit({
                        poolId: symbolInfo?.poolId as string,
                        amount: formatAmount.toString(),
                        tokenAddress: symbolInfo?.quoteToken as string,
                      })
                      if (rs?.code === 0) {
                        toast.success(t`Transfer Success`)
                        setOpen(false)
                      } else {
                        console.log('rs-->', rs)
                        toast.error(t`Transfer Failed`)
                      }
                    } else {
                      if (
                        parseBigNumber(amount.toString()).gt(
                          parseBigNumber(accountPoolAssetsString),
                        )
                      ) {
                        toast.error(t`Insufficient Balance`)
                        return
                      }
                      const rs = await client?.account.withdraw({
                        poolId: symbolInfo?.poolId as string,
                        amount: formatAmount.toString(),
                      })
                      if (rs?.code === 0) {
                        toast.success(t`Transfer Success`)
                        setOpen(false)
                      } else {
                        console.log('rs-->', rs)
                        toast.error(t`Transfer Failed`)
                      }
                    }
                  } catch (e) {
                    console.log(e)
                    toast.error(t`Transfer Failed`)
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                <Trans>Transfer</Trans>
              </PrimaryButton>
            </div>
          </div>
        </DialogBase>
      )}
    </>
  )
}
