export const isSafeNumber = (value?: string | number):boolean => {
  if (value === undefined || value === null) return false
  const num = Number(value)
  if (isNaN(num)) return false
  return true
}

export function formatNumberLocale(num:number, locale = 'en-US') {
  return new Intl.NumberFormat(locale).format(num);
}

export function thousandBitSeparator(num: number | string): string {
  if (Number.isNaN(Number(num)) || Number(num) < 1000) {
    return num.toString()
  }
  
  return formatNumberLocale(Number(num))
}

export function formatNumberPrecision(value: string | number , precision: number = 2, sign: boolean = false, isThousandBitSeparator: boolean = true, empty: string = '--'): string {
  if (isSafeNumber(value)) {
    const sValue = `${value}`
    const reg = new RegExp(`([0-9]+.[0-9]{${precision}})[0-9]*`, 'g')
    const num =  (+sValue.replace(reg, '$1')).toFixed(precision)
    const _sign = sign && Number(value) > 0 ? '+': ''
    if (isThousandBitSeparator) {
      return `${_sign}${thousandBitSeparator(num)}`
    }
    return `${_sign}${num}`
  }
  return empty
}

