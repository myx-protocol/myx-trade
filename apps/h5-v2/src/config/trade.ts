import { isBetaMode, isProdMode } from '@/utils/env'

// Test 环境配置
const TEST_DEFAULT_PAIR_PATH =
  '/trade/421614/0x7176a4ebd00b33db90b6f5cf97e957979fba0d6f66db4ec7d818fae0218ba9b8'
const TEST_DEFAULT_PRICE_PATH =
  '/price/421614/0x0f3a23ce1f81d792bb74b7e748d7ee0c0c459db3c5fd06e1c792935f9a90fce0'

// Beta 环境配置 - 请配置 Beta 环境的路径
const BETA_DEFAULT_PAIR_PATH =
  '/trade/97/0x7b853856d3c47a79b346ba17593fe51426de0410e5f180ffcaed1f807269b858'
const BETA_DEFAULT_PRICE_PATH =
  '/price/97/0x7b853856d3c47a79b346ba17593fe51426de0410e5f180ffcaed1f807269b858'

// Prod 环境配置
const PROD_DEFAULT_PAIR_PATH =
  '/trade/56/0x7176a4ebd00b33db90b6f5cf97e957979fba0d6f66db4ec7d818fae0218ba9b8'
const PROD_DEFAULT_PRICE_PATH =
  '/price/56/0x7176a4ebd00b33db90b6f5cf97e957979fba0d6f66db4ec7d818fae0218ba9b8'

// 根据环境返回不同的配置
export const DEFAULT_PAIR_PATH = isProdMode()
  ? PROD_DEFAULT_PAIR_PATH
  : isBetaMode()
    ? BETA_DEFAULT_PAIR_PATH
    : TEST_DEFAULT_PAIR_PATH

export const DEFAULT_PRICE_PATH = isProdMode()
  ? PROD_DEFAULT_PRICE_PATH
  : isBetaMode()
    ? BETA_DEFAULT_PRICE_PATH
    : TEST_DEFAULT_PRICE_PATH
