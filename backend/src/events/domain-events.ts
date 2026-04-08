export class OrderCompletedEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
  ) {}
}

export class InvoiceGeneratedEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly customerId: string,
  ) {}
}

export class PaymentReceivedEvent {
  constructor(
    public readonly invoiceId: string,
    public readonly paymentId: string,
    public readonly amount: number,
  ) {}
}

export class ProductionJobAssignedEvent {
  constructor(
    public readonly jobId: string,
    public readonly machineId: string,
  ) {}
}

export class ProductionJobCompletedEvent {
  constructor(public readonly jobId: string) {}
}
