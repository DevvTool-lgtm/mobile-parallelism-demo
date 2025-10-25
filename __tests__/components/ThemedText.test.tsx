import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '@/components/ThemedText';

describe('ThemedText', () => {
  it('renders children', () => {
    const { getByText } = render(<ThemedText>Hello</ThemedText>);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('applies title style when type="title"', () => {
    const { getByText } = render(<ThemedText type="title">Title</ThemedText>);
    expect(getByText('Title')).toHaveStyle({ fontSize: 32, lineHeight: 32 });
  });

  it('applies link style color', () => {
    const { getByText } = render(<ThemedText type="link">Link</ThemedText>);
    expect(getByText('Link')).toHaveStyle({ color: '#0a7ea4' });
  });
});