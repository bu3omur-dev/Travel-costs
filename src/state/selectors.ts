import { useMemo } from 'react';
import { CATEGORIES } from '../data/seed';
import { CurrencyCode, Expense, Traveler, TripState } from '../data/types';
import { dateLabel, native, usd } from '../utils/format';
import { Settlement, simplifySettlements } from '../utils/settlements';

export interface EnrichedExpense extends Expense {
  amountUSD: number;
  shareUSD: number;
  payer: Traveler;
  categoryLabel: string;
}

export interface CategoryRow {
  id: string;
  label: string;
  spent: number;
  budget: number;
  pct: number; // 0-100, clamped
  over: boolean;
}

export interface TravelerBalance {
  id: string;
  name: string;
  initials: string;
  net: number; // positive = owed money, negative = owes money
}

export interface PaidRow {
  id: string;
  name: string;
  amount: number;
  pct: number; // relative to the top payer, 0-100
}

export interface CurrencyRow {
  code: CurrencyCode;
  nativeLabel: string;
  usdLabel: string;
  count: number;
}

export interface Recap {
  daysLabel: string;
  biggestDesc: string;
  biggestAmountLabel: string;
  topSpenderName: string;
  topSpenderAmountLabel: string;
  topCategoryLabel: string;
  topCategoryAmountLabel: string;
  outstandingCount: number;
  settleLabel: string;
}

export interface TripData {
  rates: Record<CurrencyCode, number>;
  enriched: EnrichedExpense[];
  recentExpenses: EnrichedExpense[];
  totalSpentUSD: number;
  totalBudgetUSD: number;
  pctSpent: number;
  categoryRows: CategoryRow[];
  balances: TravelerBalance[];
  settlements: Settlement[];
  paidRows: PaidRow[];
  currencyRows: CurrencyRow[];
  recap: Recap;
  balancesShareText: string;
  recapShareText: string;
}

function findTraveler(travelers: Traveler[], id: string): Traveler {
  return travelers.find((t) => t.id === id) ?? { id, name: id, initials: '?' };
}

