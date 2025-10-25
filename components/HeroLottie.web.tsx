import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  style?: any;
};

export default function HeroLottie({ style }: Props) {
  // Web fallback: simple decorative circle
  return <View style={[styles.fallback, style]} />;
}

const styles = StyleSheet.create({
  fallback: {
    width: 280,
    height: 280,
    borderRadius: 180,
    backgroundColor: 'rgba(10,126,164,0.2)',
  },
});