import React, { useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AnimatedGradientBackground from '@/components/AnimatedGradientBackground';
import GlassCard from '@/components/GlassCard';
import HeroLottie from '@/components/HeroLottie';

const { width } = Dimensions.get('window');

const PAGES = [
  {
    title: 'Welcome',
    subtitle: 'A modern Expo starter with animations and theming.',
  },
  {
    title: 'Beautiful',
    subtitle: 'Glassmorphism, parallax, and smooth transitions.',
  },
  {
    title: 'Productive',
    subtitle: 'Installer, routing, and utilities to ship faster.',
  },
];

export default function Onboarding() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const x = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  const goNext = () => {
    const next = Math.min(index + 1, PAGES.length - 1);
    if (next === index) return;
    setIndex(next);
    // @ts-ignore
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
  };

  const skip = async () => {
    await complete();
  };

  const complete = async () => {
    try {
      await AsyncStorage.setItem('onboarded', '1');
    } finally {
      router.replace('(tabs)');
    }
  };

  return (
    <AnimatedGradientBackground intensity={1}>
      <ThemedView style={styles.container}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          onScroll={onScroll}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            setIndex(i);
          }}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {PAGES.map((p, i) => {
            return (
              <View key={i} style={{ width, padding: 24 }}>
                <View style={{ alignItems: 'center', marginTop: 24 }}>
                  <HeroLottie />
                </View>
                <View style={{ height: 12 }} />
                <GlassCard>
                  <ThemedText type="title">{p.title}</ThemedText>
                  <View style={{ height: 6 }} />
                  <ThemedText>{p.subtitle}</ThemedText>
                </GlassCard>
              </View>
            );
          })}
        </Animated.ScrollView>

        <View style={styles.dots}>
          {PAGES.map((_, i) => {
            const progress = interpolate(
              x.value,
              [(i - 1) * width, i * width, (i + 1) * width],
              [0, 1, 0],
              Extrapolation.CLAMP
            );
            const size = 8 + 6 * progress;
            const opacity = 0.4 + 0.6 * progress;
            return <Animated.View key={i} style={[styles.dot, { width: size, height: size, opacity }]} />;
          })}
        </View>

        <View style={styles.footer}>
          {index < PAGES.length - 1 ? (
            <>
              <Pressable onPress={skip} style={[styles.btn, styles.btnTextOnly]}>
                <ThemedText type="defaultSemiBold">Skip</ThemedText>
              </Pressable>
              <Pressable onPress={goNext} style={styles.btn}>
                <ThemedText type="defaultSemiBold">Next</ThemedText>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={complete} style={styles.btnPrimary}>
              <ThemedText type="defaultSemiBold">Get started</ThemedText>
            </Pressable>
          )}
        </View>
      </ThemedView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dots: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    alignItems: 'center',
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: 6,
    backgroundColor: '#999',
    marginHorizontal: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.35)',
    backgroundColor: 'rgba(127,127,127,0.12)',
    minWidth: 120,
    alignItems: 'center',
  },
  btnTextOnly: {
    backgroundColor: 'transparent',
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(10, 126, 164, 0.9)',
  },
});