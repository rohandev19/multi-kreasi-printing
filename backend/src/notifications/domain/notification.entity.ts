export enum NotificationType {
  ORDER_UPDATE = 'Order_Update',
  PAYMENT_RECEIVED = 'Payment_Received',
  APPROVAL_REQUIRED = 'Approval_Required',
  TASK_ASSIGNED = 'Task_Assigned',
  TICKET_CREATED = 'Ticket_Created',
  STOCK_ALERT = 'Stock_Alert',
  PRODUCTION_COMPLETE = 'Production_Complete',
}

export enum NotificationChannel {
  IN_APP = 'In_App',
  EMAIL = 'Email',
  PUSH = 'Push',
}

export class NotificationEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: NotificationType,
    public readonly title: string,
    public readonly message: string,
    public readonly isRead: boolean,
    public readonly channels: NotificationChannel[],
    public readonly metadata: Record<string, any> | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    channels: NotificationChannel[];
    metadata?: Record<string, any>;
  }): NotificationEntity {
    return new NotificationEntity(
      '', // ID will be assigned by DB
      props.userId,
      props.type,
      props.title,
      props.message,
      false,
      props.channels,
      props.metadata || null,
      new Date(),
    );
  }
}
