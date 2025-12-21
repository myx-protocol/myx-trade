import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { isUndefined } from 'lodash-es'
import { fetchVipInfo, getRiskLevelConfig, listFeeLevel, listVipLevel } from '@/request/vip'
import {
  type FeeConfig,
  type FeeConfigResponse,
  type LevelConfig,
  type LevelConfigResponse,
  LevelRelation,
  type LevelRule,
  type VipInfoType,
} from '@/request/vip/type.d'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { useAccessToken } from '@/hooks/useAccessToken.ts'
import Big from 'big.js'
import { useVipContext } from '@/pages/VIP/context.ts'
import { isSafeNumber } from '@/utils'

export function useFetchLevelList() {
  const [riskTier, setRiskTier] = useState<number>(0)
  const { data: riskList } = useQuery({
    queryKey: ['api.getRiskList'],
    queryFn: async () => {
      const rs = await getRiskLevelConfig()
      const riskList = rs?.data || []
      return riskList
    },
  })

  useEffect(() => {
    if (riskList?.length) {
      const risk = riskList.find((risk) => risk.levelId === riskTier)
      if (!risk) {
        setRiskTier(riskList?.[0].levelId)
      }
    }
  }, [riskTier, riskList])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [{ key: 'listVipLevel' }],
    queryFn: async () => {
      const rs: LevelConfigResponse = await listVipLevel()
      return (rs?.data ?? ([] as LevelConfig[])).map((item) => {
        const { rule, vipTier } = item
        return {
          vipTier,
          rule: JSON.parse(rule as string) as LevelRule,
        }
      })
    },
    // enabled: inView
  })

  const { data: feeMap, isLoading: isFeeLoading } = useQuery({
    queryKey: [{ key: 'listVipFeeLevel' }, riskTier],
    queryFn: async () => {
      if (riskTier === undefined || null) return [] as LevelConfig[]
      const rs: FeeConfigResponse = await listFeeLevel(riskTier)
      return (rs?.data ?? ([] as FeeConfig[]))
        .map((item) => {
          const {
            vipTier,
            baseMakerFee,
            baseTakerFee,
            makerFee,
            specialMakerFee,
            specialTakerFee,
            specialVipTier,
            takerFee,
          } = item
          const _takerFee = specialVipTier
            ? specialTakerFee
            : new Big(baseTakerFee).add(new Big(takerFee)).toString()
          const _makerFee = specialVipTier
            ? specialMakerFee
            : new Big(baseMakerFee).add(new Big(makerFee)).toString()
          return {
            vipTier,
            takerFee: _takerFee,
            makerFee: _makerFee,
          }
        })
        .reduce((prev, curr) => {
          prev = {
            ...prev,
            [curr.vipTier]: curr,
          }
          return prev
        }, {})
    },
    // enabled: inView
  })

  return {
    levelList: data ?? [],
    isLoading,
    riskTier,
    setRiskTier,
    riskList,
    isFetching,
    feeMap,
    isFeeLoading,
  }
}

export function useFetchUserVipInfo() {
  const { address: account } = useWalletConnection()
  const { accessToken } = useAccessToken()
  const { data: vipInfo, isLoading } = useQuery({
    queryKey: [
      {
        key: 'fetchUserLevelInfo',
        account,
        accessToken,
      },
    ],
    queryFn: async () => {
      if (!account || !accessToken) return {} as VipInfoType
      const rs = await fetchVipInfo(account, accessToken)
      return rs.data ?? ({} as VipInfoType)
    },
    enabled: !!accessToken && !!account,
    refetchInterval: 10000,
  })

  return {
    userVipInfo: vipInfo,
    isLoading,
  }
}

