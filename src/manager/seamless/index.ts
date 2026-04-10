import { ConfigManager } from "../config/index.js";
import { Logger } from "@/logger";

import { Utils } from "../utils/index.js";
import { getWalletClient } from "@/web3/viemClients.js";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import { hexToBytes, toHex, encodeFunctionData, maxUint256, isAddress } from "viem";
import { getForwarderContract, getMarketManageContract, getTokenContract, ProviderType } from "@/web3/providers";
import { Account as AccountManager } from "../account/index.js";
import dayjs from "dayjs";
import { getContractAddressByChainId } from "@/config/address/index.js";
import { getEIP712Domain } from "@/utils";
import { Api } from "../api/index.js";
import Forwarder_ABI from "@/abi/Forwarder.json";
import Broker_ABI from "@/abi/Broker.json";
import type { SignerLike } from "@/signer/types.js";
import Account_ABI from '@/abi/Account.json'
import { ChainId } from "@/config/chain.js";
import TradingRouter_ABI from "@/abi/TradingRouter.json";

const contractTypes = {
  ForwardRequest: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint48' },
    { name: 'data', type: 'bytes' },
  ],
}
const FORWARD_PLEDGE_FEE_RADIO = 2

function splitSignatureToVrs(signatureHex: `0x${string}`): { v: number; r: `0x${string}`; s: `0x${string}` } {
  const bytes = hexToBytes(signatureHex);
  if (bytes.length < 65) throw new Error("Invalid signature length");
  const r = toHex(bytes.slice(0, 32)) as `0x${string}`;
  const s = toHex(bytes.slice(32, 64)) as `0x${string}`;
  const v = bytes[64]!;
  return { v, r, s };
}

async function signPermit(
  walletClient: Awaited<ReturnType<typeof getWalletClient>>,
  chainId: number,
  tokenAddress: string,
  owner: string,
  spender: string,
  value: bigint,
  nonce: bigint,
  deadline: number,
): Promise<{ v: number; r: `0x${string}`; s: `0x${string}` }> {
  const tokenContract = getTokenContract(chainId, tokenAddress)
  const domain = await getEIP712Domain(tokenContract);

  const [account] = await walletClient.getAddresses();
  if (!account) throw new MyxSDKError(MyxErrorCode.InvalidSigner, "No account for signPermit");

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };
  const message = { owner: owner as `0x${string}`, spender: spender as `0x${string}`, value, nonce, deadline };
  const signature = await walletClient.signTypedData({
    account,
    domain: { ...domain, chainId: domain.chainId },
    types,
    primaryType: "Permit",
    message,
  });
  return splitSignatureToVrs(signature);
}

export class Seamless {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  private account: AccountManager;
  private api: Api;

