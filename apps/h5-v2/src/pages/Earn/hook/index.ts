import { useContext } from 'react'
import { PoolContext } from '../context.js'

export const usePoolContext = () => useContext(PoolContext)
