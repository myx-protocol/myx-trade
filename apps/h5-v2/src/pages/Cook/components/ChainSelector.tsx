import { ChainId, getSupportedChainIdsByEnv } from '@/config/chain.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { SelectPanel } from '@/components/SelectPanel'

export const ChainSelector = ({
  chainId,
  setChainId,
}: {
  chainId?: number | ChainId
  setChainId: (chainId: number | ChainId) => void
}) => {
  return (
    <SelectPanel
      value={chainId}
      options={getSupportedChainIdsByEnv().map((_chainId) => {
        const { logoUrl, label } = CHAIN_INFO[_chainId]
        return {
          icon: logoUrl,
          label,
          value: _chainId,
        }
      })}
      onChange={(_value) => setChainId(_value as number)}
    />
  )
}
