import { ChainId, getSupportedChainIdsByEnv } from '@/config/chain.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { GlobalLine } from '@/components/Icon'

export const ChainsBar = ({
  chainId,
  setChainId,
  className = '',
}: {
  chainId?: number | ChainId
  setChainId: (chainId?: number | ChainId) => void
  className?: string
}) => {
  return (
    <ul
      className={`no-scrollbar flex w-full snap-x snap-mandatory items-center gap-[12px] overflow-x-auto px-[16px] py-[8px] text-[12px] ${className}`}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <li
        key={'all'}
        className={`flex shrink-0 snap-start items-center gap-[2px] rounded-[4px] px-[8px] py-[6px] transition-all ${chainId === undefined ? 'bg-base text-white' : 'text-secondary'}`}
        onClick={() => setChainId(undefined)}
      >
        <Box className={'h-[12px] w-[12px]'}>
          <GlobalLine size={12} />
        </Box>
        <span>
          <Trans>All</Trans>
        </span>
      </li>
      {getSupportedChainIdsByEnv().map((_chainId) => {
        const { logoUrl, label } = CHAIN_INFO[_chainId]
        return (
          <li
            key={_chainId}
            className={`flex shrink-0 snap-start items-center gap-[2px] rounded-[4px] px-[8px] py-[6px] ${chainId === _chainId ? 'bg-base text-white' : 'text-secondary'}`}
            onClick={() => setChainId(_chainId)}
          >
            <Box className={''}>
              <img src={logoUrl} alt="Logo" width={12} height={12} className={'rounded-full'} />
            </Box>
            <span>{label}</span>
          </li>
        )
      })}
    </ul>
  )
}
