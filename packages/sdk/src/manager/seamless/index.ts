import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";
import CryptoJS from 'crypto-js'

import { Utils } from "../utils";
import { getSignerProvider } from "@/web3";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { toUtf8Bytes, keccak256, hexlify, ethers, isHexString, getBytes, ZeroAddress } from 'ethers'
import { getForwarderContract, ProviderType } from "@/web3/providers";
import { Account } from "../account";
import dayjs from "dayjs";
import { getContractAddressByChainId } from "@/config/address/index";
import ERC20_ABI from "@/abi/ERC20Token.json";
import { getEIP712Domain } from "@/utils";
import { splitSignature } from "@ethersproject/bytes"
import { Api } from "../api";

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


const generateEthWalletFromHashedSignature = (hashedSignature: string) => {
  const seedStringToUtf8Bytes = toUtf8Bytes(hashedSignature)
  const seedStringToKeccak256 = keccak256(seedStringToUtf8Bytes)
  const seedStringToKeccak256Array = getBytes(seedStringToKeccak256)
  const privateKey = hexlify(seedStringToKeccak256Array)

  // 检查私钥合法性
  if (!isHexString(privateKey, 32)) {
    throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key generated");
  }

  // 2. 通过私钥生成公钥和钱包对象
  const wallet = new ethers.Wallet(privateKey)

  return {
    privateKey,
    wallet,
  }
}

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

export const getIvMapString = () => CryptoJS.enc.Utf8.parse(seamlessNonceString)

async function signPermit(
  provider: ethers.Signer,
  contract: ethers.Contract,
  owner: string,
  spender: string,
  value: string,
  nonce: string,
  deadline: string,
) {

  const domain = await getEIP712Domain(contract)

  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  }

  const message = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  }

  const signature = await provider.signTypedData(domain, types, message)
  const { v, r, s } = splitSignature(signature)
  return { v, r, s }
}


export class Seamless {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  private account: Account;
  private api: Api;

