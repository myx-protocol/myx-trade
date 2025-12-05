import { CheckBox } from '@/components/UI/CheckBox'
import { Trans } from '@lingui/react/macro'
import {
  FormControlLabel,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Box,
  Paper,
} from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import SortDown from '@/components/Icon/set/SortDown'
import { PairLogo } from '@/components/UI/PairLogo'
import { Copy } from '@/components/Copy'
import { Tooltips } from '@/components/UI/Tooltips'
import { ClaimRewardsDialog } from '../Dialog/ClaimRewards'
import { useQuery } from '@tanstack/react-query'
import { getLpAssets } from '@/request'
import { usePoolContext } from '@/pages/Cook/hook'
import { PoolType } from '@/request/type.ts'
import type { LpAsset } from '@/request/lp/type.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { encryptionAddress } from '@/utils'
import { COMMON_BASE_DISPLAY_DECIMALS, COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import {
  base as Base,
  COMMON_LP_AMOUNT_DECIMALS,
  COMMON_PRICE_DECIMALS,
  formatUnits,
} from '@myx-trade/sdk'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { calculationPnl } from '@/utils/pnl.ts'
import { Empty } from '@/components/Empty.tsx'
import { useAccessToken } from '@/hooks/useAccessToken.ts'
import { t } from '@lingui/core/macro'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider.tsx'
import { useWalletActions } from '@/hooks/useWalletActions.ts'

type SortOrder = 'asc' | 'desc' | false
type PriceMapType = { [poolId: string]: string }
type RewardsMapType = { [poolId: string]: string }

const TableLoading = () => {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow className={'pointer-events-none'} key={index}>
      <TableCell>
        <Skeleton />
      </TableCell>
      <TableCell align="right">
        <Skeleton />
      </TableCell>
      <TableCell align="right">
        <Skeleton />
      </TableCell>
      <TableCell align="right">
        <Skeleton />
      </TableCell>
      <TableCell align="right">
        <Skeleton />
      </TableCell>
      <TableCell align="right">
        <Skeleton />
      </TableCell>
    </TableRow>
  ))
}

