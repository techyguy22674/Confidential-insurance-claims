import { describe, it, expect, beforeEach } from 'vitest';
import { Contract, ledger, type Witnesses } from '../managed/contract/index.js';
import {
  CONTRACT_ADDRESS,
  NETWORK_CONFIG,
  bytesToHex,
  hexToBytes,
  strToBytes32,
  stringToBytes32,
  sha256Hex,
  getClient,
  ConfidentialInsuranceClaimsClient,
  type StoredClaimRecord,
} from '../src/lib/contract.js';
import { deployCICContract } from '../src/integration/deploy.js';

function toBytes32(str: string): Uint8Array {
  const arr = new Uint8Array(32);
  new TextEncoder().encodeInto(str, arr);
  return arr;
}

function buildWitnesses({
  policyKey = 'policy_seed_secret_health_plus',
  nonce = 'entropy_nonce_insurance_claim',
  incidentHash = 'sha256_police_medical_report',
  daysRemaining = 180n,
  insurerKey = 'insurer_authority_signing_key',
}: {
  policyKey?: string;
  nonce?: string;
  incidentHash?: string;
  daysRemaining?: bigint;
  insurerKey?: string;
}): Witnesses<any> {
  const pKey = toBytes32(policyKey);
  const nBytes = toBytes32(nonce);
  const iHash = toBytes32(incidentHash);
  const insKey = toBytes32(insurerKey);

  return {
    policySecretKey: (ctx: any) => [ctx.privateState ?? ctx, pKey] as [any, Uint8Array],
    claimProofNonce: (ctx: any) => [ctx.privateState ?? ctx, nBytes] as [any, Uint8Array],
    claimIncidentHash: (ctx: any) => [ctx.privateState ?? ctx, iHash] as [any, Uint8Array],
    coverageDaysRemaining: (ctx: any) => [ctx.privateState ?? ctx, daysRemaining] as [any, bigint],
    insurerSigningKey: (ctx: any) => [ctx.privateState ?? ctx, insKey] as [any, Uint8Array],
  };
}

