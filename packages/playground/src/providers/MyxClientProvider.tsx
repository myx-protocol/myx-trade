import React, { useState } from "react";
import { MyxClientContext } from "./MyxClientContext";
import { MyxClient } from "@myx-trade/sdk";
interface Props {
  children: React.ReactNode;
}

export const MyxClientProvider: React.FC<Props> = ({ children }) => {
  const [myxClient, setMyxClient] = useState<MyxClient | null>(null);
  return (
    <MyxClientContext.Provider value={{myxClient, setMyxClient}}>
      {children}
    </MyxClientContext.Provider>
  );
};
