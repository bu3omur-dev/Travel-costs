export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'KWD';

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

export interface Trip {
  id: string;
  tripName: string;
  tripDates: string;
  travelers: Traveler[];
  categoryBudgets: Record<string, number>;
  expenses: Expense[];
  settledKeys: string[];
  eurRate: number;
  gbpRate: number;
  kwdRate: number;
  showConversions: boolean;
}

// The flattened view a screen sees: the active trip's fields plus the
// app-wide dark mode preference, shaped like the old single-trip TripState
// so screens can keep reading `state.tripName`, `state.travelers`, etc.
export interface TripState extends Trip {
  darkMode: boolean;
}

export interface AppState {
  trips: Trip[];
  activeTripId: string;
  darkMode: boolean;
}
