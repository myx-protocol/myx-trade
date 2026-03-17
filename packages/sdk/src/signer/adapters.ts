import type { ISigner, SignerLike, WalletClientLike, MinimalSignerLike } from "./types.js";

function isWalletClientLike(s: SignerLike): s is WalletClientLike {
  return (
    typeof (s as WalletClientLike).getAddresses === "function" &&
    typeof (s as WalletClientLike).signMessage === "function" &&
    typeof (s as WalletClientLike).sendTransaction === "function"
  );
}

function isMinimalSignerLike(s: SignerLike): s is MinimalSignerLike {
  return (
    typeof (s as MinimalSignerLike).getAddress === "function" &&
    typeof (s as MinimalSignerLike).signMessage === "function" &&
    typeof (s as MinimalSignerLike).sendTransaction === "function"
  );
}

/**
 * Wrap viem WalletClient as ISigner.
 * Use this when the app uses viem (e.g. wagmi useWalletClient) so no ethers is required for auth.
 */
export function fromViemWalletClient(walletClient: WalletClientLike): ISigner {
  const wc = walletClient as WalletClientLike & { signTypedData?(args: unknown): Promise<`0x${string}`> };
  return {
    async getAddress() {
      const [address] = await walletClient.getAddresses();
      if (!address) throw new Error("WalletClient: no address");
      return address as string;
    },
    async signMessage(message: string | Uint8Array) {
      const msg = typeof message === "string" ? message : { raw: message };
      return (await walletClient.signMessage({ message: msg })) as string;
    },
    async sendTransaction(tx) {
      const to = tx.to as `0x${string}` | undefined;
      if (!to) throw new Error("sendTransaction: to is required");
      const hash = await walletClient.sendTransaction({
        to,
        data: tx.data as `0x${string}` | undefined,
        value: tx.value != null ? BigInt(tx.value) : undefined,
        gas: tx.gasLimit != null ? BigInt(tx.gasLimit) : undefined,
        gasPrice: tx.gasPrice != null ? BigInt(tx.gasPrice) : undefined,
        maxFeePerGas: tx.maxFeePerGas != null ? BigInt(tx.maxFeePerGas) : undefined,
        maxPriorityFeePerGas:
          tx.maxPriorityFeePerGas != null ? BigInt(tx.maxPriorityFeePerGas) : undefined,
      });
      return { hash: hash as string };
    },
    ...(typeof wc.signTypedData === "function"
      ? {
          async signTypedData(params: { domain: Record<string, unknown>; types: Record<string, unknown>; primaryType: string; message: Record<string, unknown> }) {
            return (await wc.signTypedData!(params)) as string;
          },
        }
      : {}),
  };
}

/**
 * Wrap any object with getAddress/signMessage/sendTransaction as ISigner.
 * Use for ethers v5 or v6 Signer, or any compatible implementation.
 */
export function fromMinimalSigner(signer: MinimalSignerLike): ISigner {
  const minimal = signer as MinimalSignerLike & { signTypedData?(domain: unknown, types: unknown, message: unknown): Promise<string> };
  return {
    getAddress: () => signer.getAddress(),
    signMessage: (msg) => signer.signMessage(msg),
    async sendTransaction(tx) {
      const res = await signer.sendTransaction({
        ...tx,
        value: tx.value != null ? BigInt(tx.value) : undefined,
        gasLimit: tx.gasLimit != null ? BigInt(tx.gasLimit) : undefined,
      } as Record<string, unknown>);
      return { hash: res.hash };
    },
    ...(typeof minimal.signTypedData === "function"
      ? {
          async signTypedData(params: { domain: Record<string, unknown>; types: Record<string, unknown>; primaryType: string; message: Record<string, unknown> }) {
            return minimal.signTypedData!(params.domain, params.types, params.message);
          },
        }
      : {}),
  };
}

/**
 * Normalize SignerLike to ISigner.
 * - WalletClient -> fromViemWalletClient
 * - MinimalSignerLike (ethers v5/v6 Signer) -> fromMinimalSigner
 * - Already ISigner -> return as is
 */
export function normalizeSigner(signerLike: SignerLike): ISigner {
  if (isWalletClientLike(signerLike)) return fromViemWalletClient(signerLike);
  if (isMinimalSignerLike(signerLike)) return fromMinimalSigner(signerLike);
  return signerLike as ISigner;
}
