import { BadRequestException } from '@nestjs/common';

export enum ProductionJobStatus {
  Queue = 'Queue',
  Assigned = 'Assigned',
  In_Progress = 'In_Progress',
  Quality_Check = 'Quality_Check',
  Completed = 'Completed',
  Failed = 'Failed',
  Rework = 'Rework',
}

export class ProductionJobLogic {
  /**
   * Generates a new production job number format PROD-YYYY-9999
   */
  static generateJobNumber(sequence: number): string {
    const year = new Date().getFullYear();
    const paddedSequence = sequence.toString().padStart(4, '0');
    return `PROD-${year}-${paddedSequence}`;
  }

  static canTransition(currentStatus: string, nextStatus: ProductionJobStatus): boolean {
    const transitions: Record<string, ProductionJobStatus[]> = {
      [ProductionJobStatus.Queue]: [ProductionJobStatus.Assigned],
      [ProductionJobStatus.Assigned]: [ProductionJobStatus.In_Progress, ProductionJobStatus.Queue],
      [ProductionJobStatus.In_Progress]: [ProductionJobStatus.Quality_Check, ProductionJobStatus.Failed],
      [ProductionJobStatus.Quality_Check]: [ProductionJobStatus.Completed, ProductionJobStatus.Failed],
      [ProductionJobStatus.Failed]: [ProductionJobStatus.Rework],
      [ProductionJobStatus.Rework]: [ProductionJobStatus.Assigned, ProductionJobStatus.In_Progress],
      [ProductionJobStatus.Completed]: [],
    };

    const allowed = transitions[currentStatus] || [];
    return allowed.includes(nextStatus);
  }

  static validateTransition(currentStatus: string, nextStatus: ProductionJobStatus): void {
    if (!this.canTransition(currentStatus, nextStatus)) {
      throw new BadRequestException(`Cannot transition from ${currentStatus} to ${nextStatus}`);
    }
  }
}
