import { WordArray } from "crypto-es";
import dayjs from "dayjs";
import { forwarder } from ".";
import { FORWARD_GAS_LIMIT } from "@/config/fee";
import {
  Address,
  encodeFunctionData,
  toFunctionSelector,
  getAbiItem,
  AbiFunction,
} from "viem";
import {
  getExecutionPoolContract,
} from "@/web3/providers";
export const generateTxId = () => {
  const randomWords = WordArray.random(32);
  return `0x${randomWords.toString()}`;
};

export const getExecutionTimestamp = () => {
  const now = dayjs();
  const createAt = now.unix();
  const deadline = now.add(1, "minute").unix();

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
  const { createAt, deadline } = getExecutionTimestamp();
  const txId = generateTxId();
  const gasEscrow = 0n
  const signData = {
    from,
    to,
    deadline,
    data,
    value: 0n,
    gas: FORWARD_GAS_LIMIT,
  };
  return {
    createAt,
    deadline,
    txId,
    signData,
    gasEscrow
  };
};

interface BuildHexDataAndExecutionGasFeeParams {
  chainId: number;
  abi: any;
  method: string;
  args: any[];
}

export const buildHexDataAndExecutionGasFee = async ({
  chainId,
  abi,
  method,
  args,
}: BuildHexDataAndExecutionGasFeeParams) => {
  const hexData = encodeFunctionData({
    abi,
    functionName: method,
    args,
  });

  const abiItem = getAbiItem({
    abi,
    name: method,
  }) as AbiFunction;

  const functionSelector = toFunctionSelector(abiItem);
  console.log('functionSelector-->', functionSelector)
  const executionPoolContract = await getExecutionPoolContract(chainId);

  const executionGasFee =
    await executionPoolContract.read!.getGasEscrowForSelector([functionSelector]);
  return {
    hexData: hexData,
    executionGasFee,
  };
};
