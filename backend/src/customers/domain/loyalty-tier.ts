export class LoyaltyTier {
  static calculate(totalRevenue: number): string {
    if (totalRevenue < 10000000) return 'Bronze';
    if (totalRevenue < 50000000) return 'Silver';
    if (totalRevenue < 100000000) return 'Gold';
    return 'Platinum';
  }
}
