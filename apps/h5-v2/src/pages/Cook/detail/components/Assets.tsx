import { Box, Button, Skeleton } from '@mui/material'
import { CustomCheckBox } from '@/components/CheckBox.tsx'
import { Trans } from '@lingui/react/macro'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { LpAsset } from '@/request/lp/type.ts'
import { getLpAssets } from '@/request'
import { PoolType } from '@/request/type.ts'
import { useAccessToken } from '@/hooks/useAccessToken.ts'
import { usePoolContext } from '@/pages/Cook/hook'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { base as Base, COMMON_PRICE_DECIMALS, formatUnits } from '@myx-trade/sdk'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { PairLogo } from '@/components/UI/PairLogo'
import type { ChainId } from '@/config/chain.ts'
import { encryptionAddress } from '@/utils'
import { Copy } from '@/components/Copy.tsx'
import { Empty } from '@/components/Empty.tsx'
import { ClaimRewardsDialog } from '@/components/CookDetail/Dialog/ClaimRewards.tsx'
import { useWalletActions } from '@/hooks/useWalletActions.ts'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider.tsx'
import { calculationPnl } from '@/utils/pnl.ts'
import { RiseFallText } from '@/components/RiseFallText'
import { formatNumber } from '@/utils/number.ts'

type SortOrder = 'asc' | 'desc' | false
type PriceMapType = { [poolId: string]: string }
type RewardsMapType = { [poolId: string]: string }

