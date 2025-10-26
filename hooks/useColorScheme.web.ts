import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemeMode } from '@/providers/ThemeProvider';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const system = useRNColorScheme() ?? 'light';
  const { effectiveScheme } = useThemeMode();

  const scheme = effectiveScheme ?? system;

  if (hasHydrated) {
    return scheme;
  }

  return 'light';
}
