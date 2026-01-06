import { ChainId } from "./chain";
import { ARB_TEST_SEPOLIA } from "./address/ARB_TEST_SEPOLIA";
import {LINEA_SEPOLIA} from './address/LINEA_SEPOLIA'
import { BSC_TEST_NET } from './address/BSC_TEST_NET';

export default {
  [ChainId.ARB_TESTNET]: ARB_TEST_SEPOLIA,
  [ChainId.LINEA_SEPOLIA]: LINEA_SEPOLIA,
  [ChainId.BSC_TESTNET]: BSC_TEST_NET,
}
