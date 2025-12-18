const SLIPPAGE_STORAGE_KEY = 'MYX_Slippage'
import {
  DEFAULT_SLIPPAGE_LEVEL_1,
  DEFAULT_SLIPPAGE_LEVEL_2,
  DEFAULT_SLIPPAGE_LEVEL_3,
  DEFAULT_SLIPPAGE_LEVEL_4,
} from '@/constant/slippage'

export const SlippageTypeEnum = {
  OPEN: 'open',
  CLOSE: 'close',
  TPSL: 'tpsl',
} as const

export type SlippageType = (typeof SlippageTypeEnum)[keyof typeof SlippageTypeEnum]

interface SetSlippageProps {
  chainId: number
  poolId: string
  type: SlippageType
  slippage: number
}

interface GetSlippageProps {
  chainId: number
  poolId: string
  type: SlippageType
}

type SlippageInfo = {
  [chainId: number]: {
    [poolId: string]: {
      [type in SlippageType]?: number
    }
  }
}

/**
 * 从 localStorage 读取滑点信息
 */
const getSlippageInfo = (): SlippageInfo => {
  try {
    const stored = localStorage.getItem(SLIPPAGE_STORAGE_KEY)
    if (!stored) return {}
    return JSON.parse(stored) as SlippageInfo
  } catch (error) {
    console.error('Failed to parse slippage info:', error)
    return {}
  }
}

/**
 * 保存滑点信息到 localStorage
 */
const saveSlippageInfo = (slippageInfo: SlippageInfo): void => {
  try {
    localStorage.setItem(SLIPPAGE_STORAGE_KEY, JSON.stringify(slippageInfo))
  } catch (error) {
    console.error('Failed to save slippage info:', error)
  }
}

/**
 * 设置滑点
 * @param chainId - 链 ID
 * @param poolId - 池子 ID
 * @param type - 滑点类型（开仓/平仓/止盈止损）
 * @param slippage - 滑点值
 */
export const setSlippage = ({ chainId, poolId, type, slippage }: SetSlippageProps): void => {
  const slippageInfo = getSlippageInfo()

  // 如果该链不存在，初始化
  if (!slippageInfo[chainId]) {
    slippageInfo[chainId] = {}
  }

  // 如果该池子不存在，初始化
  if (!slippageInfo[chainId][poolId]) {
    slippageInfo[chainId][poolId] = {}
  }

  // 设置滑点值
  slippageInfo[chainId][poolId][type] = slippage

  // 保存到 localStorage
  saveSlippageInfo(slippageInfo)
}

/**
 * 获取滑点
 * @param chainId - 链 ID
 * @param poolId - 池子 ID
 * @param type - 滑点类型（开仓/平仓/止盈止损）
 * @returns 滑点值，如果不存在则返回 undefined
 */
export const getSlippage = ({ chainId, poolId, type }: GetSlippageProps): number | undefined => {
  const slippageInfo = getSlippageInfo()
  return slippageInfo[chainId]?.[poolId]?.[type]
}

/**
 * 删除特定滑点设置
 * @param chainId - 链 ID
 * @param poolId - 池子 ID
 * @param type - 滑点类型（开仓/平仓/止盈止损）
 */
export const removeSlippage = ({ chainId, poolId, type }: GetSlippageProps): void => {
  const slippageInfo = getSlippageInfo()

  if (slippageInfo[chainId]?.[poolId]?.[type] !== undefined) {
    delete slippageInfo[chainId][poolId][type]

    // 如果该池子下没有其他滑点设置，删除该池子
    if (Object.keys(slippageInfo[chainId][poolId]).length === 0) {
      delete slippageInfo[chainId][poolId]
    }

    // 如果该链下没有其他池子，删除该链
    if (Object.keys(slippageInfo[chainId]).length === 0) {
      delete slippageInfo[chainId]
    }

    saveSlippageInfo(slippageInfo)
  }
}

/**
 * 清除所有滑点设置
 */
export const clearAllSlippage = (): void => {
  try {
    localStorage.removeItem(SLIPPAGE_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear slippage info:', error)
  }
}

export const getSlippageConfig = (level: number) => {
  if (level === 1) {
    return DEFAULT_SLIPPAGE_LEVEL_1
  } else if (level === 2) {
    return DEFAULT_SLIPPAGE_LEVEL_2
  } else if (level === 3) {
    return DEFAULT_SLIPPAGE_LEVEL_3
  } else {
    return DEFAULT_SLIPPAGE_LEVEL_4
  }
}
