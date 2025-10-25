import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExternalLink } from '@/components/ExternalLink';
import * as WebBrowser from 'expo-web-browser';

// Mock Platform to ios to ensure native behavior path
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return { ...RN, Platform: { ...RN.Platform, OS: 'ios' } };
});

describe('ExternalLink', () => {
  it('opens in in-app browser on native when pressed', async () => {
    const openSpy = jest.spyOn(WebBrowser, 'openBrowserAsync').mockResolvedValue({
      type: 'opened',
    } as any);

    const { getByText } = render(<ExternalLink href="https://example.com">Go</ExternalLink>);

    const el = getByText('Go');
    fireEvent.press(el);

    expect(openSpy).toHaveBeenCalledWith('https://example.com');
    openSpy.mockRestore();
  });
});