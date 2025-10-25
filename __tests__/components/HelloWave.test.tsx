import React from 'react';
import { render } from '@testing-library/react-native';
import { HelloWave } from '@/components/HelloWave';

describe('HelloWave', () => {
  it('renders waving hand emoji', () => {
    const { getByText } = render(<HelloWave />);
    expect(getByText('👋')).toBeTruthy();
  });
});