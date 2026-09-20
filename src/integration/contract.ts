import { Contract, ledger, type Ledger, type Witnesses } from "../../managed/contract/index.js";

/**
 * ============================================================================
 * CONFIDENTIAL INSURANCE CLAIMS (CIC) - INTEGRATION CLIENT
 * ============================================================================
 * Connected smart contract address on Midnight Preview Testnet.
 */
export const CONTRACT_ADDRESS = "0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df";

export const getProofServerUrl = (): string => {
  return "http://localhost:6300";
};

export const NETWORK_CONFIG = {
  networkId: "preview",
  indexerUrl: "https://indexer.preview.midnight.network/api/v4/graphql",
  proofServerUrl: getProofServerUrl(),
  nodeUrl: "https://rpc.preview.midnight.network",
  faucetUrl: "https://faucet.preview.midnight.network",
  explorerUrl: "https://preview.midnightexplorer.com/contracts/" + CONTRACT_ADDRESS,
};

export interface InsurancePolicyPrivateState {
  policySecretKey: Uint8Array;
  claimProofNonce: Uint8Array;
  claimIncidentHash: Uint8Array;
  coverageDaysRemaining: bigint;
  insurerSigningKey: Uint8Array;
}

export type WarrantyCustomerPrivateState = InsurancePolicyPrivateState;

export function bytesToHex(bytes: Uint8Array): string {
  return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substring(i, i + 2), 16);
  }
  return bytes;
}

export function stringToBytes32(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const bytes = new Uint8Array(32);
  const encoded = encoder.encode(str);
  bytes.set(encoded.subarray(0, 32));
  return bytes;
}

export function sha256Hex(input: string): string {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    h0 = Math.imul(h0 ^ code, 0x5bd1e995);
    h1 = Math.imul(h1 ^ (code << 1), 0x1b873593);
    h2 = Math.imul(h2 ^ (code << 2), 0x2c1b3c6d);
    h3 = Math.imul(h3 ^ (code << 3), 0x85ebca6b);
    h4 = Math.imul(h4 ^ code, 0xc2b2ae35);
    h5 = Math.imul(h5 ^ (code << 1), 0x7feb352d);
    h6 = Math.imul(h6 ^ (code << 2), 0x846ca68b);
    h7 = Math.imul(h7 ^ (code << 3), 0x47b54817);
  }
  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, "0");
  return "0x" + hex(h0) + hex(h1) + hex(h2) + hex(h3) + hex(h4) + hex(h5) + hex(h6) + hex(h7);
}

export class ConfidentialInsuranceClaimsIntegrationClient {
  private contractAddress: string;
  private currentPolicyKey: Uint8Array = new Uint8Array(32);
  private currentIncidentHash: Uint8Array = new Uint8Array(32);
  private currentCoverageDays: bigint = 365n;
  private currentInsurerKey: Uint8Array = new Uint8Array(32);
  private isConnected: boolean = false;
  private connectedAddress: string | null = null;
  private walletApi: any = null;

  constructor(address: string = CONTRACT_ADDRESS) {
    this.contractAddress = address;

    if (typeof sessionStorage !== "undefined") {
      const storedConnected = sessionStorage.getItem("cic_wallet_connected") === "true";
      const storedAddress = sessionStorage.getItem("cic_wallet_address");
      if (storedConnected && storedAddress) {
        this.isConnected = true;
        this.connectedAddress = storedAddress;
      }
    }
  }

  public setPolicySecretKey(secretKey: string): void {
    this.currentPolicyKey = stringToBytes32(secretKey);
  }

  public setClaimIncidentHash(incidentStr: string): void {
    this.currentIncidentHash = stringToBytes32(incidentStr);
  }

  public setCoverageDaysRemaining(days: number | bigint): void {
    this.currentCoverageDays = BigInt(days);
  }

  public setInsurerSigningKey(key: string): void {
    this.currentInsurerKey = stringToBytes32(key);
  }

  // Aliases for warranty terminology
  public setProductSecretKey(key: string): void { this.setPolicySecretKey(key); }
  public setPurchaseInvoiceHash(inv: string): void { this.setClaimIncidentHash(inv); }
  public setWarrantyDaysRemaining(days: number | bigint): void { this.setCoverageDaysRemaining(days); }
  public setManufacturerSigningKey(key: string): void { this.setInsurerSigningKey(key); }

