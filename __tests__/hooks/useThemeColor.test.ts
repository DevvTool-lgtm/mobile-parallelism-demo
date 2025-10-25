import { Colors } from '@/constants/Colors';

// Mock useColorScheme to control theme
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'dark',
}));

import { useThemeColor } from '@/hooks/useThemeColor';

describe('useThemeColor', () => {
  it('returns prop override when provided for current scheme', () => {
    const color = useThemeColor({ light: '#abc', dark: '#def' }, 'text');
    expect(color).toBe('#def');
  });

  it('falls back to Colors when no override', () => {
    const color = useThemeColor({}, 'background');
    expect(color).toBe(Colors.dark.background);
  });
});