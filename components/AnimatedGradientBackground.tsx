import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = {
  children?: React.ReactNode;
  intensity?: number; // 0..1 controls animation strength
};

export default function AnimatedGradientBackground({ children, intensity = 1 }: Props) {
  const colorScheme = useColorScheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progress]);

  const baseLayerStyle = useAnimatedStyle(() => {
    const t1 = progress.value;

    const c1 = interpolateColor(
      t1,
      [0, 1],
      colorScheme === 'dark' ? ['#0f172a', '#111827'] : ['#e0f2fe', '#fef9c3']
    );

    return {
      backgroundColor: c1,
    } as any;
  });

  const overlayLayerStyle = useAnimatedStyle(() => {
    const t2 = 1 - progress.value;

    const c2 = interpolateColor(
      t2,
      [0, 1],
      colorScheme === 'dark' ? ['#1f2937', '#0b1220'] : ['#fce7f3', '#dbeafe']
    );

    const translate = (t2 - 0.5) * 30; // subtle motion

    return {
      backgroundColor: c2,
      transform: [{ translateX: translate }, { translateY: -translate }],
    } as any;
  });

  return (
    <Animated.View style={[styles.container]}>

      <Animated.View pointerEvents="Events="none"
        style={[
          styles.layer,
          {
            backgroundColor: colorScheme === 'dark' ? '#0b1220' : '#f0f9ff',
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.layer,
          animatedStyle,
          {
            opacity: 0.6 * intensity,
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulse,
          {
            backgroundColor: colorScheme === 'dark' ? '#111827' : '#ffffff',
            opacity: 0.08 * intensity,
          },
        ]}
      />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layer: {
    position: 'absolute',
    inset: 0 as any,
  },
  pulse: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 420,
    left: -120,
    top: -120,
    transform: [{ scale: 1 }],
  },
});