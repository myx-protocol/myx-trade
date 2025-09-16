var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/abi/LiquidityRouter.json
var LiquidityRouter_default = [
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        type: "address",
        name: "target"
      }
    ]
  },
  {
    type: "error",
    name: "DifferentMarket",
    inputs: [
      {
        type: "bytes32",
        name: "fromPoolId"
      },
      {
        type: "bytes32",
        name: "toPoolId"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        type: "address",
        name: "implementation"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967NonPayable",
    inputs: []
  },
  {
    type: "error",
    name: "FailedCall",
    inputs: []
  },
  {
    type: "error",
    name: "InsufficientAllowance",
    inputs: [
      {
        type: "address",
        name: "token"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "address",
        name: "spender"
      },
      {
        type: "uint256",
        name: "allowance"
      },
      {
        type: "uint256",
        name: "needed"
      }
    ]
  },
  {
    type: "error",
    name: "InsufficientQuoteIn",
    inputs: [
      {
        type: "uint256",
        name: "orderId"
      },
      {
        type: "uint256",
        name: "quoteIn"
      },
      {
        type: "uint256",
        name: "exchangeDelta"
      }
    ]
  },
  {
    type: "error",
    name: "InvalidAmount",
    inputs: [
      {
        type: "uint256",
        name: "amount"
      }
    ]
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidLiquidityAmount",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidTpsl",
    inputs: [
      {
        type: "uint256",
        name: "orderId"
      }
    ]
  },
  {
    type: "error",
    name: "NotDependencyManager",
    inputs: []
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: []
  },
  {
    type: "error",
    name: "NotProxyAdmin",
    inputs: []
  },
  {
    type: "error",
    name: "NotReachedPrice",
    inputs: [
      {
        type: "uint256",
        name: "orderId"
      },
      {
        type: "uint256",
        name: "price"
      },
      {
        type: "uint256",
        name: "triggerPrice"
      },
      {
        type: "uint8",
        name: "triggerType"
      }
    ]
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        type: "address",
        name: "token"
      }
    ]
  },
  {
    type: "error",
    name: "SamePoolMigration",
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ]
  },
  {
    type: "error",
    name: "SlippageExceeded",
    inputs: [
      {
        type: "uint256",
        name: "expected"
      },
      {
        type: "uint256",
        name: "actual"
      }
    ]
  },
  {
    type: "error",
    name: "UUPSUnauthorizedCallContext",
    inputs: []
  },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [
      {
        type: "bytes32",
        name: "slot"
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "Initialized",
    inputs: [
      {
        type: "uint64",
        name: "version",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "Upgraded",
    inputs: [
      {
        type: "address",
        name: "implementation",
        indexed: true
      }
    ]
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "string"
      }
    ]
  },
  {
    type: "function",
    name: "addTpsl",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint8",
            name: "poolType"
          },
          {
            type: "tuple[]",
            name: "tpslParams",
            components: [
              {
                type: "uint256",
                name: "amount"
              },
              {
                type: "uint256",
                name: "triggerPrice"
              },
              {
                type: "uint8",
                name: "triggerType"
              },
              {
                type: "uint256",
                name: "minQuoteOut"
              }
            ]
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "cancelTpsl",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "uint256",
        name: "orderId"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "claimRebate",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "address",
        name: "recipient"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "claimRebates",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "poolIds"
      },
      {
        type: "address",
        name: "recipient"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "currentOrderId",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "depositBase",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint256",
            name: "amountIn"
          },
          {
            type: "uint256",
            name: "minAmountOut"
          },
          {
            type: "address",
            name: "recipient"
          },
          {
            type: "tuple[]",
            name: "tpslParams",
            components: [
              {
                type: "uint256",
                name: "amount"
              },
              {
                type: "uint256",
                name: "triggerPrice"
              },
              {
                type: "uint8",
                name: "triggerType"
              },
              {
                type: "uint256",
                name: "minQuoteOut"
              }
            ]
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "depositQuote",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint256",
            name: "amountIn"
          },
          {
            type: "uint256",
            name: "minAmountOut"
          },
          {
            type: "address",
            name: "recipient"
          },
          {
            type: "tuple[]",
            name: "tpslParams",
            components: [
              {
                type: "uint256",
                name: "amount"
              },
              {
                type: "uint256",
                name: "triggerPrice"
              },
              {
                type: "uint8",
                name: "triggerType"
              },
              {
                type: "uint256",
                name: "minQuoteOut"
              }
            ]
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "executeTpsl",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "uint256",
        name: "orderId"
      },
      {
        type: "uint256",
        name: "quoteIn"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "getAddressManager",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getDependencyAddress",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "identifier"
      }
    ],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getDependencyIdentifier",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "contractAddress"
      }
    ],
    outputs: [
      {
        type: "bytes32"
      }
    ]
  },
  {
    type: "function",
    name: "getImplementation",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getTpslData",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "uint256",
        name: "orderId"
      }
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          {
            type: "address",
            name: "user"
          },
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint8",
            name: "poolType"
          },
          {
            type: "uint256",
            name: "amount"
          },
          {
            type: "uint256",
            name: "triggerPrice"
          },
          {
            type: "uint8",
            name: "triggerType"
          },
          {
            type: "uint256",
            name: "minQuoteOut"
          }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getUserTpslOrderIds",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "user"
      }
    ],
    outputs: [
      {
        type: "uint256[]"
      }
    ]
  },
  {
    type: "function",
    name: "initialize",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "address",
        name: "addressManager"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "migrateLiquidity",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "fromPoolId"
          },
          {
            type: "bytes32",
            name: "toPoolId"
          },
          {
            type: "uint256",
            name: "amount"
          },
          {
            type: "uint256",
            name: "minLpOut"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "proxiableUUID",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "bytes32"
      }
    ]
  },
  {
    type: "function",
    name: "registerDependencies",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "identifiers"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "unregisterDependencies",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "identifiers"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "upgradeTo",
    constant: false,
    stateMutability: "payable",
    payable: true,
    inputs: [
      {
        type: "address",
        name: "newImplementation"
      },
      {
        type: "bytes",
        name: "data"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    constant: false,
    stateMutability: "payable",
    payable: true,
    inputs: [
      {
        type: "address",
        name: "newImplementation"
      },
      {
        type: "bytes",
        name: "data"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "withdrawBase",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint256",
            name: "amountIn"
          },
          {
            type: "uint256",
            name: "minAmountOut"
          },
          {
            type: "address",
            name: "recipient"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "withdrawQuote",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint256",
            name: "amountIn"
          },
          {
            type: "uint256",
            name: "minAmountOut"
          },
          {
            type: "address",
            name: "recipient"
          }
        ]
      }
    ],
    outputs: []
  }
];

// src/config/chain.ts
var SupportedChainIds = [421614 /* ARB_TESTNET */];
function isSupportedChainFn(chainId3) {
  return !!chainId3 && SupportedChainIds.includes(chainId3);
}

// src/config/address/ARB_TEST_SEPOLIA.ts
import { ZeroAddress } from "ethers";
var ARB_TEST_SEPOLIA = {
  USDC: "",
  POOL_MANAGER: "0x121Ab2186CC7f86A174A64AACB3bB3765260b3f3",
  POOL_VIEW: "",
  HYPER_VAULT: ZeroAddress,
  FEE_COLLECTOR: "",
  POSITION_MANAGER: "",
  ORDER_MANAGER: "0x17b72e6713233EA5C16c952AFA7742F71B20ea8c",
  TRUSTED_FORWARDER: "",
  FRONT_FACET: "",
  // router address
  DELEGATE_FACET: "",
  // Seamless router address
  FAUCET: "",
  UI_POOL_DATA_PROVIDER: "",
  UI_POSITION_DATA_PROVIDER: "",
  PYTH: "",
  MYX: ZeroAddress,
  ERC20: "",
  LIQUIDITY_ROUTER: "0x25fbCa7A3aD9cAbA323227841Bd32Db0B82D6BdF",
  BASE_POOL: "0xc62e323AA83A871C1a6b2C1e44a6302b8344B061",
  QUOTE_POOL: "0xA5ecF0643eC18D5d21178aB8aB9Ef516306EBFb2",
  BROKER: "0xa70245309631Ce97425532466F24ef86FE630311"
};

// src/config/address.ts
var address_default = {
  [421614 /* ARB_TESTNET */]: ARB_TEST_SEPOLIA
};

// src/web3/index.ts
import {
  Contract,
  ethers,
  JsonRpcProvider,
  ZeroAddress as ZeroAddress2
} from "ethers";

// src/address.ts
import { getAddress } from "ethers";
import { isUndefined } from "lodash-es";
var ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
var _Address = class _Address {
  constructor(addr) {
    if (isUndefined(addr) || Number(addr) === 0) {
      addr = ZERO_ADDRESS.toString();
    }
    this._addr = getAddress(addr);
  }
  toString() {
    return this._addr.toString();
  }
  format() {
    return formatHex(this._addr.toString(), true);
  }
  unmaskFormat() {
    return formatHex(this._addr.toString(), false);
  }
  static from(addr) {
    return new _Address(addr);
  }
  isEqualTo(otherAddress) {
    return !!otherAddress && this.toString().toLowerCase() === otherAddress.toString().toLowerCase();
  }
};
_Address.ZERO_ADDRESS = new _Address(ZERO_ADDRESS);
var Address = _Address;
var formatHex = (hex, mask = true) => {
  if (mask) {
    return `${hex.slice(0, 6).toLowerCase()}...${hex.slice(-4).toLowerCase()}`;
  }
  return hex.toLowerCase();
};

// src/assets/icons/chain/logo/linea.png
var linea_default = "./linea-ZTA3FOH3.png";

// src/config/fee.ts
var GAS_FEE_RESERVED_RATIO = 10;

// src/config/chains/LINEA_SEPOLIA.ts
var LINEA_SEPOLIA_default = {
  chainId: 59141 /* LINEA_SEPOLIA */,
  chainInfo: {
    explorer: "https://sepolia.lineascan.build/",
    explorerOfTX: "https://sepolia.lineascan.build/tx/",
    publicJsonRPCUrl: [
      "https://rpc.sepolia.linea.build",
      "https://linea-sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
    ],
    label: "Linea Sepolia",
    logoUrl: linea_default,
    faucetUrl: "",
    chainSymbol: "Linea",
    gasPriceRatio: 1.3,
    gasLimitRatio: 1.2,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.525 + 1) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    }
  }
};

