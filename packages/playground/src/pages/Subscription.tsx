import { ChainId } from "@/config/chain";
import { MyxClient } from "@myx-trade/sdk";
import { BrowserProvider } from "ethers";
import { useEffect, useRef, useState } from "react";
import { useChainId, useWalletClient } from "wagmi";

const SubscriptionPage: React.FC = () => {
  const { data: walletClient } = useWalletClient();
  const [myxClient, setMyxClient] = useState<MyxClient | null>(null);
  const initClient = async () => {
    if (walletClient?.transport) {
      const provider = new BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const client = new MyxClient({
        signer: signer,
        chainId: ChainId.ARB_TESTNET,
        brokerAddress: "0xa70245309631Ce97425532466F24ef86FE630311",
      });

      setMyxClient(client);
    }
  };
  useEffect(() => {
    if (walletClient?.transport) {
      initClient();
    }
  }, [walletClient]);
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1>Subscription</h1>

      <div></div>
    </div>
  );
};

export default SubscriptionPage;
