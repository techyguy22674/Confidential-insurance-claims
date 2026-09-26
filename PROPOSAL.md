# Project Proposal: Confidential Insurance Claims (CIC)
> **A Privacy-Preserving Zero-Knowledge Insurance Verification & Claim Protocol on the Midnight Network**

[![GitHub Repo](https://img.shields.io/badge/GitHub-Confidential--insurance--claims-181717?style=for-the-badge&logo=github)](https://github.com/techyguy22674/Confidential-insurance-claims)
[![YouTube Demo](https://img.shields.io/badge/YouTube-Watch%20Demo%20Video-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/Fl0vnA4xydk)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20App-0070f3?style=for-the-badge&logo=vercel)](https://confidential-insurance-claims.vercel.app/)
[![Midnight Network](https://img.shields.io/badge/Midnight-Preview%20Testnet-8b5cf6?style=for-the-badge)](https://preview.midnightexplorer.com/contracts/0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df)
[![Tests Passing](https://img.shields.io/badge/Tests-38%20Passing-brightgreen?style=for-the-badge&logo=vitest)](https://github.com/techyguy22674/Confidential-insurance-claims/blob/main/tests/confidential_insurance_claims.test.ts)

---

## ?? Live Demo Video & Application Links

> **Demonstrating Midnight Lace and 1AM wallet connection, client-side zero-knowledge proof generation, coverage threshold assertions, and on-chain circuit executions.**

- ?? **Live Web Application (Vercel)**: [https://confidential-insurance-claims.vercel.app/](https://confidential-insurance-claims.vercel.app/)
- ?? **Watch Full Video Demo on YouTube**: [https://youtu.be/Fl0vnA4xydk](https://youtu.be/Fl0vnA4xydk)
- ?? **Midnight Preview Contract**: [0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df](https://preview.midnightexplorer.com/contracts/0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df)

---

## ?? Selected Problem from Official Idea List

- **Idea Category**: **Age / Eligibility Gate & Confidential Credentials**  
- **Application Domain**: **Private Insurance Claims & Active Coverage Verification**  
- **Core Privacy Invariant**: Prove eligibility threshold (`coverageDaysRemaining >= minimumRequiredDays`) and credential validity without revealing the underlying policy details, start/end dates, medical incident documents, or personal credentials.

---

## ?? Question 1: What is the application?

**Confidential Insurance Claims (CIC)** is an enterprise-grade decentralized application built on the **Midnight Network** using Compact zero-knowledge smart contracts and the official **Midnight.js SDK** (`@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/midnight-js-network-id`, `@midnight-ntwrk/compact-runtime`, `@midnight-ntwrk/midnight-js-contracts`).

### Key Capabilities:
1. **Confidential Claim Submission**: Policyholders prove active coverage and submit claims without revealing policy numbers, personal medical history, incident documentation, or identifying credentials.
2. **Underwriter Authority Gates**: Authorized insurance underwriters anchor cryptographic commitments on-chain and adjust minimum eligibility duration thresholds.
3. **Dual Verification Engine**: Third-party adjusters, healthcare providers, or claimants can instantly verify claim authenticity using either a **32-byte ZK Claim Commitment** or an **On-Chain Transaction Hash**.
4. **Interactive 3D WebGL Interface**: High-aesthetic user interface featuring a dynamic Three.js serpentine glass helix, real-time metrics, selective disclosure matrix, and wallet connector.

The entire claim proof is computed client-side in zero-knowledge ? only cryptographic commitments and counter updates are published to Midnight's public ledger.

---

## ?? Question 2: What problem does it solve?

Traditional insurance claims processing exposes highly confidential consumer and enterprise data across multiple intermediaries:

1. **Medical and Personal Data Leakage**: Filing claims requires submitting unencrypted health records, mechanic invoices, police reports, and financial statements to adjusters, third-party reviewers, and central servers.
2. **Identity Theft & Behavioral Profiling**: Centralized repositories of claims create high-value targets for data breaches, credential theft, and unauthorized medical profiling.
3. **Claims Fraud & Duplicate Replays**: Lack of cryptographic verification forces insurers into costly, intrusive audits and delayed claim settlement cycles.
4. **Policy Duration Leakage**: Traditional systems expose when a policy was bought and when it expires, allowing third parties to infer financial vulnerability.

### How CIC Resolves These Challenges:
- **Threshold Assertion Without Leakage**: `assert(coverageDaysRemaining >= minimumRequiredDays)` asserts policy validity without revealing exact policy start dates, end dates, or remaining balance.
- **Client-Side Document Isolation**: Incident reports and medical bills are hashed client-side via SHA-256 ? raw files never leave the claimant's machine.
- **Cryptographic Commitment Binding**: Policy credentials are bound to a ZK commitment hash, preventing identity leaks and tracking across distinct claims.
- **Replay Resistance**: Monotonic session counters and single-use entropy nonces prevent claim duplication.

---

## ? Question 3: How is Midnight used?

### 1. Midnight.js SDK (Frontend & Integration)
- **`@midnight-ntwrk/dapp-connector-api`**: Discovers and interacts with browser wallet extensions (**Midnight Lace Wallet** and **1AM Wallet**) with interactive approval prompts and address lifecycle management.
- **`@midnight-ntwrk/midnight-js-network-id`**: `setNetworkId("preview")` establishes configuration for Midnight Preview Testnet.
- **`@midnight-ntwrk/compact-runtime`**: Managed `Contract`, `Witnesses`, and `ledger` state decoding.
- **`@midnight-ntwrk/midnight-js-contracts`**: Authoritative `deployContract()` deployment APIs with strict provider enforcement.

### 2. Compact Smart Contract (6 Circuits)
Defined in `contracts/confidential_insurance_claims.compact` (Compact v0.23, compiler 0.31.1):
- **`fileInsuranceClaim(expectedPolicyId: Bytes<32>): Bytes<32>`**: Core ZK claim circuit. Asserts active coverage threshold, binds 4 private witnesses, and emits a 256-bit commitment hash.
- **`verifyClaim(commitment: Bytes<32>): Boolean`**: Public on-chain verification of claim commitments.
- **`revokeClaim(commitment: Bytes<32>): []`**: Insurer revocation circuit requiring `insurerSigningKey` ZK proof.
- **`setInsurerCommitment(minimumCoverageDays: Uint<32>): []`**: Anchors insurer authority and adjusts eligibility thresholds.
- **`resetPolicy(newPolicyId: Bytes<32>, newMinDays: Uint<32>): []`**: Rotates active underwriting policy archetype.
- **`incrementSession(): []`**: Increments monotonic epoch counter for replay protection.

### 3. Private Witness Set (5 Witnesses)
1. `policySecretKey()`: 32-byte private key held by the policyholder.
2. `claimProofNonce()`: 32-byte cryptographic entropy salt ensuring unlinkability across claims.
3. `claimIncidentHash()`: 32-byte SHA-256 digest of mechanic bills, police reports, or hospital records.
4. `coverageDaysRemaining()`: Integer number of active days remaining on the policy.
5. `insurerSigningKey()`: 32-byte private authority key used exclusively by authorized underwriters.

### 4. Public On-Chain Ledger State (8 Fields)
- `claimCount`: Total valid claims submitted.
- `revokedCount`: Total fraudulent/revoked claims.
- `activeSession`: Monotonic session counter.
- `policyId`: 32-byte identifier of active policy.
- `insurerCommitment`: 32-byte hash anchor of underwriter authority.
- `lastClaimCommitment`: 32-byte commitment of the latest settled claim.
- `lastRevokedCommitment`: 32-byte commitment of the latest revoked claim.
- `minimumRequiredDays`: Required coverage days threshold.

### 5. Live On-Chain Deployment Record
- **Network**: Midnight Preview Testnet
- **Contract Address**: `0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df`
- **Transaction Hash**: `0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df`
- **Compiler Version**: `compactc 0.31.1`
- **Source Commit**: `735d551`
- **Block Explorer**: [https://preview.midnightexplorer.com/contracts/0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df](https://preview.midnightexplorer.com/contracts/0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df)
- **Preview Indexer**: `https://indexer.preview.midnight.network/api/v4/graphql`

---

## ?? Question 4: Privacy Architecture & Selective Disclosure

| Asset | Public On-Chain State | Private Zero-Knowledge Witness |
| :--- | :--- | :--- |
| **Policyholder Identity** | ? None | ? Complete client-side isolation |
| **Policy Secret Key** | ? None | ? 32-byte witness kept in memory |
| **Remaining Days** | ? Only boolean threshold check | ? Exact remaining balance is hidden |
| **Medical / Incident Reports** | ? None | ? Client-side SHA-256 hash |
| **Entropy Salt / Nonce** | ? None | ? 32-byte nonce prevents correlation |
| **Claim Validity** | ? Public verifiable commitment | ? Personal claimant circumstances |
| **Underwriting Authority** | ? Public authority hash anchor | ? Insurer root master private key |

---

## ?? Question 5: Production Roadmap & Real-World Feasibility

1. **Phase 1 (Current - Preview Testnet)**: Full circuit execution, Lace/1AM wallet connector, dual verification engine, 38/38 passing tests, and 3DVERSE interactive WebGL UI.
2. **Phase 2 (Consortium Pilot)**: Integration with decentralized medical/mechanic oracle networks to automatically notarize incident hashes into claimant wallets.
3. **Phase 3 (Mainnet Deployment & Cross-Chain Settlement)**: Deployment to Midnight Mainnet with cross-chain settlement integrations on Cardano for automated claim payouts.

---

## ?? Level 2 & Level 3 Compliance Summary

| Requirement | Implementation Detail | Status |
| :--- | :--- | :--- |
| **Lace Wallet Connect / Disconnect** | Interactive modal supporting Midnight Lace & 1AM wallet via `@midnight-ntwrk/dapp-connector-api` | ? Complete |
| **Real Circuit Execution** | Real execution of `fileInsuranceClaim`, `verifyClaim`, `revokeClaim` | ? Complete |
| **Observable Privacy Behavior** | Threshold evaluation (`coverageDaysRemaining >= minimumRequiredDays`) | ? Complete |
| **Verifiable Deployment** | Deployed on Midnight Preview (`0xbb910a79...`) with 22,778 raw state bytes | ? Complete |
| **Automated Test Suite** | 38 passing tests across unit, witness, circuit, and integration specs | ? Complete (38/38) |
| **CI/CD Pipeline** | GitHub Actions workflow executing compilation, tests, and build | ? Complete |
| **Live Video & App** | YouTube: `https://youtu.be/Fl0vnA4xydk` | Vercel: `https://confidential-insurance-claims.vercel.app/` | ? Complete |
| **Meaningful Commits** | 20+ structured git commits by author | ? Complete |

---

## ?? Author & Contributor
- **Author**: techyguy22674
- **Email**: novustechsurveyofficial@gmail.com
- **GitHub**: [@techyguy22674](https://github.com/techyguy22674)
- **Repository**: [https://github.com/techyguy22674/Confidential-insurance-claims](https://github.com/techyguy22674/Confidential-insurance-claims)
- **License**: MIT
