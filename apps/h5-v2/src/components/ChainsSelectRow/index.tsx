import { getSupportedChainIdsByEnv } from '@/config/chain'
import { getChainInfo } from '@/config/chainInfo'
import ChainAllIcon from '@/components/Icon/set/ChainAll'
import { useMemo } from 'react'
import { Trans } from '@lingui/react/macro'
import clsx from 'clsx'
import { CoinIcon } from '../UI/CoinIcon'

interface ChainsSelectRowProps {
  chainIdSelected?: number
  showAllChains?: boolean
  onChainIdChange?: (chainId: number) => void
}

const ALL_CHAIN_VALUE = 0

const chainIdList = getSupportedChainIdsByEnv()

export const ChainsSelectRow = ({
  chainIdSelected,
  showAllChains = true,
  onChainIdChange,
}: ChainsSelectRowProps) => {
  const chainInfoList = useMemo(() => {
    return chainIdList
      .map((chainId) => {
        try {
          return {
            ...getChainInfo(chainId),
            chainId: chainId,
          }
        } catch (error) {
          return null
        }
      })
      .filter((item) => item !== null)
  }, [])
  return (
    <div className="flex w-full items-center justify-start gap-[12px] text-[12px]">
      {showAllChains && (
        <div
          className={clsx('flex items-center gap-[4px] rounded-[200px] p-[8px]', {
            'text-[#848E9C]': chainIdSelected !== ALL_CHAIN_VALUE,
            'bg-[#292B33] text-white': chainIdSelected === ALL_CHAIN_VALUE,
          })}
          role="button"
          onClick={() => {
            onChainIdChange?.(ALL_CHAIN_VALUE)
          }}
        >
          {chainIdSelected === ALL_CHAIN_VALUE && <ChainAllIcon color="#fff" size={16} />}
          <span>
            <Trans>All</Trans>
          </span>
        </div>
      )}
      {chainInfoList.map((chainInfo) => (
        <div
          key={chainInfo.chainId}
          className={clsx('flex items-center gap-[4px] rounded-[200px] p-[8px]', {
            'text-[#848E9C]': chainIdSelected !== chainInfo.chainId,
            'bg-[#292B33] text-white': chainIdSelected === chainInfo.chainId,
          })}
          role="button"
          onClick={() => {
            onChainIdChange?.(chainInfo.chainId)
          }}
        >
          {chainIdSelected === chainInfo.chainId && <CoinIcon size={16} icon={chainInfo.logoUrl} />}
          <span>{chainInfo.label}</span>
        </div>
      ))}
    </div>
  )
}
