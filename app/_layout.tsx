import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemeProviderApp } from '@/providers/ThemeProvider';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [ready, setReady] = React.useState(false);
  const [onboarded, setOnboarded] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem('onboarded');
        setOnboarded(v === '1');
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!loaded || !ready || onboarded == null) {
    // Wait for fonts and onboarding state
    return null;
  }

  return (
    <ThemeProviderApp>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ animation: 'fade' }} initialRouteName={onboarded ? '(tabs)' : 'onboarding'}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ThemeProviderApp>
  );
}
