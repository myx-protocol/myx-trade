import { useContext, useMemo } from 'react'
import { CookContext } from '../context'

export const useCookFilter = () => {
  const {
    age,
    setAge,
    mc,
    setMC,
    progress,
    setProgress,
    change,
    setChange,
    liq,
    setLiq,
    holders,
    setHolders,
  } = useContext(CookContext)

  const count = useMemo(() => {
    return [age, mc, progress, change, liq, holders].reduce((prev, cur) => {
      if (cur[0] || cur[1]) return prev + 1
      return prev
    }, 0)
  }, [age, mc, progress, change, liq, holders])

  const clear = () => {
    setAge(['', ''])
    setMC(['', ''])
    setProgress(['', ''])
    setChange(['', ''])
    setLiq(['', ''])
    setHolders(['', ''])
  }

  return {
    age,
    setAge,
    mc,
    setMC,
    progress,
    setProgress,
    change,
    setChange,
    liq,
    setLiq,
    holders,
    setHolders,
    count,
    clear,
  }
}
