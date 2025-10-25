import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '@/components/ThemedText';

describe('ThemedText', () => {
  it('renders children text', () => {
    const { getByText } = render(<ThemedText>Hello</ThemedText>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('applies title style when type is "title"', () => {
    const { getByText } = render(<ThemedText type="title">Title</ThemedText>);
    const el = getByText('Title');
    expect(el).toHaveStyle({ fontSize: 32, fontWeight: 'bold', lineHeight: 32 });
  });

  it('uses explicit color props over theme', () => {
    const { getByText } = render(
      <ThemedText lightColor="#123456" darkColor="#123456">
        Colored
      </ThemedText>
    );
    const el = getByText('Colored');
    expect(el).toHaveStyle({ color: '#123456' });
  });
});