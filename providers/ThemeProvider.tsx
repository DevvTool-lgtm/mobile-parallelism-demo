import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type Mode = 'system' | 'light' | 'dark';
type Preset = 'default' | 'amoled' | 'highContrast';

type ThemeContextValue = {
  mode: Mode;
  setMode: (m: Mode) => void;
  effectiveScheme: 'light' | 'dark';
  preset: Preset;
  setPreset: (p: Preset) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProviderApp({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('system');
  const [preset, setPreset] = useState<Preset>('default');
  const system = useSystemColorScheme() ?? 'light';

  const effectiveScheme = mode === 'system' ? system : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, setMode, effectiveScheme, preset, setPreset }),
    [mode, effectiveScheme, preset]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback if provider is not mounted
    const system = useSystemColorScheme() ?? 'light';
    return {
      mode: 'system' as Mode,
      setMode: (_: Mode) => {},
      effectiveScheme: system as 'light' | 'dark',
      preset: 'default' as Preset,
      setPreset: (_: Preset) => {},
    };
  }
  return ctx;
}