const AssetHeader = ({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) => {
  return (
    <Box className={'border-base flex items-center justify-between border-b-1 px-[16px] py-[12px]'}>
      <span className={''}>
        <Trans>My Assets</Trans>
      </span>
      <CustomCheckBox
        checked={checked}
        onChange={(checked) => onChange(checked)}
        label={<Trans>Hide other symbols</Trans>}
      />
    </Box>
  )
}

const Token = ({ asset }: { asset?: LpAsset }) => {
  return (
    <Box className={'flex items-center gap-[4px]'}>
      <PairLogo
        baseSymbol={asset?.baseSymbol}
        quoteSymbol={asset?.quoteSymbol}
        baseLogoSize={28}
        quoteLogoSize={10}
        baseLogo={asset?.tokenIcon as string}
        quoteLogo={CHAIN_INFO?.[asset?.chainId as ChainId]?.logoUrl}
      />
      <Box className={'flex flex-col gap-[4px] text-[12px] leading-[1]'}>
        <span className={'font-[500] text-white'}>
          {asset ? `m${asset?.baseSymbol}.${asset?.quoteSymbol}` : <Skeleton width={50} />}
        </span>
        <Box className={'text-secondary flex items-center gap-[4px]'}>
          {asset ? (
            <>
              <span>{asset?.token ? encryptionAddress(asset.token) : ''}</span>
              <div className="ml-[4px] flex">
                <Copy content={asset?.token} />
              </div>
            </>
          ) : (
            <Skeleton width={100} />
          )}
        </Box>
      </Box>
    </Box>
  )
}

const Value = ({
  label,
  children,
  className,
}: {
  label: ReactNode
  children: ReactNode
  className?: string
}) => {
  return (
    <Box className={`flex flex-col gap-[6px] ${className}`}>
      <span className={'text-[13px] font-[500] text-white'}>{children}</span>
      <span className={'text-secondary text-[12px]'}>{label}</span>
    </Box>
  )
}

const AssetItem = ({
  asset,
  onClaim,
  children,
  canClaim = false,
}: {
  asset?: LpAsset
  children: ReactNode
  onClaim: (asset: LpAsset) => void
  canClaim: boolean
}) => {
  return (
    <Box className={'border-base flex flex-col gap-[20px] border-b-1 py-[16px]'}>
      <Box className={'flex items-center justify-between'}>
        <Token asset={asset} />
        {asset ? (
          <Button
            variant={'contained'}
            className={
              '!text-deep !rounded-[24px] !bg-white !text-[10px] [&.Mui-disabled]:opacity-[0.3]'
            }
            onClick={() => onClaim(asset)}
            disabled={!canClaim}
          >
            <Trans>Claim</Trans>
          </Button>
        ) : (
          <Skeleton width={58} />
        )}
      </Box>

      <Box className={'grid grid-cols-2 justify-between gap-[20px]'}>{children}</Box>
    </Box>
  )
}
export const Assets = () => {
  const { accessToken } = useAccessToken()
  const { poolId, pool, price, refreshAssetKey } = usePoolContext()
  const { address: account } = useWalletConnection()
  const onAction = useWalletActions()
  const { markets } = useMyxSdkClient()
  const [lpAsset, setLpAsset] = useState<LpAsset | undefined>(undefined)
  const [openClaimRewardsDialog, setOpenClaimRewardsDialog] = useState(false)
  const [showAllAssets, setShowAllAssets] = useState(false)

  const {
    data,
    isLoading,
    refetch: refechAsset,
  } = useQuery({
    queryKey: [
      { key: 'getMineBaseLpAssets' },
      account,
      accessToken,
      poolId,
      pool?.basePoolToken,
      showAllAssets,
    ],
    enabled: !!account,
    queryFn: async () => {
      // console.log('getMineBaseLpAssets:', poolId, pool?.basePoolToken, accessToken)
      if (!account) return [] as LpAsset[]
      if (!showAllAssets && (!poolId || !pool?.basePoolToken)) return [] as LpAsset[]
      const request = await getLpAssets(account, accessToken || '', {
        poolType: PoolType.base,
        poolId: showAllAssets ? undefined : poolId,
        poolToken: showAllAssets ? undefined : pool?.basePoolToken,
      })
      return request?.data || []
    },
  })

  const rewardsQueryParams = useMemo(() => {
    return (data || []).map((item) => {
      return {
        poolId: item.poolId,
        chainId: item.chainId,
        marketId: item.marketId,
      }
    })
  }, [data])

  const priceQueryParams = useMemo(() => {
    return (rewardsQueryParams || []).filter((item) => item.poolId !== poolId)
  }, [rewardsQueryParams, poolId])

  const { data: priceMap } = useQuery({
    queryKey: [{ key: 'getBaseLpAssetBalance' }, priceQueryParams, showAllAssets],
    enabled: showAllAssets && !!priceQueryParams.length,
    queryFn: async () => {
      if (!priceQueryParams.length) return {} as PriceMapType
      const result = await Promise.all(
        priceQueryParams.map(async (item) => {
          let _price = ''
          try {
            const rs = await Base.getLpPrice(item.chainId, item.poolId)
            if (rs) {
              _price = formatUnits(rs, COMMON_PRICE_DECIMALS)
            }
          } catch (_e) {
            console.error(_e)
          }
          // console.log(item.poolId + " price: ", _price)
          return {
            poolId: item.poolId,
            chainId: item.chainId,
            price: _price,
          }
        }),
      )

      const map = (result || []).reduce((acc, cur) => {
        return {
          ...acc,
          [cur.poolId]: cur.price,
        }
      }, {} as PriceMapType)
      return map
    },
    refetchInterval: 5000,
  })

  useEffect(() => {
    refechAsset?.()
  }, [refreshAssetKey])

  const PriceMap = useMemo(() => {
    return {
      [poolId]: price || '',
      ...(priceMap || {}),
    }
  }, [poolId, price, priceMap])
  const { data: rewardsMap = {} as RewardsMapType, refetch } = useQuery({
    queryKey: [{ key: 'getBaseLpAssetRewards' }, rewardsQueryParams, account, markets],
    enabled: !!rewardsQueryParams?.length && !!account && !!markets?.length,
    queryFn: async () => {
      if (!rewardsQueryParams?.length) return {} as RewardsMapType
      const result = await Promise.all(
        rewardsQueryParams.map(async (item) => {
          let rewards = ''
          try {
            const rs = await Base.getRewards({
              poolId: item.poolId,
              chainId: item.chainId,
              account: account as `0x${string}`,
            })
            // base.getRewards({
            //   poolId,
            //   chainId,
            //   account
            // })
            // console.log('Base.getRewards', item.poolId, item.chainId, account, rs)
            if (rs === 0n) {
              rewards = '0'
            } else if (rs) {
              const marketInfo = markets?.find((market) => market.marketId === item?.marketId)
              if (marketInfo?.quoteDecimals) {
                rewards = formatUnits(rs, marketInfo?.quoteDecimals)
              }
            }
          } catch (_e) {
            console.error(_e)
          }
          return {
            poolId: item.poolId,
            chainId: item.chainId,
            rewards,
          }
        }),
      )

      return (result || []).reduce((acc, cur) => {
        return {
          ...acc,
          [cur.poolId]: cur.rewards,
        }
      }, {} as RewardsMapType)
    },
  })

  const getPnl = (lpAsset: LpAsset, price: string) => {
    const { avgPrice, lastTotal } = lpAsset
    return calculationPnl(price, avgPrice, lastTotal)
  }

  const pnlMap: Record<string, string> = useMemo(() => {
    const list = (data || []).map((item) => {
      return {
        poolId: item.poolId,
        pnl: getPnl(item, PriceMap?.[item.poolId]),
      }
    })

    return list.reduce((acc, cur) => {
      return {
        ...acc,
        [cur.poolId]: cur.pnl,
      }
    }, {})
  }, [data, PriceMap])

  const onHandleClaim = useCallback(
    async (lpAsset: LpAsset) => {
      const checked = await onAction(lpAsset.chainId)
      if (!checked) return
      setOpenClaimRewardsDialog(true)
    },
    [setOpenClaimRewardsDialog, onAction],
  )

  return (
    <>
      <Box className={'mt-[8px]'}>
        <AssetHeader checked={!showAllAssets} onChange={(checked) => setShowAllAssets(!checked)} />
        <Box className={'px-[16px]'}>
          {(isLoading
            ? (Array.from({ length: 3 }).fill(null) as LpAsset[])
            : ((data || []) as LpAsset[])
          ).map((item, index) => {
            return (
              <AssetItem
                key={index}
                asset={item as LpAsset}
                canClaim={Number(rewardsMap?.[item?.poolId as string]) > 0}
                onClaim={(asset) => {
                  setLpAsset(asset)
                  onHandleClaim(asset)
                }}
              >
                <Value label={<Trans>Quantity</Trans>}>
                  {formatNumber(+item?.lastTotal)}
                  {item ? `m${item?.baseSymbol}.${item?.quoteSymbol}` : ''}
                </Value>
                <Value className={'items-end justify-self-end'} label={<Trans>Cost Basis</Trans>}>
                  ${formatNumber(item?.avgPrice, { showUnit: false })}
                </Value>
                <Value label={<Trans>Unrealized PnL</Trans>}>
                  {pnlMap?.[item?.poolId as string] !== '' ? (
                    <RiseFallText
                      value={pnlMap?.[item?.poolId as string]}
                      renderOptions={{
                        showUnit: false,
                        showSign: true,
                      }}
                    />
                  ) : (
                    <span>{'--'}</span>
                  )}
                </Value>

                <Value
                  className={'items-end justify-self-end'}
                  label={<Trans>Unclaimed Fees</Trans>}
                >
                  {formatNumber(rewardsMap?.[item?.poolId], { showUnit: false })}{' '}
                  {item?.quoteSymbol}
                </Value>
              </AssetItem>
            )
          })}
          {!isLoading && data?.length === 0 && <Empty />}
        </Box>
      </Box>
      <ClaimRewardsDialog
        refetch={refetch}
        reward={rewardsMap?.[lpAsset?.poolId as string] || ''}
        lpAsset={lpAsset}
        open={openClaimRewardsDialog}
        onClose={() => {
          setOpenClaimRewardsDialog(false)
        }}
      />
    </>
  )
}
