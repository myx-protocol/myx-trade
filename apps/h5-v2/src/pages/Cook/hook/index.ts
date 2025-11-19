import { useContext } from 'react'
import { PoolContext } from '@/pages/Cook/context.ts'

export const usePoolContext = () => useContext(PoolContext)
