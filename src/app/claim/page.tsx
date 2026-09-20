"use client";
import { useState } from "react";
import { getClient } from "../../lib/contract";
import Link from "next/link";

export default function ClaimPage() {
  const [policyId, setPolicyId] = useState("policy_health_plus_2026");
  const [policySecretKey, setPolicySecretKey] = useState("");
  const [incidentReport, setIncidentReport] = useState("");
  const [coverageDays, setCoverageDays] = useState(180);
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [claimedCommitment, setClaimedCommitment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ msg: string; type: string }[]>([]);

  const MINIMUM_REQUIRED_DAYS = 30;
  const addLog = (msg: string, type = "info") => setLogs(l => [...l, { msg, type }]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null); setLogs([]);
    try {
      addLog("> [WALLET] Connecting to Midnight Lace Wallet...", "info");
      const client = getClient();
      client.setPolicySecretKey(policySecretKey || "policy_holder_secret_key_2026");
      client.setClaimIncidentHash(incidentReport || "incident_police_medical_report_09182");
      client.setCoverageDaysRemaining(coverageDays);

      addLog("> [ZK WITNESS] policySecretKey() - private policy secret generated locally", "info");
      addLog("> [ZK WITNESS] claimProofNonce() - random entropy salt for replay protection", "info");
      addLog("> [ZK WITNESS] claimIncidentHash() - SHA-256 hash of incident report & hospital invoice", "info");
      addLog(`> [ZK WITNESS] coverageDaysRemaining() - ${coverageDays} days balance vs. ${MINIMUM_REQUIRED_DAYS} days requirement`, "info");
      addLog("> [ZK THRESHOLD] Asserting coverageDaysRemaining >= minimumRequiredDays privately...", "info");

      if (coverageDays < MINIMUM_REQUIRED_DAYS) {
        addLog(`> [REJECTED] ${coverageDays} active days < ${MINIMUM_REQUIRED_DAYS} days requirement - circuit would reject proof`, "error");
        setError(`Coverage Expired: ${coverageDays} active days is below the required ${MINIMUM_REQUIRED_DAYS}-day threshold.`);
        return;
      }

      addLog("> [CIRCUIT] Executing fileInsuranceClaim(Bytes<32>) on Midnight Network...", "info");
      const res = await client.fileInsuranceClaim(policyId);
      setResult(res);
      addLog(`> [SUCCESS] Insurance claim verified & signed! TxHash: ${res.txHash}`, "success");
      addLog(`> [COMMITMENT] ZK Insurance Claim Commitment: ${res.commitmentHex}`, "success");
      addLog("> [PRIVACY] Policy credentials, incident details, policyholder PII - NEVER disclosed on-chain", "success");
      addLog(`> [FEE] Transaction fee: ${res.txFee} ${res.txFeeAsset}`, "info");
    } catch (err: any) {
      const msg = err?.message || "Insurance claim failed.";
      setError(msg);
      addLog(`> [ERROR] ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true); setVerifyResult(null);
    try {
      addLog("> [CIRCUIT] Executing verifyClaim(Bytes<32>) on-chain...", "info");
      const res = await getClient().verifyClaim(claimedCommitment);
      setVerifyResult(res);
      addLog(res.matches
        ? "> [VERIFIED] Commitment matches on-chain record - insurance claim is VALID"
        : "> [MISMATCH] Commitment does NOT match - claim may be invalid or revoked",
        res.matches ? "success" : "error");
    } catch (err: any) {
      addLog(`> [ERROR] ${err?.message || err}`, "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span className="badge badge-cyan">ZK Circuit Execution</span>
          <span className="badge badge-purple">Midnight Preview</span>
        </div>
        <h1 className="section-title">File & Verify Insurance Claim</h1>
        <p className="section-desc">
          Generate zero-knowledge SNARK proofs client-side to file claims without revealing policyholder identity or confidential incident documents.
        </p>
      </div>

      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem", color: "#f8fafc" }}>
          Step 1: File Insurance Claim (Private ZK Witness Input)
        </h2>
        <form onSubmit={handleClaim} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
              Policy Category / Plan ID (Public)
            </label>
            <input
              type="text"
              value={policyId}
              onChange={e => setPolicyId(e.target.value)}
              className="input-field"
              placeholder="policy_health_plus_2026"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
              Policyholder Secret Key / Membership Seed (Private Witness - Never Leaves Browser)
            </label>
            <input
              type="password"
              value={policySecretKey}
              onChange={e => setPolicySecretKey(e.target.value)}
              className="input-field"
              placeholder="e.g. seed_secret_health_policy_4981"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
              Incident Report / Bill Identifier (Private Witness - Hashed locally)
            </label>
            <input
              type="text"
              value={incidentReport}
              onChange={e => setIncidentReport(e.target.value)}
              className="input-field"
              placeholder="e.g. hospital_invoice_st_marys_2026_claim_12"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
              Coverage Days Remaining (Private Witness: Threshold Assertion &gt;= 30 Days)
            </label>
            <input
              type="number"
              value={coverageDays}
              onChange={e => setCoverageDays(Number(e.target.value))}
              className="input-field"
              min={0}
              max={3650}
              required
            />
          </div>

          {error && (
            <div style={{ padding: "0.75rem 1rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#ef4444", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: "0.5rem" }}>
            {loading ? <><span className="spinner" /> Generating ZK Proof & Submitting...</> : "🛡️ File Confidential Claim"}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: "1.5rem", padding: "1.25rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "10px" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10b981", marginBottom: "0.5rem" }}>
              Claim Filed & Commitment Anchored On-Chain!
            </div>
            <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontFamily: "monospace", wordBreak: "break-all" }}>
              <div><strong>Tx Hash:</strong> {result.txHash}</div>
              <div style={{ marginTop: "0.25rem" }}><strong>ZK Commitment:</strong> {result.commitmentHex}</div>
            </div>
            <button
              onClick={() => setClaimedCommitment(result.commitmentHex)}
              className="btn-secondary"
              style={{ marginTop: "0.75rem", fontSize: "0.75rem", padding: "0.3rem 0.75rem" }}
            >
              Use in Verification Below
            </button>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem", color: "#f8fafc" }}>
          Step 2: Verify Claim Commitment On-Chain
        </h2>
        <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
              ZK Claim Commitment Hash (Hex)
            </label>
            <input
              type="text"
              value={claimedCommitment}
              onChange={e => setClaimedCommitment(e.target.value)}
              className="input-field"
              placeholder="0x..."
              required
            />
          </div>

          <button type="submit" disabled={verifyLoading} className="btn-secondary">
            {verifyLoading ? "Verifying On-Chain..." : "🔍 Verify Claim Status"}
          </button>
        </form>

        {verifyResult && (
          <div style={{ marginTop: "1rem", padding: "1rem", background: verifyResult.matches ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${verifyResult.matches ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "8px" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: verifyResult.matches ? "#10b981" : "#ef4444" }}>
              {verifyResult.matches ? "✅ Claim Commitment Verified on Midnight Ledger" : "❌ Commitment Mismatch or Revoked"}
            </div>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase" }}>
            ZK Execution Logs
          </div>
          <div style={{ background: "#050811", borderRadius: "8px", padding: "1rem", fontFamily: "monospace", fontSize: "0.75rem", maxHeight: "220px", overflowY: "auto" }}>
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
