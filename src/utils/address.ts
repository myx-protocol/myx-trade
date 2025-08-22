import { getAddress } from "ethers";
import { isUndefined } from "lodash-es";
import { AddressType } from "typechain";

export type AddressString = AddressType;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export class Address {
  private _addr: AddressString;
  static ZERO_ADDRESS = new Address(ZERO_ADDRESS);
  constructor(addr?: string) {
    if (isUndefined(addr) || Number(addr) === 0) {
      addr = ZERO_ADDRESS.toString();
    }
    this._addr = getAddress(addr) as unknown as AddressString;
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
  
  static from(addr?: string) {
    return new Address(addr);
  }
  
  isEqualTo(otherAddress?: string | Address) {
    return (
      !!otherAddress &&
      this.toString().toLowerCase() === otherAddress.toString().toLowerCase()
    );
  }
}

export const formatHex = (hex: string, mask = true) => {
  if (mask) {
    return `${hex.slice(0, 6).toLowerCase()}...${hex.slice(-4).toLowerCase()}`;
  }
  return hex.toLowerCase();
};

export const NATIVE_TOKEN_ADDRESS =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
