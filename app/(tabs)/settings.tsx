import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import GlassCard from '@/components/GlassCard';
import AnimatedGradientBackground from '@/components/AnimatedGradientBackground';
import { useThemeMode } from '@/providers/ThemeProvider';

export default function SettingsScreen() {
  const { mode, setMode, effectiveScheme, preset, setPreset } = useThemeMode();
  const [message, setMessage] = React.useState<string | null>(null);

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

  const PresetOption = ({ value, label }: { value: 'default' | 'amoled' | 'highContrast'; label: string }) => {
    const selected = preset === value;
    return (
      <Pressable
        onPress={() => setPreset(value)}
        style={[styles.option, selected && styles.optionSelected]}
      >
        <ThemedText type="defaultSemiBold">{label}</ThemedText>
      </Pressable>
    );
  };

  const resetOnboarding = async () => {
    await AsyncStorage.removeItem('onboarded');
    setMessage('Onboarding has been reset. It will show on next app start.');
    setTimeout(() => setMessage(null), 3000);
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

        <Animated.View entering={FadeInDown.delay(190).springify()}>
          <GlassCard>
            <ThemedText type="subtitle">Theme preset</ThemedText>
            <View style={styles.row}>
              <PresetOption value="default" label="Default" />
              <PresetOption value="amoled" label="AMOLED" />
              <PresetOption value="highContrast" label="High Contrast" />
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
            <View style={{ height: 12 }} />
            <Pressable onPress={resetOnboarding} style={styles.btn}>
              <ThemedText type="defaultSemiBold">Reset onboarding</ThemedText>
            </Pressable>
            {message ? (
              <>
                <View style={{ height: 8 }} />
                <ThemedText>{message}</ThemedText>
              </>
            ) : null}
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
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.35)',
    backgroundColor: 'rgba(127,127,127,0.12)',
    alignSelf: 'flex-start',
  },
});