import { ConfigManager, MyxClientConfig } from "../config/index.js";
import { Logger } from "@/logger";
import { AES, Utf8, CBC, Pkcs7 } from 'crypto-es'

import { Utils } from "../utils/index.js";
import { getWalletClient } from "@/web3/viemClients.js";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import { keccak256, hexToBytes, toHex, isHex, bytesToHex, encodeFunctionData, zeroAddress, type Account } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getForwarderContract, getMarketManageContract, getTokenContract, ProviderType } from "@/web3/providers";
import { Account as AccountManager } from "../account/index.js";
import type { ContractWithEip712Domain } from "@/utils/index.js";
import dayjs from "dayjs";
import { getContractAddressByChainId } from "@/config/address/index.js";
import { getEIP712Domain } from "@/utils";
import { Api } from "../api/index.js";
import { executeAddressByChainId } from "@/config/address";
import Forwarder_ABI from "@/abi/Forwarder.json";
import { maxUint256 } from "viem";

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

const calculateSignature = async (message: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const seamlessNonceString = 'jAkBlC4~5!6@#$%^'


function splitSignatureToVrs(signatureHex: `0x${string}`): { v: number; r: `0x${string}`; s: `0x${string}` } {
  const bytes = hexToBytes(signatureHex);
  if (bytes.length < 65) throw new Error("Invalid signature length");
  const r = toHex(bytes.slice(0, 32)) as `0x${string}`;
  const s = toHex(bytes.slice(32, 64)) as `0x${string}`;
  const v = bytes[64]!;
  return { v, r, s };
}

const generateEthWalletFromHashedSignature = (hashedSignature: string): { privateKey: `0x${string}`; wallet: Account } => {
  const seedBytes = new Uint8Array(new TextEncoder().encode(hashedSignature));
  const seedHex = bytesToHex(seedBytes);
  const hashHex = keccak256(seedHex as `0x${string}`);
  const privateKeyBytes = hexToBytes(hashHex).slice(0, 32);
  const privateKey = toHex(privateKeyBytes) as `0x${string}`;

  if (!isHex(privateKey) || privateKey.length !== 66) {
    throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key generated");
  }

  const wallet = privateKeyToAccount(privateKey);
  return { privateKey, wallet };
};

const charFill = (ping: string) => {
  const targetLength = 16
  if (ping.length >= targetLength) {
    return ping
  }

  const remainingLength = targetLength - ping.length
  const repeatTimes = Math.ceil(remainingLength / ping.length)
  const paddedString = ping.repeat(repeatTimes).slice(0, remainingLength)
  return ping + paddedString
}

export const getIvMapString = () => Utf8.parse(seamlessNonceString)

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
  const tokenContract = getTokenContract(chainId, tokenAddress) as unknown as ContractWithEip712Domain;
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

  async onCheckRelayer(account: string, relayer: string, chainId: number) {
    const forwarderContract = await getForwarderContract(chainId);
    const checkRelayerResult = await forwarderContract.read.isUserRelayerEnabled(account as `0x${string}`, relayer as `0x${string}`);
    return checkRelayerResult;
  }

  async getUSDPermitParams(deadline: number, chainId: number) {
    if (!this.configManager.hasSigner()) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Signer is required for permit");
    }

    const walletClient = await getWalletClient(chainId);
    const contractAddress = getContractAddressByChainId(chainId);
    const [masterAddress] = await walletClient.getAddresses();
    if (!masterAddress) throw new MyxSDKError(MyxErrorCode.InvalidSigner, "No account");

    const tokenContract = getTokenContract(chainId, contractAddress.ERC20);
    try {
      const nonces = await tokenContract.read.nonces(masterAddress);
      const tradingRouterSignPermit = await signPermit(
        walletClient,
        chainId,
        contractAddress.ERC20,
        masterAddress,
        contractAddress.TRADING_ROUTER,
        maxUint256,
        nonces,
        deadline,
      );
      const tradingRouterPermitParams = {
        token: contractAddress.ERC20,
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
    }: {
      from: string;
      to: string;
      value: string;
      gas: string;
      deadline: number;
      data: string;
      nonce: string;
    },
    chainId: number,
    walletClient?: Awaited<ReturnType<typeof getWalletClient>>,
  ) {
    const forwarderContract = await getForwarderContract(chainId);
    const forwarderJsonRpcContractDomain = await forwarderContract.read.eip712Domain();

    const domain = {
      name: forwarderJsonRpcContractDomain.name,
      version: forwarderJsonRpcContractDomain.version,
      chainId: forwarderJsonRpcContractDomain.chainId,
      verifyingContract: forwarderJsonRpcContractDomain.verifyingContract,
    };

    const wc = walletClient ?? (await getWalletClient(chainId));
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

    const forwardFeeToken = executeAddressByChainId(chainId);
    this.logger.info("forwarderTx-->", { from, to, value, gas, nonce, data, deadline, signature, forwardFeeToken }, chainId);
    const txRs = await this.api.forwarderTxApi({ from, to, value, gas, nonce, data, deadline, signature, forwardFeeToken }, chainId);
    return txRs;
  }

  async authorizeSeamlessAccount({ approve, seamlessAddress, chainId }: { approve: boolean, seamlessAddress: string, chainId: number }) {
    const config: MyxClientConfig = this.configManager.getConfig();

    const masterAddress = this.configManager.hasSigner() ? await this.configManager.getSignerAddress(chainId) : "";

    if (approve) {
      const balanceRes = await this.account.getWalletQuoteTokenBalance(chainId, masterAddress);
      this.logger.info("balanceRes-->", balanceRes);
      const balance = balanceRes.data;
      const marketManagerContract = await getMarketManageContract(chainId);
      const forwardFeeToken = executeAddressByChainId(chainId);
      this.logger.info("forwardFeeToken-->", forwardFeeToken);
      const pledgeFee = await marketManagerContract.read.getForwardFeeByToken(forwardFeeToken as `0x${string}`);
      this.logger.info('pledgeFee-->', pledgeFee)
      const gasFee = BigInt(pledgeFee) * BigInt(FORWARD_PLEDGE_FEE_RADIO)
      this.logger.info('auth params-->', { gasFee, balance }, chainId, forwardFeeToken)
      this.logger.info('gasFee > 0 && gasFee > BigInt(balance)-->', gasFee > 0 && gasFee > BigInt(balance))
      if (gasFee > 0 && gasFee > BigInt(balance)) {
        throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient balance");
      }
    }

    const deadline = dayjs().add(60, 'minute').unix()
    let permitParams: any[] = []
    if (approve) {
      try {
        permitParams = await this.getUSDPermitParams(deadline, chainId)
      } catch (error) {
        console.warn('Failed to get USD permit params, proceeding without permit:', error)
        permitParams = []
      }
    }

    const forwarderContract = await getForwarderContract(chainId, ProviderType.Signer);
    const nonce = await (await getForwarderContract(chainId)).read.nonces(masterAddress as `0x${string}`);
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
          console.error('Poll transaction from chain error:', error)
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

  async unLockSeamlessWallet({ masterAddress, password, apiKey, chainId }: { masterAddress: string, password: string, apiKey: string, chainId: number }) {
    const key = Utf8.parse(charFill(password));
    const iv = getIvMapString();
    const decrypted = AES.decrypt(apiKey, key, { iv, mode: CBC, padding: Pkcs7 });
    const privateKey = decrypted.toString(Utf8) as `0x${string}`;
    const wallet = privateKeyToAccount(privateKey);
    let isAuthorized = await this.onCheckRelayer(masterAddress, wallet.address, chainId);

    if (!isAuthorized) {
      await this.authorizeSeamlessAccount({ approve: true, seamlessAddress: wallet.address, chainId });
      isAuthorized = true;
    }
    this.configManager.updateSeamlessWallet({
      masterAddress,
      wallet,
      authorized: isAuthorized,
    });
    return {
      code: 0,
      data: {
        masterAddress,
        seamlessAccount: wallet.address,
        authorized: isAuthorized,
      },
    };
  }

  async exportSeamlessPrivateKey({ password, apiKey }: { password: string, apiKey: string }) {
    const key = Utf8.parse(charFill(password));
    const iv = getIvMapString();
    const decrypted = AES.decrypt(apiKey, key, { iv, mode: CBC, padding: Pkcs7 });
    const privateKey = decrypted.toString(Utf8);
    const wallet = privateKeyToAccount(privateKey as `0x${string}`);

    if (wallet.address !== this.configManager.getConfig().seamlessAccount?.wallet?.address) {
      throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key");
    }

    return {
      code: 0,
      data: { privateKey },
    };
  }

  async importSeamlessPrivateKey({ privateKey, password, chainId }: { privateKey: string, password: string, chainId: number }) {
    if (!isHex(privateKey as `0x${string}`) || (privateKey as string).length !== 66) {
      throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key");
    }

    const wallet = privateKeyToAccount(privateKey as `0x${string}`);
    const forwarderContract = await getForwarderContract(chainId);
    const masterAddress = await forwarderContract.read.originAccount(wallet.address);

    if (masterAddress === zeroAddress) {
      throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "The private key is not a senseless account");
    }

    const isAuthorized = await this.onCheckRelayer(masterAddress, wallet.address, chainId);
    const key = Utf8.parse(charFill(password));
    const iv = getIvMapString();
    const encrypted = AES.encrypt(privateKey, key, { iv, mode: CBC, padding: Pkcs7 });
    const apiKey = encrypted.toString();

    this.configManager.updateSeamlessWallet({
      masterAddress,
      wallet,
      authorized: isAuthorized,
    });

    return {
      code: 0,
      data: {
        masterAddress,
        seamlessAccount: wallet.address,
        authorized: isAuthorized,
        apiKey,
      },
    };
  }

  async startSeamlessMode({ open }: { open: boolean }) {

    await this.configManager.startSeamlessMode(open)

    return {
      code: 0,
      data: {
        open,
      },
    }
  }

  async createSeamless({ password, chainId }: { password: string, chainId: number }) {
    if (!this.configManager.hasSigner()) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
    }
    const walletClient = await getWalletClient(chainId);
    const [account] = await walletClient.getAddresses();
    if (!account) throw new MyxSDKError(MyxErrorCode.InvalidSigner, "No account");

    try {
      const createAccountSignature = await walletClient.signMessage({
        account,
        message: `${account}_${password}`,
      });
      const hashedSignature = await calculateSignature(createAccountSignature);
      const { privateKey, wallet } = generateEthWalletFromHashedSignature(hashedSignature);

      const key = Utf8.parse(charFill(password));
      const iv = getIvMapString();
      const encrypted = AES.encrypt(privateKey, key, { iv, mode: CBC, padding: Pkcs7 });
      const apiKey = encrypted.toString();

      let isAuthorized = await this.onCheckRelayer(account, wallet.address, chainId);
      this.configManager.updateSeamlessWallet({
        masterAddress: account,
        wallet,
        authorized: isAuthorized,
      });

      return {
        code: 0,
        data: {
          masterAddress: account,
          seamlessAccount: wallet.address,
          authorized: isAuthorized,
          apiKey,
        },
      };
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }


}