// src/assets/icons/chain/logo/arbitrum.png
var arbitrum_default = "./arbitrum-MLVIRDTQ.png";

// src/config/chains/ARB_SEPOLIA.ts
var ARB_SEPOLIA_default = {
  chainId: 421614 /* ARB_TESTNET */,
  chainInfo: {
    privateJsonRPCUrl: "",
    publicJsonRPCUrl: [
      "https://sepolia-rollup.arbitrum.io/rpc"
      // 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
    ],
    label: " Arbitrum Sepolia",
    chainSymbol: "Arb Sepolia",
    explorer: "https://sepolia.arbiscan.io/",
    explorerOfTX: "https://sepolia.arbiscan.io/tx/",
    faucetUrl: "https://bwarelabs.com/faucets/arbitrum-sepolia",
    logoUrl: arbitrum_default,
    gasPriceRatio: 1.5,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.055 + 1) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    }
  }
};

// src/assets/icons/chain/logo/opbnb.png
var opbnb_default = "./opbnb-5K2AGQHT.png";

// src/config/chains/BSC_TESTNET.ts
var BSC_TESTNET_default = {
  chainId: 97 /* BSC_TESTNET */,
  chainInfo: {
    privateJsonRPCUrl: "",
    publicJsonRPCUrl: ["https://bsc-testnet-dataseed.bnbchain.org"],
    label: "BNB Chain Testnet",
    chainSymbol: "BNB Chain Testnet",
    explorer: "https://testnet.bscscan.com/",
    explorerOfTX: "https://testnet.bscscan.com/tx/",
    faucetUrl: "https://docs.bnbchain.org/bnb-smart-chain/developers/faucet/",
    logoUrl: opbnb_default,
    gasPriceRatio: 1.5,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (5e-4 + 1) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    }
  }
};

// src/config/chains/LINEA_MAINNET.ts
var LINEA_MAINNET_default = {
  chainId: 59144 /* LINEA_MAINNET */,
  chainInfo: {
    label: "Linea Mainnet",
    explorer: "https://lineascan.build/",
    logoUrl: linea_default,
    explorerOfTX: "https://lineascan.build/tx/",
    publicJsonRPCUrl: [
      "https://rpc.linea.build/",
      "https://linea.blockpi.network/v1/rpc/public",
      "https://1rpc.io/linea",
      "https://rpc.linea.build"
    ],
    chainSymbol: "Linea",
    gasPriceRatio: 1.3,
    gasLimitRatio: 1.2,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.525 + 0.35) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    }
  }
};

// src/config/chains/ARB_MAINNET.ts
var ARB_MAINNET_default = {
  chainId: 42161 /* ARB_MAINNET */,
  chainInfo: {
    privateJsonRPCUrl: "",
    publicJsonRPCUrl: ["https://arb1.arbitrum.io/rpc"],
    label: " Arbitrum One",
    chainSymbol: "Arbitrum One",
    explorer: "https://arbiscan.io/",
    explorerOfTX: "https://arbiscan.io/tx/",
    logoUrl: arbitrum_default,
    gasPriceRatio: 1.5,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.055 + 0.175) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    }
  }
};

// src/config/chains/BSC_MAINNET.ts
var BSC_MAINNET_default = {
  chainId: 56 /* BSC_MAINNET */,
  chainInfo: {
    privateJsonRPCUrl: "",
    publicJsonRPCUrl: ["https://bsc-dataseed.bnbchain.org"],
    label: "BNB Chain",
    chainSymbol: "BNB Chain",
    explorer: "https://bscscan.com/",
    explorerOfTX: "https://bscscan.com/tx/",
    faucetUrl: "https://docs.bnbchain.org/bnb-smart-chain/developers/faucet/",
    logoUrl: opbnb_default,
    gasPriceRatio: 1.5,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (5e-4 + 1) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    }
  }
};

// src/config/chains/index.ts
var CHAIN_INFO = {
  [59141 /* LINEA_SEPOLIA */]: LINEA_SEPOLIA_default.chainInfo,
  [421614 /* ARB_TESTNET */]: ARB_SEPOLIA_default.chainInfo,
  [97 /* BSC_TESTNET */]: BSC_TESTNET_default.chainInfo,
  [59144 /* LINEA_MAINNET */]: LINEA_MAINNET_default.chainInfo,
  [42161 /* ARB_MAINNET */]: ARB_MAINNET_default.chainInfo,
  [56 /* BSC_MAINNET */]: BSC_MAINNET_default.chainInfo
};
function getChainInfo(chainId3) {
  const chainInfo = CHAIN_INFO[chainId3];
  if (!chainInfo) {
    throw new Error(`Could not find information with chain id ${chainId3}`);
  }
  return chainInfo;
}

// src/web3/rotationProvider.ts
import { BaseProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
var DEFAULT_FALL_FORWARD_DELAY = 6e4;
var MAX_RETRIES = 1;
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function checkNetworks(networks) {
  if (networks.length === 0) {
    console.error("no networks provided");
  }
  let result;
  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];
    if (!network) {
      console.error("network not defined");
    }
    if (!result) {
      result = network;
      continue;
    }
    if (!(result.name.toLowerCase() === network.name.toLowerCase() && result.chainId === network.chainId && (result.ensAddress?.toLowerCase() === network.ensAddress?.toLowerCase() || result.ensAddress == null && network.ensAddress == null))) {
      console.error("provider mismatch");
    }
  }
  if (!result) {
    console.error("no networks defined");
  }
  return result;
}
var RotationProvider = class extends BaseProvider {
  constructor(urls, chainId3, config) {
    super(chainId3);
    this.currentProviderIndex = 0;
    this.firstRotationTimestamp = 0;
    // number of full loops through provider array before throwing an error
    this.maxRetries = 0;
    this.retries = 0;
    this.lastError = "";
    this.providers = urls.map((url) => new StaticJsonRpcProvider(url, chainId3));
    this.maxRetries = config?.maxRetries || MAX_RETRIES;
    this.fallForwardDelay = config?.fallFowardDelay || DEFAULT_FALL_FORWARD_DELAY;
  }
  /**
   * If we rotate away from the first RPC, rotate back after a set interval to prioritize using most reliable RPC
   */
  async fallForwardRotation() {
    const now = Date.now();
    const diff = now - this.firstRotationTimestamp;
    if (diff < this.fallForwardDelay) {
      await sleep(this.fallForwardDelay - diff);
      this.currentProviderIndex = 0;
    }
  }
  /**
   * If rpc fails, rotate to next available and trigger rotation or fall forward delay where applicable
   * @param prevIndex last updated index, checked to avoid having multiple active rotations
   */
  rotateUrl(prevIndex) {
    if (prevIndex !== this.currentProviderIndex) return;
    if (this.currentProviderIndex === 0) {
      this.currentProviderIndex += 1;
      this.firstRotationTimestamp = Date.now();
      this.fallForwardRotation();
    } else if (this.currentProviderIndex === this.providers.length - 1) {
      this.retries += 1;
      if (this.retries > this.maxRetries) {
        this.retries = 0;
        throw new Error(
          `RotationProvider exceeded max number of retries. Last error: ${this.lastError}`
        );
      }
      this.currentProviderIndex = 0;
    } else {
      this.currentProviderIndex += 1;
    }
  }
  async detectNetwork() {
    const networks = await Promise.all(
      this.providers.map((c) => c.getNetwork())
    );
    return checkNetworks(networks);
  }
  async perform(method, params) {
    const index = this.currentProviderIndex;
    try {
      return await this.providers[index].perform(method, params);
    } catch (e) {
      console.error(e.message);
      this.lastError = e.message;
      this.emit("debug", {
        action: "perform",
        provider: this.providers[index]
      });
      await this.rotateUrl(index);
      return this.perform(method, params);
    }
  }
};

// package.json
var package_default = {
  name: "@myx-trade/sdk",
  version: "1.0.0",
  description: "MYX Trade SDK for trading operations",
  main: "dist/index.js",
  module: "dist/index.mjs",
  types: "dist/index.d.ts",
  exports: {
    ".": {
      import: "./dist/index.mjs",
      require: "./dist/index.js",
      types: "./dist/index.d.ts"
    }
  },
  files: [
    "dist"
  ],
  scripts: {
    build: "tsup src/index.ts --format cjs,esm --dts",
    dev: "tsup src/index.ts --format cjs,esm --dts --watch",
    clean: "rm -rf dist",
    prebuild: "npm run clean",
    "gen:abi": "typechain --target ethers-v6 --out-dir ./src/abi/types './src/abi/**/*.json'"
  },
  keywords: ["trading", "sdk", "myx", "finance"],
  author: "",
  license: "ISC",
  packageManager: "pnpm@10.12.4",
  devDependencies: {
    "@typechain/ethers-v6": "^0.5.1",
    "@types/lodash-es": "^4.17.12",
    "@types/node": "^24.3.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.3.0",
    typechain: "^8.3.2",
    typescript: "^5.3.0",
    tsup: "^8.0.0"
  },
  dependencies: {
    "@ethersproject/providers": "^5.8.0",
    ethers: "^6.15.0",
    "ethers-decode-error": "^2.1.3",
    "lodash-es": "^4.17.21"
  }
};

