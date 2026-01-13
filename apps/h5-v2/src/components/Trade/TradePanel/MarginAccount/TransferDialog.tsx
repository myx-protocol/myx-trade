import { InfoButton, PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { DialogBase } from '@/components/UI/DialogBase'
import { useMemo, useState } from 'react'
import { t } from '@lingui/core/macro'
import ChangePosition from '@/components/Icon/set/ChangePosition'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'

import { ethers } from 'ethers'
import { displayAmount } from '@/utils/number'
import { InfoIcon } from '@/components/UI/Icon'
import { toast } from '@/components/UI/Toast'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { parseBigNumber } from '@/utils/bn'
import usdcIcon from '@/assets/icon/chainIcon/usdc.svg'
import usdtIcon from '@/assets/icon/chainIcon/usdt.svg'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck'
import { useBoolean } from 'ahooks'
import { NumberInputSourceType } from '@/components/UI/NumberInput/types'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useGetAccountAssets } from '@/hooks/balance/use-get-account-assets'
import { AmountUnitEnum } from '../../type'
import { MenuItem, Select, Tooltip } from '@mui/material'
import useGlobalStore from '@/store/globalStore'
import dayjs from 'dayjs'

const TransferType = {
  Wallet: 'wallet',
  Account: 'account',
} as const

type TransferType = (typeof TransferType)[keyof typeof TransferType]

