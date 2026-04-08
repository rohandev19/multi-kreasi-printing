export class PricingTierLogic {
  static calculateUnitPrice(
    tiers: {
      minQuantity: number;
      maxQuantity: number | null;
      unitPrice: number;
    }[],
    quantity: number,
  ): number {
    if (!tiers || tiers.length === 0)
      throw new Error('Pricing tiers not defined');

    // Sort by minQuantity descending to find the highest tier that fits
    const sortedTiers = [...tiers].sort(
      (a, b) => b.minQuantity - a.minQuantity,
    );

    for (const tier of sortedTiers) {
      if (quantity >= tier.minQuantity) {
        if (tier.maxQuantity === null || quantity <= tier.maxQuantity) {
          return tier.unitPrice;
        }
      }
    }

    // Fallback if none match (should not happen if tiers start at 1)
    throw new Error(`No pricing tier found for quantity ${quantity}`);
  }
}
