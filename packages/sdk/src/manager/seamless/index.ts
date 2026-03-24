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
import { normalizeSigner } from "@/signer/adapters.js";
import { createWalletClientFromSigner } from "@/signer/viemWalletFromSigner.js";

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

// const calculateSignature = async (message: string) => {
//   const encoder = new TextEncoder()
//   const data = encoder.encode(message)
//   if (typeof crypto === "undefined" || !crypto.subtle) throw new Error("Crypto.subtle not available");
//   const hashBuffer = await crypto.subtle.digest("SHA-256", data);
//   const hashArray = Array.from(new Uint8Array(hashBuffer))
//   return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
// }

// const seamlessNonceString = 'jAkBlC4~5!6@#$%^'


function splitSignatureToVrs(signatureHex: `0x${string}`): { v: number; r: `0x${string}`; s: `0x${string}` } {
  const bytes = hexToBytes(signatureHex);
  if (bytes.length < 65) throw new Error("Invalid signature length");
  const r = toHex(bytes.slice(0, 32)) as `0x${string}`;
  const s = toHex(bytes.slice(32, 64)) as `0x${string}`;
  const v = bytes[64]!;
  return { v, r, s };
}

// const generateEthWalletFromHashedSignature = (hashedSignature: string): { privateKey: `0x${string}`; wallet: Account } => {
//   const seedBytes = new Uint8Array(new TextEncoder().encode(hashedSignature));
//   const seedHex = bytesToHex(seedBytes);
//   const hashHex = keccak256(seedHex as `0x${string}`);
//   const privateKeyBytes = hexToBytes(hashHex).slice(0, 32);
//   const privateKey = toHex(privateKeyBytes) as `0x${string}`;

//   if (!isHex(privateKey) || privateKey.length !== 66) {
//     throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key generated");
//   }

//   const wallet = privateKeyToAccount(privateKey);
//   return { privateKey, wallet };
// };

// const charFill = (ping: string) => {
//   const targetLength = 16
//   if (ping.length >= targetLength) {
//     return ping
//   }

//   const remainingLength = targetLength - ping.length
//   const repeatTimes = Math.ceil(remainingLength / ping.length)
//   const paddedString = ping.repeat(repeatTimes).slice(0, remainingLength)
//   return ping + paddedString
// }

