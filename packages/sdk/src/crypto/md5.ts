import { Hex, MD5 } from 'crypto-es'

export const md5 = (message: string, length?: 16 | 32) => {
  return MD5(message, { outputLength: length || 32 }).toString(Hex)
}
