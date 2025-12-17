import { useQuery } from '@tanstack/react-query'
import { useMYXBalance } from './useMYXBalance'
import { useEffect, useMemo, useState } from 'react'
import { isUndefined } from 'lodash-es'
import { fetchVipInfo, fetchVipRate, listVipLevel } from '@/request/vip'
import {
  type LevelConfig,
  type LevelConfigResponse,
  LevelRelation,
  type LevelRule,
  type VipInfoType,
  type VipRateResponse,
  type VipRateType,
} from '@/request/vip/type.d'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { useAccessToken } from '@/hooks/useAccessToken.ts'
import { parseUnits } from 'ethers'
import Big from 'big.js'

export function useFetchLevelList() {
  const { data, isLoading } = useQuery({
    queryKey: [{ key: 'listVipLevel' }],
    queryFn: async () => {
      const rs: LevelConfigResponse = await listVipLevel()
      return (rs?.data ?? ([] as LevelConfig[])).map((item) => {
        return {
          level: item.level,
          rule: JSON.parse(item.rule) as LevelRule,
        }
      })
    },
    // enabled: inView
  })

  return { levelList: data ?? [], isLoading }
}

export function useFetchLevelRateList() {
  const { data } = useQuery({
    queryKey: [{ key: 'fetchFeeRateList' }],
    queryFn: async () => {
      const rs: VipRateResponse = await fetchVipRate()

      const list = rs?.data ?? ([] as VipRateType[])
      return list
    },
  })

  return { vipLevelRateList: data }
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
      const rs = await fetchVipInfo()
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
  const { levelList } = useFetchLevelList()
  const { userVipInfo } = useFetchUserVipInfo()
  const { getMYXBalance } = useMYXBalance()
  const { vipLevelRateList: rateList } = useFetchLevelRateList()

  const [myxBalance, setMyxBalance] = useState(0n)
  const [requiredMyxAmount, setRequiredMyxAmount] = useState<number>(0)
  const [process, setProcess] = useState<number>(0)
  const [safeMyxProcess, setMyxProcess] = useState<number>(0)

  const levels = useMemo(() => (levelList || []).map((item) => item.level).sort(), [levelList])
  const maxLevel = useMemo(() => Math.max(...levels), [levelList])

  const nextLevelInfo = useMemo(() => {
    if (levelList?.length && rateList?.length) {
      const level = userVipInfo?.level ?? 0
      const nextLevel = level + 1 >= maxLevel ? maxLevel : level + 1
      const levelInfo = levelList.find((level) => level.level === nextLevel)
      const rateInfo = rateList.find((rate) => rate.level === nextLevel)
      if (!levelInfo) {
        return undefined
      }
      return {
        ...levelInfo,
        takerFeeRate: rateInfo?.takerFeeRate,
        makerFeeRate: rateInfo?.makerFeeRate,
      }
    }
    return undefined
  }, [userVipInfo?.level, levelList, rateList, levels])

  const currentLevelInfo = useMemo(() => {
    if (levelList?.length && rateList?.length) {
      const level = userVipInfo?.level ?? 0
      const levelInfo = levelList.find((_level) => _level.level === level)
      const rateInfo = rateList.find((rate) => rate.level === level)
      return {
        ...levelInfo,
        takerFeeRate: rateInfo?.takerFeeRate,
        makerFeeRate: rateInfo?.makerFeeRate,
      }
    }
  }, [userVipInfo?.level, levelList, rateList, levels])

  const currentCompletion: LevelRule = userVipInfo?.currentCompletion ?? ({} as LevelRule)

  const nextTradeRule: LevelRule = nextLevelInfo?.rule ?? ({} as LevelRule)
  const nextTradeAmount = nextTradeRule.trade30Vol

  const nextVipRelation = nextTradeRule?.relation
  const nextMyxAmount = nextTradeRule?.myxDaily

  const safeNextTradeAmount =
    isUndefined(nextTradeAmount) || Number(nextTradeAmount) <= 0 ? 1 : Number(nextTradeAmount)
  const userTradeAmount = currentCompletion?.trade30Vol
    ? Number(userVipInfo?.currentCompletion?.trade30Vol)
    : 0

  const tradeProcess = (userTradeAmount / safeNextTradeAmount) * 100
  const safeTradeProcess = tradeProcess < 0 ? 0 : tradeProcess > 100 ? 100 : tradeProcess

  const diffTradeAmount = safeNextTradeAmount - userTradeAmount

  const safeDiffTradeAmount = diffTradeAmount < 0 ? 0 : diffTradeAmount
  const requiredTradeAmount = safeDiffTradeAmount

  const getBalance = async () => {
    const balance = await getMYXBalance()
    setMyxBalance(balance)
  }
  useEffect(() => {
    getBalance().then()
  }, [userVipInfo])

  useEffect(() => {
    const amount = nextMyxAmount
      ? new Big(nextMyxAmount).minus(new Big(myxBalance.toString())).toNumber()
      : 0
    setRequiredMyxAmount(amount > 0 ? amount : 0)
  }, [nextMyxAmount, myxBalance])

  useEffect(() => {
    if (!nextMyxAmount) {
      setProcess(safeTradeProcess)
      setMyxProcess(0)
    } else {
      const _nextMyxAmount = parseUnits(nextMyxAmount)
      const myxProcess =
        myxBalance >= _nextMyxAmount
          ? 100
          : new Big(myxBalance.toString())
              .mul(100)
              .div(new Big(_nextMyxAmount.toString()))
              .toNumber()
      const safeMyxProcess = myxProcess < 0 ? 0 : myxProcess > 100 ? 100 : myxProcess
      setMyxProcess(safeMyxProcess)
      if (nextVipRelation === LevelRelation.AND) {
        setProcess((safeMyxProcess * safeTradeProcess) / 100)
      }
      if (nextVipRelation === LevelRelation.OR) {
        setProcess(Math.max(safeMyxProcess, safeTradeProcess))
      }
    }
  }, [nextMyxAmount, nextVipRelation, myxBalance, safeTradeProcess])

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
    myxBalance,
    maxLevel,
  }
}
