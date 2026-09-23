import Link from 'next/link';
import type { Metadata } from 'next';
import { CONTRACT_ADDRESS } from '../lib/contract';

export const metadata: Metadata = {
  title: 'Confidential Insurance Claims | ZK dApp on Midnight Network',
  description: 'Prove insurance policy coverage and file claims without exposing policyholder PII, medical records, incident reports, or financial details. ZK smart contracts on Midnight Network.',
};

export default function HomePage() {
  return (
    <>
      <main>
        {/* Hero Section */}
        <div className="hero">
          <div className="hero-badge">
            <span>🛡️</span> Midnight Preview Network — Live ZK Insurance dApp
          </div>
          <h1>Confidential Insurance Claims</h1>
          <p>
            Prove insurance policy coverage, authenticate policyholder eligibility, and file claims with <strong>zero-knowledge proofs</strong> — without revealing policy numbers, medical records, police reports, or personal identity on-chain.
          </p>
          <div className="hero-actions">
            <Link href="/claim" className="btn-primary" style={{ background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", borderColor: "#e11d48" }}>
              📋 File & Verify Insurance Claim
            </Link>
            <Link href="/admin" className="btn-secondary">
              ⚙️ Insurer Console
            </Link>
            <Link href="/explorer" className="btn-secondary">
              🔍 Live Ledger Explorer
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem 2rem' }}>
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            {[
              { value: '6', label: 'ZK Circuits', color: '#e11d48' },
              { value: '8', label: 'Public Ledger Fields', color: '#8b5cf6' },
              { value: '5', label: 'Private Witnesses', color: '#10b981' },
              { value: '100%', label: 'Zero-Knowledge Privacy', color: '#06b6d4' },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Privacy Model Section (Level 3 Requirement) */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '3px solid #10b981' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-green">Level 3 Privacy Model</span>
              <span className="badge badge-purple">Selective Disclosure</span>
            </div>
            <h2 className="section-title">Selective Disclosure & Privacy Model</h2>
            <p className="section-desc" style={{ marginBottom: '1.25rem' }}>
              Midnight enables selective disclosure: observers can verify policy active coverage and claim integrity without gaining access to any private medical, financial, or personal information.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem', color: '#94a3b8' }}>Data Dimension</th>
                    <th style={{ padding: '0.75rem', color: '#10b981' }}>What Stays 100% Private (Device)</th>
                    <th style={{ padding: '0.75rem', color: '#38bdf8' }}>What Is Publicly Disclosed (On-Chain)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      dim: "Policyholder Identity",
                      priv: "Name, SSN/National ID, Home Address, Driver License",
                      pub: "Unlinked cryptographic commitment hash only"
                    },
                    {
                      dim: "Incident & Medical Records",
                      priv: "Hospital itemized bills, police report text, repair estimate",
                      pub: "Cryptographic SHA-256 transcript digest (never plaintext)"
                    },
                    {
                      dim: "Policy Coverage Duration",
                      priv: "Exact remaining days balance (e.g. 180 days)",
                      pub: "Zero-Knowledge proof that coverage >= required threshold"
                    },
                    {
                      dim: "Insurer Authority",
                      priv: "Insurer master private signing key",
                      pub: "One-time public authority commitment anchor"
                    },
                    {
                      dim: "Claim Anti-Replay",
                      priv: "Single-use entropy salt nonce",
                      pub: "Monotonic epoch nonce & verified claim counter"
                    }
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600, color: '#f1f5f9' }}>{row.dim}</td>
                      <td style={{ padding: '0.75rem', color: '#a7f3d0' }}>🔒 {row.priv}</td>
                      <td style={{ padding: '0.75rem', color: '#bae6fd' }}>🌐 {row.pub}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '8px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.8rem', color: '#94a3b8' }}>
              <strong>What an observer CAN learn:</strong> That a valid policyholder with active coverage filed a non-fraudulent claim against an authorized insurance policy, and the resulting claim commitment hash.
              <br /><br />
              <strong>What an observer CANNOT learn:</strong> Who the claimant is, their medical diagnosis, hospital invoice amounts, damage photos, or remaining coverage balance.
            </div>
          </div>

          {/* ZK Contract Architecture */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '3px solid #e11d48' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-amber">Compact v0.23</span>
                <span className="badge badge-purple">Midnight Preview</span>
                <span className="badge badge-green">6 Circuits</span>
              </div>
              <h2 className="section-title">Compact ZK Smart Contract Architecture</h2>
              <p className="section-desc">contracts/confidential_insurance_claims.compact — 8 ledger fields, 5 witnesses, 6 circuits</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
              {[
                { circuit: 'fileInsuranceClaim(Bytes<32>)', witnesses: '4 private witnesses', desc: 'Policyholder proves active policy coverage >= threshold; discloses unique commitment hash', color: '#e11d48' },
                { circuit: 'verifyClaim(Bytes<32>)', witnesses: '0 witnesses (Public)', desc: 'Instant dual verification of claimed commitment or transaction hash against ledger state', color: '#06b6d4' },
                { circuit: 'revokeClaim(Bytes<32>)', witnesses: 'insurerSigningKey', desc: 'Authorized insurer voids or denies fraudulent claims on-chain with ZK authority proof', color: '#ef4444' },
                { circuit: 'setInsurerCommitment(Uint<32>)', witnesses: 'insurerSigningKey', desc: 'One-time setup: anchors underwriter authority root and sets minimum coverage duration', color: '#f59e0b' },
                { circuit: 'resetPolicy(Bytes<32>, Uint<32>)', witnesses: 'insurerSigningKey', desc: 'Authorized underwriter updates policy coverage program and threshold parameters', color: '#10b981' },
                { circuit: 'incrementSession()', witnesses: 'insurerSigningKey', desc: 'Monotonic epoch counter rotation invalidating stale proofs and preventing replay attacks', color: '#8b5cf6' },
              ].map(c => (
                <div key={c.circuit} style={{ background: 'rgba(255,255,255,0.025)', borderRadius: '10px', padding: '1rem', border: `1px solid ${c.color}33` }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: c.color, marginBottom: '0.35rem', fontWeight: 700 }}>{c.circuit}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.4rem' }}>Witnesses: {c.witnesses}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance Sectors Supported */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Supported Insurance Policy Programs</h2>
            <p className="section-desc" style={{ marginBottom: '1.5rem' }}>Designed for enterprise underwriters, decentralized health networks, and parametric coverage protocols.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { title: "Health & Medical", id: "policy_health_plus_2026", desc: "Private medical claims, prescription reimbursement, and diagnosis confidentiality without revealing hospital records.", icon: "🏥" },
                { title: "Auto & Collision", id: "policy_auto_collision_2026", desc: "Vehicle accident reimbursement and collision appraisal proving damage threshold without exposing police transcripts.", icon: "🚗" },
                { title: "Property & Disaster", id: "policy_property_casualty_2026", desc: "Home, flood, and casualty claims with verifiable damage assessment and proof of continuous coverage.", icon: "🏠" },
                { title: "Parametric Travel", id: "policy_flight_delay_2026", desc: "Instant automated claims for flight delays and travel disruptions with cryptographic flight ticket proofs.", icon: "✈️" },
              ].map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{p.icon}</div>
                  <h3 style={{ fontSize: '1rem', color: '#f1f5f9', margin: '0 0 0.35rem' }}>{p.title}</h3>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#e11d48', marginBottom: '0.5rem' }}>{p.id}</div>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Authoritative Deployment Badge */}
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'rgba(139, 92, 246, 0.05)' }}>
            <div style={{ fontSize: '0.85rem', color: '#c4b5fd', fontWeight: 600, marginBottom: '0.5rem' }}>
              ✓ Verified Contract Deployed On Midnight Preview Testnet
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#f1f5f9', wordBreak: 'break-all', marginBottom: '0.75rem' }}>
              {CONTRACT_ADDRESS}
            </div>
            <a
              href={"https://preview.midnightexplorer.com/contracts/" + CONTRACT_ADDRESS}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}
            >
              View on Midnight Explorer ↗
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
