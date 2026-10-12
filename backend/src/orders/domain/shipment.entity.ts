export type ShipmentStatus = 'Preparing' | 'In_Transit' | 'Delivered' | 'Failed';

export interface DispatchItemInput {
  orderItemId: string;
  quantity: number;
  notes?: string;
}

export interface FulfillmentProgress {
  totalOrdered: number;
  totalShipped: number;
  percentage: number;
  isComplete: boolean;
}

export interface DispatchValidationResult {
  valid: boolean;
  error?: string;
  isOrderFullyShipped: boolean;
  remainingPerItem: Record<string, number>;
}

export class ShipmentLogic {
  /**
   * Generates a formal Surat Jalan number (e.g., SJ-2026-0001)
   */
  static generateShipmentNumber(
    count: number,
    year: number = new Date().getFullYear(),
  ): string {
    const sequence = String(count).padStart(4, '0');
    return `SJ-${year}-${sequence}`;
  }

  /**
   * Calculates remaining quantities that can be dispatched for each order item
   */
  static calculateRemainingQuantities(
    orderItems: { id: string; quantity: number }[],
    existingShipmentItems: { orderItemId: string; quantity: number }[],
  ): Record<string, number> {
    const shippedMap: Record<string, number> = {};

    for (const item of existingShipmentItems) {
      shippedMap[item.orderItemId] =
        (shippedMap[item.orderItemId] || 0) + item.quantity;
    }

    const remainingMap: Record<string, number> = {};
    for (const item of orderItems) {
      const shipped = shippedMap[item.id] || 0;
      remainingMap[item.id] = Math.max(0, item.quantity - shipped);
    }

    return remainingMap;
  }

  /**
   * Validates partial dispatch request against order status and remaining item quantities
   */
  static validateDispatch(
    orderStatus: string,
    orderItems: { id: string; quantity: number }[],
    existingShipmentItems: { orderItemId: string; quantity: number }[],
    newItems: DispatchItemInput[],
  ): DispatchValidationResult {
    const nonDispatchableStatuses = ['Draft', 'Cancelled', 'Rejected'];
    if (nonDispatchableStatuses.includes(orderStatus)) {
      return {
        valid: false,
        error: `Pesanan dalam status ${orderStatus} belum dapat dikirim.`,
        isOrderFullyShipped: false,
        remainingPerItem: {},
      };
    }

    if (!newItems || newItems.length === 0) {
      return {
        valid: false,
        error: 'Minimal harus ada 1 item barang yang dikirim dalam Surat Jalan.',
        isOrderFullyShipped: false,
        remainingPerItem: {},
      };
    }

    const remainingMap = this.calculateRemainingQuantities(
      orderItems,
      existingShipmentItems,
    );

    const orderItemIds = new Set(orderItems.map((i) => i.id));

    for (const dispatchItem of newItems) {
      if (!orderItemIds.has(dispatchItem.orderItemId)) {
        return {
          valid: false,
          error: `Item pesanan dengan ID ${dispatchItem.orderItemId} tidak ditemukan dalam pesanan ini.`,
          isOrderFullyShipped: false,
          remainingPerItem: remainingMap,
        };
      }

      if (dispatchItem.quantity <= 0) {
        return {
          valid: false,
          error: 'Jumlah barang yang dikirim harus lebih besar dari 0.',
          isOrderFullyShipped: false,
          remainingPerItem: remainingMap,
        };
      }

      const availableToShip = remainingMap[dispatchItem.orderItemId] ?? 0;
      if (dispatchItem.quantity > availableToShip) {
        return {
          valid: false,
          error: `Kuantitas kirim (${dispatchItem.quantity}) melebihi sisa barang yang belum terkirim (${availableToShip}).`,
          isOrderFullyShipped: false,
          remainingPerItem: remainingMap,
        };
      }
    }

    // Calculate simulated remaining quantities after this dispatch
    let allRemainingZero = true;
    const simulatedRemaining: Record<string, number> = { ...remainingMap };

    for (const dispatchItem of newItems) {
      simulatedRemaining[dispatchItem.orderItemId] -= dispatchItem.quantity;
    }

    for (const itemId of Object.keys(simulatedRemaining)) {
      if (simulatedRemaining[itemId] > 0) {
        allRemainingZero = false;
        break;
      }
    }

    return {
      valid: true,
      isOrderFullyShipped: allRemainingZero,
      remainingPerItem: simulatedRemaining,
    };
  }

  /**
   * Calculates overall fulfillment progress of an order
   */
  static calculateFulfillmentProgress(
    orderItems: { id: string; quantity: number }[],
    allShipmentItems: { orderItemId: string; quantity: number }[],
  ): FulfillmentProgress {
    const totalOrdered = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    const shippedPerItem: Record<string, number> = {};
    for (const sItem of allShipmentItems) {
      shippedPerItem[sItem.orderItemId] =
        (shippedPerItem[sItem.orderItemId] || 0) + sItem.quantity;
    }

    let totalShipped = 0;
    for (const item of orderItems) {
      const shipped = shippedPerItem[item.id] || 0;
      totalShipped += Math.min(item.quantity, shipped);
    }

    const percentage =
      totalOrdered > 0 ? Math.min(100, Math.round((totalShipped / totalOrdered) * 100)) : 0;

    return {
      totalOrdered,
      totalShipped,
      percentage,
      isComplete: totalShipped >= totalOrdered && totalOrdered > 0,
    };
  }

  /**
   * Validates state transitions for a Shipment
   */
  static isValidStatusTransition(
    currentStatus: string,
    nextStatus: string,
  ): boolean {
    const validTransitions: Record<string, string[]> = {
      Preparing: ['In_Transit', 'Cancelled'],
      In_Transit: ['Delivered', 'Failed'],
      Failed: ['Preparing', 'In_Transit'],
      Delivered: [],
      Cancelled: [],
    };

    const allowed = validTransitions[currentStatus] || [];
    return allowed.includes(nextStatus);
  }
}
