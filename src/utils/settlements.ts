export interface Balance {
  id: string;
  name: string;
  initials: string;
  net: number;
}

export interface Settlement {
  id: string;
  from: Balance;
  to: Balance;
  amount: number;
}

// Greedy min-transaction settlement: largest creditor paired against
// largest debtor until both sides are within a rounding epsilon of zero.
// Ported from `simplifySettlements` in Trip Expense Tracker.dc.html.
export function simplifySettlements(balances: Balance[]): Settlement[] {
  const creditors = balances
    .filter((b) => b.net > 0.5)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);
  const debtors = balances
    .filter((b) => b.net < -0.5)
    .map((b) => ({ ...b, net: -b.net }))
    .sort((a, b) => b.net - a.net);

  const out: Settlement[] = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const amt = Math.min(c.net, d.net);
    out.push({ id: d.id + '_' + c.id, from: d, to: c, amount: amt });
    c.net -= amt;
    d.net -= amt;
    if (c.net < 0.5) ci++;
    if (d.net < 0.5) di++;
  }
  return out;
}
