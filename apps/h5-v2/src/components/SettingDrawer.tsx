import { Drawer } from '@/components/UI/Drawer'
import { Trans } from '@lingui/react/macro'
import IconArrowRight from '@/assets/svg/arrowRight.svg?react'
import { Switch } from '@/components/UI/Switch'
import { openUrl } from '@/utils'
import { MYX_GIT_BOOK_LINK } from '@/config'
import useGlobalStore from '@/store/globalStore'
import { TradeMode } from '@/pages/Trade/types'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useCallback, useMemo } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import LangSwitch from './UI/LangSwitch'
import { LOCALE_OPTIONS, type AVAILABLE_LOCALES } from '@/locales/locale'
import { useSwitchActiveLocale } from '@/hooks/useSwitchActiveLocale'
import { useTradePanelStore } from './Trade/TradePanel/store'
import { AmountUnitEnum } from './Trade/type'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { SecondHeader } from './SecondHeader'
import { styled } from '@mui/material'
import { t } from '@lingui/core/macro'
import { toast } from './UI/Toast'
import { getAsSupportedChainIdFn } from '@/config/chain'
import { useLocation } from 'react-router-dom'
import { RenderAuthorizedTokens } from '@/components/RenderAuthorizedTokens'

const StyledSwitch = styled(Switch)({
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      '& + .MuiSwitch-track': {
        backgroundColor: '#00996F',
      },
    },
  },
})

interface SettingDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const RenderAuthButton = () => {
  const { activeSeamlessAddress, seamlessAccountList, setSeamlessAccountList } = useSeamlessStore()
  const { chainId: currChainId } = useWalletConnection()
  const { symbolInfo } = useGlobalStore()

  const chainId = getAsSupportedChainIdFn(currChainId)
  const { client } = useMyxSdkClient(chainId)
  const isAuthorized = useMemo(() => {
    const activeSeamlessAccount = seamlessAccountList.find(
      (item) => item.masterAddress === activeSeamlessAddress,
    )
    if (!activeSeamlessAccount) {
      return false
    }

    return activeSeamlessAccount.authorized[symbolInfo?.poolId as string]?.authorized || false
  }, [seamlessAccountList, activeSeamlessAddress, chainId])

  if (isAuthorized) {
    return (
      <span
        className="cursor-pointer text-[14px] leading-[14px] font-medium text-[#848E9C]"
        onClick={async () => {
          const seamlessAccount = seamlessAccountList.find(
            (item) => item.masterAddress === activeSeamlessAddress,
          )

          if (!seamlessAccount) {
            return
          }
          const authRs = await client?.seamless.authorizeSeamlessAccount({
            approve: false,
            seamlessAddress: seamlessAccount.seamlessAddress,
            chainId: chainId as number,
            forwardFeeToken: symbolInfo?.quoteToken as string,
          })

          if (authRs?.code === 0) {
            const idx = seamlessAccountList.findIndex(
              (item) => item.masterAddress === activeSeamlessAddress,
            )
            const newSeamlessAccount = {
              ...seamlessAccountList[idx],
              authorized: {
                [symbolInfo?.poolId as string]: {
                  authorized: false,
                },
              },
            }
            seamlessAccountList[idx] = newSeamlessAccount
            setSeamlessAccountList([...seamlessAccountList])
            toast.success({
              title: t`Revoke seamless account success`,
            })
          } else {
            toast.error({
              title: t`Revoke seamless account failed`,
            })
          }
        }}
      >
        <Trans>Revoke</Trans>
      </span>
    )
  }
  return (
    <span
      className="cursor-pointer text-[14px] leading-[14px] font-medium text-[#00E3A5]"
      onClick={async () => {
        const seamlessAccount = seamlessAccountList.find(
          (item) => item.masterAddress === activeSeamlessAddress,
        )

        if (!seamlessAccount) {
          return
        }
        const authRs = await client?.seamless.authorizeSeamlessAccount({
          approve: true,
          seamlessAddress: seamlessAccount.seamlessAddress,
          chainId: chainId as number,
          forwardFeeToken: symbolInfo?.quoteToken as string,
        })

        if (authRs?.code === 0) {
          const idx = seamlessAccountList.findIndex(
            (item) => item.masterAddress === activeSeamlessAddress,
          )

          const newSeamlessAccount = {
            ...seamlessAccountList[idx],
            authorized: {
              [symbolInfo?.poolId as string]: {
                authorized: true,
              },
            },
          }

          seamlessAccountList[idx] = newSeamlessAccount
          setSeamlessAccountList([...seamlessAccountList])
        }
      }}
    >
      <Trans>Authorize</Trans>
    </span>
  )
}

