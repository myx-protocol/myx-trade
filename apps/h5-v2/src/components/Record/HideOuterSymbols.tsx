import { useCallback, type ReactNode } from 'react'
import { CheckBox } from '../UI/CheckBox'
import { FormControlLabel } from '../UI/FormControlLabel'
import { Select } from '@/components/UI/Select'
import { usePositionStore } from '@/store/position/createStore'
import { getChainInfo, type BaseChainInfo } from '@/config/chainInfo'
import { getSupportedChainIdsByEnv } from '@/config/chain'
import { t } from '@lingui/core/macro'
import allChainIcon from '@/assets/icon/allChain.svg'
import { Trans } from '@lingui/react/macro'

interface HideOuterSymbolsProps {
  checked: boolean
  onChange: (checked: boolean) => void
  right?: ReactNode
  showHideOther?: boolean
}

const CHAIN_LIST: Array<
  BaseChainInfo & {
    chainId: number
  }
> = getSupportedChainIdsByEnv().map((chainId) => {
  return {
    ...getChainInfo(chainId),
    chainId,
  }
})

export const HideOuterSymbols = ({
  checked,
  onChange,
  right,
  showHideOther = true,
}: HideOuterSymbolsProps) => {
  const { selectChainId, setSelectChainId } = usePositionStore()
  const onCheckedChange = useCallback(() => {
    onChange(!checked)
  }, [checked, onChange])
  return (
    <div className="flex items-center justify-between px-[16px] pt-[16px] pb-[10px]">
      <div className="flex flex-1 items-center justify-between">
        <Select
          isSingle
          value={selectChainId || '0'}
          onChange={(e) => setSelectChainId(e.target.value as string)}
          options={[
            {
              label: <span className="text-[12px] text-[#FFFFFF]">{t`All Chains`}</span>,
              value: '0',
              icon: <img src={allChainIcon} alt="allChain" className="h-[14px] w-[14px]" />,
            },
            ...CHAIN_LIST.map((chain) => ({
              label: <span className="text-[12px] text-[#FFFFFF]">{chain.label}</span>,
              value: chain.chainId.toString(),
              icon: (
                <img
                  src={chain.logoUrl}
                  alt={chain.label}
                  className="h-[14px] w-[14px] rounded-full"
                />
              ),
            })),
            // { label: 'Arbitrum', value: ChainId, icon: ethIcon },
          ]}
        />
        {showHideOther && (
          <div className="ml-[6px]">
            <FormControlLabel
              control={<CheckBox checked={checked} onChange={onCheckedChange} />}
              label={
                <span className="text-[12px] text-[#CED1D9]">
                  <Trans>Hide other</Trans>
                </span>
              }
            />
          </div>
        )}
      </div>
      {right && selectChainId !== '0' && <div className="shrink-0">{right}</div>}
    </div>
  )
}
