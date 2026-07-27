import { doc, DocumentData, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { CATEGORIES } from '../data/seed';
import { Expense, Trip } from '../data/types';
import { db } from './config';

const TRIPS_COLLECTION = 'trips';

// Short, human-typeable join codes (no 0/O/1/I/L to avoid ambiguity when
// someone reads it out loud or copies it by hand).
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateCode(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

function zeroBudgets(): Record<string, number> {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
}

function tripFromSnapshot(id: string, data: DocumentData): Trip {
  return {
    id,
    tripName: data.tripName ?? '',
    tripDates: data.tripDates ?? '',
    travelers: data.travelers ?? [],
    categoryBudgets: data.categoryBudgets ?? {},
    expenses: data.expenses ?? [],
    settledPayments: data.settledPayments ?? {},
    eurRate: data.eurRate ?? 1.08,
    gbpRate: data.gbpRate ?? 1.27,
    kwdRate: data.kwdRate ?? 3.26,
    showConversions: data.showConversions ?? true,
  };
}

function newTravelerId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'traveler';
  return slug + '_' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
}

/** Creates a new trip document with a short, shareable code as its ID. */
export async function createTrip(
  tripName: string,
  creatorName: string
): Promise<{ tripId: string; travelerId: string }> {
  const travelerId = newTravelerId(creatorName);
  const trip: Omit<Trip, 'id'> = {
    tripName: tripName.trim() || 'Untitled trip',
    tripDates: '',
    travelers: [{ id: travelerId, name: creatorName.trim() || 'Me', initials: initialsFor(creatorName) }],
    categoryBudgets: zeroBudgets(),
    expenses: [],
    settledPayments: {},
    eurRate: 1.08,
    gbpRate: 1.27,
    kwdRate: 3.26,
    showConversions: true,
  };

  // Vanishingly unlikely to collide, but check anyway since we control the
  // ID instead of letting Firestore generate one.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const ref = doc(db, TRIPS_COLLECTION, code);
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      await setDoc(ref, trip);
      return { tripId: code, travelerId };
    }
  }
  throw new Error('Could not generate a unique trip code. Please try again.');
}

function initialsFor(name: string): string {
  const trimmed = name.trim();
  return (trimmed.slice(0, 2) || '??').toUpperCase();
}

/** One-time fetch — used to preview a trip before joining, or to show a
 * joined trip's name in a list without subscribing to it. */
export async function fetchTrip(tripId: string): Promise<Trip | null> {
  const ref = doc(db, TRIPS_COLLECTION, tripId.trim().toUpperCase());
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return tripFromSnapshot(snap.id, snap.data());
}

/** Realtime subscription — fires immediately with the current value, then
 * again every time anyone (including other devices) changes the trip. */
export function subscribeToTrip(
  tripId: string,
  onData: (trip: Trip | null) => void,
  onError: (err: Error) => void
): () => void {
  const ref = doc(db, TRIPS_COLLECTION, tripId.trim().toUpperCase());
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(tripFromSnapshot(snap.id, snap.data()));
    },
    onError
  );
}

/** Adds a new traveler and returns their generated ID, so the caller can
 * claim it as "me" right away. */
export async function addTravelerToTrip(tripId: string, name: string, currentTravelers: Trip['travelers']): Promise<string> {
  const id = newTravelerId(name);
  const traveler = { id, name: name.trim() || 'Traveler', initials: initialsFor(name) };
  await updateDoc(doc(db, TRIPS_COLLECTION, tripId), {
    travelers: [...currentTravelers, traveler],
  });
  return id;
}

/** Generic patch — the caller (TripContext) computes the next value for
 * whichever fields are changing from the live trip it already has, and
 * this just writes it. Keeps all "how do I update X" logic in one place
 * (TripContext) instead of duplicated between local and cloud code paths. */
export async function updateTripFields(tripId: string, patch: Partial<Omit<Trip, 'id'>>): Promise<void> {
  await updateDoc(doc(db, TRIPS_COLLECTION, tripId), patch as DocumentData);
}

export async function addExpenseToTrip(tripId: string, expenseInput: Omit<Expense, 'id' | 'date'>, currentExpenses: Expense[]): Promise<void> {
  const expense: Expense = {
    ...expenseInput,
    id: 'e' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
    date: new Date().toISOString().slice(0, 10),
  };
  await updateDoc(doc(db, TRIPS_COLLECTION, tripId), {
    expenses: [...currentExpenses, expense],
  });
}

