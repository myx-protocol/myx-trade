import { WordArray } from "crypto-es";
import dayjs from "dayjs";
import { forwarder } from ".";
import { getContractAddressByChainId } from "@/config/address";
import { FORWARD_GAS_LIMIT } from "@/config/fee";
import { Address } from "viem";

export const generateTxId = () => {
  const randomWords = WordArray.random(32);
  return `0x${randomWords.toString()}`;
};

export const getExecutionTimestamp = () => {
  const now = dayjs();
  const createAt = now.unix();
  const deadline = now.add(10, "second").unix();

  return {
    createAt,
    deadline,
  };
};

interface BuildSignDataParams {
  chainId: number;
  data: string;
  from: Address;
  to: Address;
}

export const buildSignData = async ({
  chainId,
  data,
  from,
  to,
}: BuildSignDataParams) => {
  const domain = await forwarder.getForwardEip712Domain(chainId);
  const { createAt, deadline } = getExecutionTimestamp();
  const txId = generateTxId();
  const { types, primaryType } = forwarder.getForwardRequestTypes();
  const signData = {
    from,
    to,
    deadline,
    data,
    value: 0n,
    gas: FORWARD_GAS_LIMIT,
  };
  return {
    domain,
    createAt,
    deadline,
    txId,
    types,
    primaryType,
    signData,
  };
};
