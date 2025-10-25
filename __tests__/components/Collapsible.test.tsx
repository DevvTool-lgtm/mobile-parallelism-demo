import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Collapsible } from '@/components/Collapsible';

describe('Collapsible', () => {
  it('toggles content visibility when pressed', () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Section">
        <>{'Inner content'}</>
      </Collapsible>
    );

    expect(queryByText('Inner content')).toBeNull();

    fireEvent.press(getByText('Section'));

    expect(getByText('Inner content')).toBeTruthy();

    fireEvent.press(getByText('Section'));
    expect(queryByText('Inner content')).toBeNull();
  });
});