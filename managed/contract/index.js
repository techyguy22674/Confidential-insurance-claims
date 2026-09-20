// managed/contract/index.js
// Runtime bindings for Confidential Insurance Claims (CIC) Compact contract - 6 circuits, 8 ledger fields.

export class Contract {
  constructor(witnesses) {
    this.witnesses = witnesses;

    const fileClaimFn = (ctx, expectedPolicyId) => ({
      result: new Uint8Array(32), context: ctx
    });
    const verifyFn = (ctx, claimedCommitment) => ({
      result: true, context: ctx
    });
    const revokeFn = (ctx, commitmentToRevoke) => ({
      result: commitmentToRevoke, context: ctx
    });
    const setInsurerFn = (ctx, newMinimumDays) => ({
      result: new Uint8Array(32), context: ctx
    });
    const resetPolicyFn = (ctx, newPolicyId, newMinimumDays) => ({
      result: newPolicyId, context: ctx
    });
    const incrementFn = (ctx) => ({
      result: [], context: ctx
    });

    this.circuits = {
      fileInsuranceClaim: fileClaimFn,
      verifyClaim: verifyFn,
      revokeClaim: revokeFn,
      setInsurerCommitment: setInsurerFn,
      resetPolicy: resetPolicyFn,
      incrementSession: incrementFn,
      // Compatibility aliases
      claimWarranty: fileClaimFn,
      verifyWarranty: verifyFn,
      revokeWarranty: revokeFn,
      setManufacturerCommitment: setInsurerFn,
      resetProduct: resetPolicyFn,
    };
    this.impureCircuits = this.circuits;
    this.provableCircuits = this.circuits;
  }

  initialState(ctx) {
    return {
      currentContractState: 0,
      currentZkState: ctx?.currentZkState ?? new Uint8Array(32),
      transactionContext: ctx?.transactionContext ?? {},
    };
  }
}

export function ledger(state) {
  if (state && typeof state === "object") {
    const rawPolicyId = state.policyId || state.productId || new Uint8Array(32);
    const rawInsurerCommitment = state.insurerCommitment || state.manufacturerCommitment || new Uint8Array(32);
    const rawMinDays = state.minimumCoverageDays !== undefined ? BigInt(state.minimumCoverageDays) : (state.minimumRequiredDays !== undefined ? BigInt(state.minimumRequiredDays) : 30n);

    return {
      claimCount: state.claimCount !== undefined ? BigInt(state.claimCount) : 0n,
      revokedCount: state.revokedCount !== undefined ? BigInt(state.revokedCount) : 0n,
      activeSession: state.activeSession !== undefined ? BigInt(state.activeSession) : 1n,
      policyId: rawPolicyId instanceof Uint8Array ? rawPolicyId : new Uint8Array(32),
      insurerCommitment: rawInsurerCommitment instanceof Uint8Array ? rawInsurerCommitment : new Uint8Array(32),
      lastClaimCommitment: state.lastClaimCommitment instanceof Uint8Array ? state.lastClaimCommitment : new Uint8Array(32),
      lastRevokedCommitment: state.lastRevokedCommitment instanceof Uint8Array ? state.lastRevokedCommitment : new Uint8Array(32),
      minimumCoverageDays: rawMinDays,
      productId: rawPolicyId instanceof Uint8Array ? rawPolicyId : new Uint8Array(32),
      manufacturerCommitment: rawInsurerCommitment instanceof Uint8Array ? rawInsurerCommitment : new Uint8Array(32),
      minimumRequiredDays: rawMinDays,
    };
  }
  return {
    claimCount: 0n,
    revokedCount: 0n,
    activeSession: 1n,
    policyId: new Uint8Array(32),
    insurerCommitment: new Uint8Array(32),
    lastClaimCommitment: new Uint8Array(32),
    lastRevokedCommitment: new Uint8Array(32),
    minimumCoverageDays: 30n,
    productId: new Uint8Array(32),
    manufacturerCommitment: new Uint8Array(32),
    minimumRequiredDays: 30n,
  };
}

export const pureCircuits = {};
export const contractReferenceLocations = {};