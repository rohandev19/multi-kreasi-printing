import { describe, it, expect } from 'vitest';
import { ShipmentLogic } from '../shipment.entity';

describe('ShipmentLogic', () => {
  describe('generateShipmentNumber', () => {
    it('should generate formatted Surat Jalan number with zero-padded sequence', () => {
      const sjNumber = ShipmentLogic.generateShipmentNumber(1, 2026);
      expect(sjNumber).toBe('SJ-2026-0001');

      const sj42 = ShipmentLogic.generateShipmentNumber(42, 2026);
      expect(sj42).toBe('SJ-2026-0042');
    });
  });

  describe('calculateRemainingQuantities', () => {
    it('should correctly calculate remaining quantities across order items', () => {
      const orderItems = [
        { id: 'item-1', quantity: 5000 },
        { id: 'item-2', quantity: 1000 },
      ];

      const existingShipmentItems = [
        { orderItemId: 'item-1', quantity: 2000 },
        { orderItemId: 'item-1', quantity: 1000 },
        { orderItemId: 'item-2', quantity: 500 },
      ];

      const remaining = ShipmentLogic.calculateRemainingQuantities(
        orderItems,
        existingShipmentItems,
      );

      expect(remaining['item-1']).toBe(2000); // 5000 - 3000
      expect(remaining['item-2']).toBe(500);  // 1000 - 500
    });
  });

  describe('validateDispatch', () => {
    const orderItems = [
      { id: 'item-1', quantity: 10000 },
      { id: 'item-2', quantity: 2000 },
    ];

    it('should reject dispatch if order status is Draft or Cancelled', () => {
      const result = ShipmentLogic.validateDispatch('Draft', orderItems, [], [
        { orderItemId: 'item-1', quantity: 1000 },
      ]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Draft');
    });

    it('should reject dispatch if no items are specified', () => {
      const result = ShipmentLogic.validateDispatch('In_Production', orderItems, [], []);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimal harus ada 1 item');
    });

    it('should reject dispatch if item quantity is zero or negative', () => {
      const result = ShipmentLogic.validateDispatch(
        'Ready_For_Delivery',
        orderItems,
        [],
        [{ orderItemId: 'item-1', quantity: 0 }],
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('lebih besar dari 0');
    });

    it('should reject dispatch if quantity exceeds remaining quantity', () => {
      const existing = [{ orderItemId: 'item-1', quantity: 8000 }];
      const result = ShipmentLogic.validateDispatch(
        'Ready_For_Delivery',
        orderItems,
        existing,
        [{ orderItemId: 'item-1', quantity: 3000 }], // remaining is 2000
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain('melebihi sisa barang yang belum terkirim');
    });

    it('should approve partial dispatch and indicate order is not fully shipped', () => {
      const result = ShipmentLogic.validateDispatch(
        'Ready_For_Delivery',
        orderItems,
        [],
        [{ orderItemId: 'item-1', quantity: 5000 }],
      );
      expect(result.valid).toBe(true);
      expect(result.isOrderFullyShipped).toBe(false);
      expect(result.remainingPerItem['item-1']).toBe(5000);
      expect(result.remainingPerItem['item-2']).toBe(2000);
    });

    it('should approve full dispatch and indicate order is fully shipped', () => {
      const existing = [
        { orderItemId: 'item-1', quantity: 5000 },
        { orderItemId: 'item-2', quantity: 2000 },
      ];
      const result = ShipmentLogic.validateDispatch(
        'Ready_For_Delivery',
        orderItems,
        existing,
        [{ orderItemId: 'item-1', quantity: 5000 }], // remaining 5000
      );
      expect(result.valid).toBe(true);
      expect(result.isOrderFullyShipped).toBe(true);
      expect(result.remainingPerItem['item-1']).toBe(0);
      expect(result.remainingPerItem['item-2']).toBe(0);
    });
  });

  describe('calculateFulfillmentProgress', () => {
    it('should calculate accurate percentage of fulfillment', () => {
      const orderItems = [
        { id: 'item-1', quantity: 5000 },
        { id: 'item-2', quantity: 5000 },
      ];
      const shipments = [
        { orderItemId: 'item-1', quantity: 2500 },
        { orderItemId: 'item-2', quantity: 2500 },
      ];

      const progress = ShipmentLogic.calculateFulfillmentProgress(
        orderItems,
        shipments,
      );

      expect(progress.totalOrdered).toBe(10000);
      expect(progress.totalShipped).toBe(5000);
      expect(progress.percentage).toBe(50);
      expect(progress.isComplete).toBe(false);
    });
  });

  describe('isValidStatusTransition', () => {
    it('should allow valid transitions for delivery tracking', () => {
      expect(ShipmentLogic.isValidStatusTransition('Preparing', 'In_Transit')).toBe(true);
      expect(ShipmentLogic.isValidStatusTransition('In_Transit', 'Delivered')).toBe(true);
      expect(ShipmentLogic.isValidStatusTransition('In_Transit', 'Failed')).toBe(true);
      expect(ShipmentLogic.isValidStatusTransition('Failed', 'In_Transit')).toBe(true);
    });

    it('should prevent invalid transitions once delivered', () => {
      expect(ShipmentLogic.isValidStatusTransition('Delivered', 'Preparing')).toBe(false);
      expect(ShipmentLogic.isValidStatusTransition('Delivered', 'In_Transit')).toBe(false);
    });
  });
});
