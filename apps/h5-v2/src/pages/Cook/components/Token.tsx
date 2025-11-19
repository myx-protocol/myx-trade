import type { TokenData, Token as _Token } from '@/pages/Cook/type.ts'
import { Box } from '@mui/material'
import { Copy } from '@/components/Copy.tsx'
import { Trans } from '@lingui/react/macro'
import { ChartLine, UsersLine } from '@/components/Icon'
import { encryptionAddress } from '@/utils'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { getTimeDiff } from '@/utils/date.ts'
import { formatNumber } from '@/utils/number.ts'
import { formatNumberPercent } from '@/utils/formatNumber.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import { useEffect, useState } from 'react'
import { LinearProgressWithLabel } from '@/components/BorderLinearProgressWithLabel.tsx'
import { CoinIcon } from '@/components/UI/CoinIcon'
export interface TokenPendingType {
  isLoading: boolean
}

export type TokenType = _Token & TokenData & { isLoading?: boolean; onClick: () => void }

const Address = ({ address, className = '' }: { address: string; className?: string }) => {
  return (
    <Box className={`flex items-center gap-[4px] ${className}`}>
      <span>{encryptionAddress(address)}</span>
      <Copy content={address} />
    </Box>
  )
}

export const Token = (props: TokenPendingType | TokenType) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isPending(props) && 'progress' in props) {
      const timer = setInterval(() => {
        if (progress >= Number(props.progress)) {
          clearInterval(timer)
          return
        }
        setProgress((prevProgress) =>
          prevProgress >= Number(props.progress) ? Number(props.progress) : prevProgress + 10,
        )
      }, 800)
      return () => {
        clearInterval(timer)
      }
    }
  }, [props, progress])
  return (
    <Box
      className={`token border-base hover:bg-base-bg flex cursor-pointer items-center gap-[10px] px-[20px] py-[24px] [&+.token]:border-t-1`}
      onClick={() => {
        if (!isPending(props)) {
          props.onClick()
        }
      }}
    >
      <Box className={'relative aspect-square h-[56px] w-[56px] min-w-[56px]'}>
        {isPending(props) ? (
          <Skeleton width={56} height={56} />
        ) : (
          <CoinIcon icon={props.icon} size={56} symbol={props.label} className={'!rounded-[6px]'} />
          // <img className={'h-full w-full rounded-[6px]'} src={props.icon} />
        )}

        <Box
          className={
            'absolute right-[-4px] bottom-0 aspect-square h-[16px] w-[16px] min-w-[16px] overflow-hidden rounded-[6px]'
          }
        >
          {isPending(props) ? (
            <Skeleton width={16} height={16} />
          ) : (
            <CoinIcon
              size={16}
              icon={CHAIN_INFO?.[props?.chainId as keyof typeof CHAIN_INFO]?.logoUrl ?? ''}
            />
          )}
        </Box>
      </Box>
      <Box className={'text-secondary flex flex-1 flex-col gap-[8px] leading-[1]'}>
        <Box className={'flex items-center gap-[4px]'}>
          {isPending(props) ? (
            <Skeleton width={'30%'} />
          ) : (
            <>
              <Box className={'flex-1'}>
                <span className={'text-[16px] font-[700] text-white'}>{props.label}</span>
                <span className={'text-[14px]'}>{props.name}</span>
              </Box>
              {'progress' in props && (
                <Box className={'w-[90px] min-w-[90px]'}>
                  <LinearProgressWithLabel value={progress} />
                </Box>
              )}
            </>
          )}
        </Box>
        <Box className={'flex items-center gap-[8px]'}>
          {isPending(props) ? (
            <Skeleton width={'60%'} />
          ) : (
            <>
              <span className={'text-regular text-[16px] font-[700]'}>
                {getTimeDiff(props?.time as number)}
              </span>
              <Address address={props.address} />
            </>
          )}
        </Box>
        <Box className={'flex items-center gap-[4px] text-[12px] leading-[1]'}>
          <Box className={'flex flex-1 items-center gap-[4px]'}>
            {isPending(props) ? (
              <Skeleton width={'50%'} />
            ) : (
              <>
                <span className={''}>
                  <Trans>MC</Trans>
                </span>
                <span className={'text-regular font-[500]'}>
                  {props?.mc ? `$${formatNumber(props?.mc)}` : '--'}
                </span>
              </>
            )}
          </Box>

          <Box className={'flex flex-1 items-center gap-[4px]'}>
            {isPending(props) ? (
              <Skeleton width={'50%'} />
            ) : (
              <>
                <span className={''}>
                  <ChartLine size={16} />
                </span>
                <span
                  className={`text-regular font-[500] ${Number(props.change) > 0 ? 'text-rise' : 'text-fall'}`}
                >
                  {props?.change ? `${formatNumberPercent(props.change)}` : '--'}
                </span>
              </>
            )}
          </Box>
          <Box className={'flex flex-1 items-center gap-[4px]'}>
            {isPending(props) ? (
              <Skeleton width={'50%'} />
            ) : (
              <>
                <span className={''}>
                  <Trans>Liq</Trans>
                </span>
                <span className={'text-regular font-[500]'}>
                  {props?.liq ? `$${formatNumber(props?.liq)}` : '--'}
                </span>
              </>
            )}
          </Box>
          <Box className={'flex flex-1 items-center gap-[4px]'}>
            {isPending(props) ? (
              <Skeleton width={'50%'} />
            ) : (
              <>
                <UsersLine size={12} className={'text-secondary'} />
                <span className={'text-regular font-[500]'}>
                  {props?.holder ? formatNumber(props.holder) : '--'}
                </span>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function isPending(token: TokenPendingType | TokenType): token is TokenPendingType {
  return 'isLoading' in token
}