// src/web3/index.ts
function getContract(address, ABI, provider) {
  if (Address.from(address).isEqualTo(ZeroAddress2)) {
    throw new Error(`Invalid 'address' parameter '${address}'.`);
  }
  return new Contract(address, ABI, provider);
}
var getJSONProvider = (chainId3) => {
  const chainConfig = getChainInfo(chainId3);
  const chainProviders = [];
  if (chainConfig.privateJsonRPCUrl) {
    chainProviders.push(chainConfig.privateJsonRPCUrl);
  }
  if (chainConfig.publicJsonRPCUrl.length > 0) {
    chainConfig.publicJsonRPCUrl.map((rpc) => chainProviders.push(rpc));
  }
  if (chainProviders.length === 0) {
    throw new Error(`${chainId3} has no jsonRPCUrl configured`);
  }
  if (chainProviders.length === 1) {
    return new JsonRpcProvider(chainProviders[0], chainId3, {
      staticNetwork: true
    });
  } else {
    return new RotationProvider(chainProviders, chainId3);
  }
};
var MxSDK = class _MxSDK {
  constructor() {
    this.version = package_default.version;
    console.log(this.version);
  }
  setProvider(provider) {
    this.provider = provider;
  }
  getProvider() {
    return this.provider;
  }
  static getInstance() {
    if (!this._instance) {
      this._instance = new _MxSDK();
    }
    return this._instance;
  }
};
var sdk = MxSDK.getInstance();
if (typeof window !== "undefined") {
  window.MxSDK = sdk;
} else if (typeof globalThis !== "undefined") {
  globalThis.MxSDK = sdk;
}
var getWalletProvider = async (chainId3) => {
  try {
    const provider = sdk.provider;
    if (!provider) {
      throw new Error("Provider missing in provider");
    }
    if (chainId3) {
      const network = await provider.getNetwork();
      console.log(provider);
      console.log(`Connected to chain: ${network.chainId}, requested: ${chainId3}`);
      if (Number(network.chainId) !== chainId3) {
        await provider.send("wallet_switchEthereumChain", [{ chainId: BigInt(chainId3) }]);
      }
    }
    return provider;
  } catch (error) {
    console.error("Error getting wallet provider:", error);
    return ethers.getDefaultProvider("mainnet");
  }
};
var getSignerProvider = async (chainId3) => {
  const provider = await getWalletProvider(chainId3);
  console.log(provider);
  return provider?.getSigner?.();
};

// src/abi/PoolManager.json
var PoolManager_default = [
  {
    type: "constructor",
    payable: false,
    inputs: []
  },
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        type: "address",
        name: "target"
      }
    ]
  },
  {
    type: "error",
    name: "BaseFeeNotSoldOut",
    inputs: []
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        type: "address",
        name: "implementation"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967NonPayable",
    inputs: []
  },
  {
    type: "error",
    name: "FailedCall",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidBaseAssetAddress",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: []
  },
  {
    type: "error",
    name: "LPNotFullyMinted",
    inputs: []
  },
  {
    type: "error",
    name: "MarketNotExist",
    inputs: [
      {
        type: "bytes32",
        name: "marketId"
      }
    ]
  },
  {
    type: "error",
    name: "NotDependencyManager",
    inputs: []
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: []
  },
  {
    type: "error",
    name: "NotProxyAdmin",
    inputs: []
  },
  {
    type: "error",
    name: "PermissionDenied",
    inputs: [
      {
        type: "address",
        name: "caller"
      },
      {
        type: "address",
        name: "target"
      }
    ]
  },
  {
    type: "error",
    name: "PoolNotExist",
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ]
  },
  {
    type: "error",
    name: "PositionNotEmpty",
    inputs: []
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: []
  },
  {
    type: "error",
    name: "UUPSUnauthorizedCallContext",
    inputs: []
  },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [
      {
        type: "bytes32",
        name: "slot"
      }
    ]
  },
  {
    type: "error",
    name: "UnexpectedPoolState",
    inputs: []
  },
  {
    type: "error",
    name: "WindowCapOutOfRange",
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "Initialized",
    inputs: [
      {
        type: "uint64",
        name: "version",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "Upgraded",
    inputs: [
      {
        type: "address",
        name: "implementation",
        indexed: true
      }
    ]
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "string"
      }
    ]
  },
  {
    type: "function",
    name: "benchPool",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint256",
            name: "baseAmount"
          },
          {
            type: "uint256",
            name: "quoteAmount"
          },
          {
            type: "string",
            name: "remark"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "checkPoolExists",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ],
    outputs: [
      {
        type: "bool"
      }
    ]
  },
  {
    type: "function",
    name: "deployPool",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "marketId"
          },
          {
            type: "address",
            name: "baseToken"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "getAddressManager",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getDependencyAddress",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "identifier"
      }
    ],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getDependencyIdentifier",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "contractAddress"
      }
    ],
    outputs: [
      {
        type: "bytes32"
      }
    ]
  },
  {
    type: "function",
    name: "getImplementation",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getMarketPool",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "marketId"
      },
      {
        type: "address",
        name: "asset"
      }
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          {
            type: "bytes32",
            name: "marketId"
          },
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "address",
            name: "baseToken"
          },
          {
            type: "address",
            name: "quoteToken"
          },
          {
            type: "address",
            name: "basePoolToken"
          },
          {
            type: "address",
            name: "quotePoolToken"
          },
          {
            type: "address",
            name: "poolVault"
          },
          {
            type: "address",
            name: "settler"
          },
          {
            type: "address",
            name: "tradingVault"
          },
          {
            type: "uint8",
            name: "oracleType"
          },
          {
            type: "bytes32",
            name: "oracleFeedId"
          },
          {
            type: "uint16",
            name: "maxPriceDeviation"
          },
          {
            type: "uint8",
            name: "riskTier"
          },
          {
            type: "uint8",
            name: "state"
          },
          {
            type: "bool",
            name: "compoundEnabled"
          },
          {
            type: "uint128",
            name: "windowCapUsd"
          }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getPool",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          {
            type: "bytes32",
            name: "marketId"
          },
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "address",
            name: "baseToken"
          },
          {
            type: "address",
            name: "quoteToken"
          },
          {
            type: "address",
            name: "basePoolToken"
          },
          {
            type: "address",
            name: "quotePoolToken"
          },
          {
            type: "address",
            name: "poolVault"
          },
          {
            type: "address",
            name: "settler"
          },
          {
            type: "address",
            name: "tradingVault"
          },
          {
            type: "uint8",
            name: "oracleType"
          },
          {
            type: "bytes32",
            name: "oracleFeedId"
          },
          {
            type: "uint16",
            name: "maxPriceDeviation"
          },
          {
            type: "uint8",
            name: "riskTier"
          },
          {
            type: "uint8",
            name: "state"
          },
          {
            type: "bool",
            name: "compoundEnabled"
          },
          {
            type: "uint128",
            name: "windowCapUsd"
          }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getPoolMarket",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ],
    outputs: [
      {
        type: "tuple",
        components: [
          {
            type: "bytes32",
            name: "marketId"
          },
          {
            type: "address",
            name: "quoteToken"
          },
          {
            type: "uint32",
            name: "baseReserveRatio"
          },
          {
            type: "uint32",
            name: "quoteReserveRatio"
          },
          {
            type: "uint128",
            name: "oracleFeeUsd"
          },
          {
            type: "uint128",
            name: "oracleRefundFeeUsd"
          },
          {
            type: "uint128",
            name: "poolPrimeThreshold"
          }
        ]
      }
    ]
  },
  {
    type: "function",
    name: "getPools",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "bytes32[]",
        name: "pools"
      }
    ]
  },
  {
    type: "function",
    name: "initialize",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "address",
        name: "addressManager"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "perBenchPool",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "string",
            name: "remark"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "primePool",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint256",
            name: "initPrice"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "proxiableUUID",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "bytes32"
      }
    ]
  },
  {
    type: "function",
    name: "registerDependencies",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "identifiers"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "reprimePool",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "trenchPool",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "bytes32",
            name: "oracleFeedId"
          },
          {
            type: "uint8",
            name: "oracleType"
          },
          {
            type: "uint16",
            name: "maxPriceDeviation"
          },
          {
            type: "uint8",
            name: "riskTier"
          },
          {
            type: "uint128",
            name: "windowCapUsd"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "unregisterDependencies",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "identifiers"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "updatePoolCompoundEnabled",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple[]",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "bool",
            name: "enabled"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "updatePoolPriceDeviations",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple[]",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint16",
            name: "maxPriceDeviation"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "updatePoolRiskTiers",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple[]",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint8",
            name: "riskTier"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "updatePoolWindowCaps",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple[]",
        name: "params",
        components: [
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint128",
            name: "windowCapUsd"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "upgradeTo",
    constant: false,
    stateMutability: "payable",
    payable: true,
    inputs: [
      {
        type: "address",
        name: "newImplementation"
      },
      {
        type: "bytes",
        name: "data"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    constant: false,
    stateMutability: "payable",
    payable: true,
    inputs: [
      {
        type: "address",
        name: "newImplementation"
      },
      {
        type: "bytes",
        name: "data"
      }
    ],
    outputs: []
  }
];

// src/abi/IERC20Metadata.json
var IERC20Metadata_default = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name_",
        type: "string"
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string"
      },
      {
        internalType: "uint8",
        name: "decimals_",
        type: "uint8"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    inputs: [],
    name: "InvalidShortString",
    type: "error"
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "str",
        type: "string"
      }
    ],
    name: "StringTooLong",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "Approval",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [],
    name: "EIP712DomainChanged",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256"
      }
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      {
        internalType: "bytes1",
        name: "fields",
        type: "bytes1"
      },
      {
        internalType: "string",
        name: "name",
        type: "string"
      },
      {
        internalType: "string",
        name: "version",
        type: "string"
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "verifyingContract",
        type: "address"
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32"
      },
      {
        internalType: "uint256[]",
        name: "extensions",
        type: "uint256[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256"
      }
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256"
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8"
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32"
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32"
      }
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];

