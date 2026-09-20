"use client";
import { useState } from "react";
import { getClient } from "../../lib/contract";
import Link from "next/link";

export default function AdminPage() {
  const [policyId, setPolicyId] = useState("policy_health_plus_2027");
  const [resetMinDays, setResetMinDays] = useState(60);
  const [loadingReset, setLoadingReset] = useState(false);

  const [insurerKey, setInsurerKey] = useState("");
  const [insurerMinDays, setInsurerMinDays] = useState(30);
  const [loadingInsurer, setLoadingInsurer] = useState(false);

  const [revokeCommitment, setRevokeCommitment] = useState("");
  const [loadingRevoke, setLoadingRevoke] = useState(false);

  const [loadingSession, setLoadingSession] = useState(false);

  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);

  const addLog = (msg: string, type = "info") => setLogs(l => [...l, { msg, type }]);
  const isLoading = loadingReset || loadingInsurer || loadingRevoke || loadingSession;

  const handleSetInsurer = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingInsurer(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog("> [ZK WITNESS] insurerSigningKey() - derived from private key, never disclosed", "info");
      addLog(`> [CIRCUIT] Executing setInsurerCommitment(Uint<32>) - minimumRequiredDays=${insurerMinDays} days...`, "info");
      const client = getClient();
      client.setInsurerSigningKey(insurerKey || "insurer_default_signing_key");
      const res = await client.setInsurerCommitment(insurerMinDays);
      setResult({ ...res, circuit: "setInsurerCommitment(Uint<32>)" });
      addLog("> [SUCCESS] Insurer commitment anchored on-chain!", "success");
      addLog(`> [COMMITMENT] ${res.insurerCommitment || res.manufacturerCommitment}`, "success");
      addLog(`> [THRESHOLD] minimumRequiredDays set to ${res.newMinimumDays} days`, "success");
      addLog(`> [TXHASH] ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingInsurer(false); }
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingRevoke(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog("> [ZK WITNESS] insurerSigningKey() - ZK authorization proof generated locally", "info");
      addLog(`> [CIRCUIT] Executing revokeClaim(Bytes<32>) - commitment: ${revokeCommitment.substring(0, 20)}...`, "info");
      const res = await getClient().revokeClaim(revokeCommitment);
      setResult({ ...res, circuit: "revokeClaim(Bytes<32>)" });
      addLog("> [SUCCESS] Claim commitment revoked on-chain!", "success");
      addLog(`> [REVOKED] ${res.revokedCommitment}`, "success");
      addLog(`> [TXHASH] ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingRevoke(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setLoadingReset(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog(`> [CIRCUIT] Executing resetPolicy("${policyId}", ${resetMinDays} days)...`, "info");
      const res = await getClient().resetPolicy(policyId, resetMinDays);
      setResult({ ...res, circuit: "resetPolicy(Bytes<32>, Uint<32>)" });
      addLog(`> [SUCCESS] Policy offering updated! New Policy ID: ${res.newPolicyId || res.newProductId}`, "success");
      addLog(`> [THRESHOLD] minimumRequiredDays updated to ${res.newMinimumDays} days`, "success");
      addLog(`> [TXHASH] ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingReset(false); }
  };

  const handleSession = async () => {
    setLoadingSession(true); setLogs([]); setResult(null);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      addLog("> [CIRCUIT] Executing incrementSession() - monotonic counter bump...", "info");
      const res = await getClient().incrementSession();
      setResult({ ...res, circuit: "incrementSession()" });
      addLog(`> [SUCCESS] Active session counter incremented to ${res.activeSession}`, "success");
      addLog(`> [TXHASH] ${res.txHash}`, "success");
    } catch (err: any) { addLog(`> [ERROR] ${err?.message || err}`, "error"); }
    finally { setLoadingSession(false); }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-amber">Admin & Underwriter Authority</span>
          <span className="badge badge-purple">Midnight Preview</span>
        </div>
        <h1 className="section-title">Insurer Admin Console</h1>
        <p className="section-desc">
          Manage insurance policy thresholds, anchor underwriter authority commitments, and void fraudulent claims via zero-knowledge circuits.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Panel 1: Anchor Authority */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", color: "#f59e0b" }}>
            1. Anchor Insurer Commitment
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "1rem" }}>
            Anchors insurer cryptographic authority and configures minimum active coverage days required for claims.
          </p>
          <form onSubmit={handleSetInsurer} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              type="password"
              value={insurerKey}
              onChange={e => setInsurerKey(e.target.value)}
              className="input-field"
              placeholder="Insurer Signing Key"
            />
            <input
              type="number"
              value={insurerMinDays}
              onChange={e => setInsurerMinDays(Number(e.target.value))}
              className="input-field"
              min={1}
              placeholder="Min Days"
            />
            <button type="submit" disabled={isLoading} className="btn-secondary">
              {loadingInsurer ? "Anchoring..." : "Anchor Insurer Commitment"}
            </button>
          </form>
        </div>

        {/* Panel 2: Revoke Claim */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", color: "#ef4444" }}>
            2. Revoke Fraudulent Claim
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "1rem" }}>
            Voids an illegitimate claim commitment using the insurer&apos;s ZK authorization signature.
          </p>
          <form onSubmit={handleRevoke} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              type="text"
              value={revokeCommitment}
              onChange={e => setRevokeCommitment(e.target.value)}
              className="input-field"
              placeholder="Commitment Hash (0x...)"
              required
            />
            <button type="submit" disabled={isLoading} className="btn-secondary" style={{ color: "#ef4444" }}>
              {loadingRevoke ? "Revoking..." : "Revoke Claim Commitment"}
            </button>
          </form>
        </div>

        {/* Panel 3: Reset Policy */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", color: "#10b981" }}>
            3. Reset Policy Offering
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "1rem" }}>
            Updates active policy model/version and updates minimum required coverage days.
          </p>
          <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              type="text"
              value={policyId}
              onChange={e => setPolicyId(e.target.value)}
              className="input-field"
              placeholder="New Policy ID"
              required
            />
            <input
              type="number"
              value={resetMinDays}
              onChange={e => setResetMinDays(Number(e.target.value))}
              className="input-field"
              min={1}
            />
            <button type="submit" disabled={isLoading} className="btn-secondary">
              {loadingReset ? "Updating..." : "Update Policy Model"}
            </button>
          </form>
        </div>

        {/* Panel 4: Bump Session */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", color: "#06b6d4" }}>
            4. Session Replay Protection
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "1rem" }}>
            Increments the active session counter to invalidate stale signatures and manage epochs.
          </p>
          <button onClick={handleSession} disabled={isLoading} className="btn-secondary" style={{ width: "100%", marginTop: "1.5rem" }}>
            {loadingSession ? "Incrementing..." : "Bump Active Session Nonce"}
          </button>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase" }}>
            Execution Logs
          </div>
          <div style={{ background: "#050811", borderRadius: "8px", padding: "1rem", fontFamily: "monospace", fontSize: "0.75rem", maxHeight: "200px", overflowY: "auto" }}>
            {logs.map((l, i) => (
              <div key={i} style={{ color: l.type === "error" ? "#ef4444" : l.type === "success" ? "#10b981" : "#94a3b8", marginBottom: "0.25rem" }}>
                {l.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
