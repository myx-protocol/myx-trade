import { getForwarderContract } from "@/web3/providers";

export const getForwardEip712Domain = async (chainId: number) => {
  const forwarderContract = await getForwarderContract(chainId);
  const forwarderJsonRpcContractDomain =
    await forwarderContract.read.eip712Domain();

  const domain = {
    name: forwarderJsonRpcContractDomain[1],
    version: forwarderJsonRpcContractDomain[2],
    chainId: forwarderJsonRpcContractDomain[3],
    verifyingContract: forwarderJsonRpcContractDomain[4],
  };

  return domain;
};

export const getForwardRequestTypes = () => {
  const types = {
    ForwardRequest: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "gas", type: "uint256" },
      { name: "deadline", type: "uint48" },
      { name: "data", type: "bytes" },
    ],
  } as const;
  const primaryType = "ForwardRequest" as any;
  return {
    types,
    primaryType,
  };
};
