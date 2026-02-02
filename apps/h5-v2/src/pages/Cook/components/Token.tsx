import type { TokenData, Token as _Token } from '@/pages/Cook/type.ts'
import { Box, Tooltip } from '@mui/material'
import { Copy } from '@/components/Copy.tsx'
import { Trans } from '@lingui/react/macro'
import { ChartLine, UsersLine } from '@/components/Icon'
import { encryptionAddress } from '@/utils'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { getTimeDiff } from '@/utils/date.ts'
import { formatNumber } from '@/utils/number.ts'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import { useEffect, useState } from 'react'
import { LinearProgressWithLabel } from '@/components/BorderLinearProgressWithLabel.tsx'
import { CoinIcon } from '@/components/UI/CoinIcon'
import Primed from '@/components/Icon/set/Primed.tsx'
import { t } from '@lingui/core/macro'
import { Tooltips } from '@/components/UI/Tooltips'
import { Change } from '@/components/Change.tsx'
import { Address } from '@/components/Address.tsx'
export interface TokenPendingType {
  isLoading: boolean
}

export type TokenType = _Token & TokenData & { isLoading?: boolean; onClick: () => void }

export const Token = (props: TokenPendingType | TokenType) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isPending(props) && 'progress' in props) {
      console.log(Math.min(Number(props.progress), 100))
      setProgress(Math.min(Number(props.progress), 100))
    }
  }, [props, progress])
  return (
    <Box
      className={`token border-base hover:bg-base-bg flex cursor-pointer items-center gap-[8px] px-[16px] py-[20px] [&+.token]:border-t-1`}
      onClick={() => {
        if (!isPending(props)) {
          props.onClick()
        }
      }}
    >
      <Box className={'relative aspect-square'}>
        {isPending(props) ? (
          <Skeleton width={44} height={44} />
        ) : (
          <CoinIcon icon={props.icon} size={44} symbol={props.label} />
          // <img className={'h-full w-full rounded-[6px]'} src={props.icon} />
        )}

        <Box
          className={
            'absolute right-[-2px] bottom-0 aspect-square h-[16px] w-[16px] min-w-[16px] overflow-hidden rounded-[6px]'
          }
        >
          {isPending(props) ? (
            <Skeleton width={16} height={16} />
          ) : (
            <CoinIcon
              className={'border-deep overflow-hidden rounded-full border-1'}
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
              <Box className={'flex flex-1 items-center'}>
                <span className={'text-[14px] font-[500] text-white'}>{props.label}</span>
                <span className={'ml-[8px] text-[12px] max-w-[6em] truncate'}>{props.name}</span>
                {'progress' in props && Number(props?.progress) >= 100 && (
                  <Tooltips title={t`待上架`}>
                    <span className={'ml-[8px]'}>
                      <Primed size={12} />
                    </span>
                  </Tooltips>
                )}
              </Box>
              {'progress' in props && (
                <Box className={'w-[100px] min-w-[100px]'}>
                  <LinearProgressWithLabel value={Number(progress)} />
                </Box>
              )}
            </>
          )}
        </Box>
        <Box className={'flex items-center justify-between'}>
          <Box className={'flex items-center gap-[8px] text-[12px] leading-[1]'}>
            {isPending(props) ? (
              <Skeleton width={'60%'} />
            ) : (
              <>
                <span className={'text-regular'}>{getTimeDiff(props?.time as number)}</span>
                <Address address={props.address} />
              </>
            )}
          </Box>

          <Box className={'flex flex-1 items-center justify-end gap-[4px] text-[12px] leading-[1]'}>
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
        <Box className={'flex items-center gap-[4px] text-[12px] leading-[1]'}>
          <Box className={'flex items-center gap-[4px]'}>
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

          <Box className={'flex flex-1 shrink-0 items-center justify-center gap-[4px] text-center'}>
            {isPending(props) ? (
              <Skeleton width={'50%'} />
            ) : (
              <>
                <span className={''}>
                  <ChartLine size={12} />
                </span>
                <Change className={'text-regular font-[500]'} change={props.change}>
                  {props?.change ? `${formatNumberPrecision(props.change)}%` : '--'}
                </Change>
              </>
            )}
          </Box>
          <Box className={'flex shrink-0 items-center gap-[4px]'}>
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
        </Box>
      </Box>
    </Box>
  )
}

function isPending(token: TokenPendingType | TokenType): token is TokenPendingType {
  return 'isLoading' in token
}
