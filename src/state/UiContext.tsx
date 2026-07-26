import React, { createContext, useContext, useMemo, useState } from 'react';

export type ShareMode = 'balances' | 'recap';

interface UiContextValue {
  showAddSheet: boolean;
  openAdd: () => void;
  closeAdd: () => void;
  showShareSheet: boolean;
  shareMode: ShareMode;
  openShare: (mode: ShareMode) => void;
  closeShare: () => void;
  expensesFilter: string;
  setExpensesFilter: (categoryId: string) => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareMode, setShareMode] = useState<ShareMode>('balances');
  const [expensesFilter, setExpensesFilter] = useState('all');

  const value = useMemo<UiContextValue>(
    () => ({
      showAddSheet,
      openAdd: () => setShowAddSheet(true),
      closeAdd: () => setShowAddSheet(false),
      showShareSheet,
      shareMode,
      openShare: (mode: ShareMode) => {
        setShareMode(mode);
        setShowShareSheet(true);
      },
      closeShare: () => setShowShareSheet(false),
      expensesFilter,
      setExpensesFilter,
    }),
    [showAddSheet, showShareSheet, shareMode, expensesFilter]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi(): UiContextValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within a UiProvider');
  return ctx;
}
