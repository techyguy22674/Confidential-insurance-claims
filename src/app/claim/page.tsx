"use client";
import { useState, useMemo } from "react";
import { getClient, sha256Hex } from "../../lib/contract";
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

  // Live computed hash of incident report
  const computedIncidentHash = useMemo(() => {
    return sha256Hex(incidentReport || "sample_incident_police_medical_invoice_09182");
  }, [incidentReport]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null); setLogs([]);
    try {
      addLog("> [WALLET] Verifying active Midnight wallet authorization...", "info");
      const client = getClient();
      if (!client.isConnected || !client.walletApi) {
        addLog("> [APPROVAL REQUIRED] Requesting 1AM / Lace wallet approval...", "info");
        await client.connectWallet();
      }
      addLog(`> [WALLET APPROVED] Verified wallet connected: ${client.connectedAddress}`, "success");

      client.setPolicySecretKey(policySecretKey || "policyholder_private_secret_key_2026");
      client.setClaimIncidentHash(incidentReport || "incident_police_medical_report_09182");
      client.setCoverageDaysRemaining(coverageDays);

      addLog("> [ZK WITNESS] policyholderSecretKey() — private identity salt, never transmitted", "info");
      addLog("> [ZK WITNESS] claimProofNonce() — random entropy salt for replay protection", "info");
      addLog(`> [ZK WITNESS] incidentReportHash() — SHA-256 digest (${computedIncidentHash.slice(0, 18)}...)`, "info");
      addLog(`> [ZK WITNESS] coverageDaysRemaining() — ${coverageDays} active days vs. ${MINIMUM_REQUIRED_DAYS} days threshold`, "info");
      addLog("> [ZK THRESHOLD] Verifying active coverage days >= minimumRequiredDays in Zero-Knowledge...", "info");

      if (coverageDays < MINIMUM_REQUIRED_DAYS) {
        addLog(`> [REJECTED] Active coverage (${coverageDays} days) is below required ${MINIMUM_REQUIRED_DAYS}-day threshold`, "error");
        setError(`Policy Lapsed: ${coverageDays} active days is below the required ${MINIMUM_REQUIRED_DAYS}-day threshold.`);
        return;
      }

      addLog("> [CIRCUIT] Executing fileInsuranceClaim(Bytes<32>) on Midnight Network...", "info");
      const res = await client.fileInsuranceClaim(policyId);
      setResult(res);
      setClaimedCommitment(res.commitmentHex);
      addLog(`> [SUCCESS] Insurance claim filed on-chain! TxHash: ${res.txHash}`, "success");
      addLog(`> [COMMITMENT] ZK Claim Commitment: ${res.commitmentHex}`, "success");
      addLog("> [PRIVACY] Medical diagnosis, incident report, policyholder identity — NEVER disclosed on-chain", "success");
      addLog(`> [FEE] Transaction fee: ${res.txFee} ${res.txFeeAsset}`, "info");
    } catch (err: any) {
      const msg = err?.message || "Insurance claim submission failed.";
      setError(msg);
      addLog(`> [ERROR] ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoVerify = async (identifier: string) => {
    if (!identifier.trim()) return;
    setClaimedCommitment(identifier.trim());
    setVerifyLoading(true);
    setVerifyResult(null);
    try {
      addLog(`> [VERIFY] Initiating verification for: ${identifier.trim().slice(0, 18)}...`, "info");
      addLog("> [CIRCUIT] Executing verifyClaim(Bytes<32>) on Midnight Network...", "info");
      const res = await getClient().verifyClaim(identifier.trim());
      setVerifyResult(res);
      addLog(
        res.matches
          ? `> [VERIFIED] Insurance claim is VALID on-chain! ${res.inputWasTxHash ? "(Resolved via On-Chain TxHash)" : "(ZK Commitment match)"}`
          : "> [MISMATCH] Claim commitment does not match registered on-chain state.",
        res.matches ? "success" : "error"
      );
      const el = document.getElementById("verify-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } catch (err: any) {
      addLog(`> [ERROR] ${err?.message || err}`, "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimedCommitment.trim()) return;
    await handleAutoVerify(claimedCommitment.trim());
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "2rem 1.5rem 4rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span className="badge badge-purple">ZK Circuit Execution</span>
          <span className="badge badge-green">Midnight Preview</span>
          <span className="badge badge-amber">Coverage Assertion</span>
        </div>
        <h1 className="section-title" style={{ fontSize: "1.85rem" }}>File & Verify Insurance Claim</h1>
        <p className="section-desc">
          Generate client-side zero-knowledge SNARK proofs to file confidential insurance claims without revealing policyholder identity, medical transcripts, or sensitive incident invoices.
        </p>
      </div>

      {/* ZK Architecture Architecture Info */}
      <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem", borderLeft: "3px solid #e11d48" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#e11d48", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          ZK Circuit Architecture — fileInsuranceClaim(Bytes&lt;32&gt;)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "policyholderSecretKey()", desc: "Private policy salt", color: "#ef4444" },
            { label: "claimProofNonce()", desc: "Entropy/replay binding", color: "#f59e0b" },
            { label: "incidentReportHash()", desc: "Hashed medical/police digest", color: "#06b6d4" },
            { label: "coverageDaysRemaining()", desc: "Active coverage >= threshold", color: "#10b981" },
          ].map(w => (
            <div key={w.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "0.75rem", border: `1px solid ${w.color}33` }}>
              <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: w.color, marginBottom: "0.25rem" }}>{w.label}</div>
              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Submission Form */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
        <form onSubmit={handleClaim} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Insurance Policy Program Identifier (Public Input) *
            </label>
            <select
              value={policyId}
              onChange={e => setPolicyId(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#f1f5f9",
                fontSize: "0.9rem",
              }}
            >
              <option value="policy_health_plus_2026">🏥 Health & Medical Plus (policy_health_plus_2026)</option>
              <option value="policy_auto_collision_2026">🚗 Auto & Collision Comprehensive (policy_auto_collision_2026)</option>
              <option value="policy_property_casualty_2026">🏠 Property & Casualty Protection (policy_property_casualty_2026)</option>
              <option value="policy_flight_delay_2026">✈️ Parametric Travel & Delay (policy_flight_delay_2026)</option>
            </select>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>Underwriter policy coverage model registered on-chain</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Policyholder Secret Key — Private Witness
            </label>
            <input
              type="password"
              id="policySecretKey"
              value={policySecretKey}
              onChange={e => setPolicySecretKey(e.target.value)}
              placeholder="Your private secret salt (never leaves your device)"
              autoComplete="off"
            />
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>
              Used locally to generate <code>policyholderSecretKey()</code> ZK witness — never transmitted
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Active Policy Coverage Days: <span style={{ color: coverageDays >= MINIMUM_REQUIRED_DAYS ? "#10b981" : "#ef4444", fontWeight: 700 }}>{coverageDays} Days</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input
                type="range"
                min={0}
                max={365}
                step={5}
                value={coverageDays}
                onChange={e => setCoverageDays(Number(e.target.value))}
                style={{ flex: 1, accentColor: coverageDays >= MINIMUM_REQUIRED_DAYS ? "#10b981" : "#ef4444" }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "99px",
                  background: coverageDays >= MINIMUM_REQUIRED_DAYS ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                  color: coverageDays >= MINIMUM_REQUIRED_DAYS ? "#10b981" : "#ef4444",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {coverageDays >= MINIMUM_REQUIRED_DAYS ? "✓ ELIGIBLE (ACTIVE)" : "✕ LAPSED (< 30 DAYS)"}
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.4rem" }}>
              Verified client-side in Zero-Knowledge: must be &gt;= {MINIMUM_REQUIRED_DAYS} days. Exact days remaining are never written to blockchain.
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginBottom: "0.5rem" }}>
              Incident Report / Medical Record / Repair Invoice Data
            </label>
            <textarea
              id="incidentReport"
              value={incidentReport}
              onChange={e => setIncidentReport(e.target.value)}
              placeholder="Paste incident details, hospital diagnosis record, police report, or invoice..."
              rows={3}
              style={{ resize: "vertical" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.4rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                Hashed locally via SHA-256 into <code>incidentReportHash()</code> — plaintext never exposed
              </span>
              <span style={{ fontSize: "0.72rem", fontFamily: "monospace", color: "#06b6d4", background: "rgba(6,182,212,0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                Digest: {computedIncidentHash.slice(0, 16)}...
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              id="fileClaimBtn"
              style={{ background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", borderColor: "#e11d48" }}
            >
              {loading ? <><span className="spinner" /> Generating ZK Proof...</> : "🛡️ File Confidential Claim (ZK Proof)"}
            </button>
            <Link href="/" className="btn-secondary">Back to Dashboard</Link>
          </div>
        </form>
      </div>

      {/* Activity Logs */}
      {logs.length > 0 && (
        <div className="glass-card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Activity Log</div>
          <div className="log-box">
            {logs.map((l, i) => <div key={i} className={`log-${l.type}`}>{l.msg}</div>)}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
          <p style={{ color: "#fca5a5", fontWeight: 600, margin: "0 0 0.5rem" }}>Submission Error</p>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.9rem" }}>{error}</p>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="glass-card fade-in" style={{ padding: "1.5rem", marginBottom: "1.5rem", border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.2rem" }}>✓</span>
            <p style={{ color: "#6ee7b7", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>
              Insurance Claim Confirmed On-Chain!
            </p>
          </div>
          {[
            { label: "Circuit", value: "fileInsuranceClaim(Bytes<32>)" },
            { label: "ZK Claim Commitment", value: result.commitmentHex },
            { label: "On-Chain TxHash", value: result.txHash },
            { label: "Coverage Assertion", value: result.daysRequirementMet ? "✓ Active Coverage Satisfied (Zero-Knowledge)" : "✕ Lapsed" },
            { label: "Signed By", value: result.signedBy },
            { label: "Tx Fee", value: `${result.txFee} ${result.txFeeAsset}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "#64748b", minWidth: 190 }}>{label}:</span>
              <span style={{ fontSize: "0.8rem", color: "#f1f5f9", fontFamily: "monospace", wordBreak: "break-all" }}>{value as string}</span>
            </div>
          ))}
          <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.75rem", fontWeight: 600 }}>Status: CONFIRMED (Midnight Preview)</p>

          {/* Quick Action & Verification Buttons */}
          <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", borderTop: "1px solid rgba(16,185,129,0.2)", paddingTop: "1rem" }}>
            <button
              type="button"
              id="autoVerifyBtn"
              onClick={() => handleAutoVerify(result.commitmentHex)}
              className="btn-primary"
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderColor: "#10b981", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}
            >
              🔍 1-Click Verify Issued Claim
            </button>
            <button
              type="button"
              onClick={() => handleAutoVerify(result.txHash)}
              className="btn-secondary"
              style={{ borderColor: "rgba(56,189,248,0.4)", color: "#38bdf8" }}
            >
              ⚡ Verify via TxHash
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(result.commitmentHex);
                addLog("> [COPIED] ZK Claim Commitment copied to clipboard", "success");
              }}
              className="btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem" }}
            >
              📋 Copy Commitment
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(result.txHash);
                addLog("> [COPIED] On-Chain TxHash copied to clipboard", "success");
              }}
              className="btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem" }}
            >
              📋 Copy TxHash
            </button>
          </div>
        </div>
      )}

      {/* Verify Insurance Claim Panel */}
      <div id="verify-section" className="glass-card" style={{ padding: "1.5rem", borderLeft: "3px solid #06b6d4" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#06b6d4", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Verify Insurance Claim — verifyClaim(Bytes&lt;32&gt;)
        </div>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
          Underwriters, adjusters, and auditors can publicly verify whether a claimed insurance commitment is anchored on-chain without learning medical history, invoices, or personal identity.
        </p>
        <p style={{ fontSize: "0.78rem", color: "#38bdf8", marginBottom: "1rem" }}>
          💡 <strong>Supports Dual Verification:</strong> Enter either the <strong>ZK Claim Commitment Hash</strong> or the <strong>On-Chain TxHash</strong> below.
        </p>

        <form onSubmit={handleVerify} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            type="text"
            id="claimedCommitment"
            value={claimedCommitment}
            onChange={e => setClaimedCommitment(e.target.value)}
            placeholder="0x... (Paste ZK Claim Commitment or On-Chain TxHash)"
            style={{ flex: 1, minWidth: "260px" }}
          />
          <button type="submit" className="btn-secondary" disabled={verifyLoading} id="verifyBtn" style={{ whiteSpace: "nowrap" }}>
            {verifyLoading ? <><span className="spinner" /> Verifying On-Chain...</> : "Verify On-Chain"}
          </button>
        </form>

        {/* Quick Fill Buttons */}
        {result && (
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Quick Fill:</span>
            <button
              type="button"
              onClick={() => setClaimedCommitment(result.commitmentHex)}
              style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(225,29,72,0.15)", color: "#f43f5e", border: "1px solid rgba(225,29,72,0.3)", cursor: "pointer" }}
            >
              Insert ZK Commitment
            </button>
            <button
              type="button"
              onClick={() => setClaimedCommitment(result.txHash)}
              style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)", cursor: "pointer" }}
            >
              Insert TxHash
            </button>
          </div>
        )}

        {/* Verification Result */}
        {verifyResult && (
          <div style={{
            marginTop: "1.25rem",
            padding: "1rem 1.25rem",
            borderRadius: "8px",
            background: verifyResult.matches ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${verifyResult.matches ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ color: verifyResult.matches ? "#10b981" : "#ef4444", fontSize: "1.1rem" }}>
                {verifyResult.matches ? "✓" : "✕"}
              </span>
              <span style={{ color: verifyResult.matches ? "#6ee7b7" : "#fca5a5", fontWeight: 700, fontSize: "0.98rem" }}>
                {verifyResult.matches ? "VALID — Insurance Claim Verified On-Chain" : "INVALID — Commitment Mismatch"}
              </span>
              {verifyResult.matches && (
                <span className="badge badge-green" style={{ marginLeft: "auto", fontSize: "0.7rem" }}>
                  Zero-Knowledge Proof Verified
                </span>
              )}
            </div>

            {verifyResult.inputWasTxHash && verifyResult.matches && (
              <div style={{
                fontSize: "0.78rem",
                color: "#38bdf8",
                background: "rgba(56,189,248,0.1)",
                padding: "0.4rem 0.75rem",
                borderRadius: "6px",
                marginBottom: "0.75rem",
                border: "1px solid rgba(56,189,248,0.2)"
              }}>
                ℹ️ Input recognized as <strong>On-Chain Transaction Hash</strong>. Automatically mapped and verified against registered ZK Claim Commitment!
              </div>
            )}

            {verifyResult.matches ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.78rem" }}>
                <div>
                  <span style={{ color: "#64748b" }}>Circuit: </span>
                  <span style={{ color: "#f1f5f9", fontFamily: "monospace" }}>verifyClaim(Bytes&lt;32&gt;)</span>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>ZK Claim Commitment: </span>
                  <span style={{ color: "#6ee7b7", fontFamily: "monospace", wordBreak: "break-all" }}>
                    {verifyResult.claimedCommitment}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#64748b" }}>On-Chain TxHash: </span>
                  <span style={{ color: "#94a3b8", fontFamily: "monospace", wordBreak: "break-all" }}>
                    {verifyResult.txHash || verifyResult.resolvedTxHash || "Confirmed on-chain"}
                  </span>
                </div>
                {verifyResult.policyId && (
                  <div>
                    <span style={{ color: "#64748b" }}>Insurance Program: </span>
                    <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{verifyResult.policyId}</span>
                  </div>
                )}
                <div>
                  <span style={{ color: "#64748b" }}>Verification Mode: </span>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>
                    {verifyResult.verificationMethod === "on-chain-indexer"
                      ? "Midnight Preview Indexer (Direct Public Ledger State)"
                      : "Zero-Knowledge Circuit Proof & Cryptographic Witness Anchor"}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                  {verifyResult.details || "The provided identifier does not match any registered on-chain claim commitment or active session proof."}
                </p>
                {result && (
                  <div style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "#f59e0b", background: "rgba(245,158,11,0.08)", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid rgba(245,158,11,0.2)" }}>
                    💡 Did you just file a claim? Click the <strong>&quot;🔍 1-Click Verify Issued Claim&quot;</strong> button above to verify your claim commitment automatically.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
