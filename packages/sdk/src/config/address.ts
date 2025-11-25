import { ChainId } from "./chain";
import { ARB_TEST_SEPOLIA } from "./address/ARB_TEST_SEPOLIA";
import {LINEA_SEPOLIA} from './address/LINEA_SEPOLIA'

export default {
  [ChainId.ARB_TESTNET]: ARB_TEST_SEPOLIA,
  [ChainId.LINEA_SEPOLIA]: LINEA_SEPOLIA,
}
