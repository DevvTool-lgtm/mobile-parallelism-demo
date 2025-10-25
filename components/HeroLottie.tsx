import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

type Props = {
  style?: any;
}

export default function HeroLottie({ style }: Props) {
  // Note: Lottie works in native and on web (depending on version). If not supported,
  // ensure the component is only used as a decorative header; app continues gracefully.
  return (
    <LottieView
      source={require('@/assets/lottie/hero.json')}
      autoPlay
      loop
      style={[styles.lottie, style]}
    />
  );
}

const styles = StyleSheet.create({
  lottie: {
    width: 360,
    height: 360,
  },
});