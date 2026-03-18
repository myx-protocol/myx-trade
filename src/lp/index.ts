import * as base from './base/index.js';
import * as quote from './quote/index.js';
import * as market from './market/index.js';

export * from '../common/price.js';

// 显式从 pool 子模块导入并组装，避免前端打包时把 pool.getPoolInfo 等 tree-shake 掉
import {
  createPool,
  getMarketPoolId,
  getMarketPools,
  getPoolInfo,
  getUserGenesisShare,
  addTpSl,
  cancelTpSl,
  reprime,
  getPoolDetail,
  getOpenOrders,
} from './pool/index.js';
export type { AddTpSLParams, CancelTpSLParams, CreatePoolRequest, TpSLParams, TpSl } from './pool/type.js';

const pool = {
  createPool,
  getMarketPoolId,
  getMarketPools,
  getPoolInfo,
  getUserGenesisShare,
  addTpSl,
  cancelTpSl,
  reprime,
  getPoolDetail,
  getOpenOrders,
};

export { base, quote, pool, market };
export { COMMON_PRICE_DECIMALS, COMMON_LP_AMOUNT_DECIMALS } from "@/config/decimals";

export { formatUnits, parseUnits } from "viem";

