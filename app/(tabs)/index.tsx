import { Image } from 'expo-image';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AnimatedGradientBackground from '@/components/AnimatedGradientBackground';
import GlassCard from '@/components/GlassCard';
import HeroLottie from '@/components/HeroLottie';

export default function HomeScreen() {
  return (
    <AnimatedGradientBackground intensity={1}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <HeroLottie style={styles.lottieHero} />
        }>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Welcome!</ThemedText>
            <HelloWave />
          </ThemedView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard>
            <ThemedText type="subtitle">Step 1: Try it</ThemedText>
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

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <GlassCard>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
            <ThemedText>
              {`Tap the Explore tab to learn more about what's included in this starter app.`}
            </ThemedText>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <GlassCard>
            <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
            <ThemedText>
              {`When you're ready, run `}
              <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
              <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the
              current <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
              <ThemedText type="defaultSemiBold">app-example</ThemedText>.
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
});
