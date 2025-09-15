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

// src/web3/rotationProvider.ts
import { BaseProvider, StaticJsonRpcProvider } from "@ethersproject/providers";

// src/web3/index.ts
function getContract(address, ABI, provider) {
  if (Address.from(address).isEqualTo(ZeroAddress2)) {
    throw new Error(`Invalid 'address' parameter '${address}'.`);
  }
  return new Contract(address, ABI, provider);
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
export {
  adjustCollateral,
  cancelOrder,
  cancelOrders,
  getUserFeeRate,
  placeOrder
};
