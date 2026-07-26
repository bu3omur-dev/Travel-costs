import { CategoryDef, Expense, Traveler, Trip } from './types';

export const DEFAULT_TRAVELERS: Traveler[] = [
  { id: 'you', name: 'You', initials: 'YO' },
  { id: 'alex', name: 'Alex', initials: 'AC' },
  { id: 'sam', name: 'Sam', initials: 'SM' },
  { id: 'jordan', name: 'Jordan', initials: 'JD' },
  { id: 'priya', name: 'Priya', initials: 'PR' },
  { id: 'marco', name: 'Marco', initials: 'MC' },
];

export const CATEGORIES: CategoryDef[] = [
  { id: 'flights', label: 'Flights', budget: 2400 },
  { id: 'lodging', label: 'Lodging', budget: 3000 },
  { id: 'food', label: 'Food & Drink', budget: 1800 },
  { id: 'transport', label: 'Transport', budget: 600 },
  { id: 'activities', label: 'Activities', budget: 900 },
  { id: 'shopping', label: 'Shopping', budget: 400 },
  { id: 'other', label: 'Other', budget: 300 },
];

const ALL_IDS = DEFAULT_TRAVELERS.map((t) => t.id);

export const SEED_EXPENSES: Expense[] = [
  { id: 'e1', description: 'Round-trip flights to Lisbon', category: 'flights', amount: 2280, currency: 'USD', payerId: 'you', participantIds: ALL_IDS, date: '2026-08-14' },
  { id: 'e2', description: 'Alfama loft, 7 nights', category: 'lodging', amount: 2450, currency: 'EUR', payerId: 'alex', participantIds: ALL_IDS, date: '2026-08-14' },
  { id: 'e3', description: 'Welcome dinner, Taberna', category: 'food', amount: 186, currency: 'EUR', payerId: 'sam', participantIds: ALL_IDS, date: '2026-08-14' },
  { id: 'e4', description: 'Airport transfer van', category: 'transport', amount: 68, currency: 'EUR', payerId: 'you', participantIds: ALL_IDS, date: '2026-08-14' },
  { id: 'e5', description: 'Sintra day tour', category: 'activities', amount: 240, currency: 'EUR', payerId: 'jordan', participantIds: ALL_IDS, date: '2026-08-15' },
  { id: 'e6', description: 'Groceries run', category: 'food', amount: 74, currency: 'EUR', payerId: 'priya', participantIds: ALL_IDS, date: '2026-08-15' },
  { id: 'e7', description: 'Tram tickets & azulejo tiles', category: 'shopping', amount: 96, currency: 'EUR', payerId: 'marco', participantIds: ALL_IDS, date: '2026-08-16' },
  { id: 'e8', description: 'Fado night dinner', category: 'food', amount: 210, currency: 'EUR', payerId: 'you', participantIds: ALL_IDS, date: '2026-08-16' },
  { id: 'e9', description: 'Train tickets to Porto', category: 'transport', amount: 142, currency: 'EUR', payerId: 'alex', participantIds: ALL_IDS, date: '2026-08-17' },
  { id: 'e10', description: 'Porto Airbnb, 2 nights', category: 'lodging', amount: 480, currency: 'EUR', payerId: 'sam', participantIds: ALL_IDS, date: '2026-08-17' },
  { id: 'e11', description: 'Douro Valley wine tour', category: 'activities', amount: 330, currency: 'EUR', payerId: 'jordan', participantIds: ALL_IDS, date: '2026-08-18' },
  { id: 'e12', description: 'Ceramics & leather goods', category: 'shopping', amount: 118, currency: 'EUR', payerId: 'priya', participantIds: ALL_IDS, date: '2026-08-19' },
  { id: 'e13', description: 'London day-trip flights', category: 'flights', amount: 210, currency: 'GBP', payerId: 'marco', participantIds: ['alex', 'sam', 'marco'], date: '2026-08-20' },
  { id: 'e14', description: 'Borough Market lunch', category: 'food', amount: 64, currency: 'GBP', payerId: 'alex', participantIds: ['alex', 'sam', 'marco'], date: '2026-08-20' },
  { id: 'e15', description: 'Farewell dinner', category: 'food', amount: 256, currency: 'EUR', payerId: 'you', participantIds: ALL_IDS, date: '2026-08-21' },
  { id: 'e16', description: 'Taxi to airport', category: 'transport', amount: 58, currency: 'EUR', payerId: 'you', participantIds: ALL_IDS, date: '2026-08-22' },
];

export const DEFAULT_TRIP_NAME = 'Lisbon & Porto Crew';
export const DEFAULT_TRIP_DATES = 'Aug 14–22, 2026';
export const DEFAULT_EUR_RATE = 1.08;
export const DEFAULT_GBP_RATE = 1.27;
export const DEFAULT_KWD_RATE = 3.26;
export const DEFAULT_TRIP_ID = 'trip-default';

function defaultBudgets(): Record<string, number> {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, c.budget]));
}

function zeroBudgets(): Record<string, number> {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
}

export function createDefaultTrip(): Trip {
  return {
    id: DEFAULT_TRIP_ID,
    tripName: DEFAULT_TRIP_NAME,
    tripDates: DEFAULT_TRIP_DATES,
    travelers: DEFAULT_TRAVELERS,
    categoryBudgets: defaultBudgets(),
    expenses: SEED_EXPENSES,
    settledKeys: [],
    eurRate: DEFAULT_EUR_RATE,
    gbpRate: DEFAULT_GBP_RATE,
    kwdRate: DEFAULT_KWD_RATE,
    showConversions: true,
  };
}

export function createEmptyTrip(name = 'New Trip'): Trip {
  return {
    id: 'trip_' + Date.now(),
    tripName: name,
    tripDates: '',
    travelers: [{ id: 'you', name: 'You', initials: 'YO' }],
    categoryBudgets: zeroBudgets(),
    expenses: [],
    settledKeys: [],
    eurRate: DEFAULT_EUR_RATE,
    gbpRate: DEFAULT_GBP_RATE,
    kwdRate: DEFAULT_KWD_RATE,
    showConversions: true,
  };
}
