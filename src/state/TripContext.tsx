import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  CATEGORIES,
  DEFAULT_EUR_RATE,
  DEFAULT_GBP_RATE,
  DEFAULT_TRAVELERS,
  DEFAULT_TRIP_DATES,
  DEFAULT_TRIP_NAME,
  SEED_EXPENSES,
} from '../data/seed';
import { Expense, Traveler, TripState } from '../data/types';

const STORAGE_KEY = 'trip-expense-tracker/state/v1';

function defaultBudgets(): Record<string, number> {
  return Object.fromEntries(CATEGORIES.map((c) => [c.id, c.budget]));
}

export function defaultState(): TripState {
  return {
    tripName: DEFAULT_TRIP_NAME,
    tripDates: DEFAULT_TRIP_DATES,
    travelers: DEFAULT_TRAVELERS,
    categoryBudgets: defaultBudgets(),
    expenses: SEED_EXPENSES,
    settledKeys: [],
    darkMode: false,
    eurRate: DEFAULT_EUR_RATE,
    gbpRate: DEFAULT_GBP_RATE,
    showConversions: true,
  };
}

export type NewExpenseInput = Omit<Expense, 'id' | 'date'>;

type Action =
  | { type: 'hydrate'; state: TripState }
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
  | { type: 'setShowConversions'; value: boolean };

function reducer(state: TripState, action: Action): TripState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'setTripName':
      return { ...state, tripName: action.name };
    case 'setTripDates':
      return { ...state, tripDates: action.dates };
    case 'addTraveler': {
      const name = action.name.trim();
      if (!name) return state;
      const initials = name.slice(0, 2).toUpperCase();
      const id = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now();
      const traveler: Traveler = { id, name, initials };
      return { ...state, travelers: [...state.travelers, traveler] };
    }
    case 'removeTraveler':
      return { ...state, travelers: state.travelers.filter((t) => t.id !== action.id) };
    case 'setCategoryBudget':
      return {
        ...state,
        categoryBudgets: { ...state.categoryBudgets, [action.categoryId]: action.value },
      };
    case 'addExpense': {
      const expense: Expense = {
        ...action.expense,
        id: 'e' + Date.now(),
        date: new Date().toISOString().slice(0, 10),
      };
      return { ...state, expenses: [...state.expenses, expense] };
    }
    case 'toggleSettled': {
      const has = state.settledKeys.includes(action.id);
      return {
        ...state,
        settledKeys: has
          ? state.settledKeys.filter((k) => k !== action.id)
          : [...state.settledKeys, action.id],
      };
    }
    case 'resetSettled':
      return { ...state, settledKeys: [] };
    case 'restoreDefaults':
      return {
        ...state,
        expenses: SEED_EXPENSES,
        travelers: DEFAULT_TRAVELERS,
        settledKeys: [],
        categoryBudgets: defaultBudgets(),
        tripName: DEFAULT_TRIP_NAME,
        tripDates: DEFAULT_TRIP_DATES,
        eurRate: DEFAULT_EUR_RATE,
        gbpRate: DEFAULT_GBP_RATE,
        showConversions: true,
      };
    case 'toggleDarkMode':
      return { ...state, darkMode: !state.darkMode };
    case 'setEurRate':
      return { ...state, eurRate: action.value };
    case 'setGbpRate':
      return { ...state, gbpRate: action.value };
    case 'setShowConversions':
      return { ...state, showConversions: action.value };
    default:
      return state;
  }
}

interface TripContextValue {
  state: TripState;
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
  setShowConversions: (value: boolean) => void;
}

const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, defaultState);
  const [hydrated, setHydrated] = React.useState(false);
  const loadedOnce = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<TripState>;
          dispatch({ type: 'hydrate', state: { ...defaultState(), ...parsed } });
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const value = useMemo<TripContextValue>(
    () => ({
      state,
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
      setShowConversions: (value: boolean) => dispatch({ type: 'setShowConversions', value }),
    }),
    [state, hydrated]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within a TripProvider');
  return ctx;
}
