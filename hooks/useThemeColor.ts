/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeMode } from '@/providers/ThemeProvider';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const { preset } = useThemeMode();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  const base = Colors[theme][colorName];

  // Preset overrides
  if (preset === 'amoled' && theme === 'dark') {
    if (colorName === 'background') return '#000000';
    if (colorName === 'text') return '#ffffff';
    if (colorName === 'tint') return '#22d3ee';
  }

  if (preset === 'highContrast') {
    if (theme === 'light') {
      if (colorName === 'background') return '#ffffff';
      if (colorName === 'text') return '#000000';
      if (colorName === 'tint') return '#ffbf00';
    } else {
      if (colorName === 'background') return '#0a0a0a';
      if (colorName === 'text') return '#fefefe';
      if (colorName === 'tint') return '#ffd400';
    }
  }

  return base;
}
