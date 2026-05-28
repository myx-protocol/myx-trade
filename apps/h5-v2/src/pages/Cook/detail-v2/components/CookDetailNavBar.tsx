import { BackIcon } from '@/components/Icon'
import { Copy } from '@/components/Copy'
import { PairLogo } from '@/components/UI/PairLogo'
import { AutoTooltips } from '@/components/AutoTooltips'
import { encryptionAddress } from '@/utils'
import { Box } from '@mui/material'

interface CookDetailNavBarProps {
  displayPairSymbol: string
  displayBaseTokenName: string
  displayAddress: string
  chainLabel?: string
  chainLogo?: string
  baseTokenIcon?: string
  onBack: () => void
  onOpenTokenSelectDialog: () => void
}

export const CookDetailNavBar = ({
  displayPairSymbol,
  displayBaseTokenName,
  displayAddress,
  chainLabel,
  chainLogo,
  baseTokenIcon,
  onBack,
  onOpenTokenSelectDialog,
}: CookDetailNavBarProps) => {
  return (
    <Box className="flex items-center gap-[8px] px-[12px] pt-[14px] pr-[16px]">
      <Box className="flex shrink-0 cursor-pointer items-center" onClick={onBack} role="button">
        <BackIcon size={24} />
      </Box>
      <Box
        className="flex min-w-0 flex-1 items-center gap-[8px]"
        role="button"
        onClick={onOpenTokenSelectDialog}
      >
        <PairLogo
          baseLogoSize={36}
          quoteLogoSize={12}
          baseSymbol={displayPairSymbol}
          quoteSymbol={chainLabel}
          quoteLogo={chainLogo}
          baseLogo={baseTokenIcon}
          baseClassName="rounded-[56px]"
          quoteClassName="rounded-[8px] border border-[#101114]"
        />
        <Box className="flex min-w-0 flex-col gap-[4px]">
          <span className="block max-w-full text-[16px] leading-none font-[700] text-white">
            <AutoTooltips title={displayPairSymbol} />
          </span>
          <Box className="flex min-w-0 items-center gap-[8px]">
            <span className="block max-w-[80px] shrink-0 truncate text-[12px] leading-none text-[#848E9C] capitalize">
              <AutoTooltips title={displayBaseTokenName} />
            </span>
            <Box className="flex min-w-0 items-center gap-[2px] text-[14px] leading-none text-[#848E9C]">
              <span className="truncate">{encryptionAddress(displayAddress)}</span>
              <Box
                className="flex shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <Copy content={displayAddress} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
