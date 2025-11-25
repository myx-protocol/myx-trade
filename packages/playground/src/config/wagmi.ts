import { http, createConfig } from 'wagmi'
import { arbitrumSepolia, lineaSepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [arbitrumSepolia, lineaSepolia],
  connectors: [
    metaMask(),
  ],
  transports: {
    [arbitrumSepolia.id]: http(),
    [lineaSepolia.id]: http()
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