function categoryLabelFor(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function computeTripData(state: TripState): TripData {
  const rates: Record<CurrencyCode, number> = {
    USD: 1,
    EUR: state.eurRate,
    GBP: state.gbpRate,
    KWD: state.kwdRate,
  };

  const enriched: EnrichedExpense[] = state.expenses.map((e) => {
    const amountUSD = e.amount * rates[e.currency];
    const shareUSD = amountUSD / e.participantIds.length;
    return {
      ...e,
      amountUSD,
      shareUSD,
      payer: findTraveler(state.travelers, e.payerId),
      categoryLabel: categoryLabelFor(e.category),
    };
  });

  const totalSpentUSD = enriched.reduce((a, e) => a + e.amountUSD, 0);
  const totalBudgetUSD = CATEGORIES.reduce((a, c) => a + (state.categoryBudgets[c.id] ?? 0), 0);
  const pctSpent = totalBudgetUSD ? (totalSpentUSD / totalBudgetUSD) * 100 : 0;

  const categoryRows: CategoryRow[] = CATEGORIES.map((c) => {
    const budget = state.categoryBudgets[c.id] ?? 0;
    const spent = enriched.filter((e) => e.category === c.id).reduce((a, e) => a + e.amountUSD, 0);
    const pct = budget ? (spent / budget) * 100 : 0;
    return {
      id: c.id,
      label: c.label,
      spent,
      budget,
      pct: Math.min(100, pct),
      over: spent > budget,
    };
  });

  const balances: TravelerBalance[] = state.travelers.map((t) => {
    const paid = enriched.filter((e) => e.payerId === t.id).reduce((a, e) => a + e.amountUSD, 0);
    const owed = enriched
      .filter((e) => e.participantIds.includes(t.id))
      .reduce((a, e) => a + e.shareUSD, 0);
    return { id: t.id, name: t.name, initials: t.initials, net: paid - owed };
  });

  const settlements = simplifySettlements(balances);

  // "Paid" totals include settlement payments the traveler has marked as
  // settled (money they actually handed over), not just logged expenses.
  const paidTotalsRaw = state.travelers.map((t) => {
    const expensePaid = enriched.filter((e) => e.payerId === t.id).reduce((a, e) => a + e.amountUSD, 0);
    const settlementPaid = settlements
      .filter((s) => s.from.id === t.id && Object.prototype.hasOwnProperty.call(state.settledPayments, s.id))
      .reduce((a, s) => a + (state.settledPayments[s.id] ?? s.amount), 0);
    return { id: t.id, name: t.name, amount: expensePaid + settlementPaid };
  });
  const maxPaid = Math.max(1, ...paidTotalsRaw.map((p) => p.amount));
  const paidRows: PaidRow[] = paidTotalsRaw
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .map((p) => ({ id: p.id, name: p.name, amount: p.amount, pct: (p.amount / maxPaid) * 100 }));

  const currencyCodes: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'KWD'];
  const currencyRows: CurrencyRow[] = currencyCodes
    .map((code) => {
      const rows = enriched.filter((e) => e.currency === code);
      const nativeTotal = rows.reduce((a, e) => a + e.amount, 0);
      const usdTotal = rows.reduce((a, e) => a + e.amountUSD, 0);
      return { code, count: rows.length, nativeLabel: native(nativeTotal, code), usdLabel: usd(usdTotal) };
    })
    .filter((r) => r.count > 0);

  const recentExpenses = enriched
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const days = new Set(enriched.map((e) => e.date)).size;
  const biggest = enriched.reduce<EnrichedExpense | null>(
    (max, e) => (!max || e.amountUSD > max.amountUSD ? e : max),
    null
  );
  const topSpender = paidRows[0];
  const topCategory = categoryRows.slice().sort((a, b) => b.spent - a.spent)[0];
  const outstandingCount = settlements.filter(
    (s) => !Object.prototype.hasOwnProperty.call(state.settledPayments, s.id)
  ).length;

  const recap: Recap = {
    daysLabel: days + ' day' + (days === 1 ? '' : 's'),
    biggestDesc: biggest ? biggest.description : '—',
    biggestAmountLabel: biggest ? usd(biggest.amountUSD) : '—',
    topSpenderName: topSpender ? topSpender.name : '—',
    topSpenderAmountLabel: topSpender ? usd(topSpender.amount) : '—',
    topCategoryLabel: topCategory ? topCategory.label : '—',
    topCategoryAmountLabel: topCategory ? usd(topCategory.spent) : '—',
    outstandingCount,
    settleLabel: outstandingCount
      ? outstandingCount + ' settlement' + (outstandingCount === 1 ? '' : 's') + ' still open'
      : 'Everyone is settled up',
  };

  const balancesLines = [state.tripName + ' — balances', ''];
  balances.forEach((b) => {
    const label = b.net > 0.5 ? '+' + usd(b.net) + ' owed' : b.net < -0.5 ? '-' + usd(-b.net) + ' owes' : 'settled';
    balancesLines.push(b.name + ': ' + label);
  });
  balancesLines.push('');
  if (settlements.length) {
    balancesLines.push('Suggested settlements:');
    settlements.forEach((s) => {
      const settled = Object.prototype.hasOwnProperty.call(state.settledPayments, s.id);
      balancesLines.push('- ' + s.from.name + ' → ' + s.to.name + ': ' + usd(s.amount) + (settled ? ' (settled)' : ''));
    });
  } else {
    balancesLines.push('Everyone is settled up.');
  }
  const balancesShareText = balancesLines.join('\n');

  const recapLines = [
    state.tripName + ' — trip recap',
    state.tripDates,
    '',
    'Total spent: ' + usd(totalSpentUSD) + ' (' + usd(totalSpentUSD / state.travelers.length) + ' per person)',
    'Biggest expense: ' + recap.biggestDesc + ' (' + recap.biggestAmountLabel + ')',
    'Top spender: ' + recap.topSpenderName + ' (' + recap.topSpenderAmountLabel + ')',
    'Top category: ' + recap.topCategoryLabel + ' (' + recap.topCategoryAmountLabel + ')',
    '',
    recap.settleLabel,
  ];
  const recapShareText = recapLines.join('\n');

  return {
    rates,
    enriched,
    recentExpenses,
    totalSpentUSD,
    totalBudgetUSD,
    pctSpent,
    categoryRows,
    balances,
    settlements,
    paidRows,
    currencyRows,
    recap,
    balancesShareText,
    recapShareText,
  };
}

export function useTripData(state: TripState): TripData {
  return useMemo(() => computeTripData(state), [state]);
}

export { dateLabel, native, usd };
