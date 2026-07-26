import { CurrencyCode } from '../data/types';

export const SYMBOLS: Record<CurrencyCode, string> = { USD: '$', EUR: '€', GBP: '£', KWD: 'KD' };

// The Kuwaiti dinar subdivides into 1000 fils (vs. 100 cents/pence), so it's
// conventionally quoted to 3 decimal places rather than 2.
const MAX_FRACTION_DIGITS: Record<CurrencyCode, number> = { USD: 2, EUR: 2, GBP: 2, KWD: 3 };

export function usd(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function native(n: number, currency: CurrencyCode): string {
  return (
    SYMBOLS[currency] +
    n.toLocaleString('en-US', { maximumFractionDigits: n % 1 ? MAX_FRACTION_DIGITS[currency] : 0 })
  );
}

export function dateLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
