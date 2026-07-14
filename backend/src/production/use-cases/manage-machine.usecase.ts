import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MachineLogic, MachineStatus } from '../domain/machine.entity';
import { AuditService } from '../../audit/audit.service';

@Injectable()
export class ManageMachineUseCase {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async createMachine(name: string, type: string, currentUserId: string) {
    const machine = await this.prisma.machine.create({
      data: {
        name,
        type,
        status: MachineStatus.Available,
      },
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'MACHINE_CREATED',
      entityType: 'Machine',
      entityId: machine.id,
      oldValue: null,
      newValue: { name, type },
    });

    return machine;
  }

  async updateStatus(
    machineId: string,
    status: MachineStatus,
    currentUserId: string,
  ) {
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });
    if (!machine) throw new NotFoundException('Machine not found');

    if (
      (machine.status as MachineStatus) === MachineStatus.In_Use &&
      status !== MachineStatus.Available
    ) {
      throw new BadRequestException(
        'Cannot change status of a machine that is currently in use',
      );
    }

    const updated = await this.prisma.machine.update({
      where: { id: machineId },
      data: { status },
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'MACHINE_STATUS_UPDATED',
      entityType: 'Machine',
      entityId: machineId,
      oldValue: { status: machine.status },
      newValue: { status },
    });

    return updated;
  }

  async scheduleMaintenance(
    machineId: string,
    maintenanceDate: Date,
    currentUserId: string,
  ) {
    const machine = await this.prisma.machine.update({
      where: { id: machineId },
      data: { maintenanceDate },
    });

    await this.audit.log({
      userId: currentUserId,
      action: 'MACHINE_MAINTENANCE_SCHEDULED',
      entityType: 'Machine',
      entityId: machineId,
      oldValue: null,
      newValue: { maintenanceDate },
    });

    return machine;
  }

  async getMachineUtilization(machineId: string) {
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });
    if (!machine) throw new NotFoundException('Machine not found');

    const utilization = MachineLogic.calculateUtilization(
      machine.productionTime,
      machine.idleTime,
    );

    return {
      machineId: machine.id,
      name: machine.name,
      productionTime: machine.productionTime,
      idleTime: machine.idleTime,
      utilizationPercentage: utilization,
    };
  }
}
