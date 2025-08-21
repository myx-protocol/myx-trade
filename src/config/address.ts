import { ChainId } from "./chain";
import { LINEA_BETA_SEPOLIA } from "./address/LINEA_BETA_SEPOLIA";
import { LINEA_TEST_SEPOLIA } from "./address/LINEA_TEST_SEPOLIA";
import { ARB_TEST_SEPOLIA } from "./address/ARB_TEST_SEPOLIA";
import BSC_TESTNET from "./chains/BSC_TESTNET";
import ARB_MAINNET from "./chains/ARB_MAINNET";
import LINEA_MAINNET from "./chains/LINEA_MAINNET";
import BSC_MAINNET from "./chains/BSC_MAINNET";

export default {
  [ChainId.LINEA_SEPOLIA] :  LINEA_TEST_SEPOLIA,
  [ChainId.ARB_TESTNET]:   ARB_TEST_SEPOLIA,
  [ChainId.BSC_TESTNET]: BSC_TESTNET,
  [ChainId.ARB_MAINNET]: ARB_MAINNET,
  [ChainId.LINEA_MAINNET]: LINEA_MAINNET,
  [ChainId.BSC_MAINNET]: BSC_MAINNET,
}