// export const getIvMapString = () => Utf8.parse(seamlessNonceString)

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
    walletClientOrSigner?: Awaited<ReturnType<typeof getWalletClient>> | SignerLike,
  ) {
    const forwarderContract = await getForwarderContract(chainId);
    const forwarderJsonRpcContractDomain = await forwarderContract.read.eip712Domain();


    const domain = {
      name: forwarderJsonRpcContractDomain[1],
      version: forwarderJsonRpcContractDomain[2],
      chainId: forwarderJsonRpcContractDomain[3],
      verifyingContract: forwarderJsonRpcContractDomain[4],
    };

    const signerInput = walletClientOrSigner ?? (await getWalletClient(chainId));
    const maybeWalletClient = signerInput as {
      getAddresses?: () => Promise<readonly `0x${string}`[]>;
      signTypedData?: (args: unknown) => Promise<`0x${string}`>;
    };
    const wc =
      typeof maybeWalletClient.getAddresses === "function" &&
      typeof maybeWalletClient.signTypedData === "function"
        ? (signerInput as Awaited<ReturnType<typeof getWalletClient>>)
        : await createWalletClientFromSigner(normalizeSigner(signerInput as SignerLike), chainId);

    const [account] = await wc.getAddresses();
    if (!account) throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Missing signer for forwarderTx");

    const signature = await wc.signTypedData({
      account,
      domain,
      types: contractTypes,
      primaryType: "ForwardRequest",
      message: {
        from: from as `0x${string}`,
        to: to as `0x${string}`,
        value: BigInt(value),
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
    walletClientOrSigner,
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
        this.logger.debug('Insufficient balance')
        throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient balance");
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
    }, chainId, walletClientOrSigner)

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
    const brokerAddress = this.configManager.getConfig().brokerAddress;
    if (!brokerAddress || !isAddress(brokerAddress)) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidBrokerAddress,
        "brokerAddress is missing or invalid; pass brokerAddress in MyxClient constructor / updateClientChainId"
      );
    }
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
    try {
      functionHash = encodeFunctionData({
        abi: Broker_ABI as any,
        functionName,
        args: data as any,
      });
    } catch (e) {
      throw new MyxSDKError(
        MyxErrorCode.ParamError,
        `encodeFunctionData failed for Broker.${String(functionName)}: ${(e as Error).message}. Check args shape and that no address field is undefined.`
      );
    }

    const nonce = await forwarderContract.read.nonces([seamlessAddress as `0x${string}`]);

    return {
      from: seamlessAddress,
      to: brokerAddress,
      value: "0",
      gas: "800000",
      deadline: dayjs().add(60, "minute").unix(),
      data: functionHash,
      nonce: nonce.toString(),
      forwardFeeToken,
    };
  }

  // async unLockSeamlessWallet({ masterAddress, password, apiKey, chainId }: { masterAddress: string, password: string, apiKey: string, chainId: number }) {
  //   const key = Utf8.parse(charFill(password));
  //   const iv = getIvMapString();
  //   const decrypted = AES.decrypt(apiKey, key, { iv, mode: CBC, padding: Pkcs7 });
  //   const privateKey = decrypted.toString(Utf8) as `0x${string}`;
  //   const wallet = privateKeyToAccount(privateKey);
  //   let isAuthorized = await this.onCheckRelayer(masterAddress, wallet.address, chainId);

  //   if (!isAuthorized) {
  //     await this.authorizeSeamlessAccount({ approve: true, seamlessAddress: wallet.address, chainId });
  //     isAuthorized = true;
  //   }
  //   this.configManager.updateSeamlessWallet({
  //     masterAddress,
  //     wallet,
  //     authorized: isAuthorized,
  //   });
  //   return {
  //     code: 0,
  //     data: {
  //       masterAddress,
  //       seamlessAccount: wallet.address,
  //       authorized: isAuthorized,
  //     },
  //   };
  // }

  // async exportSeamlessPrivateKey({ password, apiKey }: { password: string, apiKey: string }) {
  //   const key = Utf8.parse(charFill(password));
  //   const iv = getIvMapString();
  //   const decrypted = AES.decrypt(apiKey, key, { iv, mode: CBC, padding: Pkcs7 });
  //   const privateKey = decrypted.toString(Utf8);
  //   const wallet = privateKeyToAccount(privateKey as `0x${string}`);

  //   if (wallet.address !== this.configManager.getConfig().seamlessAccount?.wallet?.address) {
  //     throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key");
  //   }

  //   return {
  //     code: 0,
  //     data: { privateKey },
  //   };
  // }

  // async importSeamlessPrivateKey({ privateKey, password, chainId }: { privateKey: string, password: string, chainId: number }) {
  //   if (!isHex(privateKey as `0x${string}`) || (privateKey as string).length !== 66) {
  //     throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key");
  //   }

  //   const wallet = privateKeyToAccount(privateKey as `0x${string}`);
  //   const forwarderContract = await getForwarderContract(chainId);
  //   const masterAddress = await forwarderContract.read.originAccount([wallet.address]);

  //   if (masterAddress === zeroAddress) {
  //     throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "The private key is not a senseless account");
  //   }

  //   const isAuthorized = await this.onCheckRelayer(masterAddress, wallet.address, chainId);
  //   const key = Utf8.parse(charFill(password));
  //   const iv = getIvMapString();
  //   const encrypted = AES.encrypt(privateKey, key, { iv, mode: CBC, padding: Pkcs7 });
  //   const apiKey = encrypted.toString();

  //   this.configManager.updateSeamlessWallet({
  //     masterAddress,
  //     wallet,
  //     authorized: isAuthorized,
  //   });

  //   return {
  //     code: 0,
  //     data: {
  //       masterAddress,
  //       seamlessAccount: wallet.address,
  //       authorized: isAuthorized,
  //       apiKey,
  //     },
  //   };
  // }

  // async startSeamlessMode({ open }: { open: boolean }) {

  //   await this.configManager.startSeamlessMode(open)

  //   return {
  //     code: 0,
  //     data: {
  //       open,
  //     },
  //   }
  // }

  // async createSeamless({ password, chainId }: { password: string, chainId: number }) {
  //   if (!this.configManager.hasSigner()) {
  //     throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
  //   }
  //   const walletClient = await getWalletClient(chainId);
  //   const [account] = await walletClient.getAddresses();
  //   if (!account) throw new MyxSDKError(MyxErrorCode.InvalidSigner, "No account");

  //   try {
  //     const createAccountSignature = await walletClient.signMessage({
  //       account,
  //       message: `${account}_${password}`,
  //     });
  //     const hashedSignature = await calculateSignature(createAccountSignature);
  //     const { privateKey, wallet } = generateEthWalletFromHashedSignature(hashedSignature);

  //     const key = Utf8.parse(charFill(password));
  //     const iv = getIvMapString();
  //     const encrypted = AES.encrypt(privateKey, key, { iv, mode: CBC, padding: Pkcs7 });
  //     const apiKey = encrypted.toString();

  //     let isAuthorized = await this.onCheckRelayer(account, wallet.address, chainId);
  //     this.configManager.updateSeamlessWallet({
  //       masterAddress: account,
  //       wallet,
  //       authorized: isAuthorized,
  //     });

  //     return {
  //       code: 0,
  //       data: {
  //         masterAddress: account,
  //         seamlessAccount: wallet.address,
  //         authorized: isAuthorized,
  //         apiKey,
  //       },
  //     };
  //   } catch (error) {
  //     return {
  //       code: -1,
  //       message: (error as Error).message,
  //     };
  //   }
  // }
}