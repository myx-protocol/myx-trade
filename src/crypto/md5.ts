import Hex from 'crypto-js/enc-hex'
import cryptoMD5 from 'crypto-js/md5'

export const md5 = (message: string, length?: 16 | 32) => {
  return cryptoMD5(message, { length: length || 32 }).toString(Hex)
}
