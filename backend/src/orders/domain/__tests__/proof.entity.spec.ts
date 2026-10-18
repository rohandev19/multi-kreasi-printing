import { describe, it, expect } from 'vitest';
import { ProofLogic, ProofStatus } from '../proof.entity';

describe('ProofLogic', () => {
  describe('getNextVersion', () => {
    it('returns 1 if there is no previous version', () => {
      expect(ProofLogic.getNextVersion()).toBe(1);
      expect(ProofLogic.getNextVersion(0)).toBe(1);
    });

    it('increments highest version sequentially', () => {
      expect(ProofLogic.getNextVersion(1)).toBe(2);
      expect(ProofLogic.getNextVersion(4)).toBe(5);
    });
  });

  describe('isValidTransition', () => {
    it('allows transition from Pending_Approval to Approved or Rejected', () => {
      expect(
        ProofLogic.isValidTransition(
          ProofStatus.Pending_Approval,
          ProofStatus.Approved,
        ),
      ).toBe(true);
      expect(
        ProofLogic.isValidTransition(
          ProofStatus.Pending_Approval,
          ProofStatus.Rejected,
        ),
      ).toBe(true);
    });

    it('rejects invalid transitions from Approved (terminal status)', () => {
      expect(
        ProofLogic.isValidTransition(
          ProofStatus.Approved,
          ProofStatus.Pending_Approval,
        ),
      ).toBe(false);
      expect(
        ProofLogic.isValidTransition(
          ProofStatus.Approved,
          ProofStatus.Rejected,
        ),
      ).toBe(false);
    });

    it('allows Rejected proof to be Superseded when a new version is uploaded', () => {
      expect(
        ProofLogic.isValidTransition(
          ProofStatus.Rejected,
          ProofStatus.Superseded,
        ),
      ).toBe(true);
    });
  });
});
