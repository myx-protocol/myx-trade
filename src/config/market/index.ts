import { ChainId } from "@/config/chain";
import { ARB_TEST_SEPOLIA } from "@/config/market/ARB_TEST_SEPOLIA";
import { MarketInfo } from "@/config/market/type";

export type MarketInfoMap = { readonly [chainId: number]: MarketInfo }
export const Market: MarketInfoMap = {
  [ChainId.ARB_TESTNET]:ARB_TEST_SEPOLIA,
}

export type {MarketInfo} from "./type";