const TradeSetting = () => {
  const { pathname } = useLocation()
  const { isConnected } = useWalletConnection()
  const isTradePage = pathname.includes('/trade')

  const {
    tradeMode,
    setImportSeamlessKeyDialogOpen,
    setResetPasswordDialogOpen,
    setExportSeamlessInfoDialogOpen,
    setAccountDialogOpen,
  } = useGlobalStore()

  return (
    <>
      {isTradePage && (
        <div className="px-[16px]">
          <div className="mt-[24px] mb-[40px] h-[1px] w-full bg-[#31333D]"></div>
          <div className="mb-[8px] text-[14px] font-medium text-[#848E9C]">
            <Trans>Trading Setting</Trans>
          </div>
          {isConnected && (
            <div
              className="flex cursor-pointer items-center justify-between py-[16px]"
              onClick={() => {
                setAccountDialogOpen(true)
              }}
            >
              <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                <Trans>Account Mode</Trans>
              </p>
              <p className="flex items-center text-[14px] leading-[14px] font-medium text-[#848E9C]">
                <span>
                  {tradeMode === TradeMode.Classic ? (
                    <Trans>Classic</Trans>
                  ) : (
                    <Trans>Seamless</Trans>
                  )}
                </span>
                <IconArrowRight className="h-[16px] w-[16px]" />
              </p>
            </div>
          )}
          {!isConnected && (
            <div
              className="flex cursor-pointer items-center justify-between py-[16px]"
              onClick={() => setImportSeamlessKeyDialogOpen(true)}
            >
              <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                <Trans>Import Seamless Key</Trans>
              </p>
              <p className="flex cursor-pointer items-center text-[14px] leading-[14px] font-medium text-[#848E9C]">
                <IconArrowRight className="h-[16px] w-[16px]" />
              </p>
            </div>
          )}
          {tradeMode === TradeMode.Seamless && (
            <>
              <div className="flex cursor-pointer items-center justify-between py-[16px]">
                <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                  <Trans>Authorized Tokens</Trans>
                </p>
                <RenderAuthorizedTokens />
              </div>
              <div
                className="flex cursor-pointer items-center justify-between py-[16px]"
                onClick={() => setResetPasswordDialogOpen(true)}
              >
                <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                  <Trans>Reset Password</Trans>
                </p>
                <p className="flex cursor-pointer items-center text-[14px] leading-[14px] font-medium text-[#848E9C]">
                  <IconArrowRight className="h-[16px] w-[16px]" />
                </p>
              </div>
              <div
                className="flex cursor-pointer items-center justify-between py-[16px]"
                onClick={() => setExportSeamlessInfoDialogOpen(true)}
              >
                <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                  <Trans>Export Seamless Key</Trans>
                </p>
                <p className="flex cursor-pointer items-center text-[14px] leading-[14px] font-medium text-[#848E9C]">
                  <IconArrowRight className="h-[16px] w-[16px]" />
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export const SettingDrawer = ({ open, onOpenChange }: SettingDrawerProps) => {
  const {
    setVipRedeemDialogOpen,
    activeLocale,
    showPlaceOrderConfirmDialog,
    setShowPlaceOrderConfirmDialog,
    showCloseOrderConfirmDialog,
    setShowCloseOrderConfirmDialog,
    shareCollateral,
    setShareCollateral,
  } = useGlobalStore()

  const switchActiveLocale = useSwitchActiveLocale()

  const handleSwitchLang = useCallback(
    async (lang: AVAILABLE_LOCALES) => {
      await switchActiveLocale(lang)
    },
    [switchActiveLocale],
  )

  const options = LOCALE_OPTIONS.map((option) => {
    return {
      label: option.shortLabel,
      value: option.locale,
    }
  })

  const { amountUnit, setAmountUnit } = useTradePanelStore()

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => onOpenChange(false)}
      sx={{
        width: '100%',
        padding: '0px',
        borderRadius: '0',
        background: '#101114',
        borderTop: 'none',
        borderBottom: 'none',
      }}
    >
      <SecondHeader onBack={() => onOpenChange(false)} title={<Trans>Setting</Trans>} />
      <div className="pb-[24px]">
        {/* basic setting */}
        <div className="px-[16px] pt-[16px]">
          <div className="mb-[10px] text-[14px] font-medium text-[#848E9C]">
            <Trans>基础设置</Trans>
          </div>
          {/* basic setting items */}
          {/* vip tickers */}
          <div
            className="flex cursor-pointer items-center justify-between py-[14px]"
            onClick={() => {
              setVipRedeemDialogOpen(true)
              onOpenChange(false)
            }}
          >
            <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
              <Trans>VIP Redeem Code</Trans>
            </p>
            <IconArrowRight className="h-[16px] w-[16px]" />
          </div>
          {/* open Position Confirmation */}
          <div className="flex items-center justify-between py-[14px]">
            <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
              <Trans>开仓二次确认</Trans>
            </p>
            <StyledSwitch
              checked={showPlaceOrderConfirmDialog}
              onChange={(_, checked) => {
                setShowPlaceOrderConfirmDialog(checked)
              }}
            />
          </div>
          {/* close position confirmation */}
          <div className="flex items-center justify-between py-[14px]">
            <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
              <Trans>平仓二次确认</Trans>
            </p>
            <StyledSwitch
              checked={showCloseOrderConfirmDialog}
              onChange={(_, checked) => {
                setShowCloseOrderConfirmDialog(checked)
              }}
            />
          </div>
          <div className="flex items-center justify-between py-[16px]">
            <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
              <Trans>仓位保证金共享</Trans>
            </p>
            <Switch
              checked={shareCollateral}
              onChange={(_, checked) => {
                setShareCollateral(checked)
              }}
            />
          </div>
        </div>
        {/* split line */}
        <TradeSetting />

        {/* split line */}
        <div className="my-[8px] h-[1px] w-full bg-[#3E3F47]">
          <div className="px-[16px] pt-[16px]">
            {/* other settings */}
            <div className="mb-[10px] text-[14px] font-medium text-[#848E9C]">
              <Trans>其他</Trans>
            </div>
            {/* gitbook */}
            <div className="flex w-full shrink-0 flex-row items-center justify-between py-[14px]">
              <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                <Trans>Language</Trans>
              </p>
              <LangSwitch value={activeLocale} onChange={handleSwitchLang} options={options} />
            </div>
            <div className="flex w-full shrink-0 flex-row items-center justify-between py-[14px]">
              <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                <Trans>Display Currency</Trans>
              </p>
              <LangSwitch<AmountUnitEnum>
                value={amountUnit}
                onChange={(value: AmountUnitEnum) => {
                  setAmountUnit(value as AmountUnitEnum)
                }}
                options={[
                  { label: 'USD', value: AmountUnitEnum.QUOTE },
                  {
                    label: 'Coin',
                    value: AmountUnitEnum.BASE,
                  },
                ]}
              />
            </div>
            <div
              className="flex cursor-pointer items-center justify-between py-[14px]"
              onClick={() => openUrl(MYX_GIT_BOOK_LINK)}
            >
              <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                <Trans>文档</Trans>
              </p>
              <IconArrowRight className="h-[16px] w-[16px]" />
            </div>
            {/* datas */}
            <div className="flex cursor-pointer items-center justify-between py-[14px]">
              <p className="text-[14px] leading-[14px] font-medium text-[#FFFFFF]">
                <Trans>数据</Trans>
              </p>
              <IconArrowRight className="h-[16px] w-[16px]" />
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