export function useGetLevelUpdateInfo() {
  const { levelList, userVipInfo } = useVipContext()

  const myxAmount = useMemo(() => {
    if (userVipInfo) {
      return new Big(userVipInfo?.myxTokenAmount)
        .add(new Big(userVipInfo?.stakingAmount))
        .toString()
    }
    return undefined
  }, [userVipInfo])

  const userTradeAmount = useMemo(() => {
    if (userVipInfo) {
      return new Big(userVipInfo?.tradeAmountV1).add(new Big(userVipInfo?.tradeAmountV2)).toString()
    }
    return undefined
  }, [userVipInfo])

  const [requiredMyxAmount, setRequiredMyxAmount] = useState(0)

  const [process, setProcess] = useState<number>(0)
  const [safeMyxProcess, setMyxProcess] = useState<number>(0)

  const levels = useMemo(() => (levelList || []).map((item) => item.vipTier).sort(), [levelList])
  const maxLevel = useMemo(() => Math.max(...levels), [levelList])

  const nextLevelInfo = useMemo(() => {
    if (levelList?.length) {
      const level = userVipInfo?.level ?? 0
      const nextLevel = level + 1 >= maxLevel ? maxLevel : level + 1
      const levelInfo = levelList.find((level) => level.vipTier === nextLevel)
      if (!levelInfo) {
        return undefined
      }

      return levelInfo
    }
    return undefined
  }, [userVipInfo?.level, levelList, levels])

  const currentLevelInfo = useMemo(() => {
    if (levelList?.length) {
      const level = userVipInfo?.level ?? 0
      const levelInfo = levelList.find((_level) => _level.vipTier === level)
      return levelInfo
    }
  }, [userVipInfo?.level, levelList, levels])

  const nextTradeRule: LevelRule = nextLevelInfo?.rule as LevelRule
  const nextTradeAmount = nextTradeRule?.trade30Vol

  const nextVipRelation = nextTradeRule?.relation
  const nextMyxAmount = nextTradeRule?.myxDaily

  const safeNextTradeAmount =
    isUndefined(nextTradeAmount) || Number(nextTradeAmount) <= 0 ? 1 : Number(nextTradeAmount)

  const tradeProcess = userTradeAmount
    ? new Big(userTradeAmount).mul(100).div(new Big(safeNextTradeAmount)).toNumber()
    : 0
  const safeTradeProcess = tradeProcess < 0 ? 0 : tradeProcess > 100 ? 100 : tradeProcess

  const diffTradeAmount = new Big(safeNextTradeAmount)
    .minus(new Big(userTradeAmount || 0))
    .toNumber()

  const safeDiffTradeAmount = diffTradeAmount < 0 ? 0 : diffTradeAmount
  const requiredTradeAmount = safeDiffTradeAmount

  useEffect(() => {}, [userVipInfo])

  useEffect(() => {
    const amount =
      isSafeNumber(nextMyxAmount) && isSafeNumber(myxAmount)
        ? new Big(nextMyxAmount as string).minus(new Big(myxAmount as string)).toNumber()
        : 0
    setRequiredMyxAmount(amount > 0 ? amount : 0)
  }, [nextMyxAmount, myxAmount])

  useEffect(() => {
    if (!nextMyxAmount) {
      setProcess(safeTradeProcess)
      setMyxProcess(0)
    } else {
      const _nextMyxAmount = new Big(nextMyxAmount)
      const myxProcess =
        myxAmount && new Big(myxAmount).gte(_nextMyxAmount)
          ? 100
          : new Big(myxAmount || 0).mul(100).div(_nextMyxAmount).toNumber()
      const safeMyxProcess = myxProcess < 0 ? 0 : myxProcess > 100 ? 100 : myxProcess
      setMyxProcess(safeMyxProcess)
      if (nextVipRelation === LevelRelation.AND) {
        setProcess((safeMyxProcess * safeTradeProcess) / 100)
      }
      if (nextVipRelation === LevelRelation.OR) {
        setProcess(Math.max(safeMyxProcess, safeTradeProcess))
      }
    }
  }, [nextMyxAmount, nextVipRelation, myxAmount, safeTradeProcess])

  return {
    nextLevelInfo,
    safeTradeProcess,
    requiredTradeAmount,
    tradeAmount: userTradeAmount,
    nextVipRelation,
    nextMyxAmount,
    requiredMyxAmount,
    process,
    safeMyxProcess,
    currentLevelInfo,
    myxBalance: myxAmount,
    maxLevel,
  }
}