  constructor(configManager: ConfigManager, logger: Logger, utils: Utils, account: Account, api: Api) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
    this.account = account;
    this.api = api;
  }

  async onCheckRelayer(account: string, relayer: string, chainId: number) {
    const forwarderContract = await getForwarderContract(chainId)

    const checkRelayerResult = await forwarderContract.isUserRelayerEnabled(account, relayer)

    return checkRelayerResult
  }

  async getUSDPermitParams(deadline: number, chainId: number) {
    const config: MyxClientConfig = this.configManager.getConfig();

    if (!config.signer) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Signer is required for permit");
    }

    const contractAddress = getContractAddressByChainId(chainId);
    const masterAddress = await config.signer.getAddress()
    const forwarderContract = await getForwarderContract(chainId)
    const forwarderAddress = forwarderContract.target

    const brokerAddress = config.brokerAddress
    const erc20Contract = new ethers.Contract(
      contractAddress.ERC20,
      ERC20_ABI,
      config.signer
    );


    try {
      const nonces = await erc20Contract.nonces(masterAddress)

      const brokerSignPermit = await signPermit(
        config.signer,  // 使用 signer 而不是 provider
        erc20Contract,
        masterAddress,
        brokerAddress,
        ethers.MaxUint256.toString(),
        nonces.toString(),
        deadline.toString(),
      )

     


      const forwarderSignPermit = await signPermit(
        config.signer,  // 使用 signer 而不是 provider
        erc20Contract,
        masterAddress,
        forwarderAddress as string,
        ethers.MaxUint256.toString(),
        (nonces + BigInt(1)).toString(),
        deadline.toString(),
      )

      const accountSignPermit = await signPermit(
        config.signer,  // 使用 signer 而不是 provider
        erc20Contract,
        masterAddress,
        contractAddress.Account,
        ethers.MaxUint256.toString(),
        (nonces + BigInt(2)).toString(),
        deadline.toString(),
      )

      const brokerSeamlessUSDPermitParams = {
        token: erc20Contract.target,
        owner: masterAddress,
        spender: brokerAddress,
        value: ethers.MaxUint256,
        deadline,
        v: brokerSignPermit.v,
        r: brokerSignPermit.r,
        s: brokerSignPermit.s,
      }

      const forwarderPermitParams = {
        token: erc20Contract.target,
        owner: masterAddress,
        spender: forwarderAddress as string,
        value: ethers.MaxUint256,
        deadline,
        v: forwarderSignPermit.v,
        r: forwarderSignPermit.r,
        s: forwarderSignPermit.s,
      }

      const accountPermitParams = {
        token: erc20Contract.target,
        owner: masterAddress,
        spender: contractAddress.Account,
        value: ethers.MaxUint256,
        deadline,
        v: accountSignPermit.v,
        r: accountSignPermit.r,
        s: accountSignPermit.s,
      }

      return [brokerSeamlessUSDPermitParams, forwarderPermitParams, accountPermitParams]

      // return [forwarderPermitParams]

    } catch (error) {
      this.logger.error('error-->', error);
      throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key generated");
    }
  }

  async forwarderTx({
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
  }, chainId: number, provider?: ethers.Signer) {
    const forwarderContract = await getForwarderContract(chainId)
    const forwarderJsonRpcContractDomain = await forwarderContract.eip712Domain()

    const domain = {
      name: forwarderJsonRpcContractDomain.name,
      version: forwarderJsonRpcContractDomain.version,
      chainId: forwarderJsonRpcContractDomain.chainId,
      verifyingContract: forwarderJsonRpcContractDomain.verifyingContract,
    }

    const walletProvider = provider ?? await getSignerProvider(chainId)

    const signature = await walletProvider.signTypedData(domain, contractTypes, {
      from,
      to,
      value,
      gas,
      nonce,
      deadline,
      data
    })

    const txRs = await this.api.forwarderTxApi({ from, to, value, gas, nonce, data, deadline, signature }, chainId)
    return txRs
  }

  async authorizeSeamlessAccount({ approve, seamlessAddress, chainId }: { approve: boolean, seamlessAddress: string, chainId: number }) {
    const config: MyxClientConfig = this.configManager.getConfig();

    const masterAddress = await config.signer?.getAddress() ?? ''

    if (approve) {
      const balanceRes = await this.account.getWalletQuoteTokenBalance(masterAddress)
      const balance = balanceRes.data
      const forwarderContract = await getForwarderContract(chainId)

      const pledgeFee = await forwarderContract.getRelayFee()
      const gasFee = BigInt(pledgeFee) * BigInt(FORWARD_PLEDGE_FEE_RADIO)
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
        console.log('error-->', error);
        console.warn('Failed to get USD permit params, proceeding without permit:', error)
        permitParams = []
      }
    }

    const forwarderContract = await getForwarderContract(chainId, ProviderType.Signer)
    const nonce = await forwarderContract.nonces(masterAddress)

    const functionHash = forwarderContract.interface.encodeFunctionData('permitAndApproveForwarder', [
      seamlessAddress,
      approve,
      permitParams,
    ])

    const txRs = await this.forwarderTx({
      from: masterAddress ?? '',
      to: forwarderContract?.target as string,
      value: '0',
      gas: '800000',//gas.toString(),
      nonce: nonce.toString(),
      data: functionHash,
      deadline,
    }, chainId)

    if (txRs.data?.txHash) {
      return {
        code: 0,
        data: {
          seamlessAccount: seamlessAddress,
          authorized: approve,
        },
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
    const key = CryptoJS.enc.Utf8.parse(charFill(password))
    const iv = getIvMapString()
    const decrypted = CryptoJS.AES.decrypt(apiKey, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })
    const privateKey = decrypted.toString(CryptoJS.enc.Utf8)
    const wallet = new ethers.Wallet(privateKey)

    let isAuthorized = await this.onCheckRelayer(masterAddress, wallet.address, chainId)

    if (!isAuthorized) {
      await this.authorizeSeamlessAccount({ approve: true, seamlessAddress: wallet.address, chainId })
      isAuthorized = true
    }
    this.configManager.updateSeamlessWallet({
      masterAddress: masterAddress,
      wallet: wallet,
      authorized: isAuthorized,
    })
    return {
      code: 0,
      data: {
        masterAddress: masterAddress,
        seamlessAccount: wallet.address,
        authorized: isAuthorized,
      },
    }
  }

  async exportSeamlessPrivateKey({ password, apiKey }: { password: string, apiKey: string }) {
    const key = CryptoJS.enc.Utf8.parse(charFill(password))
    const iv = getIvMapString()
    const decrypted = CryptoJS.AES.decrypt(apiKey, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    const privateKey = decrypted.toString(CryptoJS.enc.Utf8)
    const wallet = new ethers.Wallet(privateKey)

    if (wallet.address !== this.configManager.getConfig().seamlessAccount?.wallet?.address) {
      throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key");
    }

    return {
      code: 0,
      data: {
        privateKey,
      },
    }
  }

  async importSeamlessPrivateKey({ privateKey, password, chainId }: { privateKey: string, password: string, chainId: number }) {
    if (!ethers.isHexString(privateKey, 32)) {
      throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "Invalid private key");
    }

    const wallet = new ethers.Wallet(privateKey)
    const forwarderContract = await getForwarderContract(chainId)

    const masterAddress = await forwarderContract.originAccount(wallet.address)

    if (masterAddress === ZeroAddress) {
      throw new MyxSDKError(MyxErrorCode.InvalidPrivateKey, "The private key is not a senseless account");
    }

    const isAuthorized = await this.onCheckRelayer(masterAddress, wallet.address, chainId)

    const key = CryptoJS.enc.Utf8.parse(charFill(password))
    const iv = getIvMapString()

    const encrypted = CryptoJS.AES.encrypt(privateKey, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    const apiKey = encrypted.toString()

    this.configManager.updateSeamlessWallet({
      masterAddress: masterAddress,
      wallet: wallet,
      authorized: isAuthorized,
    })

    return {
      code: 0,
      data: {
        masterAddress: masterAddress,
        seamlessAccount: wallet.address,
        authorized: isAuthorized,
        apiKey
      },
    }
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
    const config: MyxClientConfig = this.configManager.getConfig();
    const signer = config.signer;
    const account = await signer?.getAddress() ?? ''

    if (!signer) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
    }

    try {
      const createAccountSignature = await signer.signMessage(`${account}_${password}`);

      const hashedSignature = await calculateSignature(createAccountSignature)

      const { privateKey, wallet } = generateEthWalletFromHashedSignature(hashedSignature)

      const key = CryptoJS.enc.Utf8.parse(charFill(password))
      const iv = getIvMapString()

      const encrypted = CryptoJS.AES.encrypt(privateKey, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      })

      const apiKey = encrypted.toString()

      let isAuthorized = await this.onCheckRelayer(account, wallet.address, chainId)

      this.configManager.updateSeamlessWallet({
        masterAddress: account,
        wallet: wallet,
        authorized: isAuthorized,
      })

      // const forwarderContract = await getForwarderContract(chainId)
      // const erc20Address = getContractAddressByChainId(chainId).ERC20

      // await this.utils.approveAuthorization({
      //   chainId,
      //   quoteAddress: erc20Address,
      //   amount: ethers.MaxUint256.toString(),
      //   spenderAddress: forwarderContract.target as string,
      // });

      return {
        code: 0,
        data: {
          masterAddress: account,
          seamlessAccount: wallet.address,
          authorized: isAuthorized,
          apiKey
        },
      }
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      }
    }
  }


}