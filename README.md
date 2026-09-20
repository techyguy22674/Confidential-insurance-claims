# Confidential Insurance Claims (CIC)
> A privacy-preserving zero-knowledge insurance verification and claim protocol built on the Midnight Network using Compact smart contracts and the Midnight.js SDK.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Confidential--insurance--claims-181717?style=flat-square&logo=github)](https://github.com/techyguy22674/Confidential-insurance-claims)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Live_Demo_Video-FF0000?style=flat-square&logo=youtube)](https://youtu.be/WeqR2uJzXZw)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_App-000000?style=flat-square&logo=vercel)](https://confidential-insurance-claims.vercel.app/)
[![CI/CD Pipeline](https://github.com/techyguy22674/Confidential-insurance-claims/actions/workflows/ci.yml/badge.svg)](https://github.com/techyguy22674/Confidential-insurance-claims/actions/workflows/ci.yml)
[![Midnight Network](https://img.shields.io/badge/Network-Midnight_Preview-8b5cf6?style=flat-square)](https://preview.midnightexplorer.com/contracts/0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df)
[![Midnight.js SDK](https://img.shields.io/badge/Midnight.js-SDK_Integrated-3b82f6?style=flat-square)](https://midnight.network)
[![Compact Language](https://img.shields.io/badge/Compact-v0.23-e11d48?style=flat-square)](https://midnight.network)
[![Framework](https://img.shields.io/badge/Framework-Next.js_14-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![Node.js Version](https://img.shields.io/badge/Node.js-v22.x-10b981?style=flat-square)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## What Is CIC?

**Confidential Insurance Claims (CIC)** enables policyholders to authenticate insurance policies, prove active coverage, and file claims **without exposing sensitive medical diagnoses, police incident reports, hospital invoices, policy numbers, or personal identifying information (PII)** to third parties, adjusters, or public ledgers.

Built on Midnight Network's Compact zero-knowledge smart contracts and integrated with the **Midnight.js SDK** (`@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/midnight-js-network-id`, `@midnight-ntwrk/compact-runtime`, `@midnight-ntwrk/midnight-js-contracts`), claimants generate cryptographic ZK proofs client-side in their browser. Only an immutable claim commitment hash is recorded on-chain — eliminating identity theft, medical record surveillance, and claims fraud.

> **Verify policy coverage & settle insurance claims cryptographically — without exposing private health records, incident reports, or personal identity.**

---

## Live Demo Video

> **Demonstrates:** Midnight Lace wallet connect flow + successful `fileInsuranceClaim()` circuit call + ZK commitment anchored on-chain.

[![CIC Video Walkthrough](https://img.shields.io/badge/YouTube-Watch%20Live%20Demo-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/WeqR2uJzXZw)

**Watch on YouTube**: [https://youtu.be/WeqR2uJzXZw](https://youtu.be/WeqR2uJzXZw)

The demo video highlights:
1. **Wallet Connect**: Connecting Midnight Lace / 1AM extension via `@midnight-ntwrk/dapp-connector-api`
2. **Circuit Call**: Executing `fileInsuranceClaim(Bytes<32>)` from the frontend with ZK witness loading
3. **On-Chain Commitment**: ZK claim commitment hash anchored to `claimCount` on Midnight Preview
4. **Insurer Admin Console**: `setInsurerCommitment()` and `revokeClaim()` circuit execution

---

## Repository & Deployment Details

- **Project Proposal**: [PROPOSAL.md](PROPOSAL.md)
- **GitHub Repository**: [https://github.com/techyguy22674/Confidential-insurance-claims](https://github.com/techyguy22674/Confidential-insurance-claims)
- **Vercel Live Demo**: [https://confidential-insurance-claims.vercel.app/](https://confidential-insurance-claims.vercel.app/)
- **YouTube Video Walkthrough**: [https://youtu.be/WeqR2uJzXZw](https://youtu.be/WeqR2uJzXZw)
- **CI/CD Workflow**: [.github/workflows/ci.yml](.github/workflows/ci.yml)
- **Deployment Workflow**: [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
- **Midnight Explorer**: [https://preview.midnightexplorer.com/contracts/0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df](https://preview.midnightexplorer.com/contracts/0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df)
- **Network**: Midnight Preview Testnet
- **Authoritative Contract Address**: `0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df` (verified on-chain)
- **Preview Node RPC**: `https://rpc.preview.midnight.network`
- **Preview Indexer GraphQL**: `https://indexer.preview.midnight.network/api/v4/graphql`
- **Preview Faucet**: `https://faucet.preview.midnight.network`

---

## Getting Started: Clone & Setup Guide

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (recommended: Node.js v22)
- **npm**: `v9.x` or higher
- **Midnight Lace / 1AM Browser Extension**: Configured on Midnight Preview Testnet

### 1. Clone the Repository
```bash
git clone https://github.com/techyguy22674/Confidential-insurance-claims.git
cd Confidential-insurance-claims
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify Compact Contract & Compile
```bash
npm run compile:compact
```

### 4. Run Test Suite
```bash
npm test
```
All 13 automated tests verify circuits, witness structures, threshold invariants, and deployment records.

### 5. Launch Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to interact with the live dApp.

---

## Zero-Knowledge Architecture

### 1. Compact Smart Contract (6 Circuits)
Defined in `contracts/confidential_insurance_claims.compact` (Compact v0.23):

| Circuit | Witnesses Required | Description |
|---|---|---|
| `fileInsuranceClaim(Bytes<32>)` | 4 private witnesses | Generates ZK proof asserting valid policy membership & coverage days >= threshold |
| `verifyClaim(Bytes<32>)` | None (Public) | Verifies on-chain if a claim commitment hash exists on the public ledger |
| `revokeClaim(Bytes<32>)` | `insurerSigningKey` | Authorizes insurer to invalidate a fraudulent or voided claim commitment |
| `setInsurerCommitment(Uint<32>)` | `insurerSigningKey` | Anchors underwriter authority and configures minimum active coverage days |
| `resetPolicy(Bytes<32>, Uint<32>)` | None | Rotates active policy schema model identifier and updates days threshold |
| `incrementSession()` | None | Increments epoch nonce for session replay protection |

### 2. Private Witness State (Client-Side Privacy)
- **`policySecretKey`**: Private policyholder seed/key. Never exposed on-chain.
- **`claimProofNonce`**: Cryptographic entropy salt preventing replay attacks.
- **`claimIncidentHash`**: SHA-256 hash of incident report, medical record, or police filing.
- **`coverageDaysRemaining`**: BigInt coverage balance asserted privately against minimum required days.
- **`insurerSigningKey`**: Underwriter signing key used to authorize administrative operations.

### 3. Public On-Chain Ledger State (8 Fields)
- `claimCount`: Monotonic counter of verified insurance claims.
- `revokedCount`: Monotonic counter of revoked/voided claims.
- `activeSession`: Epoch counter for replay resistance.
- `policyId`: Active policy model identifier.
- `insurerCommitment`: Cryptographic anchor of insurer authority.
- `lastClaimCommitment`: Hash of the most recently settled claim.
- `lastRevokedCommitment`: Hash of the most recently revoked claim.
- `minimumRequiredDays`: Threshold for policy coverage verification.

---

## Author & Contributor
- **Author**: techyguy22674
- **Email**: novustechsurveyofficial@gmail.com
- **Repository**: [https://github.com/techyguy22674/Confidential-insurance-claims](https://github.com/techyguy22674/Confidential-insurance-claims)
- **License**: MIT
