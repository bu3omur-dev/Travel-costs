import React, { createContext, useContext, useMemo } from 'react';
import { Palette, paletteFor } from './colors';

const ThemeContext = createContext<Palette>(paletteFor(false));

export function ThemeProvider({
  darkMode,
  children,
}: {
  darkMode: boolean;
  children: React.ReactNode;
}) {
  const value = useMemo(() => paletteFor(darkMode), [darkMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useColors(): Palette {
  return useContext(ThemeContext);
}