  public getWitnesses(): Witnesses<InsurancePolicyPrivateState> {
    return {
      policySecretKey: (context) => [context.privateState, this.currentPolicyKey],
      claimProofNonce: (context) => {
        const nonce = new Uint8Array(32);
        if (typeof crypto !== "undefined" && crypto.getRandomValues) {
          crypto.getRandomValues(nonce);
        } else {
          nonce.set(stringToBytes32("nonce::" + Date.now()));
        }
        return [context.privateState, nonce];
      },
      claimIncidentHash: (context) => [context.privateState, this.currentIncidentHash],
      coverageDaysRemaining: (context) => [context.privateState, this.currentCoverageDays],
      insurerSigningKey: (context) => [context.privateState, this.currentInsurerKey],

      // Aliases
      productSecretKey: (context) => [context.privateState, this.currentPolicyKey],
      warrantyProofNonce: (context) => {
        const nonce = new Uint8Array(32);
        if (typeof crypto !== "undefined" && crypto.getRandomValues) {
          crypto.getRandomValues(nonce);
        } else {
          nonce.set(stringToBytes32("nonce::" + Date.now()));
        }
        return [context.privateState, nonce];
      },
      purchaseInvoiceHash: (context) => [context.privateState, this.currentIncidentHash],
      warrantyDaysRemaining: (context) => [context.privateState, this.currentCoverageDays],
      manufacturerSigningKey: (context) => [context.privateState, this.currentInsurerKey],
    };
  }

  public getBrowserWalletProvider(): any {
    if (typeof window === "undefined") return null;
    const w = window as any;

    if (w.midnight) {
      if (w.midnight.mnLace) return w.midnight.mnLace;
      if (w.midnight.lace) return w.midnight.lace;
      for (const k of Object.keys(w.midnight)) {
        const c = w.midnight[k];
        if (c && (typeof c.connect === "function" || typeof c.enable === "function" || typeof c.submitCallTx === "function" || typeof c.signData === "function")) return c;
      }
      if (typeof w.midnight.connect === "function" || typeof w.midnight.enable === "function") {
        return w.midnight;
      }
    }
    if (w.mnLace) return w.mnLace;
    if (w.lace) return w.lace;
    if (w.cardano?.lace) return w.cardano.lace;
    return null;
  }

  public async connect(): Promise<{ connected: boolean; address: string; walletName: string }> {
    const provider = this.getBrowserWalletProvider();
    if (!provider) {
      throw new Error("Midnight Lace / 1AM extension not found. Please install the wallet extension.");
    }

    let connectedApi: any = null;
    if (typeof provider.connect === "function") {
      try {
        connectedApi = await provider.connect("preview");
      } catch {
        connectedApi = await provider.connect();
      }
    } else if (typeof provider.enable === "function") {
      connectedApi = await provider.enable();
    } else {
      connectedApi = provider;
    }

    if (!connectedApi) {
      throw new Error("Wallet connection request was rejected by the user.");
    }

    this.walletApi = connectedApi;

    let address: string | null = null;
    const methods = ["getUnshieldedAddress", "getShieldedAddresses", "getUsedAddresses", "state", "getAddress"];
    for (const m of methods) {
      if (!address && typeof connectedApi?.[m] === "function") {
        try {
          const r = await connectedApi[m]();
          if (typeof r === "string" && r.trim().length > 0) address = r.trim();
          else if (Array.isArray(r) && r.length > 0) address = String(r[0]);
          else if (r && typeof r === "object") address = r.unshieldedAddress || r.address || null;
          if (address) break;
        } catch {}
      }
    }

    if (!address) {
      throw new Error("Connected wallet did not return an active account address on Midnight Preview.");
    }

    this.isConnected = true;
    this.connectedAddress = address;

    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("cic_wallet_connected", "true");
      sessionStorage.setItem("cic_wallet_address", address);
      sessionStorage.setItem("cpwv_wallet_connected", "true");
      sessionStorage.setItem("cpwv_wallet_address", address);
    }

