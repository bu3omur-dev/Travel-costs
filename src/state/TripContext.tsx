import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { CATEGORIES, createDefaultTrip, createEmptyTrip } from '../data/seed';
import { AppState, Expense, Traveler, Trip, TripState } from '../data/types';

const STORAGE_KEY = 'trip-expense-tracker/state/v2';

function defaultBudgets(): Record<string, number> {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, c.budget]));
}

export function defaultAppState(): AppState {
  const trip = createDefaultTrip();
  return {
    trips: [trip],
    activeTripId: trip.id,
    darkMode: false,
  };
}

function updateTrip(trips: Trip[], id: string, updater: (t: Trip) => Trip): Trip[] {
  return trips.map((t) => (t.id === id ? updater(t) : t));
}

export type NewExpenseInput = Omit<Expense, 'id' | 'date'>;

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'setTripName'; name: string }
  | { type: 'setTripDates'; dates: string }
  | { type: 'addTraveler'; name: string }
  | { type: 'removeTraveler'; id: string }
  | { type: 'setCategoryBudget'; categoryId: string; value: number }
  | { type: 'addExpense'; expense: NewExpenseInput }
  | { type: 'toggleSettled'; id: string }
  | { type: 'resetSettled' }
  | { type: 'restoreDefaults' }
  | { type: 'toggleDarkMode' }
  | { type: 'setEurRate'; value: number }
  | { type: 'setGbpRate'; value: number }
  | { type: 'setKwdRate'; value: number }
  | { type: 'setShowConversions'; value: boolean }
  | { type: 'addTrip' }
  | { type: 'deleteTrip'; id: string }
  | { type: 'switchTrip'; id: string };

function reducer(state: AppState, action: Action): AppState {
  const activeId = state.activeTripId;

  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'setTripName':
      return { ...state, trips: updateTrip(state.trips, activeId, (t) => ({ ...t, tripName: action.name })) };
    case 'setTripDates':
      return { ...state, trips: updateTrip(state.trips, activeId, (t) => ({ ...t, tripDates: action.dates })) };
    case 'addTraveler': {
      const name = action.name.trim();
      if (!name) return state;
      const initials = name.slice(0, 2).toUpperCase();
      const id = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now();
      const traveler: Traveler = { id, name, initials };
      return {
        ...state,
        trips: updateTrip(state.trips, activeId, (t) => ({ ...t, travelers: [...t.travelers, traveler] })),
      };
    }
    case 'removeTraveler':
      return {
        ...state,
        trips: updateTrip(state.trips, activeId, (t) => ({
          ...t,
          travelers: t.travelers.filter((tt) => tt.id !== action.id),
        })),
      };
    case 'setCategoryBudget':
      return {
        ...state,
        trips: updateTrip(state.trips, activeId, (t) => ({
          ...t,
          categoryBudgets: { ...t.categoryBudgets, [action.categoryId]: action.value },
        })),
      };
    case 'addExpense': {
      const expense: Expense = {
        ...action.expense,
        id: 'e' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
      };
      return {
        ...state,
        trips: updateTrip(state.trips, activeId, (t) => ({ ...t, expenses: [...t.expenses, expense] })),
      };
    }
    case 'toggleSettled':
      return {
        ...state,
        trips: updateTrip(state.trips, activeId, (t) => ({
          ...t,
          settledKeys: t.settledKeys.includes(action.id)
            ? t.settledKeys.filter((k) => k !== action.id)
            : [...t.settledKeys, action.id],
        })),
      };
    case 'resetSettled':
      return { ...state, trips: updateTrip(state.trips, activeId, (t) => ({ ...t, settledKeys: [] })) };
    case 'restoreDefaults': {
      const isDefaultTrip = activeId === createDefaultTrip().id;
      return {
        ...state,
        trips: updateTrip(state.trips, activeId, (t) =>
          isDefaultTrip
            ? createDefaultTrip()
            : { ...t, categoryBudgets: defaultBudgets(), expenses: [], settledKeys: [] }
        ),
      };
    }
    case 'toggleDarkMode':
      return { ...state, darkMode: !state.darkMode };
    case 'setEurRate':
      return { ...state, trips: updateTrip(state.trips, activeId, (t) => ({ ...t, eurRate: action.value })) };
    case 'setGbpRate':
      return { ...state, trips: updateTrip(state.trips, activeId, (t) => ({ ...t, gbpRate: action.value })) };
    case 'setKwdRate':
      return { ...state, trips: updateTrip(state.trips, activeId, (t) => ({ ...t, kwdRate: action.value })) };
    case 'setShowConversions':
      return {
        ...state,
        trips: updateTrip(state.trips, activeId, (t) => ({ ...t, showConversions: action.value })),
      };
    case 'addTrip': {
      const trip = createEmptyTrip();
      return { ...state, trips: [...state.trips, trip], activeTripId: trip.id };
    }
    case 'deleteTrip': {
      if (state.trips.length <= 1) return state; // always keep at least one trip
      const trips = state.trips.filter((t) => t.id !== action.id);
      const activeTripId = state.activeTripId === action.id ? trips[0].id : state.activeTripId;
      return { ...state, trips, activeTripId };
    }
    case 'switchTrip':
      return state.trips.some((t) => t.id === action.id) ? { ...state, activeTripId: action.id } : state;
    default:
      return state;
  }
}

