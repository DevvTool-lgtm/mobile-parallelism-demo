import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import Constants from 'expo-constants';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AnimatedGradientBackground from '@/components/AnimatedGradientBackground';
import GlassCard from '@/components/GlassCard';
import HeroLottie from '@/components/HeroLottie';

export default function HomeScreen() {
  const brand = (Constants.expoConfig as any)?.extra?.brand || {};
  const headerImage = brand.logoUrl ? (
    <Image source={{ uri: brand.logoUrl }} style={styles.brandLogo} contentFit="contain" />
  ) : (
    <HeroLottie style={styles.lottieHero} />
  );

  return (
    <AnimatedGradientBackground intensity={1}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={headerImage}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Welcome!</ThemedText>
            <HelloWave />
          </ThemedView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard>
            <ThemedText type="subtitle">Scan IDs for attendance</ThemedText>
            <ThemedText>Use your device camera to scan ID barcodes or QR codes.</ThemedText>
            <View style={{ height: 8 }} />
            <Pressable onPress={() => router.push('/(tabs)/attendance')} style={styles.btn}>
              <ThemedText type="defaultSemiBold">Open Scanner</ThemedText>
            </Pressable>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <GlassCard>
            <ThemedText type="subtitle">Vote with ID verification</ThemedText>
            <ThemedText>Secure one-person-one-vote using ID scan verification.</ThemedText>
            <View style={{ height: 8 }} />
            <Pressable onPress={() => router.push('/(tabs)/voting')} style={styles.btn}>
              <ThemedText type="defaultSemiBold">Open Voting</ThemedText>
            </Pressable>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).springify()}>
          <GlassCard>
            <ThemedText type="subtitle">Developer Tips</ThemedText>
            <ThemedText>
              Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see
              changes. Press{' '}
              <ThemedText type="defaultSemiBold">
                {Platform.select({
                  ios: 'cmd + d',
                  android: 'cmd + m',
                  web: 'F12',
                })}
              </ThemedText>{' '}
              to open developer tools.
            </ThemedText>
          </GlassCard>
        </Animated.View>

        <View style={{ height: 8 }} />
      </ParallaxScrollView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lottieHero: {
    position: 'absolute',
    bottom: -30,
    left: -20,
  },
  brandLogo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 260,
    height: 120,
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
