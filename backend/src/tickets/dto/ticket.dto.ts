import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export const TICKET_CATEGORIES = [
  'Order_Issue',
  'Design_Problem',
  'Payment_Question',
  'Technical_Issue',
  'General_Inquiry',
] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = [
  'Open',
  'Assigned',
  'In_Progress',
  'Resolved',
  'Closed',
  'Reopened',
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export class CreateTicketDto {
  @IsString()
  @MaxLength(255)
  subject: string;

  @IsString()
  @IsIn(TICKET_CATEGORIES, {
    message: 'Category must be one of: Order_Issue, Design_Problem, Payment_Question, Technical_Issue, General_Inquiry',
  })
  category: TicketCategory;

  @IsOptional()
  @IsString()
  @IsIn(TICKET_PRIORITIES, {
    message: 'Priority must be one of: Low, Normal, High, Urgent',
  })
  priority?: TicketPriority;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  orderId?: string;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @IsIn(TICKET_STATUSES, {
    message: 'Status must be one of: Open, Assigned, In_Progress, Resolved, Closed, Reopened',
  })
  status?: TicketStatus;

  @IsOptional()
  @IsString()
  @IsIn(TICKET_PRIORITIES, {
    message: 'Priority must be one of: Low, Normal, High, Urgent',
  })
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  @IsIn(TICKET_CATEGORIES)
  category?: TicketCategory;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class CreateTicketMessageDto {
  @IsString()
  message: string;
}