export const Assets = () => {
  const { accessToken } = useAccessToken()
  const { poolId, pool, price } = usePoolContext()
  const [showAllAssets, setShowAllAssets] = useState(false)
  const [sortField, setSortField] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<SortOrder>(false)
  const [openClaimRewardsDialog, setOpenClaimRewardsDialog] = useState(false)
  const { address: account } = useWalletConnection()
  const [lpAsset, setLpAsset] = useState<LpAsset | undefined>(undefined)
  const { markets } = useMyxSdkClient()
  const onAction = useWalletActions()

  const { data, isLoading } = useQuery({
    queryKey: [
      { key: 'getMineBaseLpAssets' },
      account,
      accessToken,
      poolId,
      pool?.basePoolToken,
      showAllAssets,
    ],
    enabled: !!account && !!accessToken,
    queryFn: async () => {
      // console.log(poolId , pool , accessToken)
      if (!accessToken || !account) return [] as LpAsset[]
      if (!showAllAssets && (!poolId || !pool?.basePoolToken)) return [] as LpAsset[]
      const request = await getLpAssets(account, accessToken, {
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

  const PriceMap = useMemo(() => {
    return {
      [poolId]: price || '',
      ...(priceMap || {}),
    }
  }, [poolId, price, priceMap])

  const onClaim = useCallback(
    async (lpAsset: LpAsset) => {
      const checked = await onAction(lpAsset.chainId)
      if (!checked) return
      setOpenClaimRewardsDialog(true)
    },
    [setOpenClaimRewardsDialog, onAction],
  )

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
            console.log('Base.getRewards', item.poolId, item.chainId, account, rs)
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

      console.log(result)

      return (result || []).reduce((acc, cur) => {
        return {
          ...acc,
          [cur.poolId]: cur.rewards,
        }
      }, {} as RewardsMapType)
    },
  })

  // 格式化数字显示
  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  // 处理排序
  const handleSort = (field: string) => {
    let newOrder: SortOrder = 'asc'
    if (sortField === field && sortOrder === 'asc') {
      newOrder = 'desc'
    } else if (sortField === field && sortOrder === 'desc') {
      newOrder = false
    }

    setSortField(newOrder ? field : '')
    setSortOrder(newOrder)
  }

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

  // 对数据进行排序
  const sortedData = useMemo(() => {
    return [...(data || [])].sort((a, b) => {
      if (!sortField || !sortOrder) return 0

      const aValue: any =
        sortField === 'rewards'
          ? rewardsMap[a.poolId]
          : sortField === 'pnl'
            ? pnlMap[a.poolId]
            : a[sortField as keyof LpAsset]
      const bValue: any =
        sortField === 'rewards'
          ? rewardsMap[b.poolId]
          : sortField === 'pnl'
            ? pnlMap[b.poolId]
            : b[sortField as keyof LpAsset]

      // 处理字符串排序
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      // 处理数字排序
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      return 0
    })
  }, [sortField, sortOrder, data, pnlMap, rewardsMap])

  // 自定义排序图标
  const CustomSortIcon = ({ direction }: { direction: SortOrder }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ml: 0.5,
      }}
    >
      <span className="inline-flex origin-center rotate-180">
        <SortDown size={5} color={direction === 'asc' ? '#00E3A5' : '#6D7180'} />
      </span>
      <span className="mt-[1px] inline-flex">
        <SortDown size={5} color={direction === 'desc' ? '#00E3A5' : '#6D7180'} />
      </span>
    </Box>
  )

  return (
    <div className="mt-[4px] flex-[1_1_0%] rounded-[6px] bg-[#101114]">
      {/* title */}
      <div className="flex items-center justify-between border-b-[1px] border-b-[#31333D] px-[20px] py-[12px]">
        <p className="text-[14px] leading-[1] font-bold text-white">
          <Trans>我的资产</Trans>
        </p>
        <div className="flex items-center gap-[4px]">
          <FormControlLabel
            sx={{
              marginRight: 0,
              '& .MuiTypography-root': {
                lineHeight: 1,
                fontSize: '12px',
              },
            }}
            control={
              <CheckBox checked={showAllAssets} onChange={() => setShowAllAssets(!showAllAssets)} />
            }
            label={
              <span className="ml-[4px] text-[12px] leading-[1] font-normal text-[#848E9C] select-none">
                <Trans>显示所有资产</Trans>
              </span>
            }
          />
        </div>
      </div>

      {/* tables */}
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflowX: 'auto',
          // height: '450px',
          overflowY: 'auto',
        }}
      >
        <MuiTable
          sx={{
            backgroundColor: '#101114',
            '& .MuiTableCell-root': {
              color: '#FFFFFF',
              padding: '12px 20px',
              fontSize: '12px',
              borderBottom: 'none',
              lineHeight: 1,
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              backgroundColor: '#101114',
              color: '#9397A3',
              fontWeight: '500',
              borderBottom: 'none',
            },
            '& .MuiTableBody-root .MuiTableRow-root': {
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: '#101114',
              },
            },
          }}
        >
          <TableHead>
            <TableRow>
              {/* asset */}
              <TableCell>
                <TableSortLabel
                  active={sortField === 'baseSymbol'}
                  direction={sortField === 'baseSymbol' && sortOrder ? sortOrder : 'asc'}
                  onClick={() => handleSort('baseSymbol')}
                  IconComponent={() => (
                    <CustomSortIcon direction={sortField === 'baseSymbol' ? sortOrder : false} />
                  )}
                  sx={{
                    color: '#9397A3',
                    fontSize: '12px',
                    lineHeight: 1,
                    fontWeight: 400,
                    '&.Mui-active': {
                      color: '#9397A3',
                    },
                    '&:hover,&:focus': {
                      color: '#9397A3',
                    },
                  }}
                >
                  <Trans>Asset</Trans>
                </TableSortLabel>
              </TableCell>
              {/* quantity */}
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <TableSortLabel
                    active={sortField === 'lastTotal'}
                    direction={sortField === 'lastTotal' && sortOrder ? sortOrder : 'asc'}
                    onClick={() => handleSort('lastTotal')}
                    IconComponent={() => (
                      <CustomSortIcon direction={sortField === 'lastTotal' ? sortOrder : false} />
                    )}
                    sx={{
                      color: '#9397A3',
                      fontSize: '12px',
                      lineHeight: 1,
                      fontWeight: 400,
                      flexDirection: 'row',
                      '& .MuiTableSortLabel-content': {
                        order: 1,
                      },
                      '& .MuiTableSortLabel-icon': {
                        order: 2,
                        marginLeft: '4px',
                      },
                      '&.Mui-active': {
                        color: '#9397A3',
                      },
                      '&:hover,&:focus': {
                        color: '#9397A3',
                      },
                    }}
                  >
                    <Trans>Quantity</Trans>
                  </TableSortLabel>
                </Box>
              </TableCell>
              {/* cost basis */}
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <TableSortLabel
                    active={sortField === 'avgPrice'}
                    direction={sortField === 'avgPrice' && sortOrder ? sortOrder : 'asc'}
                    onClick={() => handleSort('avgPrice')}
                    IconComponent={() => (
                      <CustomSortIcon direction={sortField === 'avgPrice' ? sortOrder : false} />
                    )}
                    sx={{
                      color: '#9397A3',
                      fontSize: '12px',
                      lineHeight: 1,
                      fontWeight: 400,
                      flexDirection: 'row',
                      '& .MuiTableSortLabel-content': {
                        order: 1,
                      },
                      '& .MuiTableSortLabel-icon': {
                        order: 2,
                        marginLeft: '4px',
                      },
                      '&.Mui-active': {
                        color: '#9397A3',
                      },
                      '&:hover,&:focus': {
                        color: '#9397A3',
                      },
                    }}
                  >
                    <Trans>Cost Basis</Trans>
                  </TableSortLabel>
                </Box>
              </TableCell>

              {/* unrealized PnL */}
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <TableSortLabel
                    active={sortField === 'pnl'}
                    direction={sortField === 'pnl' && sortOrder ? sortOrder : 'asc'}
                    onClick={() => handleSort('pnl')}
                    IconComponent={() => (
                      <CustomSortIcon direction={sortField === 'pnl' ? sortOrder : false} />
                    )}
                    sx={{
                      color: '#9397A3',
                      fontSize: '12px',
                      lineHeight: 1,
                      fontWeight: 400,
                      flexDirection: 'row',
                      '& .MuiTableSortLabel-content': {
                        order: 1,
                      },
                      '& .MuiTableSortLabel-icon': {
                        order: 2,
                        marginLeft: '4px',
                      },
                      '&.Mui-active': {
                        color: '#9397A3',
                      },
                      '&:hover,&:focus': {
                        color: '#9397A3',
                      },
                    }}
                  >
                    <Trans>Unrealized PnL</Trans>
                  </TableSortLabel>
                </Box>
              </TableCell>

              {/* Unclaimed Fees */}
              <TableCell align="right">
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <TableSortLabel
                    active={sortField === 'rewards'}
                    direction={sortField === 'rewards' && sortOrder ? sortOrder : 'asc'}
                    onClick={() => handleSort('rewards')}
                    IconComponent={() => (
                      <CustomSortIcon direction={sortField === 'rewards' ? sortOrder : false} />
                    )}
                    sx={{
                      color: '#9397A3',
                      fontSize: '12px',
                      lineHeight: 1,
                      fontWeight: 400,
                      flexDirection: 'row',
                      '& .MuiTableSortLabel-content': {
                        order: 1,
                      },
                      '& .MuiTableSortLabel-icon': {
                        order: 2,
                        marginLeft: '4px',
                      },
                      '&.Mui-active': {
                        color: '#9397A3',
                      },
                      '&:hover,&:focus': {
                        color: '#9397A3',
                      },
                    }}
                  >
                    <Tooltips title={t`Unclaimed earnings from genesis liquidity`}>
                      <span className="border-b-[#848E9C border-b-[1px] border-dashed">
                        <Trans>Unclaimed Fees</Trans>
                      </span>
                    </Tooltips>
                  </TableSortLabel>
                </Box>
              </TableCell>

              {/* operation */}
              <TableCell align="right">
                <span>
                  <Trans>Action</Trans>
                </span>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableLoading />
            ) : sortedData?.length === 0 ? (
              sortedData.length === 0 && (
                <>
                  <TableRow>
                    <TableCell className={'empty'} colSpan={7777}>
                      <Empty className={'py-[20px]'} />
                    </TableCell>
                  </TableRow>
                </>
              )
            ) : (
              sortedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-[4px]">
                      <PairLogo
                        baseSymbol={row?.baseSymbol}
                        quoteSymbol={row?.quoteSymbol}
                        baseLogoSize={28}
                        quoteLogoSize={12}
                        baseLogo={row?.tokenIcon as string}
                        quoteLogo={CHAIN_INFO?.[row?.chainId]?.logoUrl}
                      />
                      <div className="">
                        <p className="text-[12px] font-medium text-white">{`m${row.baseSymbol}.${row.quoteSymbol}`}</p>
                        <div className="mt-[4px] flex items-center text-[12px] text-[#848E9C]">
                          <span>{row.token ? encryptionAddress(row.token) : ''}</span>
                          <div className="ml-[4px] flex">
                            <Copy content={row.token} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    <div>
                      <p className="text-[12px] font-medium text-white">
                        {row?.lastTotal
                          ? formatNumber(+row?.lastTotal, COMMON_BASE_DISPLAY_DECIMALS)
                          : '--'}
                      </p>
                      <p className="mt-[4px] text-[#9397A3]">
                        $
                        {formatNumberPrecision(
                          PriceMap?.[row?.poolId],
                          COMMON_PRICE_DISPLAY_DECIMALS,
                        )}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell align="right">
                    {formatNumberPrecision(row?.avgPrice, COMMON_PRICE_DISPLAY_DECIMALS)}
                  </TableCell>
                  <TableCell align="right" className={'font-[500]'}>
                    {pnlMap?.[row?.poolId as string] !== '' ? (
                      <span
                        className={
                          Number(pnlMap?.[row?.poolId as string]) > 0 ? 'text-rise' : 'text-fall'
                        }
                      >
                        {formatNumberPrecision(
                          pnlMap?.[row?.poolId as string],
                          COMMON_PRICE_DISPLAY_DECIMALS,
                          true,
                        )}
                      </span>
                    ) : (
                      <span>{'--'}</span>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <div>
                      <p className="text-[12px] font-medium text-white">
                        {formatNumberPrecision(
                          rewardsMap?.[row?.poolId],
                          COMMON_PRICE_DISPLAY_DECIMALS,
                        )}
                      </p>
                      <p className="mt-[4px] text-[#9397A3]">
                        $
                        {formatNumberPrecision(
                          rewardsMap?.[row?.poolId],
                          COMMON_PRICE_DISPLAY_DECIMALS,
                        )}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell align="right" className={'flex justify-end'}>
                    <div className="flex w-full justify-end">
                      <div
                        className="w-[fit-content] rounded-[999px] bg-[#202129] px-[12px] py-[6px] leading-[1.2] font-normal text-white"
                        role="button"
                        onClick={async () => {
                          setLpAsset(row)
                          await onClaim(row)
                          // setOpenClaimRewardsDialog(true)
                        }}
                      >
                        <Trans>Claim Rewards</Trans>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {/*<ClaimTotalRewardsDialog
        open={openClaimTotalRewardsDialog}
        onClose={() => {
          setOpenClaimTotalRewardsDialog(false)
        }}
        onConfirm={() => {
          setOpenClaimTotalRewardsDialog(false)
          setOpenClaimRewardsDialog(true)
        }}
        chainIds={[]}
      />*/}
      <ClaimRewardsDialog
        refetch={refetch}
        reward={rewardsMap?.[lpAsset?.poolId as string] || ''}
        lpAsset={lpAsset}
        open={openClaimRewardsDialog}
        onClose={() => {
          setOpenClaimRewardsDialog(false)
        }}
      />
    </div>
  )
}
