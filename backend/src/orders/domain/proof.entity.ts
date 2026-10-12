export enum ProofStatus {
  Pending_Approval = 'Pending_Approval',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Superseded = 'Superseded',
}

export class ProofLogic {
  static getNextVersion(highestExistingVersion?: number): number {
    return highestExistingVersion ? highestExistingVersion + 1 : 1;
  }

  static isValidTransition(currentStatus: string, nextStatus: string): boolean {
    const transitions: Record<string, string[]> = {
      [ProofStatus.Pending_Approval]: [
        ProofStatus.Approved,
        ProofStatus.Rejected,
        ProofStatus.Superseded,
      ],
      [ProofStatus.Approved]: [],
      [ProofStatus.Rejected]: [ProofStatus.Superseded],
      [ProofStatus.Superseded]: [],
    };
    return transitions[currentStatus]?.includes(nextStatus) || false;
  }
}
