export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'KWD';

export interface Traveler {
  id: string;
  name: string;
  initials: string;
}

export interface CategoryDef {
  id: string;
  label: string;
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

// A trip's shared, cloud-synced data — this is the shape of each Firestore
// document in the `trips` collection. `id` is the doc ID, which doubles as
// the shareable join code.
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
// app-wide dark mode preference, so screens can keep reading
// `state.tripName`, `state.travelers`, etc.
export interface TripState extends Trip {
  darkMode: boolean;
}

// A trip this device has joined — kept locally so re-opening the app
// doesn't require re-entering the join code, and so the app remembers
// which traveler in that trip is "me" on this device.
export interface JoinedTrip {
  tripId: string;
  myTravelerId: string;
}

// Everything that lives only on this device (AsyncStorage) rather than in
// the shared Firestore trip document.
export interface LocalState {
  darkMode: boolean;
  joinedTrips: JoinedTrip[];
  activeTripId: string | null;
}
