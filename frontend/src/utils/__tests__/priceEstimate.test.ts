import { describe, it, expect } from 'vitest';
import { estimatePrice, resolveUnitPrice, PPN_RATE } from '../priceEstimate';

const tiers = [
  { minQuantity: 500, pricePerUnit: 800 },
  { minQuantity: 100, pricePerUnit: 900 },
  { minQuantity: 1000, pricePerUnit: 700 },
];

describe('resolveUnitPrice', () => {
  it('falls back to base price below the lowest tier', () => {
    expect(resolveUnitPrice(1000, tiers, 50)).toEqual({ unitPrice: 1000, appliedTier: null });
  });

  it('picks the highest tier whose minQuantity is met, regardless of input order', () => {
    expect(resolveUnitPrice(1000, tiers, 750).unitPrice).toBe(800);
    expect(resolveUnitPrice(1000, tiers, 1000).unitPrice).toBe(700);
  });

  it('treats the tier boundary as inclusive', () => {
    expect(resolveUnitPrice(1000, tiers, 100).appliedTier).toEqual({ minQuantity: 100, pricePerUnit: 900 });
  });

  it('uses base price when there are no tiers', () => {
    expect(resolveUnitPrice(1200, [], 5000).unitPrice).toBe(1200);
  });
});

describe('estimatePrice', () => {
  it('computes subtotal, PPN, and total', () => {
    const result = estimatePrice(1000, tiers, 500);
    expect(result).not.toBeNull();
    expect(result!.subtotal).toBe(400_000);
    expect(result!.tax).toBe(Math.round(400_000 * PPN_RATE));
    expect(result!.total).toBe(400_000 + 44_000);
  });

  it.each([0, -5, Number.NaN])('returns null for invalid quantity %s', (qty) => {
    expect(estimatePrice(1000, tiers, qty)).toBeNull();
  });

  it('returns null for a negative base price', () => {
    expect(estimatePrice(-1, [], 10)).toBeNull();
  });
});
