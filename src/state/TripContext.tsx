import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { CATEGORIES } from '../data/seed';
import { Expense, JoinedTrip, LocalState, Traveler, Trip, TripState } from '../data/types';
import { addExpenseToTrip, addTravelerToTrip, createTrip, fetchTrip, subscribeToTrip, updateTripFields } from '../firebase/tripsApi';

const STORAGE_KEY = 'trip-expense-tracker/local-state/v3';

function zeroBudgets(): Record<string, number> {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, 0]));
}

export function defaultLocalState(): LocalState {
  return { darkMode: false, joinedTrips: [], activeTripId: null };
}

type LocalAction =
  | { type: 'hydrate'; state: LocalState }
  | { type: 'toggleDarkMode' }
  | { type: 'setActiveTrip'; tripId: string | null }
  | { type: 'upsertJoinedTrip'; tripId: string; myTravelerId: string }
  | { type: 'removeJoinedTrip'; tripId: string };

function reducer(state: LocalState, action: LocalAction): LocalState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'toggleDarkMode':
      return { ...state, darkMode: !state.darkMode };
    case 'setActiveTrip':
      return { ...state, activeTripId: action.tripId };
    case 'upsertJoinedTrip': {
      const exists = state.joinedTrips.some((j) => j.tripId === action.tripId);
      const joinedTrips: JoinedTrip[] = exists
        ? state.joinedTrips.map((j) => (j.tripId === action.tripId ? { ...j, myTravelerId: action.myTravelerId } : j))
        : [...state.joinedTrips, { tripId: action.tripId, myTravelerId: action.myTravelerId }];
      return { ...state, joinedTrips, activeTripId: action.tripId };
    }
    case 'removeJoinedTrip': {
      const joinedTrips = state.joinedTrips.filter((j) => j.tripId !== action.tripId);
      const activeTripId = state.activeTripId === action.tripId ? joinedTrips[0]?.tripId ?? null : state.activeTripId;
      return { ...state, joinedTrips, activeTripId };
    }
    default:
      return state;
  }
}

export type NewExpenseInput = Omit<Expense, 'id' | 'date'>;

function reportError(err: unknown) {
  const message = err instanceof Error ? err.message : 'Something went wrong.';
  Alert.alert("Couldn't save changes", message + '\n\nCheck your internet connection and try again.');
}

interface TripContextValue {
  hydrated: boolean;
  state: TripState | null;
  tripLoading: boolean;
  tripError: string | null;
  myTravelerId: string | null;
  joinedTrips: JoinedTrip[];
  activeTripId: string | null;
  darkMode: boolean;

  // Trip data mutations (act on the currently active trip)
  setTripName: (name: string) => void;
  setTripDates: (dates: string) => void;
  addTraveler: (name: string) => void;
  removeTraveler: (id: string) => void;
  setCategoryBudget: (categoryId: string, value: number) => void;
  addExpense: (expense: NewExpenseInput) => void;
  toggleSettled: (id: string) => void;
  resetSettled: () => void;
  resetTrip: () => void;
  setEurRate: (value: number) => void;
  setGbpRate: (value: number) => void;
  setKwdRate: (value: number) => void;
  setShowConversions: (value: boolean) => void;

  // App-wide
  toggleDarkMode: () => void;

