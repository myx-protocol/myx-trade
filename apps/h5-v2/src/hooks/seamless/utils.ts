import { t } from '@lingui/core/macro'
import { Utf8 } from 'crypto-es'
import { createWalletClient, http, defineChain } from 'viem'
import { privateKeyToAccount, type Account } from 'viem/accounts'
import { bytesToHex, isHex, hexToBytes, keccak256, toHex } from 'viem/utils'
import { CHAIN_INFO } from '@/config/chainInfo'
import { ethers } from 'ethers'

/**
 * SDK `forwarderTx` 需要 viem WalletClient（含 getAddresses / signTransaction 等），
 * `privateKeyToAccount` 得到的是 LocalAccount，需包一层 createWalletClient。
 */
export const createSeamlessWalletClientFromPrivateKey = (privateKey: `0x${string}`) => {
  // const info = CHAIN_INFO[chainId as keyof typeof CHAIN_INFO]
  // if (!info) {
  //   throw new Error(t`Unsupported chain`)
  // }
  // const chain = defineChain({
  //   id: chainId,
  //   name: info.label,
  //   nativeCurrency: info.nativeCurrency,
  //   rpcUrls: {
  //     default: { http: [...info.publicJsonRPCUrl] },
  //   },
  // })
  // const account = privateKeyToAccount(privateKey)
  // return createWalletClient({
  //   account,
  //   chain,
  //   transport: http(info.publicJsonRPCUrl[0]),
  // })
  const wallet = new ethers.Wallet(privateKey)
  return wallet
}

/** 使用浏览器 Web Crypto API，避免使用 Node crypto（Vite 在浏览器端会 externalize） */
const getWebCrypto = () => {
  const c = globalThis.crypto
  if (!c?.subtle) throw new Error('Crypto.subtle not available')
  return c
}

const calculateSignature = async (message: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const crypto = getWebCrypto()
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const generateEthWalletFromHashedSignature = (
  hashedSignature: string,
): { privateKey: `0x${string}`; wallet: Account } => {
  const seedBytes = new Uint8Array(new TextEncoder().encode(hashedSignature))
  const seedHex = bytesToHex(seedBytes)
  const hashHex = keccak256(seedHex as `0x${string}`)
  const privateKeyBytes = hexToBytes(hashHex).slice(0, 32)
  const privateKey = toHex(privateKeyBytes) as `0x${string}`

  if (!isHex(privateKey) || privateKey.length !== 66) {
    throw new Error(t`Invalid private key generated`)
  }

  const wallet = privateKeyToAccount(privateKey)
  return { privateKey, wallet }
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

const seamlessNonceString = 'jAkBlC4~5!6@#$%^'

export const getIvMapString = () => Utf8.parse(seamlessNonceString)

export { calculateSignature, generateEthWalletFromHashedSignature, charFill }
