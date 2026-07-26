export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export interface Traveler {
  id: string;
  name: string;
  initials: string;
}

export interface CategoryDef {
  id: string;
  label: string;
  budget: number;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: CurrencyCode;
  payerId: string;
  participantIds: string[];
  date: string; // ISO yyyy-mm-dd
}

export interface TripState {
  tripName: string;
  tripDates: string;
  travelers: Traveler[];
  categoryBudgets: Record<string, number>;
  expenses: Expense[];
  settledKeys: string[];
  darkMode: boolean;
  eurRate: number;
  gbpRate: number;
  showConversions: boolean;
}
