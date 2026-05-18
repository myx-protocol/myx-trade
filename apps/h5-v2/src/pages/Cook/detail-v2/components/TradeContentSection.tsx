import { PairLogo } from '@/components/UI/PairLogo'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { TipsOutLine } from '@/components/Icon'
import { Tooltips } from '@/components/UI/Tooltips'
import { FormControlLabel } from '@/components/UI/FormControlLabel'
import { CheckBox } from '@/components/UI/CheckBox'
import { useCookOrderStore } from '@/components/CookDetail/Order/store'
import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { formatNumber } from '@/utils/number'
import { AutoTooltips } from '@/components/AutoTooltips'

type ActionType = 'deposit' | 'redeem' | 'activate'

interface TradeContentSectionProps {
  isActivate: boolean
  isDeposit: boolean
  activeAction: ActionType
  activeActionLabel: string
  displayBalance: number
  displayTokenSymbol: string
  displayTokenName: string
  chainLabel?: string
  chainLogo?: string
  baseTokenIcon?: string
  amount: string
  setAmount: (value: string) => void
  ratioList: Array<{ label: string; value: number | 'max' }>
  selectedRatio: string
  onClickRatio: (label: string, value: number | 'max') => void
  getRatioLabel: (ratio: string) => string
  activateAmount: number
  genesisYieldText: string
  /** 赎回 Base 金库 LP 时展示，与旧版 Sell 一致 */
  showRetainGenesisOption?: boolean
  displayTradeTokenSymbol?: string
}

export const TradeContentSection = ({
  isActivate,
  isDeposit,
  activeActionLabel,
  displayBalance,
  displayTokenSymbol,
  displayTokenName,
  chainLabel,
  chainLogo,
  baseTokenIcon,
  amount,
  setAmount,
  ratioList,
  selectedRatio,
  onClickRatio,
  getRatioLabel,
  activateAmount,
  genesisYieldText,
  showRetainGenesisOption = false,
  displayTradeTokenSymbol = displayTokenSymbol,
}: TradeContentSectionProps) => {
  const { retainGenesisLPShares, setRetainGenesisLPShares } = useCookOrderStore()
  return (
    <Box className="flex flex-col gap-[12px]">
      {isActivate ? (
        <Box className="flex flex-col gap-[16px] rounded-[10px] border border-[#292B33] px-[16px] py-[20px]">
          <Box className="flex items-center justify-between text-[14px]">
            <span className="text-[#CED1D9]">
              <Trans>支付</Trans>
            </span>
            <Box className="flex items-center gap-[4px] text-[#848E9C]">
              <span>
                <Trans>Balance:</Trans>
              </span>
              <span>
                {formatNumber(displayBalance, {
                  showUnit: false,
                })}
              </span>
            </Box>
          </Box>
          <Box className="flex items-center justify-between">
            <Box className="flex flex-shrink-0 items-center gap-[8px]">
              <PairLogo
                baseLogoSize={36}
                quoteLogoSize={10}
                baseLogo={baseTokenIcon}
                baseSymbol={displayTokenSymbol}
                quoteSymbol={chainLabel}
                quoteLogo={chainLogo}
                baseClassName="rounded-[56px]"
                quoteClassName="rounded-[8px] border border-[#18191F]"
              />
              <Box className="flex flex-col gap-[6px]">
                <span className="text-[16px] leading-none font-[700] text-white">
                  {displayTokenSymbol}
                </span>
                <span className="block max-w-[100px] text-[14px] leading-none text-[#848E9C]">
                  <AutoTooltips title={displayTradeTokenSymbol} />
                </span>
              </Box>
            </Box>
            <span className="line-clamp-2 flex-[1_1_0%] text-right text-[24px] leading-none font-[700] text-white">
              {formatNumber(activateAmount, {
                showUnit: false,
              })}
            </span>
          </Box>
        </Box>
      ) : (
        <Box className="flex flex-col gap-[16px] rounded-[10px] bg-[#18191F] px-[16px] py-[20px]">
          <Box className="flex items-center justify-between text-[14px]">
            <span className="text-[#848E9C]">{activeActionLabel}</span>
            <Box className="flex items-center gap-[4px] text-[#848E9C]">
              <span>
                <Trans>Balance:</Trans>
              </span>
              <span>
                {formatNumber(displayBalance, {
                  showUnit: false,
                })}
              </span>
            </Box>
          </Box>

          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-[8px] px-[4px] py-[4px]">
              <PairLogo
                baseLogoSize={36}
                quoteLogoSize={10}
                baseLogo={baseTokenIcon}
                baseSymbol={displayTokenSymbol}
                quoteSymbol={chainLabel}
                quoteLogo={chainLogo}
                baseClassName="rounded-[56px]"
                quoteClassName="rounded-[8px] border border-[#18191F]"
              />
              <Box className="flex flex-col gap-[8px]">
                <span className="text-[16px] leading-none font-[700] text-white">
                  {displayTokenSymbol}
                </span>
                <span className="block max-w-[100px] text-[14px] leading-none text-[#848E9C]">
                  <AutoTooltips title={displayTradeTokenSymbol} />
                </span>
              </Box>
            </Box>
            <NumberInputPrimitive
              value={amount}
              onValueChange={(values) => setAmount(values.value)}
              placeholder={isDeposit ? '0.00' : '0'}
              className="w-[180px] bg-transparent text-right text-[24px] leading-none font-[700] text-white outline-none placeholder:text-[#848E9C]"
            />
          </Box>

          <Box className="flex items-center gap-[8px]">
            {ratioList.map((ratio) => {
              const isActive = selectedRatio === ratio.label
              return (
                <Box
                  key={ratio.label}
                  role="button"
                  onClick={() => onClickRatio(ratio.label, ratio.value)}
                  className={`flex flex-1 items-center justify-center rounded-[20px] border px-[8px] py-[6px] text-[12px] leading-normal ${isActive ? 'border-[#848E9C] bg-[#202129] text-white' : 'border-[#31333D] text-[#848E9C]'}`}
                >
                  {getRatioLabel(ratio.label)}
                </Box>
              )
            })}
          </Box>

          {showRetainGenesisOption && (
            <FormControlLabel
              control={
                <CheckBox
                  checked={retainGenesisLPShares}
                  onChange={() => setRetainGenesisLPShares(!retainGenesisLPShares)}
                />
              }
              label={
                <Box className="flex items-center">
                  <span className="text-[14px] text-[#CED1D9]">
                    <Trans>保留创世LP份额</Trans>
                  </span>
                  <Tooltips
                    title={t`When checked, the system will only redeem your regular LP shares.`}
                  >
                    <span className="ml-[4px] flex cursor-pointer">
                      <TipsOutLine size={12} className="text-[#848E9C]" />
                    </span>
                  </Tooltips>
                </Box>
              }
            />
          )}
        </Box>
      )}

      {isDeposit && (
        <Box className="flex items-center justify-between rounded-[8px] border border-[#292B33] px-[20px] py-[12px]">
          <Box className="flex items-center gap-[4px] text-[14px] text-[#CED1D9]">
            <span>
              <Trans>创世收益</Trans>
            </span>
            <Tooltips title={t`创世 LP 可额外获得平台手续费分成。`}>
              <span className="flex">
                <TipsOutLine size={14} className="text-[#848E9C]" />
              </span>
            </Tooltips>
          </Box>
          <span className="text-[14px] font-[500] text-white">{genesisYieldText}</span>
        </Box>
      )}
    </Box>
  )
}
