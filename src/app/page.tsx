import Link from 'next/link';
import type { Metadata } from 'next';
import InsuranceSerpentine3D from '../components/InsuranceSerpentine3D';
import { CONTRACT_ADDRESS, CANONICAL_DEPLOYMENT } from '../lib/contract';

export const metadata: Metadata = {
  title: '3DVERSE // Confidential Insurance Claims | Midnight Network',
  description: 'Discover the art of 3D interaction and zero-knowledge insurance claim verification on Midnight Network.',
};

export default function HomePage() {
  return (
    <div>
      {/* --- HERO SECTION: 3DVERSE SERPENTINE EXPERIENCE --- */}
      <section className="hero-3d-layout">
        <div className="hero-content-left">
          <div className="hero-micro-tag">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', display: 'inline-block', boxShadow: '0 0 8px #38bdf8' }} />
            Midnight Preview Network // ZK DApp
          </div>

          <h1 className="hero-headline-3d">
            DISCOVER THE<br />
            ART OF 3D<br />
            INTERACTION.
          </h1>

          <p className="hero-subtitle-3d">
            3D Experiences That Go Beyond Flat Design — Blending Zero-Knowledge Cryptography, Depth, And Tamper-Proof Insurance Claim Verification On Midnight Network.
          </p>

          <div className="hero-cta-group">
            <Link href="/claim" className="btn-pill-cyan-glow">
              VIEW IN 3D &rarr;
            </Link>
            <Link href="/explorer" className="btn-pill-secondary">
              EXPLORE LEDGER
            </Link>
          </div>

          {/* Ecosystem Trust Strip */}
          <div className="ecosystem-trust-strip">
            <div className="trust-item">
              <svg className="trust-icon-svg" viewBox="0 0 24 24">
                <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V13H5V7.3l7-3.11v8.8z"/>
              </svg>
              <span>SafePal</span>
            </div>

            <div className="trust-item">
              <svg className="trust-icon-svg" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"/>
              </svg>
              <span>DEXSCREENER</span>
            </div>

            <div className="trust-item">
              <svg className="trust-icon-svg" viewBox="0 0 24 24">
                <path d="M12 2C6.5 2 2 6.5 2 12c0 3.9 2.2 7.2 5.5 8.9V19c0-1.7 1.3-3 3-3h3c1.7 0 3 1.3 3 3v1.9c3.3-1.7 5.5-5 5.5-8.9 0-5.5-4.5-10-10-10z"/>
              </svg>
              <span>PancakeSwap</span>
            </div>

            <div className="trust-item">
              <svg className="trust-icon-svg" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M12 3a9 9 0 0 0 0 18V3z" fill="currentColor" />
              </svg>
              <span>Midnight</span>
            </div>
          </div>
        </div>

        {/* Right Hero: 3D Serpentine Glass WebGL Canvas */}
        <div className="hero-canvas-right">
          <InsuranceSerpentine3D />
        </div>
      </section>


      {/* --- STAT METRIC CARDS --- */}
      <section className="section-container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        <div className="stats-grid-3d">
          <div className="stat-card-3d">
            <div className="stat-val-3d" style={{ color: '#38bdf8' }}>6</div>
            <div className="stat-label-3d">ZK Circuits</div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              fileClaim, verifyClaim, revokeClaim, setInsurer, resetPolicy, incSession
            </p>
          </div>

          <div className="stat-card-3d">
            <div className="stat-val-3d" style={{ color: '#06b6d4' }}>8</div>
            <div className="stat-label-3d">Ledger Fields</div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              claimCount, activeSession, policyId, lastClaimCommitment, etc.
            </p>
          </div>

          <div className="stat-card-3d">
            <div className="stat-val-3d" style={{ color: '#a855f7' }}>5</div>
            <div className="stat-label-3d">Private Witnesses</div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              Zero data leakage; proofs evaluated client-side via BLS12-381
            </p>
          </div>

          <div className="stat-card-3d">
            <div className="stat-val-3d" style={{ color: '#10b981' }}>100%</div>
            <div className="stat-label-3d">ZK Shielded</div>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              Compact v0.23 / 0.31.1 formal verification on Midnight Preview
            </p>
          </div>
        </div>

        {/* --- AUTHORITATIVE DEPLOYMENT INFO CARD --- */}
        <div className="glass-panel-3d" style={{ borderColor: 'rgba(56, 189, 248, 0.25)', background: 'linear-gradient(135deg, rgba(8, 14, 26, 0.7) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8', display: 'inline-block', boxShadow: '0 0 10px #38bdf8' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Authoritative Midnight Contract Deployment
              </span>
            </div>
            <a
              href={CANONICAL_DEPLOYMENT.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill-secondary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}>
              Open in Midnight Explorer &rarr;
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Contract Address</div>
              <code style={{ fontSize: '0.8rem', color: '#38bdf8', wordBreak: 'break-all', background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.5rem', borderRadius: '6px', display: 'block' }}>
                {CONTRACT_ADDRESS}
              </code>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Deployment Transaction Hash</div>
              <code style={{ fontSize: '0.8rem', color: '#e2e8f0', wordBreak: 'break-all', background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.5rem', borderRadius: '6px', display: 'block' }}>
                {CANONICAL_DEPLOYMENT.txHash}
              </code>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Compiler & Source Commit</div>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', paddingTop: '0.25rem' }}>
                compactc 0.31.1 // Commit {CANONICAL_DEPLOYMENT.sourceCommit}
              </span>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Target Network</div>
              <span style={{ fontSize: '0.82rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', paddingTop: '0.25rem' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                Midnight Preview Testnet
              </span>
            </div>
          </div>
        </div>


        {/* --- CORE ARCHITECTURE 3-COLUMN CARDS --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rm', margin: '3rm 0' }}>
          <div className="glass-panel-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '1.25rem' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem' }}>Private Policyholder Proofs</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Claimants prove valid active insurance coverage (&ge; minimumRequiredDays) without revealing their personal identity, policy secret key, or incident diagnosis details.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link href="/claim" className="btn-pill-cyan-glow" style={{ display: 'inline-block', fontSize: '0.82rem', padding: '0.55rem 1.25rem' }}>
                FILE CLAIM IN 3D &rarr;
              </Link>
            </div>
          </div>

          <div className="glass-panel-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', marginBottom: '1.25rem' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem' }}>Dual-Mode Claim Verifier</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Adjusters can verify insurance claims by raw 32-byte ZK Claim Commitment hash or directly by on-chain Transaction Hash mapped to live indexer state.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link href="/explorer" className="btn-pill-secondary" style={{ display: 'inline-block', fontSize: '0.82rem', padding: '0.55rem 1.25rem' }}>
                EXPLORE VERIFIER &rarr;
              </Link>
            </div>
          </div>

          <div className="glass-panel-3d" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', marginBottom: '1.25rem' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.6rem' }}>Insurer Governance Portal</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Underwriters manage policy parameters, update minimum coverage days, advance monotonic session nonces, and revoke fraudulent commitments with ZK circuits.
              </p>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link href="/admin" className="btn-pill-secondary" style={{ display: 'inline-block', fontSize: '0.82rem', padding: '0.55rem 1.25rem' }}>
                INSURER ADMIN &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* --- LEVEL 2 & LEVEL 3 SELECTIVE DISCLOSURE ARCHITECTURE MATRIX --- */}
        <div className="glass-panel-3d">
          <div className="section-header-center" style={{ marginBottom: '1.75rem' }}>
            <span className="section-badge">Compliance Architecture</span>
            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Selective Disclosure & Witness Shielding</h2>
            <p className="section-desc">
              Cryptographic boundary separation between public on-chain ledger state and shielded private witnesses.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table-3d">
              <thead>
                <tr>
                  <th>Field / Data Element</th>
                  <th>Ledger Visibility</th>
                  <th>Private Witness Protection</th>
                  <th>Midnight Circuit</th>
                  <th>Cryptographic Guarantee</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: '#f8fafc' }}>Policyholder Secret Key</strong></td>
                  <td><span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>0% HIDDEN</span></td>
                  <td style={{ color: '#94a3b8' }}>32-byte witness (client-only)</td>
                  <td><code style={{ color: '#38bdf8' }}>fileInsuranceClaim</code></td>
                  <td style={{ color: '#64748b' }}>Never leaves claimant browser; shielded by BLS12-381</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#f8fafc' }}>Claim Incident Hash</strong></td>
                  <td><span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>0% HIDDEN</span></td>
                  <td style={{ color: '#94a3b8' }}>32-byte witness (client-only)</td>
                  <td><code style={{ color: '#38bdf8' }}>fileInsuranceClaim</code></td>
                  <td style={{ color: '#64748b' }}>Bound into commitment; raw medical/police report hash private</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#f8fafc' }}>Coverage Days Remaining</strong></td>
                  <td><span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>0% HIDDEN</span></td>
                  <td style={{ color: '#94a3b8' }}>Uint witness (&ge; minRequiredDays)</td>
                  <td><code style={{ color: '#38bdf8' }}>fileInsuranceClaim</code></td>
                  <td style={{ color: '#64748b' }}>Proves compliance without disclosing remaining policy tenure</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#f8fafc' }}>Claim Commitment Hash</strong></td>
                  <td><span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>100% PUBLIC</span></td>
                  <td style={{ color: '#94a3b8' }}>Anchored on Public Ledger</td>
                  <td><code style={{ color: '#38bdf8' }}>verifyClaim</code></td>
                  <td style={{ color: '#64748b' }}>Globally verifiable by adjusters without revealing underlying data</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#f8fafc' }}>Insurer Root Key</strong></td>
                  <td><span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>0% HIDDEN</span></td>
                  <td style={{ color: '#94a3b8' }}>32-byte authority witness</td>
                  <td><code style={{ color: '#38bdf8' }}>setInsurerCommitment</code></td>
                  <td style={{ color: '#64748b' }}>Authority verified via ZK circuit before state mutation</td>
                </tr>
                <tr>
                  <td><strong style={{ color: '#f8fafc' }}>Anti-Replay Session Nonce</strong></td>
                  <td><span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.2rem 0.55rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>100% pUBLIC</span></td>
                  <td style={{ color: '#94a3b8' }}>Monotonic Epoch Counter</td>
                  <td><code style={{ color: '#38bdf8' }}>incrementSession</code></td>
                  <td style={{ color: '#64748b' }}>Guarantees freshness; eliminates cross-epoch claim replay attacks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