  constructor(configManager: ConfigManager, logger: Logger, utils: Utils, account: AccountManager, api: Api) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
    this.account = account;
    this.api = api;
  }

  async onCheckRelayer(account: string, relayer: string, chainId: number, tokenAddress: string) {
    const forwarderContract = await getForwarderContract(chainId);
    const checkRelayerResult = await forwarderContract.read.isUserRelayerEnabled([account as `0x${string}`, relayer as `0x${string}`]);

    const isNeedApprove = await this.utils.needsApproval(
      account,
      chainId,
      tokenAddress,
      maxUint256.toString(),
      getContractAddressByChainId(chainId).TRADING_ROUTER,
    );

    return checkRelayerResult && !isNeedApprove;
  }

  async getContractAbiAndAddressByFunctionName(functionName: string, chainId: ChainId) {
    const tradingRouterFunctions: string[] = [
      'placeOrderWithSalt',
      'placeOrderWithPosition',
      'cancelOrders',
      'cancelOrder',
      'updateOrder',
      'updatePriceAndAdjustCollateral',
    ]

    const brokerFunctions: string[] = [
      'setUserFeeData',
    ]
    
    const accountFunctions: string[] = [
      'updateAndWithdraw',
      'deposit',
    ]

    if (tradingRouterFunctions.includes(functionName)) {
      return {
        abi: TradingRouter_ABI as any,
        address: getContractAddressByChainId(chainId).TRADING_ROUTER,
      }
    }

    if (accountFunctions.includes(functionName)) {
      return {
        abi: Account_ABI as any,
        address: getContractAddressByChainId(chainId).Account,
      }
    }

    console.log('functionName==>', functionName)
    console.log('brokerFunctions.includes(functionName)->', brokerFunctions.includes(functionName))

    if(brokerFunctions.includes(functionName)) {
      return {
        abi: Broker_ABI as any,
        address: this.configManager.getConfig().brokerAddress,
      }
    }

    return {
      abi: TradingRouter_ABI as any,
      address: getContractAddressByChainId(chainId).TRADING_ROUTER,
    }
  }

  async getUSDPermitParams(deadline: number, chainId: number, tokenAddress: string) {
    if (!this.configManager.hasSigner()) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Signer is required for permit");
    }

    const walletClient = await getWalletClient(chainId);
    const contractAddress = getContractAddressByChainId(chainId);
    const [masterAddress] = await walletClient.getAddresses();
    if (!masterAddress) throw new MyxSDKError(MyxErrorCode.InvalidSigner, "No account");
    const tokenContract = getTokenContract(chainId, tokenAddress);
    try {
      const nonces = await tokenContract.read.nonces([masterAddress]);
      const tradingRouterSignPermit = await signPermit(
        walletClient,
        chainId,
        tokenAddress,
        masterAddress,
        contractAddress.TRADING_ROUTER,
        maxUint256,
        nonces,
        deadline,
      );
      const tradingRouterPermitParams = {
        token: tokenAddress,
        owner: masterAddress,
        spender: contractAddress.TRADING_ROUTER,
        value: maxUint256.toString(),
        deadline: deadline.toString(),
        v: tradingRouterSignPermit.v,
        r: tradingRouterSignPermit.r,
        s: tradingRouterSignPermit.s,
      };
      return [tradingRouterPermitParams];
    } catch (error) {
      throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key generated");
    }
  }

  async getForwardEip712Domain(chainId: number) {
    const forwarderContract = await getForwarderContract(chainId);
    const forwarderJsonRpcContractDomain = await forwarderContract.read.eip712Domain();

    const domain = {
      name: forwarderJsonRpcContractDomain[1],
      version: forwarderJsonRpcContractDomain[2],
      chainId: forwarderJsonRpcContractDomain[3],
      verifyingContract: forwarderJsonRpcContractDomain[4],
    };

    return domain;
  }

  async forwardTxInFront({
    chainId,
    seamlessAddress,
    signFunction,
    forwardFeeToken,
    functionName,
    orderParams,
    value = '0'
  }: {
    chainId: number,
    masterAddress: string,
    seamlessAddress: string,
    signFunction: (signParams: {
      domain: any,
      functionHash: string,
      to: string,
      nonce: string,
      deadline: number,
    }) => Promise<string>,
    functionName: string
    forwardFeeToken: string
    orderParams: any
    value?: string
  }) {
  
    const nonce = await (await getForwarderContract(chainId)).read.nonces([seamlessAddress as `0x${string}`]);
    const deadline = dayjs().add(60, 'minute').unix()
    const domain = await this.getForwardEip712Domain(chainId)
    const { abi, address: to } = await this.getContractAbiAndAddressByFunctionName(functionName, chainId)


    console.log('functionName-->', functionName)
    console.log('toContractAddress==>', to)
    const functionHash = encodeFunctionData({
      abi: abi as any,
      functionName: functionName,
      args: orderParams,
    });
    const signature = await signFunction({
      domain,
      functionHash,
      to,
      nonce: nonce.toString(),
      deadline,
    })


    const txRs = await this.api.forwarderTxApi(
      {
        from: seamlessAddress,
        to,
        value: value ?? '0',
        gas: '800000',
        nonce: nonce.toString(),
        data: functionHash,
        deadline,
        signature,
        forwardFeeToken
      },
      chainId
    );

    if (txRs.data?.txHash) {
      const maxAttempts = 5
      const pollInterval = 1000

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const rs = await this.api.fetchForwarderGetApi({ requestId: txRs.data.requestId })

          if (rs.data?.status === 9) {
            return {
              code: 0,
            }
          }

          if (attempt < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, pollInterval))
          }
        } catch (error) {
          this.logger.error('Poll transaction from chain error:', error)
          if (attempt < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, pollInterval))
          }
        }
      }

      return {
        code: -1,
        data: null,
        message: 'Transaction confirmation timeout, please check later',
      }
    } else {
      return {
        code: -1,
        data: null,
        message: 'Your request timed out, please try again',
      }
    }
  }

  async forwarderTx(
    {
      from,
      to,
      value,
      gas,
      deadline,
      data,
      nonce,
      forwardFeeToken,
    }: {
      from: string;
      to: string;
      value: string;
      gas: string;
      deadline: number;
      data: string;
      nonce: string;
      forwardFeeToken: string;
    },
    chainId: number,
  ) {
    const domain = await this.getForwardEip712Domain(chainId);
    const walletClient = await getWalletClient(chainId);
    const [account] = await walletClient.getAddresses();
    if (!account) throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Missing signer for forwarderTx");

    const signature = await walletClient.signTypedData({
      account,
      domain,
      types: contractTypes,
      primaryType: "ForwardRequest",
      message: {
        from: from as `0x${string}`,
        to: to as `0x${string}`,
        value: BigInt(value ?? '0'),
        gas: BigInt(gas),
        nonce: BigInt(nonce),
        deadline: BigInt(deadline),
        data: data as `0x${string}`,
      },
    });

    const txRs = await this.api.forwarderTxApi({ from, to, value, gas, nonce, data, deadline, signature, forwardFeeToken }, chainId);
    return txRs;
  }

  async authorizeSeamlessAccount({
    approve,
    seamlessAddress,
    chainId,
    forwardFeeToken,
  }: {
    approve: boolean;
    seamlessAddress: string;
    chainId: number;
    forwardFeeToken: string;
    walletClientOrSigner?: Awaited<ReturnType<typeof getWalletClient>> | SignerLike;
  }) {
    const masterAddress = this.configManager.hasSigner() ? await this.configManager.getSignerAddress(chainId) : "";

    if (approve) {
      const balanceRes = await this.account.getWalletQuoteTokenBalance({ chainId, address: masterAddress, tokenAddress: forwardFeeToken });
      const balance = balanceRes.data;
      const marketManagerContract = await getMarketManageContract(chainId);
      const pledgeFee = await marketManagerContract.read.getForwardFeeByToken([forwardFeeToken as `0x${string}`]);
      const gasFee = BigInt(pledgeFee) * BigInt(FORWARD_PLEDGE_FEE_RADIO)
      if (gasFee > 0 && gasFee > BigInt(balance)) {
        this.logger.debug('Insufficient wallet balance')
        throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient wallet balance");
      }
    }

    const deadline = dayjs().add(60, 'minute').unix()
    let permitParams: any[] = []
    if (approve) {
      try {
        permitParams = await this.getUSDPermitParams(deadline, chainId, forwardFeeToken)
      } catch (error) {
        this.logger.warn('Failed to get USD permit params, proceeding without permit:', error)
        permitParams = []
      }
    }

    const forwarderContract = await getForwarderContract(chainId, ProviderType.Signer);
    const nonce = await (await getForwarderContract(chainId)).read.nonces([masterAddress as `0x${string}`]);
    const functionHash = encodeFunctionData({
      abi: Forwarder_ABI as any,
      functionName: "permitAndApproveForwarder",
      args: [seamlessAddress, approve, permitParams],
    });

    const txRs = await this.forwarderTx({
      from: masterAddress,
      to: forwarderContract.address,
      value: '0',
      gas: '800000',//gas.toString(),
      nonce: nonce.toString(),
      data: functionHash,
      deadline,
      forwardFeeToken,
    }, chainId)

    if (txRs.data?.txHash) {
      // Poll chain for transaction status
      const maxAttempts = 5 // Max 5 attempts
      const pollInterval = 1000 // Poll every 1 second

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const rs = await this.api.fetchForwarderGetApi({ requestId: txRs.data.requestId })

          if (rs.data?.status === 9) {
            return {
              code: 0,
              data: {
                seamlessAccount: seamlessAddress,
                authorized: approve,
              },
            }
          }

          // If not on chain yet, wait and poll again
          if (attempt < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, pollInterval))
          }
        } catch (error) {
          this.logger.error('Poll transaction from chain error:', error)
          // If not the last attempt, continue polling
          if (attempt < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, pollInterval))
          }
        }
      }

      // Poll timeout, return failure
      return {
        code: -1,
        data: null,
        message: 'Transaction confirmation timeout, please check later',
      }
    } else {
      return {
        code: -1,
        data: null,
        message: 'Your request timed out, please try again',
      }
    }
  }

  async getOriginSeamlessAccount(address: string, chainId: number) {
    const forwarderContract = await getForwarderContract(chainId);
    const masterAddress = await forwarderContract.read.originAccount([address as `0x${string}`]);

    return {
      code: 0,
      data: { masterAddress },
    };
  }

  /**
   * Build ForwardRequest fields for a Broker contract call executed via the Forwarder.
   * `data` must be the ABI args array for `functionName` (same order as the contract), with no undefined addresses.
   */
  async formatForwarderTxParams({
    address,
    chainId,
    forwardFeeToken,
    functionName,
    data,
    seamlessAddress,
  }: {
    address: string;
    chainId: number;
    forwardFeeToken: string;
    functionName: string;
    /** ABI args tuple for `functionName`, e.g. `[user, poolId, ...]` */
    data: readonly unknown[] | unknown[];
    seamlessAddress: string;
  }) {
    if (!address || !isAddress(address)) {
      throw new MyxSDKError(MyxErrorCode.ParamError, "address (master) is missing or invalid");
    }
    if (!seamlessAddress || !isAddress(seamlessAddress)) {
      throw new MyxSDKError(MyxErrorCode.ParamError, "seamlessAddress is missing or invalid");
    }
    if (!forwardFeeToken || !isAddress(forwardFeeToken)) {
      throw new MyxSDKError(MyxErrorCode.ParamError, "forwardFeeToken is missing or invalid");
    }
    if (!Array.isArray(data)) {
      throw new MyxSDKError(
        MyxErrorCode.ParamError,
        "data must be an array of ABI arguments for encodeFunctionData (e.g. [arg1, arg2])"
      );
    }

    const isEnoughGas = await this.utils.checkSeamlessGas(address, chainId, forwardFeeToken);

    if (!isEnoughGas) {
      throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
    }

    const forwarderContract = await getForwarderContract(chainId);
    let functionHash: `0x${string}`;
    const { abi, address: abiAddress } = await this.getContractAbiAndAddressByFunctionName(functionName, chainId)
    try {
      functionHash = encodeFunctionData({
        abi: abi as any,
        functionName,
        args: data as any,
      });
    } catch (e) {
      throw new MyxSDKError(
        MyxErrorCode.ParamError,
        `encodeFunctionData failed for TradingRouter.${String(functionName)}: ${(e as Error).message}. Check args shape and that no address field is undefined.`
      );
    }

    const nonce = await forwarderContract.read.nonces([seamlessAddress as `0x${string}`]);

    return {
      from: seamlessAddress,
      to: abiAddress,
      value: "0",
      gas: "800000",
      deadline: dayjs().add(60, "minute").unix(),
      data: functionHash,
      nonce: nonce.toString(),
      forwardFeeToken,
    };
  }
}