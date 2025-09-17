import { ethers, TransactionResponse } from "ethers";

export const getOrderIdFromTransaction = (transaction: TransactionResponse) => {
  // const orderId = transaction.logs.find((log: any) => log.topics[0] === ethers.keccak256(ethers.toUtf8Bytes('OrderPlaced')))?.data;
  // return orderId;
}