function calculateExecution(OI: number, Y: number, A: number, s: number, basePrice: number) {
  if (Y === 0)
    return {
      noSlippageVolume: 0,
      slippageVolume: 0,
      R: 0,
      s_actual: 0,
      priceWithSlippage: basePrice,
      avgExecutionPrice: basePrice,
      realizedSlippagePercentage: 0,
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
    // Short (Y < 0)
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
      E_start = Math.abs(OI + A) // distance already below -A
      E_end = E_start + absY
    }
  }

  noSlippageVolume = Math.max(0, noSlippageVolume)
  slippageVolume = Math.max(0, slippageVolume)

  let s_actual = 0
  const R_display = 0

  if (slippageVolume > 0) {
    const V = slippageVolume

    let expEnd = E_end / A - 1
    let expStart = E_start / A - 1

    if (expEnd > 700) expEnd = 700
    if (expStart > 700) expStart = 700

    if (V / A < 0.0001) {
      const mid = (E_start + E_end) / 2
      let m = mid / A - 1
      if (m > 700) m = 700
      s_actual = Math.exp(m) * s
    } else {
      if (expStart >= 700) {
        s_actual = 10
      } else {
        const integral = A * s * (Math.exp(expEnd) - Math.exp(expStart))
        s_actual = integral / V
      }
    }

    const maxS = isLong ? 10 : 0.999
    if (s_actual > maxS) s_actual = maxS
  }

  const priceModifier = 1 + (isLong ? s_actual : -s_actual)
  const priceWithSlippage = basePrice * priceModifier
  const avgExecutionPrice =
    slippageVolume === 0
      ? basePrice
      : (slippageVolume * priceWithSlippage + noSlippageVolume * basePrice) / absY

  return {
    avgExecutionPrice,
  }
}

export function generateDepthData(oi: number, A: number, s: number, basePrice: number) {
  const shortData = [] // 代表做空 (Y < 0)，滑点后执行价格小于 basePrice
  const longData = [] // 代表做多 (Y > 0)，滑点后执行价格大于 basePrice
  const numPoints = 50

  console.log({ oi, A, s, basePrice })

  const deltaVolume = (A * 10) / numPoints

  for (let i = 1; i <= numPoints; i++) {
    const orderSize = (i * A * 10) / numPoints
    const calc = calculateExecution(oi, -orderSize, A, s, basePrice)
    shortData.push({ x: calc.avgExecutionPrice, y: deltaVolume })
  }

  for (let i = 1; i <= numPoints; i++) {
    const orderSize = (i * A * 10) / numPoints
    const calc = calculateExecution(oi, orderSize, A, s, basePrice)
    longData.push({ x: calc.avgExecutionPrice, y: deltaVolume })
  }

  const zeroCalc = calculateExecution(oi, 0, A, s, basePrice)
  shortData.push({ x: zeroCalc.avgExecutionPrice, y: 0 })
  longData.push({ x: zeroCalc.avgExecutionPrice, y: 0 })

  shortData.sort((a, b) => {
    if (a.x === b.x) return b.y - a.y
    return a.x - b.x
  })
  longData.sort((a, b) => {
    if (a.x === b.x) return a.y - b.y
    return a.x - b.x
  })
  console.log({ shortData, longData })
  return {
    shortData,
    longData,
    basePrice,
  }
}
