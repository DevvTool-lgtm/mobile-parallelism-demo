// Mock react-native-reanimated for Jest
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock expo-router Link to a basic component to avoid navigation context requirements
jest.mock('expo-router', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    ...jest.requireActual('expo-router'),
    Link: ({ children }) => React.createElement(Text, null, children),
  };
});

// Silence console warnings that can be noisy in tests
const originalError = console.error;
console.error = (...args) => {
  const msg = args[0] || '';
  if (
    typeof msg === 'string' &&
    (msg.includes('Warning:') || msg.includes('Animated: `useNativeDriver`'))
  ) {
    return;
  }
  originalError(...args);
};