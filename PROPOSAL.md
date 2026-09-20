# Project Proposal: Confidential Insurance Claims (CIC)
> Privacy-Preserving Zero-Knowledge Insurance Verification & Claim Protocol on Midnight Network

---

## Live Demo Video

> **Demonstrates Midnight Lace wallet connection, proof creation, and successful `fileInsuranceClaim()` circuit call from the frontend.**

[![CIC Video Walkthrough](https://img.shields.io/badge/YouTube-Watch%20Live%20Demo-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/WeqR2uJzXZw)

**Watch on YouTube**: [https://youtu.be/WeqR2uJzXZw](https://youtu.be/WeqR2uJzXZw)

---

## Question 1: What is the application?

**Confidential Insurance Claims (CIC)** is a decentralized, privacy-preserving insurance claim and policy verification platform built on the Midnight Network using Compact zero-knowledge smart contracts and the official **Midnight.js SDK** (`@midnight-ntwrk/dapp-connector-api`, `@midnight-ntwrk/midnight-js-network-id`, `@midnight-ntwrk/compact-runtime`, `@midnight-ntwrk/midnight-js-contracts`).

Policyholders prove active coverage and submit claims without revealing policy numbers, personal medical history, incident documentation, or identifying credentials. Insurers anchor underwriting policies and configure minimum active thresholds. The entire claim proof is computed client-side in zero-knowledge — only cryptographic commitments are recorded on Midnight's public ledger.

---

## Question 2: What problem does it solve?

Traditional insurance claims processing exposes sensitive consumer data across multiple intermediaries:
1. **Medical and Personal Data Exposure**: Filing claims requires submitting unencrypted health records, police reports, and financial statements to adjusters, third-party reviewers, and central servers.
2. **Identity Theft & Profiling**: Centralized repositories of claims create high-value targets for data breaches and consumer profiling.
3. **Claims Fraud & Duplication**: Lack of cryptographic verification forces insurers into intrusive audits.

CIC resolves these challenges with zero-knowledge cryptography:
- `assert(coverageDaysRemaining >= minimumRequiredDays)` asserts policy validity without revealing exact policy start or end dates.
- Incident reports and hospital bills are hashed client-side — raw files never leave the claimant's machine.
- Policy credentials are bound to a ZK commitment hash, preventing identity leaks and tracking.

---

## Question 3: How is Midnight used?

### 1. Midnight.js SDK (Frontend Integration)
- **`@midnight-ntwrk/dapp-connector-api`**: Handles browser wallet authorization (Midnight Lace / 1AM) with user approval prompts.
- **`@midnight-ntwrk/midnight-js-network-id`**: `setNetworkId("preview")` establishes the Midnight network environment.
- **`@midnight-ntwrk/compact-runtime`**: Managed `Contract`, `Witnesses`, and `ledger` state decoding.
- **`@midnight-ntwrk/midnight-js-contracts`**: Authoritative `deployContract()` deployment APIs.

### 2. Compact Smart Contract (6 Circuits)
Defined in `contracts/confidential_insurance_claims.compact` (Compact v0.23):
- **`fileInsuranceClaim(expectedPolicyId: Bytes<32>): Bytes<32>`**: Core ZK claim circuit. Asserts active coverage threshold and emits a 256-bit commitment hash.
- **`verifyClaim(claimedCommitment: Bytes<32>): Boolean`**: Public on-chain verification of claim commitments.
- **`revokeClaim(commitmentToRevoke: Bytes<32>): Bytes<32>`**: Insurer revocation circuit requiring `insurerSigningKey` ZK proof.
- **`setInsurerCommitment(newMinimumDays: Uint<32>): Bytes<32>`**: Anchors insurer authority and adjusts eligibility thresholds.
- **`resetPolicy(newPolicyId: Bytes<32>, newMinimumDays: Uint<32>): Bytes<32>`**: Rotates policy schema definitions.
- **`incrementSession(): []`**: Increments session nonce for replay resistance.

### 3. Live On-Chain Deployment Record
- **Network**: Midnight Preview Testnet
- **Contract Address**: `0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df`
- **Midnight Explorer**: [https://preview.midnightexplorer.com/contracts/0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df](https://preview.midnightexplorer.com/contracts/0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df)
- **Preview Indexer**: `https://indexer.preview.midnight.network/api/v4/graphql`

---

## Author & Contributor
- **Author**: techyguy22674
- **Email**: novustechsurveyofficial@gmail.com
- **GitHub Repository**: [https://github.com/techyguy22674/Confidential-insurance-claims](https://github.com/techyguy22674/Confidential-insurance-claims)