interface TripContextValue {
  state: TripState;
  trips: Trip[];
  activeTripId: string;
  hydrated: boolean;
  setTripName: (name: string) => void;
  setTripDates: (dates: string) => void;
  addTraveler: (name: string) => void;
  removeTraveler: (id: string) => void;
  setCategoryBudget: (categoryId: string, value: number) => void;
  addExpense: (expense: NewExpenseInput) => void;
  toggleSettled: (id: string) => void;
  resetSettled: () => void;
  restoreDefaults: () => void;
  toggleDarkMode: () => void;
  setEurRate: (value: number) => void;
  setGbpRate: (value: number) => void;
  setKwdRate: (value: number) => void;
  setShowConversions: (value: boolean) => void;
  addTrip: () => void;
  deleteTrip: (id: string) => void;
  switchTrip: (id: string) => void;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [appState, dispatch] = useReducer(reducer, undefined, defaultAppState);
  const [hydrated, setHydrated] = React.useState(false);
  const loadedOnce = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          if (parsed.trips && parsed.trips.length > 0 && parsed.activeTripId) {
            dispatch({ type: 'hydrate', state: { ...defaultAppState(), ...parsed } as AppState });
          }
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appState)).catch(() => {});
  }, [appState]);

  const activeTrip = useMemo(
    () => appState.trips.find((t) => t.id === appState.activeTripId) ?? appState.trips[0],
    [appState.trips, appState.activeTripId]
  );

  const state = useMemo<TripState>(
    () => ({ ...activeTrip, darkMode: appState.darkMode }),
    [activeTrip, appState.darkMode]
  );

  const value = useMemo<TripContextValue>(
    () => ({
      state,
      trips: appState.trips,
      activeTripId: appState.activeTripId,
      hydrated,
      setTripName: (name: string) => dispatch({ type: 'setTripName', name }),
      setTripDates: (dates: string) => dispatch({ type: 'setTripDates', dates }),
      addTraveler: (name: string) => dispatch({ type: 'addTraveler', name }),
      removeTraveler: (id: string) => dispatch({ type: 'removeTraveler', id }),
      setCategoryBudget: (categoryId: string, value: number) =>
        dispatch({ type: 'setCategoryBudget', categoryId, value }),
      addExpense: (expense: NewExpenseInput) => dispatch({ type: 'addExpense', expense }),
      toggleSettled: (id: string) => dispatch({ type: 'toggleSettled', id }),
      resetSettled: () => dispatch({ type: 'resetSettled' }),
      restoreDefaults: () => dispatch({ type: 'restoreDefaults' }),
      toggleDarkMode: () => dispatch({ type: 'toggleDarkMode' }),
      setEurRate: (value: number) => dispatch({ type: 'setEurRate', value }),
      setGbpRate: (value: number) => dispatch({ type: 'setGbpRate', value }),
      setKwdRate: (value: number) => dispatch({ type: 'setKwdRate', value }),
      setShowConversions: (value: boolean) => dispatch({ type: 'setShowConversions', value }),
      addTrip: () => dispatch({ type: 'addTrip' }),
      deleteTrip: (id: string) => dispatch({ type: 'deleteTrip', id }),
      switchTrip: (id: string) => dispatch({ type: 'switchTrip', id }),
    }),
    [state, appState.trips, appState.activeTripId, hydrated]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within a TripProvider');
  return ctx;
}
