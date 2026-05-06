import type { FavoritesDefaultItem as FavoritesDefaultItemType } from '@myx-trade/sdk'
import { PairLogo } from '../UI/PairLogo'
import { usePoolSymbol } from '@/hooks/pool/usePoolSymbol'
import { useChainInfo } from '@/hooks/chain/useChainInfo'
import { CheckBoxBorder, Checked } from '../Icon'
import clsx from 'clsx'

interface StyledCheckboxProps {
  checked: boolean
  onChange: () => void
  size?: number
}
const StyledCheckbox = ({ checked, onChange, size = 16 }: StyledCheckboxProps) => {
  if (!checked) {
    return <CheckBoxBorder role="button" onClick={onChange} color="#6D7180" size={size} />
  }
  return <Checked color="#fff" size={size} />
}

export interface FavoritesDefaultItemProps {
  item: FavoritesDefaultItemType
  size?: 'md' | 'lg' // md: py-[14px] px-[16px], lg: py-[20px] px-[16px]
  selected: boolean
  onSelectChange: (selected: boolean) => void
}

export const FavoritesDefaultItem = ({
  item,
  selected,
  onSelectChange,
  size = 'md',
}: FavoritesDefaultItemProps) => {
  const poolInfo = usePoolSymbol({
    poolId: item.poolId,
    chainId: item.chainId,
  })
  const chainInfo = useChainInfo(item.chainId)

  return (
    <div
      className={clsx(
        'bg-base flex items-center justify-between rounded-[10px] px-[16px] leading-none',
        {
          'py-[20px]': size === 'lg',
          'py-[14px]': size === 'md',
        },
      )}
      role="button"
      onClick={() => onSelectChange(!selected)}
    >
      <div className="flex items-center gap-[8px]">
        <PairLogo
          baseLogo={poolInfo?.baseTokenIcon}
          quoteLogo={chainInfo?.logoUrl}
          baseSymbol={poolInfo?.baseSymbol}
          quoteSymbol={poolInfo?.quoteSymbol}
          baseLogoSize={32}
          quoteLogoSize={12}
          quoteClassName="!ml-[-8px]"
        />
        <div className="flex flex-col gap-[2px]">
          <p className="text-[14px] font-medium text-white">{item.baseQuoteSymbol}</p>
          <p className="text-secondary mt-[6px] text-[12px] leading-[1]">{item.symbol}</p>
        </div>
      </div>
      <StyledCheckbox checked={selected} onChange={() => {}} />
    </div>
  )
}
