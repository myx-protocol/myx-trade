import type { ISigner, SignerLike, WalletClientLike, MinimalSignerLike } from "./types.js";

function isWalletClientLike(s: SignerLike): s is WalletClientLike {
  // viem WalletClient: getAddresses (plural), no getAddress (singular)
  return (
    typeof (s as WalletClientLike).getAddresses === "function" &&
    typeof (s as MinimalSignerLike).getAddress !== "function" &&
    typeof (s as WalletClientLike).signMessage === "function" &&
    typeof (s as WalletClientLike).sendTransaction === "function"
  );
}

function isMinimalSignerLike(s: SignerLike): s is MinimalSignerLike {
  const obj = s as Record<string, unknown>;
  // ethers v5/v6: getAddress (singular), signMessage
  // sendTransaction may not exist on read-only signers, but provider field indicates ethers signer
  return (
    typeof obj["getAddress"] === "function" &&
    typeof obj["signMessage"] === "function" &&
    (typeof obj["sendTransaction"] === "function" || typeof obj["provider"] !== "undefined")
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
    signTransaction: (transaction: import("viem").TransactionRequest) => walletClient.signTransaction(transaction) as Promise<string>,
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
 * Compatible with ethers v5, ethers v6, and any ISigner-like object.
 *
 * ethers v5: sendTransaction returns TransactionResponse { hash, wait, ... }
 * ethers v6: sendTransaction returns TransactionResponse { hash, wait, ... }
 * ethers v5: _signTypedData(domain, types, value)
 * ethers v6: signTypedData(domain, types, value)
 */
export function fromMinimalSigner(signer: MinimalSignerLike): ISigner {
  const obj = signer as unknown as Record<string, unknown>;
  const minimal = signer as MinimalSignerLike & {
    signTypedData?(domain: unknown, types: unknown, message: unknown): Promise<string>;
    _signTypedData?(domain: unknown, types: unknown, message: unknown): Promise<string>; // ethers v5
  };

  return {
    getAddress: () => signer.getAddress(),

    signMessage: (msg: string | Uint8Array) => signer.signMessage(msg),

    async sendTransaction(tx) {
      const params: Record<string, unknown> = { ...tx };
      if (tx.value != null) params.value = BigInt(tx.value);
      if (tx.gasLimit != null) params.gasLimit = BigInt(tx.gasLimit);
      if (tx.gasPrice != null) params.gasPrice = BigInt(tx.gasPrice);
      if (tx.maxFeePerGas != null) params.maxFeePerGas = BigInt(tx.maxFeePerGas);
      if (tx.maxPriorityFeePerGas != null) params.maxPriorityFeePerGas = BigInt(tx.maxPriorityFeePerGas);

      try {
        const res = await signer.sendTransaction(params);
        const hash = (res as { hash?: string }).hash;
        if (!hash) throw new Error("sendTransaction: no hash in response");
        return { hash };
      } catch (err: unknown) {
        // ethers v5 in some environments doesn't support bigint, retry with hex strings
        const msg = typeof err === "object" && err !== null ? String((err as { message?: string }).message) : "";
        if (err instanceof TypeError || msg.includes("BigInt") || msg.includes("bigint")) {
          const fallback: Record<string, unknown> = { ...tx };
          if (tx.value != null) fallback.value = `0x${BigInt(tx.value).toString(16)}`;
          if (tx.gasLimit != null) fallback.gasLimit = `0x${BigInt(tx.gasLimit).toString(16)}`;
          if (tx.gasPrice != null) fallback.gasPrice = `0x${BigInt(tx.gasPrice).toString(16)}`;
          if (tx.maxFeePerGas != null) fallback.maxFeePerGas = `0x${BigInt(tx.maxFeePerGas).toString(16)}`;
          if (tx.maxPriorityFeePerGas != null) fallback.maxPriorityFeePerGas = `0x${BigInt(tx.maxPriorityFeePerGas).toString(16)}`;
          const res = await signer.sendTransaction(fallback);
          const hash = (res as { hash?: string }).hash;
          if (!hash) throw new Error("sendTransaction: no hash in response");
          return { hash };
        }
        throw err;
      }
    },

    signTransaction: typeof obj["signTransaction"] === "function"
      ? (tx) => minimal.signTransaction!(tx)
      : () => Promise.reject(new Error("signTransaction not supported by this signer")),

    // ethers v6: signTypedData(domain, types, value)
    // ethers v5: _signTypedData(domain, types, value)
    ...(typeof minimal.signTypedData === "function"
      ? {
          async signTypedData(params: { domain: Record<string, unknown>; types: Record<string, unknown>; primaryType: string; message: Record<string, unknown> }) {
            return minimal.signTypedData!(params.domain, params.types, params.message);
          },
        }
      : typeof minimal._signTypedData === "function"
      ? {
          async signTypedData(params: { domain: Record<string, unknown>; types: Record<string, unknown>; primaryType: string; message: Record<string, unknown> }) {
            return minimal._signTypedData!(params.domain, params.types, params.message);
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