export const TransferDialogButton = () => {
  const [loading, setLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const { symbolInfo } = useGlobalStore()
  const { client } = useMyxSdkClient(symbolInfo?.chainId)
  const { address } = useWalletConnection()
  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)
  const [transferType, setTransferType] = useState<TransferType>(TransferType.Account)
  const [amount, setAmount] = useState<string>('')
  const { poolList } = useGlobalStore()
  const pool = poolList.find((item: any) => item.poolId === symbolInfo?.poolId)
  const [tokenType, setTokenType] = useState<string>(AmountUnitEnum.QUOTE)

  const releaseTime = accountAssets.releaseTime
  const isExpired = dayjs().unix() > releaseTime

  const { checkWalletChainId } = useWalletChainCheck()

  const [isSwitchNetwork, { setTrue: setIsSwitchNetworkTrue, setFalse: setIsSwitchNetworkFalse }] =
    useBoolean(false)
  const handleTransfer = async () => {
    if (!symbolInfo?.chainId || !client) return
    setIsSwitchNetworkTrue()
    checkWalletChainId(symbolInfo.chainId).then(() => {
      setIsSwitchNetworkFalse()
      setOpen(true)
    })
  }

  const total = useMemo(() => {
    if (tokenType === AmountUnitEnum.QUOTE) {
      if (isExpired) {
        return (
          parseBigNumber(accountAssets?.freeMargin?.toString() ?? '0')
            .plus(parseBigNumber(accountAssets?.quoteProfit?.toString() ?? '0'))
            .toString() ?? '0'
        )
      }
      return accountAssets?.freeMargin?.toString() ?? '0'
    } else {
      if (isExpired) {
        return (
          parseBigNumber(accountAssets?.freeBaseAmount?.toString() ?? '0')
            .plus(parseBigNumber(accountAssets?.baseProfit?.toString() ?? '0'))
            .toString() ?? '0'
        )
      }
      return accountAssets?.freeBaseAmount?.toString() ?? '0'
    }
  }, [tokenType, accountAssets, isExpired])

  return (
    <>
      <PrimaryButton className="w-full" onClick={handleTransfer} loading={isSwitchNetwork}>
        <Trans>Transfer</Trans>
      </PrimaryButton>
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
            <div className="mt-[8px] h-[80px] rounded-[16px] bg-[#202129] p-[16px]">
              <p className="text-[14px] font-[500] text-[#848E9C]">
                <Trans>Asset</Trans>
              </p>
              {transferType === TransferType.Wallet ? (
                <div className="mt-[12px] flex items-center gap-[8px]">
                  <img
                    src={symbolInfo?.quoteSymbol === 'USDT' ? usdtIcon : usdcIcon}
                    alt=""
                    className="h-[20px] w-[20px]"
                  />
                  <span className="text-[14px] font-[500] text-[white]">
                    {symbolInfo?.quoteSymbol}
                  </span>
                </div>
              ) : (
                <Select
                  className="mt-[13px] w-full"
                  value={tokenType}
                  onChange={(e) => setTokenType(e.target.value)}
                  renderValue={(value) => {
                    const isQuote = value === AmountUnitEnum.QUOTE

                    return (
                      <div className="flex h-[20px] items-center gap-[8px]">
                        <img
                          src={
                            isQuote
                              ? pool?.quoteSymbol === 'USDT'
                                ? usdtIcon
                                : usdcIcon
                              : pool?.baseTokenIcon
                          }
                          alt=""
                          className="h-[20px] w-[20px] rounded-full"
                        />
                        <span className="text-[14px] font-[500] text-white">
                          {isQuote ? pool?.quoteSymbol : pool?.baseSymbol}
                        </span>
                      </div>
                    )
                  }}
                  sx={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    height: '20px',
                    minHeight: '20px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    '& .MuiSelect-icon': {
                      color: 'white',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    },
                    '& .MuiSelect-select': {
                      padding: '0',
                      paddingRight: '24px !important',
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '20px !important',
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        width: '356px',
                        backgroundColor: '#202129',
                        borderRadius: '16px',
                        marginTop: '8px',
                        padding: '4px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        '& .MuiList-root': {
                          padding: 0,
                        },
                      },
                    },
                  }}
                >
                  <MenuItem
                    value={AmountUnitEnum.QUOTE}
                    sx={{
                      borderRadius: '12px',
                      padding: '12px 16px',
                      '&:hover': {
                        backgroundColor: '#2A2B33',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#2A2B33',
                        '&:hover': {
                          backgroundColor: '#2A2B33',
                        },
                      },
                    }}
                  >
                    <div className="flex h-[44px] w-full items-center justify-between">
                      <div className="flex items-center gap-[12px]">
                        <img
                          src={pool?.quoteSymbol === 'USDT' ? usdtIcon : usdcIcon}
                          alt=""
                          className="h-[20px] w-[20px]"
                        />
                        <span className="text-[14px] font-[500] text-white">
                          {pool?.quoteSymbol}
                        </span>
                      </div>
                      {tokenType === AmountUnitEnum.QUOTE && (
                        <div className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#00E3A5]">
                          <svg
                            width="8"
                            height="6"
                            viewBox="0 0 14 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 5L5 9L13 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </MenuItem>
                  <MenuItem
                    value={AmountUnitEnum.BASE}
                    sx={{
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginTop: '4px',
                      '&:hover': {
                        backgroundColor: '#2A2B33',
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#2A2B33',
                        '&:hover': {
                          backgroundColor: '#2A2B33',
                        },
                      },
                    }}
                  >
                    <div className="flex h-[44px] w-full items-center justify-between">
                      <div className="flex items-center gap-[12px]">
                        <img
                          src={pool?.baseTokenIcon}
                          alt=""
                          className="h-[20px] w-[20px] rounded-full"
                        />
                        <span className="text-[14px] font-[500] text-white">
                          {pool?.baseSymbol}
                        </span>
                      </div>
                      {tokenType === AmountUnitEnum.BASE && (
                        <div className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#00E3A5]">
                          <svg
                            width="8"
                            height="6"
                            viewBox="0 0 14 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 5L5 9L13 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </MenuItem>
                </Select>
              )}
            </div>
            <div className="mt-[8px] h-[80px] rounded-[16px] bg-[#202129] p-[16px]">
              <p className="text-[14px] font-[500] text-[#848E9C]">
                <Trans>Amount</Trans>
              </p>
              <div className="flex items-center gap-[4px]">
                <NumberInputPrimitive
                  className="text-[24px] font-[500] text-[white]"
                  value={amount}
                  placeholder={t`Please Enter`}
                  inputMode="decimal"
                  decimalScale={6}
                  thousandSeparator=","
                  decimalSeparator="."
                  onValueChange={(values, sourceInfo) => {
                    if (sourceInfo.source === NumberInputSourceType.EVENT) {
                      setAmount(values.value)
                    }
                  }}
                />
                <span
                  className="cursor-pointer text-[14px] font-[500] text-[#00E3A5]"
                  onClick={() => {
                    if (transferType === TransferType.Wallet) {
                      setAmount(accountAssets?.walletBalance?.toString() ?? '0')
                    } else {
                      setAmount(total)
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
              <div className="flex items-center gap-[8px] text-[12px]">
                {transferType === 'wallet' ? (
                  <span className="text-[white]">
                    {displayAmount(accountAssets?.walletBalance?.toString() ?? '0', 6)}{' '}
                    {symbolInfo?.quoteSymbol}
                  </span>
                ) : (
                  <span className="text-[white]">
                    {displayAmount(total)}{' '}
                    {tokenType === AmountUnitEnum.QUOTE
                      ? symbolInfo?.quoteSymbol
                      : symbolInfo?.baseSymbol}
                  </span>
                )}
                <Tooltip
                  title={
                    transferType === TransferType.Wallet
                      ? t`钱包内可划转至保证金账户的余额`
                      : t`保证金账户可划转到钱包的余额`
                  }
                >
                  <InfoIcon className="h-[16px] w-[16px]" />
                </Tooltip>
              </div>
            </div>
            <div className="mt-[20px]">
              <PrimaryButton
                loading={loading}
                className="w-full rounded-[44px]"
                style={{
                  height: '44px',
                  fontSize: '14px',
                  borderRadius: '44px',
                  fontWeight: '500',
                }}
                onClick={async () => {
                  if (amount === '') {
                    toast.error({ title: t`Please Enter Amount` })
                    return
                  }

                  if (parseBigNumber(amount).lte(0)) {
                    toast.error({ title: t`Amount must be greater than 0` })
                    return
                  }

                  try {
                    setLoading(true)
                    if (transferType === TransferType.Wallet) {
                      if (
                        parseBigNumber(amount.toString()).gt(
                          parseBigNumber(accountAssets?.walletBalance?.toString() ?? '0'),
                        )
                      ) {
                        toast.error({ title: t`Insufficient Balance` })
                        return
                      }
                      const formatAmount = ethers.parseUnits(amount, symbolInfo?.quoteDecimals ?? 6)

                      const rs = await client?.account.deposit({
                        amount: formatAmount.toString(),
                        tokenAddress: symbolInfo?.quoteToken as string,
                        chainId: symbolInfo?.chainId as number,
                      })
                      if (rs?.code === 0) {
                        toast.success({ title: t`Transfer Success` })
                        setOpen(false)
                      } else {
                        toast.error({ title: t`Transfer Failed` })
                      }
                    } else {
                      const formatAmount = ethers.parseUnits(
                        amount,
                        tokenType === AmountUnitEnum.QUOTE
                          ? (symbolInfo?.quoteDecimals ?? 6)
                          : (symbolInfo?.baseDecimals ?? 6),
                      )
                      let maxAmount = '0'
                      if (tokenType === AmountUnitEnum.QUOTE) {
                        maxAmount = accountAssets?.freeMargin?.toString() ?? '0'
                      } else {
                        maxAmount = accountAssets?.freeBaseAmount?.toString() ?? '0'
                      }
                      if (parseBigNumber(amount.toString()).gt(parseBigNumber(maxAmount))) {
                        toast.error({ title: t`Insufficient Balance` })
                        return
                      }
                      const rs = await client?.account.withdraw({
                        poolId: symbolInfo?.poolId as string,
                        chainId: symbolInfo?.chainId as number,
                        receiver: address as string,
                        amount: formatAmount.toString(),
                        isQuoteToken: tokenType === AmountUnitEnum.QUOTE,
                      })
                      if (rs?.code === 0) {
                        toast.success({ title: t`Transfer Success` })
                        setOpen(false)
                      } else {
                        console.log('rs-->', rs)
                        toast.error({ title: t`Transfer Failed` })
                      }
                    }
                  } catch (e) {
                    console.log(e)
                    toast.error({ title: t`Transfer Failed` })
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
