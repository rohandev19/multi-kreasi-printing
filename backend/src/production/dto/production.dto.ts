import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsInt,
} from 'class-validator';
import { MachineStatus } from '../domain/machine.entity';

export class AssignProductionJobDto {
  @IsUUID()
  machineId: string;

  @IsUUID()
  assigneeId: string;
}

export class CompleteProductionDto {
  @IsBoolean()
  passedQualityCheck: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RecordMaterialConsumptionDto {
  @IsUUID()
  materialId: string;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateReworkJobDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class CreateMachineDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;
}

export class UpdateMachineStatusDto {
  @IsEnum(MachineStatus)
  status: MachineStatus;
}

export class ScheduleMaintenanceDto {
  @IsDateString()
  maintenanceDate: Date;
}
