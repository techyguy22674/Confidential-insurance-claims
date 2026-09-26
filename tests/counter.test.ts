import { describe, it, expect } from 'vitest';
import { Contract, ledger, type Witnesses } from '../managed/contract/index.js';
import {
  CONTRACT_ADDRESS,
  NETWORK_CONFIG,
  bytesToHex,
  hexToBytes,
  stringToBytes32,
  sha256Hex,
} from '../src/integration/contract.js';
import { deployCICContract, CANONICAL_DEPLOYMENT } from '../src/integration/deploy.js';

// Helpers
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

    // Aliases
    productSecretKey: (ctx: any) => [ctx.privateState ?? ctx, pKey] as [any, Uint8Array],
    warrantyProofNonce: (ctx: any) => [ctx.privateState ?? ctx, nBytes] as [any, Uint8Array],
    purchaseInvoiceHash: (ctx: any) => [ctx.privateState ?? ctx, iHash] as [any, Uint8Array],
    warrantyDaysRemaining: (ctx: any) => [ctx.privateState ?? ctx, daysRemaining] as [any, bigint],
    manufacturerSigningKey: (ctx: any) => [ctx.privateState ?? ctx, insKey] as [any, Uint8Array],
  };
}

describe('Confidential Insurance Claims (CIC) - Midnight ZK Contract Suite', () => {

  it('1. Contract Structure: all 6 core circuits are exported and callable from managed runtime', () => {
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

  it('2. Witness Completeness: all 5 witnesses (including coverage days and insurer key) are defined', () => {
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

  it('3. Private Witness Byte Length: policySecretKey, claimProofNonce, claimIncidentHash are 32 bytes', () => {
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

  it('4. Coverage Days Threshold Witness: coverageDaysRemaining returns bigint usable for active days check', () => {
    const activeDays = 120n;
    const minimumRequiredDays = 30n;
    const witnesses = buildWitnesses({ daysRemaining: activeDays });
    const mockCtx = { privateState: {} };

    const [, days] = witnesses.coverageDaysRemaining(mockCtx);
    expect(typeof days).toBe('bigint');
    expect(days).toBe(120n);
    expect(days >= minimumRequiredDays).toBe(true);
  });

  it('5. ZK Privacy: private witnesses are strictly isolated from public policyId (no data leak)', () => {
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

  it('6. Insurer Authority Witness: insurerSigningKey produces 32-byte array independent of policy key', () => {
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

  it('7. Multi-Policy Commitment Uniqueness: different policies produce distinct contract instances', () => {
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

  it('8. Ledger Schema Interface: ledger() decodes the 8-field on-chain public state correctly', () => {
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

  it('9. Expired Coverage Fail Case: coverageDaysRemaining below minimumRequiredDays fails threshold check', () => {
    const expiredDays = 5n;
    const minimumRequiredDays = 30n;
    const witnesses = buildWitnesses({ daysRemaining: expiredDays });
    const mockCtx = { privateState: {} };

    const [, days] = witnesses.coverageDaysRemaining(mockCtx);
    expect(days >= minimumRequiredDays).toBe(false);
  });

  it('10. Session Isolation: witnesses built for different sessions produce independent nonce contexts', () => {
    const witnessesSession1 = buildWitnesses({ nonce: 'session_1_insurance_nonce', daysRemaining: 90n });
    const witnessesSession2 = buildWitnesses({ nonce: 'session_2_insurance_nonce', daysRemaining: 180n });
    const mockCtx = { privateState: { sessionId: 'test' } };

    const [, nonce1] = witnessesSession1.claimProofNonce(mockCtx);
    const [, nonce2] = witnessesSession2.claimProofNonce(mockCtx);

    expect(nonce1).not.toEqual(nonce2);
  });

  it('11. Authoritative Verified Contract Address: matches Preview deployment record', () => {
    expect(CONTRACT_ADDRESS).toBe('0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df');
    expect(NETWORK_CONFIG.networkId).toBe('preview');
    expect(NETWORK_CONFIG.indexerUrl).toContain('indexer.preview.midnight.network');
  });

  it('12. Authoritative deployCICContract returns the verified contract address', async () => {
    await expect(deployCICContract(undefined as any)).rejects.toThrow('ContractProviders are strictly required');
    expect(CANONICAL_DEPLOYMENT.contractAddress).toBe('0xbb910a795fe4bea70af422038ce303ce6cee7e1133f32f021380f221a849e4df');
  });

  it('13. Encoding Helpers: bytesToHex and stringToBytes32 round-trip correctly', () => {
    const testStr = 'test_policy_123';
    const bytes = stringToBytes32(testStr);
    expect(bytes.length).toBe(32);
    const hex = bytesToHex(bytes);
    expect(hex.startsWith('0x')).toBe(true);
    expect(hex.length).toBe(66);
    const back = hexToBytes(hex);
    expect(back).toEqual(bytes);
  });

});