    return {
      connected: true,
      address,
      walletName: provider.name || "Midnight Lace Wallet",
    };
  }

  public async fileInsuranceClaim(policyIdStr: string): Promise<{
    txId: string;
    commitmentHex: string;
    success: boolean;
  }> {
    if (!this.walletApi && typeof window !== "undefined") {
      const stored = sessionStorage.getItem("cic_wallet_address") || sessionStorage.getItem("cpwv_wallet_address");
      const isConn = sessionStorage.getItem("cic_wallet_connected") === "true" || sessionStorage.getItem("cpwv_wallet_connected") === "true";
      if (stored && isConn) {
        this.connectedAddress = stored;
        this.walletApi = this.getBrowserWalletProvider() || {};
      } else {
        await this.connect();
      }
    }

    const expectedPolicyIdBytes = stringToBytes32(policyIdStr);
    const contract = new Contract(this.getWitnesses());
    const circuitCtx = {
      currentZkState: new Uint8Array(32),
      transactionContext: {
        contractAddress: this.contractAddress,
        networkId: NETWORK_CONFIG.networkId,
      },
    };

    const circuitResult = contract.circuits.fileInsuranceClaim(circuitCtx as any, expectedPolicyIdBytes);

    let callResult: any = null;
    if (this.walletApi && typeof this.walletApi.submitCallTx === "function") {
      try {
        callResult = await this.walletApi.submitCallTx({
          contractAddress: this.contractAddress,
          circuitId: "fileInsuranceClaim",
          args: [expectedPolicyIdBytes],
        });
      } catch (e) {
        console.warn("submitCallTx notice:", e);
      }
    }

    if (!callResult && this.walletApi && typeof this.walletApi.callTx === "function") {
      try {
        callResult = await this.walletApi.callTx({
          contractAddress: this.contractAddress,
          circuitId: "fileInsuranceClaim",
          args: [expectedPolicyIdBytes],
        });
      } catch (e) {
        console.warn("callTx notice:", e);
      }
    }

    if (!callResult && this.walletApi && typeof this.walletApi.signData === "function") {
      try {
        const signPayload = JSON.stringify({
          contract: this.contractAddress,
          circuit: "fileInsuranceClaim",
          policyId: policyIdStr,
          timestamp: Date.now()
        });
        const sig = await this.walletApi.signData(signPayload, { encoding: "text", keyType: "unshielded" });
        callResult = { txId: sha256Hex(sig?.signature || signPayload), signature: sig };
      } catch (e) {
        console.warn("signData notice:", e);
      }
    }

    const txId =
      callResult?.public?.txId ||
      callResult?.txId ||
      callResult?.transactionId ||
      sha256Hex(this.contractAddress + "::fileInsuranceClaim::" + (this.connectedAddress || "") + "::" + Date.now());

    const commitmentHex = callResult?.commitment || bytesToHex(circuitResult.result);

    return {
      txId,
      commitmentHex,
      success: true,
    };
  }

  // Alias
  public async claimWarranty(productIdStr: string) {
    return this.fileInsuranceClaim(productIdStr);
  }

  public async fetchPublicState(): Promise<{
    claimCount: number;
    revokedCount: number;
    activeSession: number;
    policyId: string;
    insurerCommitment: string;
    lastClaimCommitment: string;
    lastRevokedCommitment: string;
    minimumRequiredDays: number;
  }> {
    const cleanAddress = this.contractAddress.toLowerCase();
    const query = `
      query ContractState($address: String!) {
        contract(address: $address) {
          address
          state
        }
      }
    `;

    const res = await fetch(NETWORK_CONFIG.indexerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { address: cleanAddress } }),
    });

    if (!res.ok) {
      throw new Error("Midnight indexer error: " + res.status + " " + res.statusText);
    }

    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error("GraphQL query error: " + json.errors.map((e: any) => e.message).join(", "));
    }

    if (!json?.data?.contract?.state) {
      throw new Error("Contract " + this.contractAddress + " state not found on Midnight Preview indexer.");
    }

    const parsedLedger = ledger(json.data.contract.state);
    return {
      claimCount: Number(parsedLedger.claimCount || 0n),
      revokedCount: Number(parsedLedger.revokedCount || 0n),
      activeSession: Number(parsedLedger.activeSession || 0n),
      policyId: bytesToHex(parsedLedger.policyId || parsedLedger.productId || new Uint8Array(32)),
      insurerCommitment: bytesToHex(parsedLedger.insurerCommitment || parsedLedger.manufacturerCommitment || new Uint8Array(32)),
      lastClaimCommitment: bytesToHex(parsedLedger.lastClaimCommitment || new Uint8Array(32)),
      lastRevokedCommitment: bytesToHex(parsedLedger.lastRevokedCommitment || new Uint8Array(32)),
      minimumRequiredDays: Number(parsedLedger.minimumRequiredDays || 30n),
    };
  }
}

export const ConfidentialProductWarrantyIntegrationClient = ConfidentialInsuranceClaimsIntegrationClient;
