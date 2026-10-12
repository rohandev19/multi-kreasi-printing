/**
 * Client-side price ESTIMATE for the public homepage.
 *
 * This is display-only. Authoritative pricing is always recomputed on the
 * server when a cart/order is created — never send these numbers to the API.
 */

export interface PriceTier {
  minQuantity: number;
  pricePerUnit: number;
}

export interface PriceEstimate {
  unitPrice: number;
  subtotal: number;
  tax: number;
  total: number;
  /** The tier that was applied, or null when the base price was used. */
  appliedTier: PriceTier | null;
}

/** Mirrors the backend OrderLogic PPN rate (11%). Keep in sync with backend/src/orders/domain/order.entity.ts. */
export const PPN_RATE = 0.11;

export function resolveUnitPrice(
  basePrice: number,
  tiers: readonly PriceTier[],
  quantity: number,
): { unitPrice: number; appliedTier: PriceTier | null } {
  const applicable = tiers
    .filter((tier) => tier.minQuantity <= quantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  return applicable
    ? { unitPrice: applicable.pricePerUnit, appliedTier: applicable }
    : { unitPrice: basePrice, appliedTier: null };
}

export function estimatePrice(
  basePrice: number,
  tiers: readonly PriceTier[],
  quantity: number,
): PriceEstimate | null {
  if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(basePrice) || basePrice < 0) {
    return null;
  }

  const { unitPrice, appliedTier } = resolveUnitPrice(basePrice, tiers, quantity);
  const subtotal = unitPrice * quantity;
  const tax = Math.round(subtotal * PPN_RATE);

  return { unitPrice, subtotal, tax, total: subtotal + tax, appliedTier };
}
