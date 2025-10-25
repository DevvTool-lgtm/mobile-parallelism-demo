import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '@/components/ThemedView';

describe('ThemedView', () => {
  it('renders with default light background color', () => {
    const { getByTestId } = render(<ThemedView testID="view" />);
    const view = getByTestId('view');
    expect(view).toBeTruthy();
    // light background is '#fff' per Colors.ts
    expect(view).toHaveStyle({ backgroundColor: '#fff' });
  });

  it('respects explicit lightColor prop', () => {
    const { getByTestId } = render(<ThemedView testID="view" lightColor="#123456" />);
    const view = getByTestId('view');
    expect(view).toHaveStyle({ backgroundColor: '#123456' });
  });
});