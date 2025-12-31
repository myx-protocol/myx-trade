import { isBetaMode } from '@/utils/env'

// Test 环境配置
const TEST_DEFAULT_PAIR_PATH =
  '/trade/421614/0x8f1a46ef081575b8dc07c52844c7a9b8e2bfde249eae9ddba82df0a8eb6f6b31'
const TEST_DEFAULT_PRICE_PATH =
  '/trade/421614/0x0f3a23ce1f81d792bb74b7e748d7ee0c0c459db3c5fd06e1c792935f9a90fce0'

// Beta 环境配置 - 请配置 Beta 环境的路径
const BETA_DEFAULT_PAIR_PATH =
  '/trade/97/0x7b853856d3c47a79b346ba17593fe51426de0410e5f180ffcaed1f807269b858'
const BETA_DEFAULT_PRICE_PATH =
  '/trade/97/0x7b853856d3c47a79b346ba17593fe51426de0410e5f180ffcaed1f807269b858'

// 根据环境返回不同的配置
export const DEFAULT_PAIR_PATH = isBetaMode() ? BETA_DEFAULT_PAIR_PATH : TEST_DEFAULT_PAIR_PATH

export const DEFAULT_PRICE_PATH = isBetaMode() ? BETA_DEFAULT_PRICE_PATH : TEST_DEFAULT_PRICE_PATH
