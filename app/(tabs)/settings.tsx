import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import GlassCard from '@/components/GlassCard';
import AnimatedGradientBackground from '@/components/AnimatedGradientBackground';
import { useThemeMode } from '@/providers/ThemeProvider';

export default function SettingsScreen() {
  const { mode, setMode, effectiveScheme } = useThemeMode();

  const Option = ({ value, label }: { value: 'system' | 'light' | 'dark'; label: string }) => {
    const selected = mode === value;
    return (
      <Pressable
        onPress={() => setMode(value)}
        style={[styles.option, selected && styles.optionSelected]}
      >
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
      </Pressable>
    );
  };

  return (
    <AnimatedGradientBackground intensity={0.8}>
      <ThemedView style={styles.container}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText type="title" style={styles.title}>
            Settings
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <GlassCard>
            <ThemedText type="subtitle">Theme</ThemedText>
            <ThemedText style={{ marginBottom: 12 }}>
              Current: <ThemedText type="defaultSemiBold">{mode.toUpperCase()}</ThemedText>{' '}
              (effective: <ThemedText type="defaultSemiBold">{effectiveScheme}</ThemedText>)
            </ThemedText>
            <View style={styles.row}>
              <Option value="system" label="System" />
              <Option value="light" label="Light" />
              <Option value="dark" label="Dark" />
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <GlassCard>
            <ThemedText type="subtitle">About</ThemedText>
            <ThemedText>
              This app uses Expo Router with a modern, animated UI. Explore tabs to see parallax
              headers and animated content.
            </ThemedText>
          </GlassCard>
        </Animated.View>
      </ThemedView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.3)',
  },
  optionSelected: {
    borderColor: 'rgba(127,127,127,0.7)',
    backgroundColor: 'rgba(127,127,127,0.12)',
  },
});