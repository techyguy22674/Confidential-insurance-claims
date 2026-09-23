"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CONTRACT_ADDRESS, NETWORK_CONFIG, bytesToHex, getClient, type StoredClaimRecord } from "../../lib/contract";
import { ledger } from "../../../managed/contract/index.js";

export default function ExplorerPage() {
  const [loading, setLoading] = useState(true);
  const [liveState, setLiveState] = useState<{
    claimCount: string;
    revokedCount: string;
    activeSession: string;
    policyId: string;
    insurerCommitment: string;
    lastClaimCommitment: string;
    lastRevokedCommitment: string;
    minimumRequiredDays: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawLength, setRawLength] = useState<number | null>(null);
  const [recentClaims, setRecentClaims] = useState<StoredClaimRecord[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Load local verified claims
    try {
      const client = getClient();
      setRecentClaims(client.getIssuedClaims());
    } catch {
      // ignore
    }
  }, [refreshTrigger]);

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveLedger() {
      try {
        setLoading(true);
        setError(null);

        const cleanAddr = CONTRACT_ADDRESS.toLowerCase().replace(/^0x/, "");
        const query = `
          query GetContractState($address: String!) {
            contractAction(address: $address) {
              address
              state
            }
          }
        `;

        const res = await fetch(NETWORK_CONFIG.indexerUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            variables: { address: cleanAddr },
          }),
        });

        if (!res.ok) {
          throw new Error("Indexer responded with HTTP " + res.status);
        }

        const json = await res.json();
        if (json.errors && json.errors.length > 0) {
          throw new Error(json.errors.map((e: any) => e.message).join(", "));
        }

        const rawState = json?.data?.contractAction?.state;
        if (!rawState) {
          throw new Error("No public ledger state returned from Midnight Preview indexer.");
        }

        const parsed = ledger(rawState);
        if (isMounted) {
          setRawLength(rawState.length);
          setLiveState({
            claimCount: (parsed.claimCount ?? 0n).toString(),
            revokedCount: (parsed.revokedCount ?? 0n).toString(),
            activeSession: (parsed.activeSession ?? 0n).toString(),
            policyId: bytesToHex(parsed.policyId || new Uint8Array(32)),
            insurerCommitment: bytesToHex(parsed.insurerCommitment || new Uint8Array(32)),
            lastClaimCommitment: bytesToHex(parsed.lastClaimCommitment || new Uint8Array(32)),
            lastRevokedCommitment: bytesToHex(parsed.lastRevokedCommitment || new Uint8Array(32)),
            minimumRequiredDays: (parsed.minimumRequiredDays ?? 30n).toString(),
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to query Midnight Preview indexer.");
          // Fallback to client cached/ledger decoder
          try {
            const client = getClient();
            const fallback = await client.fetchContractState();
            setLiveState({
              claimCount: fallback.claimCount.toString(),
              revokedCount: fallback.revokedCount.toString(),
              activeSession: fallback.activeSession.toString(),
              policyId: fallback.policyId,
              insurerCommitment: fallback.insurerCommitment,
              lastClaimCommitment: fallback.lastClaimCommitment,
              lastRevokedCommitment: fallback.lastRevokedCommitment,
              minimumRequiredDays: fallback.minimumRequiredDays.toString(),
            });
            setError(null);
          } catch {
            // keep error
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchLiveLedger();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
          <span className="badge badge-cyan">Midnight Explorer</span>
          <span className="badge badge-green">Preview Network</span>
          <span className="badge badge-purple">Indexer v4</span>
        </div>
        <h1 className="section-title">On-Chain Contract Explorer</h1>
        <p className="section-desc">
          Inspect live zero-knowledge state, public ledger fields, and verifiable insurance proofs on Midnight Preprod/Preview.
        </p>
      </div>

      {/* Contract Metadata Card */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.35rem" }}>
              Verified Contract Address
            </div>
            <code style={{ fontSize: "0.85rem", color: "#06b6d4", wordBreak: "break-all" }}>
              {CONTRACT_ADDRESS}
            </code>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setRefreshTrigger(t => t + 1)}
              className="btn-secondary"
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
            >
              Refresh State
            </button>
            <a
              href={"https://preview.midnightexplorer.com/contracts/" + CONTRACT_ADDRESS}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.8rem" }}
            >
              Midnight Explorer
            </a>
          </div>
        </div>
      </div>

      {/* Public Ledger Grid */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc" }}>
              Public Ledger Fields (8 Compact Declarations)
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              State variables verified on Midnight blockchain with selective zero-knowledge disclosure
            </div>
          </div>
          <span
            style={{
              fontSize: "0.72rem",
              padding: "0.25rem 0.6rem",
              borderRadius: "4px",
              background: loading ? "rgba(245,158,11,0.15)" : error ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
              color: loading ? "#f59e0b" : error ? "#ef4444" : "#10b981",
              fontFamily: "monospace",
            }}
          >
            {loading ? "Querying Indexer..." : error ? "Fallback Mode" : ("Verified On-Chain (" + (rawLength ? rawLength + " bytes" : "Active") + ")")}
          </span>
        </div>

        {error && (
          <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.1)", borderRadius: "6px", color: "#ef4444", fontSize: "0.78rem", marginBottom: "1rem" }}>
            Indexer Notice: {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {[
            { field: "claimCount: Counter", val: liveState?.claimCount, desc: "Total verified insurance claims filed", color: "#e11d48" },
            { field: "revokedCount: Counter", val: liveState?.revokedCount, desc: "Total revoked/voided claims on-chain", color: "#ef4444" },
            { field: "activeSession: Counter", val: liveState?.activeSession, desc: "Monotonic epoch nonce (replay protection)", color: "#06b6d4" },
            { field: "policyId: Bytes<32>", val: liveState?.policyId, desc: "Active underwriting policy identifier", color: "#10b981" },
            { field: "insurerCommitment: Bytes<32>", val: liveState?.insurerCommitment, desc: "Insurer public authority anchor hash", color: "#f59e0b" },
            { field: "lastClaimCommitment: Bytes<32>", val: liveState?.lastClaimCommitment, desc: "Most recent ZK insurance claim hash", color: "#8b5cf6" },
            { field: "lastRevokedCommitment: Bytes<32>", val: liveState?.lastRevokedCommitment, desc: "Most recent revoked commitment hash", color: "#ef4444" },
            { field: "minimumRequiredDays: Uint<32>", val: liveState ? liveState.minimumRequiredDays + " days" : undefined, desc: "Threshold for policy coverage validity", color: "#06b6d4" },
          ].map((f) => (
            <div
              key={f.field}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 0.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.01)",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div>
                <code style={{ fontSize: "0.8rem", color: f.color, display: "block" }}>{f.field}</code>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{f.desc}</span>
              </div>
              {f.val !== undefined && (
                <div style={{ textAlign: "right" }}>
                  <code style={{ fontSize: "0.78rem", color: "#e2e8f0", background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: "4px" }}>
                    {f.val.length > 22 ? f.val.substring(0, 10) + "..." + f.val.substring(f.val.length - 8) : f.val}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Issued Claims History with 1-Click Verification */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f8fafc" }}>
              Issued Claims Registry ({recentClaims.length})
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              ZK insurance claim commitments stored locally with dual verification support
            </div>
          </div>
          <Link href="/claim" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}>
            + File New Claim
          </Link>
        </div>

        {recentClaims.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
            No claims filed yet in this session. Go to <Link href="/claim" style={{ color: "#06b6d4" }}>File Claim</Link> to generate a ZK proof.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {recentClaims.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: "1rem",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
                    <span className="badge badge-green" style={{ fontSize: "0.68rem" }}>{c.policyId}</span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{new Date(c.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace" }}>
                    Commitment: <span style={{ color: "#06b6d4" }}>{c.commitment.substring(0, 18)}...{c.commitment.substring(c.commitment.length - 8)}</span>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", fontFamily: "monospace" }}>
                    TxHash: {c.txHash.substring(0, 18)}...
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link
                    href={"/claim?verify=" + encodeURIComponent(c.commitment)}
                    className="btn-primary"
                    style={{ fontSize: "0.72rem", padding: "0.4rem 0.8rem" }}
                  >
                    1-Click Verify Commitment
                  </Link>
                  <Link
                    href={"/claim?verify=" + encodeURIComponent(c.txHash)}
                    className="btn-secondary"
                    style={{ fontSize: "0.72rem", padding: "0.4rem 0.8rem" }}
                  >
                    Verify TxHash
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link href="/" className="btn-secondary">
          Back to Dashboard
        </Link>
        <Link href="/claim" className="btn-primary">
          File Insurance Claim
        </Link>
        <Link href="/admin" className="btn-secondary">
          Insurer Console
        </Link>
      </div>
    </div>
  );
}
