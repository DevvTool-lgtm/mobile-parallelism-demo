import { useThemeMode } from '@/providers/ThemeProvider';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme() {
  // If ThemeProvider is mounted, use its effective scheme; otherwise fallback to system
  try {
    const { effectiveScheme } = useThemeMode();
    return effectiveScheme;
  } catch {
    return useSystemColorScheme();
  }
}