  // Trip membership
  createTripAndJoin: (tripName: string, yourName: string) => Promise<string>;
  previewTrip: (code: string) => Promise<Trip | null>;
  joinExistingTraveler: (tripId: string, travelerId: string) => void;
  joinAsNewTraveler: (tripId: string, travelers: Traveler[], name: string) => Promise<void>;
  leaveTrip: (tripId: string) => void;
  switchTrip: (tripId: string) => void;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [local, dispatch] = useReducer(reducer, undefined, defaultLocalState);
  const [hydrated, setHydrated] = useState(false);
  const loadedOnce = useRef(false);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripLoading, setTripLoading] = useState(false);
  const [tripError, setTripError] = useState<string | null>(null);
  const tripRef = useRef<Trip | null>(null);
  tripRef.current = trip;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<LocalState>;
          dispatch({ type: 'hydrate', state: { ...defaultLocalState(), ...parsed } });
        }
      } catch {
        // corrupt storage — fall back to defaults already in state
      } finally {
        loadedOnce.current = true;
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loadedOnce.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(local)).catch(() => {});
  }, [local]);

  useEffect(() => {
    if (!local.activeTripId) {
      setTrip(null);
      setTripLoading(false);
      setTripError(null);
      return;
    }
    setTripLoading(true);
    setTripError(null);
    const unsubscribe = subscribeToTrip(
      local.activeTripId,
      (t) => {
        setTrip(t);
        setTripLoading(false);
        setTripError(t ? null : 'This trip could not be found. It may have been removed.');
      },
      (err) => {
        setTripLoading(false);
        setTripError(err.message || 'Could not load this trip. Check your internet connection.');
      }
    );
    return unsubscribe;
  }, [local.activeTripId]);

  const myTravelerId = useMemo(
    () => local.joinedTrips.find((j) => j.tripId === local.activeTripId)?.myTravelerId ?? null,
    [local.joinedTrips, local.activeTripId]
  );

  const state = useMemo<TripState | null>(
    () => (trip ? { ...trip, darkMode: local.darkMode } : null),
    [trip, local.darkMode]
  );

  const value = useMemo<TripContextValue>(() => {
    function current(): Trip {
      const t = tripRef.current;
      if (!t) throw new Error('No active trip loaded yet.');
      return t;
    }

    return {
      hydrated,
      state,
      darkMode: local.darkMode,
      tripLoading,
      tripError,
      myTravelerId,
      joinedTrips: local.joinedTrips,
      activeTripId: local.activeTripId,

      setTripName: (name) => updateTripFields(current().id, { tripName: name }).catch(reportError),
      setTripDates: (dates) => updateTripFields(current().id, { tripDates: dates }).catch(reportError),
      addTraveler: (name) => {
        const t = current();
        addTravelerToTrip(t.id, name, t.travelers).catch(reportError);
      },
      removeTraveler: (id) => {
        const t = current();
        updateTripFields(t.id, { travelers: t.travelers.filter((tt) => tt.id !== id) }).catch(reportError);
      },
      setCategoryBudget: (categoryId, val) => {
        const t = current();
        updateTripFields(t.id, { categoryBudgets: { ...t.categoryBudgets, [categoryId]: val } }).catch(reportError);
      },
      addExpense: (expense) => {
        const t = current();
        addExpenseToTrip(t.id, expense, t.expenses).catch(reportError);
      },
      toggleSettled: (id) => {
        const t = current();
        const has = t.settledKeys.includes(id);
        updateTripFields(t.id, {
          settledKeys: has ? t.settledKeys.filter((k) => k !== id) : [...t.settledKeys, id],
        }).catch(reportError);
      },
      resetSettled: () => {
        updateTripFields(current().id, { settledKeys: [] }).catch(reportError);
      },
      resetTrip: () => {
        updateTripFields(current().id, { categoryBudgets: zeroBudgets(), expenses: [], settledKeys: [] }).catch(
          reportError
        );
      },
      setEurRate: (v) => updateTripFields(current().id, { eurRate: v }).catch(reportError),
      setGbpRate: (v) => updateTripFields(current().id, { gbpRate: v }).catch(reportError),
      setKwdRate: (v) => updateTripFields(current().id, { kwdRate: v }).catch(reportError),
      setShowConversions: (v) => updateTripFields(current().id, { showConversions: v }).catch(reportError),

      toggleDarkMode: () => dispatch({ type: 'toggleDarkMode' }),

      createTripAndJoin: async (tripName, yourName) => {
        const { tripId, travelerId } = await createTrip(tripName, yourName);
        dispatch({ type: 'upsertJoinedTrip', tripId, myTravelerId: travelerId });
        return tripId;
      },
      previewTrip: (code) => fetchTrip(code),
      joinExistingTraveler: (tripId, travelerId) => {
        dispatch({ type: 'upsertJoinedTrip', tripId, myTravelerId: travelerId });
      },
      joinAsNewTraveler: async (tripId, travelers, name) => {
        const travelerId = await addTravelerToTrip(tripId, name, travelers);
        dispatch({ type: 'upsertJoinedTrip', tripId, myTravelerId: travelerId });
      },
      leaveTrip: (tripId) => dispatch({ type: 'removeJoinedTrip', tripId }),
      switchTrip: (tripId) => dispatch({ type: 'setActiveTrip', tripId }),
    };
  }, [hydrated, state, tripLoading, tripError, myTravelerId, local.joinedTrips, local.activeTripId, local.darkMode]);

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within a TripProvider');
  return ctx;
}
