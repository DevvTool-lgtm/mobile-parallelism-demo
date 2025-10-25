import React from 'react';
import { render } from '@testing-library/react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';

describe('ParallaxScrollView', () => {
  it('renders header image and children', () => {
    const { getByText } = render(
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#123', dark: '#456' }}
        headerImage={<ThemedText>Header</ThemedText>}
      >
        <ThemedText>Content</ThemedText>
      </ParallaxScrollView>
    );

    expect(getByText('Header')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
  });
});