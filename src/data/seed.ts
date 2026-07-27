import { CategoryDef } from './types';

// Fixed, app-wide expense categories. Every trip (whether created fresh or
// joined) starts with these at a $0 budget — travelers, expenses and budget
// amounts themselves are no longer seeded; they live in Firestore per trip.
export const CATEGORIES: CategoryDef[] = [
  { id: 'flights', label: 'Flights' },
  { id: 'lodging', label: 'Lodging' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'transport', label: 'Transport' },
  { id: 'activities', label: 'Activities' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'other', label: 'Other' },
];
