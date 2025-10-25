import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HapticTab } from '@/components/HapticTab';
import * as Haptics from 'expo-haptics';

// Ensure process.env.EXPO_OS is ios to trigger haptics
beforeAll(() => {
  process.env.EXPO_OS = 'ios';
});

describe('HapticTab', () => {
  it('triggers light impact haptic on press in (iOS)', () => {
    const impactSpy = jest.spyOn(Haptics, 'impactAsync').mockResolvedValue();

    const { getByTestId } = render(
      <HapticTab
        testID="tab"
        onPressIn={() => {}}
        onPress={() => {}}
        accessibilityRole="button"
      />
    );

    fireEvent(getByTestId('tab'), 'pressIn');

    expect(impactSpy).toHaveBeenCalled();
    impactSpy.mockRestore();
  });
});