import * as base from './base/index.js';
import * as quote from './quote/index.js';
import * as market from './market/index.js';

export * from '../common/price.js';

// Explicitly import and assemble from pool submodule to avoid pool.getPoolInfo and others being tree-shaken by frontend bundlers
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


