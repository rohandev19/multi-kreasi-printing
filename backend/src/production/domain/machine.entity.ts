export enum MachineStatus {
  Available = 'Available',
  In_Use = 'In_Use',
  Maintenance = 'Maintenance',
  Broken = 'Broken',
  Offline = 'Offline',
}

export class MachineLogic {
  /**
   * Calculates the machine utilization percentage.
   * @param productionTime In seconds
   * @param idleTime In seconds
   * @returns Percentage (0 to 100)
   */
  static calculateUtilization(productionTime: number, idleTime: number): number {
    const total = productionTime + idleTime;
    if (total === 0) return 0;
    return Math.round((productionTime / total) * 100);
  }

  static canAssignJob(status: MachineStatus): boolean {
    return status === MachineStatus.Available;
  }
}