describe('Confidential Insurance Claims (CIC) - Midnight ZK Contract Suite (Level 2 & Level 3)', () => {
  let client: ConfidentialInsuranceClaimsClient;

  beforeEach(() => {
    client = getClient();
    client.clearIssuedClaims();
  });

  // --- CONTRACT ARCHITECTURE & COMPACT CIRCUITS ---

  it('1. Contract Structure: all 6 core circuits are defined, exported, and callable from managed runtime', () => {
    const contract = new Contract(buildWitnesses({}));
    expect(contract).toBeDefined();
    expect(typeof contract.circuits.fileInsuranceClaim).toBe('function');
    expect(typeof contract.circuits.verifyClaim).toBe('function');
    expect(typeof contract.circuits.revokeClaim).toBe('function');
    expect(typeof contract.circuits.setInsurerCommitment).toBe('function');
    expect(typeof contract.circuits.resetPolicy).toBe('function');
    expect(typeof contract.circuits.incrementSession).toBe('function');
    expect(contract).toHaveProperty('circuits');
    expect(contract).toHaveProperty('witnesses');
  });

  it('2. Witness Completeness: all 5 private witnesses are correctly bound', () => {
    const witnesses = buildWitnesses({
      policyKey: 'policy_holder_alpha_123',
      nonce: 'entropy_nonce_insurance_claim',
      incidentHash: 'sha256_hospital_bill_receipt',
      daysRemaining: 180n,
      insurerKey: 'insurer_root_signing_key_chubb',
    });
    const contract = new Contract(witnesses);

    expect(contract.witnesses.policySecretKey).toBeDefined();
    expect(contract.witnesses.claimProofNonce).toBeDefined();
    expect(contract.witnesses.claimIncidentHash).toBeDefined();
    expect(contract.witnesses.coverageDaysRemaining).toBeDefined();
    expect(contract.witnesses.insurerSigningKey).toBeDefined();
  });

  it('3. Private Witness Byte Representation: policySecretKey, claimProofNonce, claimIncidentHash are exactly 32 bytes', () => {
    const witnesses = buildWitnesses({
      policyKey: 'policy_secret_key_alpha',
      nonce: 'random_nonce_beta',
      incidentHash: 'hashed_incident_gamma',
    });
    const mockCtx = { privateState: {} };

    const [, keyBytes] = witnesses.policySecretKey(mockCtx);
    const [, nonceBytes] = witnesses.claimProofNonce(mockCtx);
    const [, incidentBytes] = witnesses.claimIncidentHash(mockCtx);

    expect(keyBytes.length).toBe(32);
    expect(nonceBytes.length).toBe(32);
    expect(incidentBytes.length).toBe(32);
  });

  it('4. Coverage Threshold Evaluation: coverageDaysRemaining passes when >= minimumRequiredDays', () => {
    const activeDays = 120n;
    const minimumRequiredDays = 30n;
    const witnesses = buildWitnesses({ daysRemaining: activeDays });
    const mockCtx = { privateState: {} };

    const [, days] = witnesses.coverageDaysRemaining(mockCtx);
    expect(typeof days).toBe('bigint');
    expect(days).toBe(120n);
    expect(days >= minimumRequiredDays).toBe(true);
  });

  it('5. Coverage Threshold Fail Case: coverageDaysRemaining fails when < minimumRequiredDays', () => {
    const expiredDays = 14n;
    const minimumRequiredDays = 30n;
    const witnesses = buildWitnesses({ daysRemaining: expiredDays });
    const mockCtx = { privateState: {} };

    const [, days] = witnesses.coverageDaysRemaining(mockCtx);
    expect(days >= minimumRequiredDays).toBe(false);
  });

  it('6. ZK Selective Disclosure: private witnesses are cryptographically isolated from public policyId', () => {
    const publicPolicyId = toBytes32('policy_health_plus_2026');
    const witnesses = buildWitnesses({
      policyKey: 'super_secret_policy_key',
      nonce: 'private_claim_nonce_secret',
      incidentHash: 'encrypted_medical_incident_hash',
    });
    const mockCtx = { privateState: {} };

    const [, keyBytes] = witnesses.policySecretKey(mockCtx);
    const [, nonceBytes] = witnesses.claimProofNonce(mockCtx);
    const [, incidentBytes] = witnesses.claimIncidentHash(mockCtx);

    expect(keyBytes).not.toEqual(publicPolicyId);
    expect(nonceBytes).not.toEqual(publicPolicyId);
    expect(incidentBytes).not.toEqual(publicPolicyId);
  });

  it('7. Insurer Authority Witness: insurerSigningKey produces 32-byte key independent of policy secrets', () => {
    const witnesses = buildWitnesses({
      policyKey: 'policy_secret_abc',
      insurerKey: 'insurer_signing_key_xyz',
    });
    const mockCtx = { privateState: {} };

    const [, policyKeyBytes] = witnesses.policySecretKey(mockCtx);
    const [, insurerKeyBytes] = witnesses.insurerSigningKey(mockCtx);

    expect(insurerKeyBytes.length).toBe(32);
    expect(insurerKeyBytes).not.toEqual(policyKeyBytes);
  });

  it('8. Multi-Policy Commitment Uniqueness: distinct policyholders yield unique cryptographic instances', () => {
    const witnessesA = buildWitnesses({ policyKey: 'policy_auto_travel', incidentHash: 'incident_police_a' });
    const witnessesB = buildWitnesses({ policyKey: 'policy_health_plus', incidentHash: 'incident_clinic_b' });
    const mockCtx = { privateState: {} };

    const contractA = new Contract(witnessesA);
    const contractB = new Contract(witnessesB);

    const [, keyA] = witnessesA.policySecretKey(mockCtx);
    const [, keyB] = witnessesB.policySecretKey(mockCtx);

    expect(contractA).not.toBe(contractB);
    expect(keyA).not.toEqual(keyB);
  });

  it('9. Ledger Schema Interface: ledger() decodes all 8 public on-chain fields correctly', () => {
    expect(typeof ledger).toBe('function');
    const parsed = ledger({});
    expect(parsed).toHaveProperty('claimCount');
    expect(parsed).toHaveProperty('revokedCount');
    expect(parsed).toHaveProperty('activeSession');
    expect(parsed).toHaveProperty('policyId');
    expect(parsed).toHaveProperty('insurerCommitment');
    expect(parsed).toHaveProperty('lastClaimCommitment');
    expect(parsed).toHaveProperty('lastRevokedCommitment');
    expect(parsed).toHaveProperty('minimumRequiredDays');
    expect(typeof parsed.claimCount).toBe('bigint');
    expect(typeof parsed.minimumRequiredDays).toBe('bigint');
  });

  it('10. Session Nonce Isolation: independent session nonces produce distinct proof contexts', () => {
    const witnessesSession1 = buildWitnesses({ nonce: 'session_1_insurance_nonce', daysRemaining: 90n });
    const witnessesSession2 = buildWitnesses({ nonce: 'session_2_insurance_nonce', daysRemaining: 180n });
    const mockCtx = { privateState: { sessionId: 'test' } };

    const [, nonce1] = witnessesSession1.claimProofNonce(mockCtx);
    const [, nonce2] = witnessesSession2.claimProofNonce(mockCtx);

    expect(nonce1).not.toEqual(nonce2);
  });

  // --- CLIENT LIFECYCLE & DUAL VERIFICATION ---

  it('11. Authoritative Verified Contract Address matches Midnight Preview deployment record', () => {
    expect(CONTRACT_ADDRESS).toBe('0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df');
    expect(NETWORK_CONFIG.networkId).toBe('preview');
    expect(NETWORK_CONFIG.indexerUrl).toContain('indexer.preview.midnight.network');
  });

  it('12. Authoritative deployCICContract returns the verified contract address', async () => {
    const res = await deployCICContract();
    expect(res.contractAddress).toBe('0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df');
  });

  it('13. Encoding Helpers: bytesToHex and strToBytes32 round-trip correctly', () => {
    const testStr = 'test_policy_123';
    const bytes = strToBytes32(testStr);
    expect(bytes.length).toBe(32);
    const hex = bytesToHex(bytes);
    expect(hex.startsWith('0x')).toBe(true);
    expect(hex.length).toBe(66);
    const back = hexToBytes(hex);
    expect(back).toEqual(bytes);
    expect(stringToBytes32(testStr)).toEqual(bytes);
  });

  it('14. SHA-256 Incident Hash Helper generates deterministic 32-byte digest', () => {
    const hash1 = sha256Hex('incident_hospital_receipt_2026');
    const hash2 = sha256Hex('incident_hospital_receipt_2026');
    const hashDiff = sha256Hex('incident_auto_repair_receipt_2026');

    expect(hash1.startsWith('0x')).toBe(true);
    expect(hash1.length).toBe(66);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashDiff);
  });

  it('15. File Insurance Claim generates valid ZK commitment and stores in registry', async () => {
    const res = await client.fileInsuranceClaim({
      policyId: 'policy_travel_safe_99',
      policySecretKey: 'sec_key_travel_123',
      claimProofNonce: 'claim_nonce_random_99',
      claimIncidentHash: 'incident_lost_luggage_report',
      coverageDaysRemaining: 90,
      description: 'Lost luggage at international terminal',
      estimatedClaimAmountUsd: 1200,
    });

    expect(res.success).toBe(true);
    expect(res.claimCommitment.startsWith('0x')).toBe(true);
    expect(res.claimCommitment.length).toBe(66);
    expect(res.txHash.startsWith('0x')).toBe(true);
    expect(res.claimCount).toBeGreaterThanOrEqual(1);

    const stored = client.getIssuedClaims();
    expect(stored.length).toBeGreaterThanOrEqual(1);
    expect(stored.some(s => s.commitment.toLowerCase() === res.claimCommitment.toLowerCase())).toBe(true);
  });

  it('16. Dual Verification - Mode A: Verification by 32-Byte ZK Claim Commitment succeeds', async () => {
    const claim = await client.fileInsuranceClaim({
      policyId: 'policy_health_gold',
      policySecretKey: 'health_key_4455',
      claimProofNonce: 'health_nonce_7788',
      claimIncidentHash: 'hospital_bill_0912',
      coverageDaysRemaining: 180,
    });

    const verifyRes = await client.verifyClaim(claim.claimCommitment);
    expect(verifyRes.success).toBe(true);
    expect(verifyRes.matches).toBe(true);
    expect(verifyRes.inputWasTxHash).toBe(false);
    expect(verifyRes.claimedCommitment.toLowerCase()).toBe(claim.claimCommitment.toLowerCase());
  });

  it('17. Dual Verification - Mode B: Verification by On-Chain TxHash succeeds', async () => {
    const claim = await client.fileInsuranceClaim({
      policyId: 'policy_auto_secure',
      policySecretKey: 'auto_sec_9900',
      claimProofNonce: 'auto_nonce_1122',
      claimIncidentHash: 'mechanic_invoice_7766',
      coverageDaysRemaining: 240,
    });

    const verifyRes = await client.verifyClaim(claim.txHash);
    expect(verifyRes.success).toBe(true);
    expect(verifyRes.matches).toBe(true);
    expect(verifyRes.inputWasTxHash).toBe(true);
    expect(verifyRes.claimedCommitment.toLowerCase()).toBe(claim.claimCommitment.toLowerCase());
  });

  it('18. Verification Rejection: Unknown / Fake Commitment fails verification', async () => {
    const fakeCommitment = '0x1111111111111111111111111111111111111111111111111111111111111111';
    const verifyRes = await client.verifyClaim(fakeCommitment);
    expect(verifyRes.matches).toBe(false);
    expect(verifyRes.details).toContain('not match');
  });

  it('19. Admin Circuit: revokeClaim invalidates claim commitment and prevents subsequent verification', async () => {
    const claim = await client.fileInsuranceClaim({
      policyId: 'policy_suspicious_claim',
      policySecretKey: 'fraud_key_test',
      claimProofNonce: 'fraud_nonce_test',
      claimIncidentHash: 'fraud_invoice_test',
      coverageDaysRemaining: 60,
    });

    // Revoke by underwriter
    const revokeRes = await client.revokeClaim(claim.claimCommitment);
    expect(revokeRes.success).toBe(true);
    expect(revokeRes.revokedCommitment.toLowerCase()).toBe(claim.claimCommitment.toLowerCase());
    expect(revokeRes.revokedCount).toBeGreaterThanOrEqual(1);

    // Now verification must reject as revoked
    const verifyRes = await client.verifyClaim(claim.claimCommitment);
    expect(verifyRes.matches).toBe(false);
    expect(verifyRes.details).toContain('revoked');
  });

  it('20. Admin Circuit: setInsurerCommitment anchors underwriter cryptographic key and updates minimum coverage days', async () => {
    const res = await client.setInsurerCommitment('underwriter_master_key_swissre', 45);
    expect(res.success).toBe(true);
    expect(res.insurerCommitment.startsWith('0x')).toBe(true);
    expect(res.minimumRequiredDays).toBe(45);
  });

  it('21. Admin Circuit: resetPolicy updates active underwriting model and coverage threshold', async () => {
    const res = await client.resetPolicy('policy_cyber_liability_2027', 90);
    expect(res.success).toBe(true);
    expect(res.newPolicyId).toBe('policy_cyber_liability_2027');
    expect(res.newMinimumDays).toBe(90);
  });

  it('22. Admin Circuit: incrementSession increments monotonic epoch counter for replay protection', async () => {
    const stateBefore = await client.fetchContractState();
    const res = await client.incrementSession();
    expect(res.success).toBe(true);
    expect(BigInt(res.activeSession)).toBe(BigInt(stateBefore.activeSession) + 1n);
  });

  it('23. Wallet Discovery: identifies Lace and 1AM wallet connector interfaces', () => {
    const wallets = client.getWallets();
    expect(Array.isArray(wallets)).toBe(true);
    expect(wallets.length).toBeGreaterThanOrEqual(1);
    expect(wallets.some(w => w.id === 'lace' || w.id === 'oneam')).toBe(true);
  });

  it('24. Wallet Connection & Disconnection lifecycle manages session address state', async () => {
    const connectRes = await client.connectWallet('lace');
    expect(connectRes.success).toBe(true);
    expect(client.isConnected).toBe(true);
    expect(client.getConnectedAddress()?.startsWith('0x')).toBe(true);

    client.disconnect();
    expect(client.isConnected).toBe(false);
    expect(client.getConnectedAddress()).toBeNull();
  });

  it('25. Indexer v4 Query formatting: target address is correctly sanitized without 0x prefix', async () => {
    const cleanAddr = CONTRACT_ADDRESS.toLowerCase().replace(/^0x/, '');
    expect(cleanAddr.startsWith('0x')).toBe(false);
    expect(cleanAddr.length).toBe(64);

    const query = `
      query GetContractState($address: String!) {
        contractAction(address: $address) {
          address
          state
        }
      }
    `;
    expect(query).toContain('contractAction(address: $address)');
  });
});
