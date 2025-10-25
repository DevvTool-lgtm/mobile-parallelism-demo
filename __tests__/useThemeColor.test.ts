import { useThemeColor } from '@/hooks/useThemeColor';
import * as UseColorSchemeModule from '@/hooks/useColorScheme';
import { renderHook } from '@testing-library/react-native';
import React from 'react';

describe('useThemeColor', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns provided light color when theme is light', () => {
    jest.spyOn(UseColorSchemeModule, 'useColorScheme').mockReturnValue('light' as any);

    const { result } = renderHook(() => useThemeColor({ light: '#abc', dark: '#def' }, 'text'));
    expect(result.current).toBe('#abc');
  });

  it('returns provided dark color when theme is dark', () => {
    jest.spyOn(UseColorSchemeModule, 'useColorScheme').mockReturnValue('dark' as any);

    const { result } = renderHook(() => useThemeColor({ light: '#abc', dark: '#def' }, 'text'));
    expect(result.current).toBe('#def');
  });

  it('falls back to Colors when no explicit color provided', () => {
    jest.spyOn(UseColorSchemeModule, 'useColorScheme').mockReturnValue('light' as any);

    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe('#11181C'); // from Colors.light.text
  });
});