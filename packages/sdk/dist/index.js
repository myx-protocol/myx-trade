"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  adjustCollateral: () => adjustCollateral,
  cancelOrder: () => cancelOrder,
  cancelOrders: () => cancelOrders,
  getUserFeeRate: () => getUserFeeRate,
  placeOrder: () => placeOrder
});
module.exports = __toCommonJS(index_exports);

// src/config/address/ARB_TEST_SEPOLIA.ts
var import_ethers = require("ethers");
var ARB_TEST_SEPOLIA = {
  USDC: "",
  POOL_MANAGER: "0xfe3eC818ADd1a2259c0e0cf7A1Ff8780124E5bEA",
  POOL_VIEW: "",
  HYPER_VAULT: import_ethers.ZeroAddress,
  FEE_COLLECTOR: "",
  POSITION_MANAGER: "",
  ORDER_MANAGER: "0x598B5C8243E477616fAD4d4838b26ceE3330EEdf",
  TRUSTED_FORWARDER: "",
  FRONT_FACET: "",
  // router address
  DELEGATE_FACET: "",
  // Seamless router address
  FAUCET: "",
  UI_POOL_DATA_PROVIDER: "",
  UI_POSITION_DATA_PROVIDER: "",
  PYTH: "",
  MYX: import_ethers.ZeroAddress,
  ERC20: "",
  LIQUIDITY_ROUTER: "0xC2A4c4Ac0017153895642821504c51850E3A251A",
  BASE_POOL: "0x2096B83c8c268E8a4C4C82bd03fc310A9C41c4b2",
  QUOTE_POOL: "0x9219ca5761F71357cb3164a9B5FF073065bafF79",
  BROKER: "0x06415215fCEC29A84EdBDa3c5BF5dfB4Bd6F0F07"
};

// src/config/address.ts
var address_default = {
  [421614 /* ARB_TESTNET */]: ARB_TEST_SEPOLIA
};

// src/web3/index.ts
var import_ethers3 = require("ethers");

// src/address.ts
var import_ethers2 = require("ethers");
var import_lodash_es = require("lodash-es");
var ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
var _Address = class _Address {
  constructor(addr) {
    if ((0, import_lodash_es.isUndefined)(addr) || Number(addr) === 0) {
      addr = ZERO_ADDRESS.toString();
    }
    this._addr = (0, import_ethers2.getAddress)(addr);
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

// src/web3/rotationProvider.ts
var import_providers = require("@ethersproject/providers");

// src/web3/index.ts
function getContract(address, ABI, provider) {
  if (Address.from(address).isEqualTo(import_ethers3.ZeroAddress)) {
    throw new Error(`Invalid 'address' parameter '${address}'.`);
  }
  return new import_ethers3.Contract(address, ABI, provider);
}

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
var getBrokerSingerContract = async (chainId, singer) => {
  const addresses = address_default[chainId];
  const address = addresses.BROKER;
  return getContract(address, Broker_default, singer);
};

// src/config/con.ts
var TimeInForce = {
  IOC: 0
};
var TIME_IN_FORCE = TimeInForce.IOC;

// src/trade/index.ts
var getUserFeeRate = async ({ address, poolId, chainId }, singer) => {
  const brokerContract = await getBrokerSingerContract(chainId, singer);
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
var cancelOrder = async (chainId, orderId, singer) => {
  const brokerContract = await getBrokerSingerContract(chainId, singer);
  const response = await brokerContract.cancelOrder(orderId);
  const receipt = await response?.wait();
  return receipt;
};
var cancelOrders = async (chainId, orderIds, singer) => {
  const brokerContract = await getBrokerSingerContract(chainId, singer);
  const response = await brokerContract.cancelOrders(orderIds);
  const receipt = await response?.wait();
  return receipt;
};
var adjustCollateral = async (chainId, positionId, adjustAmount, singer) => {
  const brokerContract = await getBrokerSingerContract(chainId, singer);
  const response = await brokerContract.adjustCollateral(positionId, adjustAmount);
  const receipt = await response?.wait();
  return receipt;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  adjustCollateral,
  cancelOrder,
  cancelOrders,
  getUserFeeRate,
  placeOrder
});
