/**
 * 深度图数据生成包 - 纯数据输出，不依赖任何图表库
 *
 * 公式说明:
 * - 无滑点窗口: OI ∈ [-A, A] 时零滑点
 * - 指数模型: f(E) = s · e^(E/A - 1)
 * - 幂律模型: f(E) = s_pow · (E/A + 1)^n
 *
 * @example
 * const { calculateExecution, generateDepthChartData } = require('./depth-chart');
 * const { bids, asks } = generateDepthChartData({ OI: 0, A: 50, s: 0.005, basePrice: 1000 });
 */

export interface CalculateExecutionResult {
  noSlippageVolume: number
  slippageVolume: number
  R: number
  s_actual: number
  priceWithSlippage: number
  avgExecutionPrice: number
  realizedSlippagePercentage: number
}

export interface ModelParams {
  model?: 'exponential' | 'powerlaw'
  n?: number
  s_pow?: number
}

/**
 * 计算单笔订单的执行结果
 *
 * @param OI - 当前未平仓量
 * @param Y - 订单量 (正=多, 负=空)
 * @param A - 无滑点容量
 * @param s - 滑点系数 (小数, 如 0.005 表示 0.5%)
 * @param basePrice - 基准价格
 * @param modelParams - 可选，幂律模型参数。不传则用指数模型
 */
export function calculateExecution(
  OI: number,
  Y: number,
  A: number,
  s: number,
  basePrice: number,
  modelParams: ModelParams | null = null,
): CalculateExecutionResult {
  if (Y === 0) {
    return {
      noSlippageVolume: 0,
      slippageVolume: 0,
      R: 0,
      s_actual: 0,
      priceWithSlippage: basePrice,
      avgExecutionPrice: basePrice,
      realizedSlippagePercentage: 0,
    }
  }

  let noSlippageVolume = 0
  let slippageVolume = 0
  const isLong = Y > 0
  const absY = Math.abs(Y)

  let E_start = 0
  let E_end = 0

  if (isLong) {
    if (OI < A) {
      if (OI + Y <= A) {
        noSlippageVolume = absY
        slippageVolume = 0
      } else {
        noSlippageVolume = Math.max(0, A - OI)
        slippageVolume = absY - noSlippageVolume
        E_start = 0
        E_end = slippageVolume
      }
    } else {
      noSlippageVolume = 0
      slippageVolume = absY
      E_start = OI - A
      E_end = E_start + absY
    }
  } else {
    if (OI > -A) {
      if (OI + Y >= -A) {
        noSlippageVolume = absY
        slippageVolume = 0
      } else {
        noSlippageVolume = Math.max(0, OI - -A)
        slippageVolume = absY - noSlippageVolume
        E_start = 0
        E_end = slippageVolume
      }
    } else {
      noSlippageVolume = 0
      slippageVolume = absY
      E_start = Math.abs(OI + A)
      E_end = E_start + absY
    }
  }

  noSlippageVolume = Math.max(0, noSlippageVolume)
  slippageVolume = Math.max(0, slippageVolume)

  let s_actual = 0

  if (slippageVolume > 0) {
    const V = slippageVolume
    const usePowerlaw =
      modelParams?.model === 'powerlaw' && modelParams.n != null && modelParams.s_pow != null

    if (usePowerlaw && modelParams.n != null && modelParams.s_pow != null) {
      const { n, s_pow } = modelParams
      if (V / A < 0.0001) {
        const midE = (E_start + E_end) / 2
        s_actual = s_pow * Math.pow(midE / A + 1, n)
      } else {
        const u_end = E_end / A + 1
        const u_start = E_start / A + 1
        const integral =
          ((s_pow * A) / (n + 1)) * (Math.pow(u_end, n + 1) - Math.pow(u_start, n + 1))
        s_actual = integral / V
      }
    } else {
      let expEnd = E_end / A - 1
      let expStart = E_start / A - 1
      if (expEnd > 50) expEnd = 50
      if (expStart > 50) expStart = 50

      if (V / A < 0.0001) {
        const mid = (E_start + E_end) / 2
        s_actual = Math.exp(mid / A - 1) * s
      } else {
        const integral = A * s * (Math.exp(expEnd) - Math.exp(expStart))
        s_actual = integral / V
      }
    }
  }

  const R_displayFinal = slippageVolume > 0 ? E_end / A : 0
  const priceModifier = 1 + (isLong ? s_actual : -s_actual)
  const priceWithSlippage = basePrice * priceModifier
  const avgExecutionPrice =
    (slippageVolume * priceWithSlippage + noSlippageVolume * basePrice) / absY
  const realizedSlippagePercentage = (avgExecutionPrice - basePrice) / basePrice

  return {
    noSlippageVolume,
    slippageVolume,
    R: R_displayFinal,
    s_actual,
    priceWithSlippage,
    avgExecutionPrice,
    realizedSlippagePercentage,
  }
}