// src/abi/QuotePool.json
var QuotePool_default = [
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        type: "address",
        name: "target"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        type: "address",
        name: "implementation"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967NonPayable",
    inputs: []
  },
  {
    type: "error",
    name: "FailedCall",
    inputs: []
  },
  {
    type: "error",
    name: "InsufficientOutputAmount",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: []
  },
  {
    type: "error",
    name: "NotDependencyManager",
    inputs: []
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: []
  },
  {
    type: "error",
    name: "NotProxyAdmin",
    inputs: []
  },
  {
    type: "error",
    name: "PermissionDenied",
    inputs: [
      {
        type: "address",
        name: "caller"
      },
      {
        type: "address",
        name: "target"
      }
    ]
  },
  {
    type: "error",
    name: "PoolNotActive",
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ]
  },
  {
    type: "error",
    name: "PoolNotExist",
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ]
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: []
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        type: "address",
        name: "token"
      }
    ]
  },
  {
    type: "error",
    name: "UUPSUnauthorizedCallContext",
    inputs: []
  },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [
      {
        type: "bytes32",
        name: "slot"
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "Initialized",
    inputs: [
      {
        type: "uint64",
        name: "version",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "QuotePoolProfitDistributed",
    inputs: [
      {
        type: "bytes32",
        name: "poolId",
        indexed: false
      },
      {
        type: "uint256",
        name: "amount",
        indexed: false
      },
      {
        type: "uint256",
        name: "genesisAmount",
        indexed: false
      },
      {
        type: "uint256",
        name: "price",
        indexed: false
      },
      {
        type: "uint256",
        name: "exchangeRate",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "Upgraded",
    inputs: [
      {
        type: "address",
        name: "implementation",
        indexed: true
      }
    ]
  },
  {
    type: "function",
    name: "EXCHANGE_RATE_PRECISION",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "POOL_TOKEN_DECIMALS",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "uint8"
      }
    ]
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "string"
      }
    ]
  },
  {
    type: "function",
    name: "deposit",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "amountIn"
      },
      {
        type: "uint256",
        name: "minAmountOut"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "address",
        name: "recipient"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "amountOut"
      }
    ]
  },
  {
    type: "function",
    name: "distribute",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "amount"
      },
      {
        type: "uint256",
        name: "genesisAmount"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "getAddressManager",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getDependencyAddress",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "identifier"
      }
    ],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getDependencyIdentifier",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "contractAddress"
      }
    ],
    outputs: [
      {
        type: "bytes32"
      }
    ]
  },
  {
    type: "function",
    name: "getExchangeRate",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "getExchangeRate",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "getImplementation",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getPoolTokenPrice",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "initialize",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "address",
        name: "addressManager"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "pendingUserRebates",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "previewLpAmountOut",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "amountIn"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "previewPoolTokenPrice",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "previewQuoteAmountOut",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "amountIn"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "previewUserWithdrawData",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "lpAmountIn"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "quoteAmountOut"
      }
    ]
  },
  {
    type: "function",
    name: "proxiableUUID",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "bytes32"
      }
    ]
  },
  {
    type: "function",
    name: "registerDependencies",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "identifiers"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "unregisterDependencies",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "identifiers"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "upgradeTo",
    constant: false,
    stateMutability: "payable",
    payable: true,
    inputs: [
      {
        type: "address",
        name: "newImplementation"
      },
      {
        type: "bytes",
        name: "data"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    constant: false,
    stateMutability: "payable",
    payable: true,
    inputs: [
      {
        type: "address",
        name: "newImplementation"
      },
      {
        type: "bytes",
        name: "data"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "withdraw",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "amountIn"
      },
      {
        type: "uint256",
        name: "minAmountOut"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "address",
        name: "recipient"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "amountOut"
      }
    ]
  }
];

// src/abi/BasePool.json
var BasePool_default = [
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        type: "address",
        name: "target"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        type: "address",
        name: "implementation"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967NonPayable",
    inputs: []
  },
  {
    type: "error",
    name: "ExceedMaxProfit",
    inputs: []
  },
  {
    type: "error",
    name: "ExceedMinOutputAmount",
    inputs: []
  },
  {
    type: "error",
    name: "FailedCall",
    inputs: []
  },
  {
    type: "error",
    name: "InsufficientOutputAmount",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: []
  },
  {
    type: "error",
    name: "NotDependencyManager",
    inputs: []
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: []
  },
  {
    type: "error",
    name: "NotProxyAdmin",
    inputs: []
  },
  {
    type: "error",
    name: "PermissionDenied",
    inputs: [
      {
        type: "address",
        name: "caller"
      },
      {
        type: "address",
        name: "target"
      }
    ]
  },
  {
    type: "error",
    name: "PoolNotActive",
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ]
  },
  {
    type: "error",
    name: "PoolNotCompoundable",
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ]
  },
  {
    type: "error",
    name: "PoolNotExist",
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ]
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: []
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        type: "address",
        name: "token"
      }
    ]
  },
  {
    type: "error",
    name: "UUPSUnauthorizedCallContext",
    inputs: []
  },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [
      {
        type: "bytes32",
        name: "slot"
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "BasePoolProfitDistributed",
    inputs: [
      {
        type: "bytes32",
        name: "poolId",
        indexed: true
      },
      {
        type: "uint256",
        name: "baseAmount",
        indexed: false
      },
      {
        type: "uint256",
        name: "quoteAmount",
        indexed: false
      },
      {
        type: "uint256",
        name: "price",
        indexed: false
      },
      {
        type: "uint256",
        name: "exchangeRate",
        indexed: false
      },
      {
        type: "uint256",
        name: "rebateIndex",
        indexed: false
      },
      {
        type: "uint256",
        name: "genesisRebateIndex",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "Initialized",
    inputs: [
      {
        type: "uint64",
        name: "version",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "PoolProfitExchanged",
    inputs: [
      {
        type: "bytes32",
        name: "poolId",
        indexed: true
      },
      {
        type: "uint256",
        name: "baseIn",
        indexed: false
      },
      {
        type: "uint256",
        name: "quoteOut",
        indexed: false
      },
      {
        type: "uint256",
        name: "price",
        indexed: false
      },
      {
        type: "address",
        name: "recipient",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "PoolRebateIndexUpdated",
    inputs: [
      {
        type: "bytes32",
        name: "poolId",
        indexed: true
      },
      {
        type: "uint256",
        name: "remainingProfits",
        indexed: false
      },
      {
        type: "uint256",
        name: "oldIndex",
        indexed: false
      },
      {
        type: "uint256",
        name: "newIndex",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "Upgraded",
    inputs: [
      {
        type: "address",
        name: "implementation",
        indexed: true
      }
    ]
  },
  {
    type: "function",
    name: "EXCHANGE_RATE_PRECISION",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "POOL_TOKEN_DECIMALS",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "uint8"
      }
    ]
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "string"
      }
    ]
  },
  {
    type: "function",
    name: "claimUserRebate",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "address",
        name: "recipient"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "rebateOut"
      }
    ]
  },
  {
    type: "function",
    name: "claimUserRebates",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "poolIds"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "address",
        name: "recipient"
      }
    ],
    outputs: [
      {
        type: "uint256[]",
        name: "rebateOut"
      }
    ]
  },
  {
    type: "function",
    name: "deposit",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "amountIn"
      },
      {
        type: "uint256",
        name: "minAmountOut"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "address",
        name: "recipient"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "amountOut"
      }
    ]
  },
  {
    type: "function",
    name: "distribute",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "baseAmount"
      },
      {
        type: "uint256",
        name: "quoteAmount"
      },
      {
        type: "uint256",
        name: "genesisAmount"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "exchangeProfit",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "baseIn"
      },
      {
        type: "uint256",
        name: "minQuoteOut"
      },
      {
        type: "address",
        name: "recipient"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "quoteOut"
      }
    ]
  },
  {
    type: "function",
    name: "getAddressManager",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getDependencyAddress",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "identifier"
      }
    ],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getDependencyIdentifier",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "contractAddress"
      }
    ],
    outputs: [
      {
        type: "bytes32"
      }
    ]
  },
  {
    type: "function",
    name: "getExchangeRate",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "getExchangeRate",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "getExchangeableProfit",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "baseIn"
      },
      {
        type: "uint256",
        name: "quoteOut"
      }
    ]
  },
  {
    type: "function",
    name: "getImplementation",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getPoolTokenPrice",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "initialize",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "address",
        name: "addressManager"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "pendingUserRebates",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "previewBaseAmountOut",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "lpAmountIn"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "previewExchangeableProfit",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "baseIn"
      },
      {
        type: "uint256",
        name: "quoteOut"
      }
    ]
  },
  {
    type: "function",
    name: "previewLpAmountOut",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "baseAmountIn"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "previewPoolTokenPrice",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      }
    ],
    outputs: [
      {
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "previewUserWithdrawData",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "lpAmountIn"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "uint256",
        name: "price"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "baseAmountOut"
      },
      {
        type: "uint256",
        name: "rebateAmount"
      }
    ]
  },
  {
    type: "function",
    name: "proxiableUUID",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "bytes32"
      }
    ]
  },
  {
    type: "function",
    name: "registerDependencies",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "identifiers"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "unregisterDependencies",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "identifiers"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "upgradeTo",
    constant: false,
    stateMutability: "payable",
    payable: true,
    inputs: [
      {
        type: "address",
        name: "newImplementation"
      },
      {
        type: "bytes",
        name: "data"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    constant: false,
    stateMutability: "payable",
    payable: true,
    inputs: [
      {
        type: "address",
        name: "newImplementation"
      },
      {
        type: "bytes",
        name: "data"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "withdraw",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "uint256",
        name: "amountIn"
      },
      {
        type: "uint256",
        name: "minAmountOut"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "address",
        name: "recipient"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "amountOut"
      },
      {
        type: "uint256",
        name: "rebateOut"
      }
    ]
  }
];

// src/abi/Broker.json
var Broker_default = [
  {
    type: "error",
    name: "AddressEmptyCode",
    inputs: [
      {
        type: "address",
        name: "target"
      }
    ]
  },
  {
    type: "error",
    name: "BrokerNotActive",
    inputs: []
  },
  {
    type: "error",
    name: "ECDSAInvalidSignature",
    inputs: []
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureLength",
    inputs: [
      {
        type: "uint256",
        name: "length"
      }
    ]
  },
  {
    type: "error",
    name: "ECDSAInvalidSignatureS",
    inputs: [
      {
        type: "bytes32",
        name: "s"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967InvalidImplementation",
    inputs: [
      {
        type: "address",
        name: "implementation"
      }
    ]
  },
  {
    type: "error",
    name: "ERC1967NonPayable",
    inputs: []
  },
  {
    type: "error",
    name: "ExpiredFeeData",
    inputs: []
  },
  {
    type: "error",
    name: "FailedCall",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidFeeRate",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidInitialization",
    inputs: []
  },
  {
    type: "error",
    name: "NoRebateToClaim",
    inputs: []
  },
  {
    type: "error",
    name: "NotBrokerSigner",
    inputs: [
      {
        type: "address",
        name: "signer"
      }
    ]
  },
  {
    type: "error",
    name: "NotContractConfigurator",
    inputs: []
  },
  {
    type: "error",
    name: "NotDependencyManager",
    inputs: []
  },
  {
    type: "error",
    name: "NotInitializing",
    inputs: []
  },
  {
    type: "error",
    name: "NotProxyAdmin",
    inputs: []
  },
  {
    type: "error",
    name: "OwnableInvalidOwner",
    inputs: [
      {
        type: "address",
        name: "owner"
      }
    ]
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [
      {
        type: "address",
        name: "account"
      }
    ]
  },
  {
    type: "error",
    name: "PermissionDenied",
    inputs: []
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: []
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [
      {
        type: "address",
        name: "token"
      }
    ]
  },
  {
    type: "error",
    name: "UUPSUnauthorizedCallContext",
    inputs: []
  },
  {
    type: "error",
    name: "UUPSUnsupportedProxiableUUID",
    inputs: [
      {
        type: "bytes32",
        name: "slot"
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "AddOnFeeTierUpdated",
    inputs: [
      {
        type: "address",
        name: "broker",
        indexed: false
      },
      {
        type: "uint8",
        name: "tier",
        indexed: false
      },
      {
        type: "uint32",
        name: "takerFeeRate",
        indexed: false
      },
      {
        type: "uint32",
        name: "makerFeeRate",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "BrokerStatusUpdated",
    inputs: [
      {
        type: "address",
        name: "broker",
        indexed: false
      },
      {
        type: "bool",
        name: "isActive",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "EIP712DomainChanged",
    inputs: []
  },
  {
    type: "event",
    anonymous: false,
    name: "Initialized",
    inputs: [
      {
        type: "uint64",
        name: "version",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "OwnershipTransferStarted",
    inputs: [
      {
        type: "address",
        name: "previousOwner",
        indexed: true
      },
      {
        type: "address",
        name: "newOwner",
        indexed: true
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "OwnershipTransferred",
    inputs: [
      {
        type: "address",
        name: "previousOwner",
        indexed: true
      },
      {
        type: "address",
        name: "newOwner",
        indexed: true
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "RebateClaimed",
    inputs: [
      {
        type: "address",
        name: "user",
        indexed: false
      },
      {
        type: "address",
        name: "token",
        indexed: false
      },
      {
        type: "uint256",
        name: "amount",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "SignerUpdated",
    inputs: [
      {
        type: "address",
        name: "signer",
        indexed: false
      },
      {
        type: "bool",
        name: "isSigner",
        indexed: false
      }
    ]
  },
  {
    type: "event",
    anonymous: false,
    name: "Upgraded",
    inputs: [
      {
        type: "address",
        name: "implementation",
        indexed: true
      }
    ]
  },
  {
    type: "function",
    name: "FEE_TYPEHASH",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "bytes32"
      }
    ]
  },
  {
    type: "function",
    name: "UPGRADE_INTERFACE_VERSION",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "string"
      }
    ]
  },
  {
    type: "function",
    name: "acceptOwnership",
    constant: false,
    payable: false,
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "activeFeeTiers",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "uint256[]"
      }
    ]
  },
  {
    type: "function",
    name: "adjustCollateral",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "uint256",
        name: "positionId"
      },
      {
        type: "int256",
        name: "adjustAmount"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "cancelOrder",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "uint256",
        name: "orderId"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "cancelOrders",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "uint256[]",
        name: "orderIds"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "claimRebate",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "address",
        name: "token"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "claimRebates",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "address[]",
        name: "tokens"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "eip712Domain",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "bytes1",
        name: "fields"
      },
      {
        type: "string",
        name: "name"
      },
      {
        type: "string",
        name: "version"
      },
      {
        type: "uint256",
        name: "chainId"
      },
      {
        type: "address",
        name: "verifyingContract"
      },
      {
        type: "bytes32",
        name: "salt"
      },
      {
        type: "uint256[]",
        name: "extensions"
      }
    ]
  },
  {
    type: "function",
    name: "getAddOnFeeTier",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "uint8",
        name: "tier"
      }
    ],
    outputs: [
      {
        type: "uint32",
        name: "takerFeeRate"
      },
      {
        type: "uint32",
        name: "makerFeeRate"
      }
    ]
  },
  {
    type: "function",
    name: "getAddressManager",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getDependencyAddress",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "identifier"
      }
    ],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getDependencyIdentifier",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "contractAddress"
      }
    ],
    outputs: [
      {
        type: "bytes32"
      }
    ]
  },
  {
    type: "function",
    name: "getImplementation",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "getUserFeeRate",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "user"
      },
      {
        type: "uint8",
        name: "assetClass"
      }
    ],
    outputs: [
      {
        type: "uint16",
        name: "takerFeeRate"
      },
      {
        type: "int16",
        name: "makerFeeRate"
      },
      {
        type: "uint16",
        name: "baseTakerFeeRate"
      },
      {
        type: "uint16",
        name: "baseMakerFeeRate"
      }
    ]
  },
  {
    type: "function",
    name: "initialize",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "address",
        name: "addressManager"
      },
      {
        type: "address",
        name: "owner"
      },
      {
        type: "string",
        name: "_brokerName"
      },
      {
        type: "address[]",
        name: "brokerSigners"
      },
      {
        type: "uint8[]",
        name: "assetClasses"
      },
      {
        type: "tuple[]",
        name: "baseFeeRates",
        components: [
          {
            type: "uint16",
            name: "takerFeeRate"
          },
          {
            type: "uint16",
            name: "makerFeeRate"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "isActive",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "bool"
      }
    ]
  },
  {
    type: "function",
    name: "name",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "string"
      }
    ]
  },
  {
    type: "function",
    name: "onBrokerFee",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32",
        name: "poolId"
      },
      {
        type: "address",
        name: "user"
      },
      {
        type: "address",
        name: "token"
      },
      {
        type: "uint256",
        name: "feeAmount"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "totalReferralRebate"
      },
      {
        type: "uint256",
        name: "referrerRebate"
      },
      {
        type: "address",
        name: "referrer"
      }
    ]
  },
  {
    type: "function",
    name: "owner",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "pendingOwner",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "address"
      }
    ]
  },
  {
    type: "function",
    name: "placeOrder",
    constant: false,
    stateMutability: "payable",
    payable: true,
    inputs: [
      {
        type: "tuple",
        name: "orderParams",
        components: [
          {
            type: "address",
            name: "user"
          },
          {
            type: "bytes32",
            name: "poolId"
          },
          {
            type: "uint256",
            name: "positionId"
          },
          {
            type: "uint8",
            name: "orderType"
          },
          {
            type: "uint8",
            name: "triggerType"
          },
          {
            type: "uint8",
            name: "operation"
          },
          {
            type: "uint8",
            name: "direction"
          },
          {
            type: "uint256",
            name: "collateralAmount"
          },
          {
            type: "uint256",
            name: "size"
          },
          {
            type: "uint256",
            name: "orderPrice"
          },
          {
            type: "uint256",
            name: "triggerPrice"
          },
          {
            type: "uint8",
            name: "timeInForce"
          },
          {
            type: "bool",
            name: "postOnly"
          },
          {
            type: "uint16",
            name: "slippagePct"
          },
          {
            type: "address",
            name: "executionFeeToken"
          },
          {
            type: "uint16",
            name: "leverage"
          },
          {
            type: "uint256",
            name: "tpSize"
          },
          {
            type: "uint256",
            name: "tpPrice"
          },
          {
            type: "uint256",
            name: "slSize"
          },
          {
            type: "uint256",
            name: "slPrice"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "proxiableUUID",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [],
    outputs: [
      {
        type: "bytes32"
      }
    ]
  },
  {
    type: "function",
    name: "registerDependencies",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "identifiers"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "renounceOwnership",
    constant: false,
    payable: false,
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "setSigner",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "address",
        name: "signer"
      },
      {
        type: "bool",
        name: "isSigner"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "setUserFeeData",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "address",
        name: "user"
      },
      {
        type: "uint64",
        name: "deadline"
      },
      {
        type: "tuple",
        name: "feeData",
        components: [
          {
            type: "uint8",
            name: "tier"
          },
          {
            type: "address",
            name: "referrer"
          },
          {
            type: "uint32",
            name: "totalReferralRebatePct"
          },
          {
            type: "uint32",
            name: "referrerRebatePct"
          }
        ]
      },
      {
        type: "bytes",
        name: "signature"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "transferOwnership",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "address",
        name: "newOwner"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "unregisterDependencies",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bytes32[]",
        name: "identifiers"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "updateBrokerStatus",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "bool",
        name: "active"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "updateFeeTier",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "uint8",
        name: "tier"
      },
      {
        type: "tuple",
        name: "feeRate",
        components: [
          {
            type: "uint16",
            name: "takerFeeRate"
          },
          {
            type: "uint16",
            name: "makerFeeRate"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "updateFeeTiers",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "uint8[]",
        name: "tiers"
      },
      {
        type: "tuple[]",
        name: "feeRates",
        components: [
          {
            type: "uint16",
            name: "takerFeeRate"
          },
          {
            type: "uint16",
            name: "makerFeeRate"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "updateOrder",
    constant: false,
    payable: false,
    inputs: [
      {
        type: "tuple",
        name: "params",
        components: [
          {
            type: "uint256",
            name: "orderId"
          },
          {
            type: "uint256",
            name: "tpSize"
          },
          {
            type: "uint256",
            name: "tpPrice"
          },
          {
            type: "uint256",
            name: "slSize"
          },
          {
            type: "uint256",
            name: "slPrice"
          },
          {
            type: "address",
            name: "executionFeeToken"
          },
          {
            type: "bool",
            name: "useOrderCollateral"
          }
        ]
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "upgradeTo",
    constant: false,
    stateMutability: "payable",
    payable: true,
    inputs: [
      {
        type: "address",
        name: "newImplementation"
      },
      {
        type: "bytes",
        name: "data"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "upgradeToAndCall",
    constant: false,
    stateMutability: "payable",
    payable: true,
    inputs: [
      {
        type: "address",
        name: "newImplementation"
      },
      {
        type: "bytes",
        name: "data"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "userFeeData",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "user"
      }
    ],
    outputs: [
      {
        type: "uint8",
        name: "tier"
      },
      {
        type: "address",
        name: "referrer"
      },
      {
        type: "uint32",
        name: "totalReferralRebatePct"
      },
      {
        type: "uint32",
        name: "referrerRebatePct"
      }
    ]
  },
  {
    type: "function",
    name: "userRebates",
    constant: true,
    stateMutability: "view",
    payable: false,
    inputs: [
      {
        type: "address",
        name: "user"
      },
      {
        type: "address",
        name: "token"
      }
    ],
    outputs: [
      {
        type: "uint256",
        name: "rebateAmount"
      }
    ]
  }
];

// src/web3/providers.ts
var getERC20Contract = async (chainId3, tokenAddress) => {
  const provider = await getSignerProvider(chainId3);
  return getContract(tokenAddress, IERC20Metadata_default, provider);
};
var getAccount = async (chainId3) => {
  const provider = await getWalletProvider(chainId3);
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts?.[0] ?? void 0;
};
var getLiquidityRouterContract = async (chainId3) => {
  const addresses = address_default[chainId3];
  const address = addresses.LIQUIDITY_ROUTER;
  console.log("LiquidityRouter address", address);
  const provider = await getSignerProvider(chainId3);
  return getContract(address, LiquidityRouter_default, provider);
};
var getPoolManagerContract = async (chainId3) => {
  const addresses = address_default[chainId3];
  const address = addresses.POOL_MANAGER;
  const provider = await getSignerProvider(chainId3);
  return getContract(address, PoolManager_default, provider);
};
var getQuotePoolContract = async (chainId3, type = 0 /* JSON */) => {
  const addresses = address_default[chainId3];
  const address = addresses.QUOTE_POOL;
  const provider = type === 0 /* JSON */ ? getJSONProvider(chainId3) : await getSignerProvider(chainId3);
  return getContract(address, QuotePool_default, provider);
};
var getBasePoolContract = async (chainId3, type = 0 /* JSON */) => {
  const addresses = address_default[chainId3];
  const address = addresses.BASE_POOL;
  const provider = type === 0 /* JSON */ ? getJSONProvider(chainId3) : await getSignerProvider(chainId3);
  return getContract(address, BasePool_default, provider);
};
var getBrokerSingerContract = async (chainId3, singer) => {
  const addresses = address_default[chainId3];
  const address = addresses.BROKER;
  return getContract(address, Broker_default, singer);
};

// src/config/con.ts
var TimeInForce = {
  IOC: 0
};
var TIME_IN_FORCE = TimeInForce.IOC;

// src/trade/index.ts
var getUserFeeRate = async ({ address, poolId, chainId: chainId3 }, singer) => {
  const brokerContract = await getBrokerSingerContract(chainId3, singer);
  const userFeeRate = await brokerContract.getUserFeeRate(address, poolId);
  return userFeeRate;
};
var placeOrder = async (params, singer) => {
  console.log("params--->", params, JSON.stringify(params));
  const brokerContract = await getBrokerSingerContract(params.chainId, singer);
  const gasLimit = await brokerContract.placeOrder.estimateGas(
    {
      user: params.address,
      poolId: params.poolId,
      positionId: params.positionId,
      orderType: params.orderType,
      triggerType: params.triggerType,
      operation: params.operation,
      direction: params.direction,
      collateralAmount: params.collateralAmount,
      size: params.size,
      orderPrice: params.orderPrice,
      triggerPrice: params.triggerPrice,
      timeInForce: TIME_IN_FORCE,
      postOnly: params.postOnly,
      slippagePct: params.slippagePct,
      executionFeeToken: params.executionFeeToken,
      leverage: params.leverage,
      tpSize: params.tpSize,
      tpPrice: params.tpPrice,
      slSize: params.slSize,
      slPrice: params.slPrice
    }
  );
  console.log("gasLimit--->", gasLimit);
  const response = await brokerContract.placeOrder(
    {
      user: params.address,
      poolId: params.poolId,
      positionId: params.positionId,
      orderType: params.orderType,
      triggerType: params.triggerType,
      operation: params.operation,
      direction: params.direction,
      collateralAmount: params.collateralAmount,
      size: params.size,
      orderPrice: params.orderPrice,
      triggerPrice: params.triggerPrice,
      timeInForce: TIME_IN_FORCE,
      postOnly: params.postOnly,
      slippagePct: params.slippagePct,
      executionFeeToken: params.executionFeeToken,
      leverage: params.leverage,
      tpSize: params.tpSize,
      tpPrice: params.tpPrice,
      slSize: params.slSize,
      slPrice: params.slPrice
    }
  );
  const receipt = await response?.wait();
  return receipt;
};
var cancelOrder = async (chainId3, orderId, singer) => {
  const brokerContract = await getBrokerSingerContract(chainId3, singer);
  const response = await brokerContract.cancelOrder(orderId);
  const receipt = await response?.wait();
  return receipt;
};
var cancelOrders = async (chainId3, orderIds, singer) => {
  const brokerContract = await getBrokerSingerContract(chainId3, singer);
  const response = await brokerContract.cancelOrders(orderIds);
  const receipt = await response?.wait();
  return receipt;
};
var adjustCollateral = async (chainId3, positionId, adjustAmount, singer) => {
  const brokerContract = await getBrokerSingerContract(chainId3, singer);
  const response = await brokerContract.adjustCollateral(positionId, adjustAmount);
  const receipt = await response?.wait();
  return receipt;
};

// src/lp/base/index.ts
var base_exports = {};
__export(base_exports, {
  deposit: () => deposit,
  withdraw: () => withdraw
});

// src/lp/base/deposit.ts
import {
  parseUnits as parseUnits4
} from "ethers";

// src/common/tradingGas.ts
import { parseUnits } from "ethers";

// src/config/decimals.ts
var COMMON_CONFIG_DECIMALS = 8;

// src/common/tradingGas.ts
var bigintTradingGasToRatioCalculator = (gas, ratio) => {
  return gas * parseUnits(ratio.toString(), COMMON_CONFIG_DECIMALS) / BigInt(10 ** COMMON_CONFIG_DECIMALS);
};
var bigintTradingGasPriceWithRatio = async (chainId3) => {
  try {
    const chainInfo = CHAIN_INFO[chainId3];
    const provider = getJSONProvider(chainId3);
    const { gasPrice } = await provider.getFeeData();
    if (!gasPrice) {
      throw new Error("Network Error");
    }
    console.log("gasPrice", gasPrice);
    const gasPriceWithRatio = bigintTradingGasToRatioCalculator(gasPrice, chainInfo.gasPriceRatio);
    console.log("gasPriceWithRatio--->", gasPriceWithRatio);
    return {
      gasPrice: gasPriceWithRatio
    };
  } catch (e) {
    throw e;
  }
};
var bigintAmountSlipperCalculator = (amount, slipper = 0.01) => {
  const radio = parseUnits("1", COMMON_CONFIG_DECIMALS) - parseUnits(slipper.toString(), COMMON_CONFIG_DECIMALS);
  return amount * radio / BigInt(10 ** COMMON_CONFIG_DECIMALS);
};

// src/config/error.ts
import { ErrorType, ErrorDecoder } from "ethers-decode-error";
var errorDecoder = ErrorDecoder.create();
var Errors = {
  [1 /* Invalid_Chain_ID */]: `Invalid Chain`,
  [2 /* Invalid_TOKEN_ADDRESS */]: `Invalid Token Address`,
  [4001 /* USER_REJECTED_REQUEST */]: `User Rejected`,
  [3 /* Insufficient_Balance */]: `Insufficient Balance`,
  [4 /* Insufficient_Amount_Of_Approved */]: `Insufficient Amount Of Approved`,
  [4002 /* Invalid_Base */]: `Invalid Base Token Address`,
  [4003 /* Invalid_slippage */]: `Invalid Slippage`,
  [4004 /* Invalid_Amount */]: `Invalid Amount`,
  [4005 /* Invalid_Pool_State */]: `Invalid Pool State`
};
function didUserReject(error) {
  return error?.code === 4001 /* USER_REJECTED_REQUEST */;
}
async function getErrorTextFormError(error) {
  if (didUserReject(error)) {
    return {
      error: Errors[4001 /* USER_REJECTED_REQUEST */]
    };
  }
  const decodeErrorResult = await errorDecoder.decode(error);
  if (decodeErrorResult.type === ErrorType.UserRejectError) {
    return {
      error: Errors[4001 /* USER_REJECTED_REQUEST */]
    };
  }
  console.error(error);
  return {
    error: void 0
  };
}

// src/common/balanceOf.ts
import { ethers as ethers2 } from "ethers";
var getBalanceOf = async (chainId3, account, tokenAddress) => {
  try {
    const provider = getJSONProvider(chainId3);
    const contractInterface = new ethers2.Interface(IERC20Metadata_default);
    const data = contractInterface.encodeFunctionData("balanceOf", [account]);
    const callData = {
      to: tokenAddress,
      data
    };
    const result = await provider.call(callData);
    const balance = BigInt(result);
    return balance;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// src/common/checkParams.ts
import { MaxUint256, parseUnits as parseUnits3 } from "ethers";

// src/common/allowance.ts
import { ethers as ethers3 } from "ethers";
var getAllowanceApproved = async (chainId3, account, tokenAddress, approveAddress, approveAmount) => {
  try {
    const provider = getJSONProvider(chainId3);
    const contractInterface = new ethers3.Interface(IERC20Metadata_default);
    const data = contractInterface.encodeFunctionData("allowance", [account, approveAddress]);
    console.log("approve token ", tokenAddress);
    console.log("approve address ", approveAddress);
    const callData = {
      to: tokenAddress,
      data
    };
    const result = await provider.call(callData);
    const allowance = BigInt(result);
    console.log("Allowance:", allowance.toString());
    console.log("ApproveAmount:", approveAmount.toString());
    if (allowance >= approveAmount) {
      console.log("Allowance approved.");
      return true;
    }
    return false;
  } catch (e) {
    throw e;
  }
};

// src/common/approve.ts
var approve = async (chainId3, account, tokenAddress, approveAddress, amount) => {
  try {
    const TokenContract = await getERC20Contract(chainId3, tokenAddress);
    console.log("approve token Address", tokenAddress);
    const response = await TokenContract.approve(approveAddress, amount);
    console.log("approve amount", approveAddress);
    console.log("approve amount", amount);
    const receipt = await response?.wait();
    const isApproved = await getAllowanceApproved(chainId3, account, tokenAddress, approveAddress, amount);
    if (!isApproved) {
      throw new Error(Errors[4 /* Insufficient_Amount_Of_Approved */]);
    }
  } catch (e) {
    throw e;
  }
};

// src/common/checkParams.ts
var checkParams = async (params) => {
  if ("chainId" in params) {
    const valid = isSupportedChainFn(params.chainId);
    if (!valid) {
      throw new Error(Errors[1 /* Invalid_Chain_ID */]);
    }
  }
  if ("slippage" in params) {
    if (!(Number(params?.slippage) <= 1 && Number(params?.slippage) > 0)) {
      throw new Error(Errors[4003 /* Invalid_slippage */]);
    }
  }
  if ("amount" in params) {
    if (Number(params.amount) === Number.NaN || Number(params.amount) < 0) {
      throw new Error(Errors[4004 /* Invalid_Amount */]);
    }
  }
  console.log("checkbalance");
  const { tokenAddress, contractAddress, chainId: chainId3, amount, decimals, account } = params;
  if (amount && chainId3 && decimals && account) {
    const amountIn = parseUnits3(amount.toString(), decimals);
    if (tokenAddress) {
      const balance = await getBalanceOf(chainId3, account, tokenAddress);
      console.log("balance", balance, tokenAddress);
      if (!balance || balance < amountIn) {
        throw new Error(Errors[3 /* Insufficient_Balance */]);
      }
    }
    if (contractAddress && tokenAddress) {
      const isApproved = await getAllowanceApproved(chainId3, account, tokenAddress, contractAddress, amountIn);
      if (!isApproved) {
        await approve(chainId3, account, tokenAddress, contractAddress, MaxUint256);
      }
    }
  }
};

// src/lp/base/preview.ts
var previewLpAmountOut = async ({ chainId: chainId3, amountIn, poolId, price = 0n }) => {
  try {
    const chainInfo = CHAIN_INFO[chainId3];
    console.log("previewLpAmountOut data", [poolId, amountIn, price]);
    const basePoolContract = await getBasePoolContract(chainId3);
    const _gasLimit = await basePoolContract.previewLpAmountOut.estimateGas(poolId, amountIn, price);
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio);
    const { gasPrice } = await bigintTradingGasPriceWithRatio(chainId3);
    const request = await basePoolContract.previewLpAmountOut(poolId, amountIn, price, {
      gasLimit,
      gasPrice
    });
    console.log(request);
    return request;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
var previewBaseAmountOut = async ({ chainId: chainId3, amountIn, poolId, price = 0n }) => {
  try {
    const chainInfo = CHAIN_INFO[chainId3];
    console.log("previewQuoteAmountOut data", [poolId, amountIn, price]);
    const basePoolContract = await getBasePoolContract(chainId3);
    const _gasLimit = await basePoolContract.previewBaseAmountOut.estimateGas(poolId, amountIn, price);
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio);
    const { gasPrice } = await bigintTradingGasPriceWithRatio(chainId3);
    const request = await basePoolContract.previewBaseAmountOut(poolId, amountIn, price, {
      gasLimit,
      gasPrice
    });
    console.log("previewBaseAmountOut response", request);
    return request;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// src/api/type.ts
var ErrorCode2 = /* @__PURE__ */ ((ErrorCode3) => {
  ErrorCode3[ErrorCode3["SUCCESS"] = 9200] = "SUCCESS";
  ErrorCode3[ErrorCode3["SUCCESS_ORIGIN"] = 0] = "SUCCESS_ORIGIN";
  ErrorCode3[ErrorCode3["IDENTITY_VERIFICATION_FAILED"] = 9401] = "IDENTITY_VERIFICATION_FAILED";
  ErrorCode3[ErrorCode3["PERMISSION_DENIED"] = 9403] = "PERMISSION_DENIED";
  ErrorCode3[ErrorCode3["NOT_EXIST"] = 9404] = "NOT_EXIST";
  ErrorCode3[ErrorCode3["REQUEST_LIMIT"] = 9429] = "REQUEST_LIMIT";
  ErrorCode3[ErrorCode3["SERVICE_ERROR"] = 9500] = "SERVICE_ERROR";
  ErrorCode3[ErrorCode3["MISS_REQUESTED_PARAMETER"] = 9900] = "MISS_REQUESTED_PARAMETER";
  ErrorCode3[ErrorCode3["INVALID_PARAMETER"] = 9901] = "INVALID_PARAMETER";
  ErrorCode3["NETWORK_ERROR"] = "ERR_NETWORK";
  return ErrorCode3;
})(ErrorCode2 || {});
var MarketPoolState = /* @__PURE__ */ ((MarketPoolState2) => {
  MarketPoolState2[MarketPoolState2["Cook"] = 0] = "Cook";
  MarketPoolState2[MarketPoolState2["Primed"] = 1] = "Primed";
  MarketPoolState2[MarketPoolState2["Trench"] = 2] = "Trench";
  MarketPoolState2[MarketPoolState2["PreBench"] = 3] = "PreBench";
  MarketPoolState2[MarketPoolState2["Bench"] = 4] = "Bench";
  return MarketPoolState2;
})(MarketPoolState || {});
var OracleType = /* @__PURE__ */ ((OracleType2) => {
  OracleType2[OracleType2["Pyth"] = 0] = "Pyth";
  OracleType2[OracleType2["Chainlink"] = 1] = "Chainlink";
  return OracleType2;
})(OracleType || {});

// src/api/request.ts
function $fetch(method, url, data) {
  return fetch(url, {
    method,
    headers: {
      Accept: "application/json,text/plain,*/*",
      "Content-Type": "application/json",
      "Access-Control-Allow-credentials": "true"
      // "Accept-Language": getActiveLocale(),
      // "myx-signature-account":
      //   store.getState().account?.account?.address ?? undefined,
    },
    body: method === "GET" || !data ? void 0 : JSON.stringify(data)
  }).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return Promise.reject(res);
    }
  }).then((data2) => {
    console.log(data2);
    if (data2.code === 9200 /* SUCCESS */ || data2.code === 0 /* SUCCESS_ORIGIN */) {
      return Promise.resolve(data2);
    } else {
      return Promise.reject(data2);
    }
  }).catch((e) => {
    console.error(e.message);
    return Promise.reject(e);
  });
}

// src/api/utils.ts
function encodeQueryParam(key, value) {
  const encodedKey = encodeURIComponent(key);
  return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
}
function addQueryParam(query, key) {
  return encodeQueryParam(key, query[key]);
}
function addArrayQueryParam(query, key) {
  const value = query[key];
  return value.map((v) => encodeQueryParam(key, v)).join("&");
}
function toQueryString(rawQuery) {
  const query = rawQuery || {};
  const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
  return keys.map((key) => Array.isArray(query[key]) ? addArrayQueryParam(query, key) : addQueryParam(query, key)).join("&");
}
function addQueryParams(rawQuery) {
  const queryString = toQueryString(rawQuery);
  return queryString ? `?${queryString}` : "";
}

// src/api/index.ts
var baseUrl = "https://api-test.myx.cash";
var getPools = async () => {
  return await $fetch("GET", `${baseUrl}/v2/mx-scan/market/list`);
};
var getPrice = async (chainId3, poolIds = []) => {
  if (!!poolIds.length) {
    return await $fetch("GET", `${baseUrl}/v2/mx-gateway/quote/price/oracles${addQueryParams({
      chainId: chainId3,
      poolIds: poolIds.join(",")
    })}`);
  }
  return Promise.reject(new Error("Invalid pool id"));
};

// src/lp/getPoolInfo.ts
var getPoolInfo = async (poolId) => {
  try {
    const pools = (await getPools()).data || [];
    const pool = pools.find((_pool) => _pool.poolId === poolId);
    if (!pool) return null;
    return pool;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// src/lp/base/deposit.ts
var deposit = async (params) => {
  try {
    const { poolId, chainId: chainId3, amount, slippage = 0.01 } = params;
    await checkParams(params);
    const pool = await getPoolInfo(poolId);
    const decimals = pool?.baseDecimals;
    const tokenAddress = pool?.baseToken;
    const chainInfo = CHAIN_INFO[chainId3];
    const account = await getAccount(chainId3);
    const addresses = address_default[chainId3];
    const contractAddress = addresses.BASE_POOL;
    await checkParams({
      tokenAddress,
      contractAddress,
      decimals,
      account,
      chainId: chainId3,
      amount
    });
    const amountIn = parseUnits4(amount.toString(), decimals);
    const amountOut = await previewLpAmountOut({ chainId: chainId3, poolId, amountIn });
    const data = {
      poolId,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),
      // todo  调合约获取
      recipient: account,
      tpslParams: []
    };
    console.log("deposit base", data);
    const contract = await getLiquidityRouterContract(chainId3);
    const _gasLimit = await contract.depositBase.estimateGas(data);
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio);
    const { gasPrice } = await bigintTradingGasPriceWithRatio(chainId3);
    const result = await contract.depositBase(data, {
      gasLimit,
      gasPrice
    });
    console.log("deposit", result);
  } catch (e) {
    throw e;
  }
};

// src/lp/base/withdraw.ts
import { parseUnits as parseUnits5 } from "ethers";

// src/config/market/ARB_TEST_SEPOLIA.ts
var ARB_TEST_SEPOLIA2 = {
  marketId: "0x1ddd0797c40b61b1437e0c455a78470e7c0659ed497d94222425736210f9d08c",
  quoteToken: "0x7E248Ec1721639413A280d9E82e2862Cae2E6E28",
  oracleFeeUsd: 400000000n,
  oracleRefundFeeUsd: 300000000n,
  baseReserveRatio: 100,
  quoteReserveRatio: 100,
  poolPrimeThreshold: 20000n,
  decimals: 6,
  lpDecimals: 18
};

// src/config/market/index.ts
var Market = {
  [421614 /* ARB_TESTNET */]: ARB_TEST_SEPOLIA2
};

// src/lp/base/withdraw.ts
var withdraw = async (params) => {
  try {
    const { chainId: chainId3, poolId, amount, slippage = 0.01 } = params;
    const pool = await getPoolInfo(poolId);
    const lpAddress = pool?.quotePoolToken;
    const chainInfo = CHAIN_INFO[chainId3];
    const account = await getAccount(chainId3);
    const decimals = Market[chainId3].lpDecimals;
    await checkParams({
      tokenAddress: lpAddress,
      decimals,
      account,
      chainId: chainId3,
      amount
    });
    const amountIn = parseUnits5(amount.toString(), decimals);
    const amountOut = await previewBaseAmountOut({
      chainId: chainId3,
      poolId,
      amountIn
    });
    const data = {
      poolId,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),
      recipient: account
    };
    const contract = await getLiquidityRouterContract(chainId3);
    const _gasLimit = await contract.withdrawBase.estimateGas(data);
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio);
    const { gasPrice } = await bigintTradingGasPriceWithRatio(chainId3);
    const response = await contract.withdrawBase(data, {
      gasLimit,
      gasPrice
    });
    console.log("base withdraw", response);
    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// src/lp/quote/index.ts
var quote_exports = {};
__export(quote_exports, {
  deposit: () => deposit2,
  transfer: () => transfer,
  withdraw: () => withdraw2
});

// src/lp/quote/deposit.ts
import { parseUnits as parseUnits6 } from "ethers";

// src/lp/quote/preview.ts
var previewLpAmountOut2 = async ({ chainId: chainId3, amountIn, poolId, price = 0n }) => {
  try {
    const chainInfo = CHAIN_INFO[chainId3];
    console.log("previewLpAmountOut data", [poolId, amountIn, price]);
    const quotePoolContract = await getQuotePoolContract(chainId3);
    const _gasLimit = await quotePoolContract.previewLpAmountOut.estimateGas(poolId, amountIn, price);
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio);
    const { gasPrice } = await bigintTradingGasPriceWithRatio(chainId3);
    const request = await quotePoolContract.previewLpAmountOut(poolId, amountIn, price, {
      gasLimit,
      gasPrice
    });
    console.log(request);
    return request;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
var previewQuoteAmountOut = async ({ chainId: chainId3, amountIn, poolId, price = 0n }) => {
  try {
    const chainInfo = CHAIN_INFO[chainId3];
    console.log("previewQuoteAmountOut data", [poolId, amountIn, price]);
    const quotePoolContract = await getQuotePoolContract(chainId3);
    const _gasLimit = await quotePoolContract.previewQuoteAmountOut.estimateGas(poolId, amountIn, price);
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio);
    const { gasPrice } = await bigintTradingGasPriceWithRatio(chainId3);
    const request = await quotePoolContract.previewQuoteAmountOut(poolId, amountIn, price, {
      gasLimit,
      gasPrice
    });
    console.log("previewQuoteAmountOut response", request);
    return request;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// src/lp/quote/deposit.ts
var deposit2 = async (params) => {
  try {
    const { poolId, chainId: chainId3, amount, slippage = 0.01 } = params;
    await checkParams(params);
    const chainInfo = CHAIN_INFO[chainId3];
    const account = await getAccount(chainId3);
    const addresses = address_default[chainId3];
    const contractAddress = addresses.QUOTE_POOL;
    const tokenAddress = Market[chainId3].quoteToken;
    const decimals = Market[chainId3].decimals;
    await checkParams({
      tokenAddress,
      contractAddress,
      decimals,
      account,
      chainId: chainId3,
      amount
    });
    const amountIn = parseUnits6(amount.toString(), decimals);
    const amountOut = await previewLpAmountOut2({ chainId: chainId3, poolId, amountIn });
    console.log(amountOut);
    const tpslParams = [];
    console.log(amount * (1 - slippage));
    debugger;
    const data = {
      poolId,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),
      // todo  调合约获取
      recipient: account,
      tpslParams: []
    };
    console.log("deposit", data);
    const contract = await getLiquidityRouterContract(chainId3);
    const _gasLimit = await contract.depositQuote.estimateGas(data);
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio);
    const { gasPrice } = await bigintTradingGasPriceWithRatio(chainId3);
    const result = await contract.depositQuote(data, {
      gasLimit,
      gasPrice
    });
    console.log("deposit", result);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// src/lp/quote/withdraw.ts
import { parseUnits as parseUnits7 } from "ethers";
var withdraw2 = async (params) => {
  try {
    const { chainId: chainId3, poolId, amount, slippage = 0.01 } = params;
    const pool = await getPoolInfo(poolId);
    const lpAddress = pool?.quotePoolToken;
    const chainInfo = CHAIN_INFO[chainId3];
    const account = await getAccount(chainId3);
    const decimals = Market[chainId3].lpDecimals;
    await checkParams({
      tokenAddress: lpAddress,
      decimals,
      account,
      chainId: chainId3,
      amount
    });
    const amountIn = parseUnits7(amount.toString(), decimals);
    const amountOut = await previewQuoteAmountOut({ chainId: chainId3, poolId, amountIn });
    const data = {
      poolId,
      amountIn,
      minAmountOut: bigintAmountSlipperCalculator(amountOut, slippage),
      // todo  调合约获取
      recipient: account
    };
    console.log("withdraw", data);
    const contract = await getLiquidityRouterContract(chainId3);
    const _gasLimit = await contract.withdrawQuote.estimateGas(data);
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio);
    const { gasPrice } = await bigintTradingGasPriceWithRatio(chainId3);
    const request = await contract.withdrawQuote(data, {
      gasLimit,
      gasPrice
    });
    console.log("withdraw quote", request);
    return request;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// src/lp/quote/transfer.ts
import { parseUnits as parseUnits8 } from "ethers";
var transfer = async (chainId3, fromPoolId, toPoolId, amount) => {
  try {
    const fromPool = await getPoolInfo(fromPoolId);
    const toPool = await getPoolInfo(toPoolId);
    if (!toPool || !fromPool) return null;
    if ([3 /* PreBench */, 4 /* Bench */].includes(toPool.state)) {
      throw new Error(Errors[4005 /* Invalid_Pool_State */]);
    }
    const account = await getAccount(chainId3);
    await checkParams({ chainId: chainId3, amount, account, tokenAddress: fromPool.quotePoolToken });
    const chainInfo = CHAIN_INFO[chainId3];
    const decimals = Market[chainId3].lpDecimals;
    const data = {
      fromPoolId,
      toPoolId,
      minLpOut: 0n,
      amount: parseUnits8(amount.toString(), decimals)
    };
    console.log("migrateLiquiditydata", data);
    const contract = await getLiquidityRouterContract(chainId3);
    const _gasLimit = await contract.migrateLiquidity.estimateGas(data);
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio);
    const { gasPrice } = await bigintTradingGasPriceWithRatio(chainId3);
    const result = await contract.migrateLiquidity(data, {
      gasLimit,
      gasPrice
    });
    console.log("migrateLiquidity", result);
    return result;
  } catch (e) {
    console.error(e);
  }
};

// src/lp/pool/index.ts
var pool_exports = {};
__export(pool_exports, {
  createPool: () => createPool,
  getMarketPoolId: () => getMarketPoolId,
  getMarketPools: () => getMarketPools
});

// src/lp/pool/get.ts
import { ZeroAddress as ZeroAddress3 } from "ethers";
var chainId = 421614 /* ARB_TESTNET */;
var marketId = Market[chainId].marketId;
var getMarketPoolId = async ({ chainId: chainId3, baseToken }) => {
  try {
    if (!baseToken) {
      throw new Error(Errors[2 /* Invalid_TOKEN_ADDRESS */]);
    }
    const chainInfo = CHAIN_INFO[chainId3];
    const addresses = address_default[chainId3];
    const address = addresses.POOL_MANAGER;
    const contract = await getPoolManagerContract(chainId3);
    const data = [marketId, baseToken];
    const request = await contract.getMarketPool(marketId, baseToken);
    return request.poolId === ZeroAddress3 || !request.poolId ? void 0 : request.poolId;
  } catch (error) {
    console.error(error);
    throw typeof error === "string" ? error : await getErrorTextFormError(error);
  }
};
var getMarketPools = async (chainId3) => {
  try {
    const contract = await getPoolManagerContract(chainId3);
    const request = await contract.getPools();
    console.log(request);
    return request || [];
  } catch (error) {
    console.error(error);
    throw typeof error === "string" ? error : await getErrorTextFormError(error);
  }
};

// src/lp/pool/create.ts
var chainId2 = 421614 /* ARB_TESTNET */;
var marketId2 = Market[chainId2].marketId;
var createPool = async ({ chainId: chainId3, baseToken }) => {
  try {
    if (!baseToken) {
      throw new Error(Errors[2 /* Invalid_TOKEN_ADDRESS */]);
    }
    const chainInfo = CHAIN_INFO[chainId3];
    const contract = await getPoolManagerContract(chainId3);
    const data = { marketId: marketId2, baseToken };
    const _gasLimit = await contract.deployPool.estimateGas(data);
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio);
    console.log("gasLimit", _gasLimit, gasLimit);
    const { gasPrice } = await bigintTradingGasPriceWithRatio(chainId3);
    console.log("gasPrice", gasPrice);
    const request = await contract.deployPool(data, {
      gasLimit,
      gasPrice
    });
    const receipt = await request?.wait();
    if (receipt?.hash) {
      const poolId = await getMarketPoolId({ chainId: chainId3, baseToken });
      if (poolId) {
        await deposit2({
          poolId,
          amount: Number(Market[chainId3].poolPrimeThreshold),
          chainId: chainId3,
          slippage: 0.01
        });
      }
    }
  } catch (error) {
    console.error(error);
    throw typeof error === "string" ? error : await getErrorTextFormError(error);
  }
};
export {
  ErrorCode2 as ErrorCode,
  Market,
  MarketPoolState,
  MxSDK,
  OracleType,
  adjustCollateral,
  approve,
  base_exports as base,
  bigintAmountSlipperCalculator,
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator,
  cancelOrder,
  cancelOrders,
  getAllowanceApproved,
  getBalanceOf,
  getPools,
  getPrice,
  getUserFeeRate,
  placeOrder,
  pool_exports as pool,
  quote_exports as quote
};
