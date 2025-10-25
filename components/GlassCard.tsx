import React from 'react';
import { View, StyleSheet, ViewProps, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = ViewProps & {
  onPress?: () => void;
  children?: React.ReactNode;
};

export default function GlassCard({ style, onPress, children, ...rest }: Props) {
  const colorScheme = useColorScheme();
  const scale = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const content = (
    <Animated.View style={[styles.card, aStyle, style]} {...rest}>
      <BlurView
        intensity={colorScheme === 'dark' ? 30 : 50}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.inner}>{children}</View>
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 20, stiffness: 250 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 20, stiffness: 250 });
        }}
        onPress={onPress}
        style={{ borderRadius: 16, overflow: 'hidden' }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inner: {
    padding: 16,
  },
});