export interface DepthLevelRaw {
  price: number
  size: number
}

export interface GenerateDepthChartDataParams {
  OI?: number
  A: number
  s: number
  basePrice: number
  modelParams?: ModelParams | null
  numPoints?: number
  depthMultiplier?: number
  minPrice?: number | null
  maxPrice?: number | null
}

export interface GenerateDepthChartDataResult {
  bids: DepthLevelRaw[]
  asks: DepthLevelRaw[]
  basePrice: number
}

/**
 * 生成深度图数据
 *
 * @param params - 参数
 * @param params.OI - 当前未平仓量
 * @param params.A - 无滑点容量
 * @param params.s - 滑点系数 (小数)
 * @param params.basePrice - 基准价格
 * @param params.modelParams - 幂律模型参数，不传则用指数模型
 * @param params.numPoints - 每侧采样点数
 * @param params.depthMultiplier - 扫描深度倍数，实际扫描到 depthMultiplier * A
 * @param params.minPrice - 可选，过滤 bid 侧最低价格
 * @param params.maxPrice - 可选，过滤 ask 侧最高价格
 * @returns { bids, asks, basePrice }
 *   - bids: [{ price, size }] 卖单/做空侧，按 price 升序
 *   - asks: [{ price, size }] 买单/做多侧，按 price 升序
 */
export function generateDepthChartData(
  params: GenerateDepthChartDataParams,
): GenerateDepthChartDataResult {
  const {
    OI = 0,
    A,
    s,
    basePrice,
    modelParams = null,
    numPoints = 120,
    depthMultiplier = 10,
    minPrice: minPriceParam = null,
    maxPrice: maxPriceParam = null,
  } = params

  if (A == null || s == null || basePrice == null) {
    throw new Error('generateDepthChartData 需要 A, s, basePrice')
  }

  const defaultRange = basePrice * 0.1
  const _minPrice = minPriceParam ?? basePrice - defaultRange
  const _maxPrice = maxPriceParam ?? basePrice + defaultRange

  const bids: DepthLevelRaw[] = []
  const asks: DepthLevelRaw[] = []

  const maxOrderSize = A * depthMultiplier

  for (let i = 0; i < numPoints; i++) {
    const orderSize = (i * maxOrderSize) / numPoints

    const shortCalc = calculateExecution(OI, -orderSize, A, s, basePrice, modelParams)
    if (shortCalc.avgExecutionPrice >= _minPrice) {
      bids.push({ price: shortCalc.avgExecutionPrice, size: orderSize })
    }

    const longCalc = calculateExecution(OI, orderSize, A, s, basePrice, modelParams)
    if (longCalc.avgExecutionPrice <= _maxPrice) {
      asks.push({ price: longCalc.avgExecutionPrice, size: orderSize })
    }
  }

  const zeroCalc = calculateExecution(OI, 0, A, s, basePrice, modelParams)
  bids.push({ price: zeroCalc.avgExecutionPrice, size: 0 })
  asks.push({ price: zeroCalc.avgExecutionPrice, size: 0 })

  bids.sort((a, b) => a.price - b.price)
  asks.sort((a, b) => a.price - b.price)

  return {
    bids,
    asks,
    basePrice,
  }
}
