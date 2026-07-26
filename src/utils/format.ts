import { CurrencyCode } from '../data/types';

export const SYMBOLS: Record<CurrencyCode, string> = { USD: '$', EUR: '€', GBP: '£' };

export function usd(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function native(n: number, currency: CurrencyCode): string {
  return (
    SYMBOLS[currency] +
    n.toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0 })
  );
}

export function dateLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
