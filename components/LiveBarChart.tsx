import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';

type Props = {
  title?: string;
  labels: string[];
  values: number[];
  max?: number;
};

export default function LiveBarChart({ title, labels, values, max }: Props) {
  const computedMax = Math.max(1, max ?? Math.max(...values, 1));
  return (
    <View style={styles.container}>
      {title ? <ThemedText type="subtitle">{title}</ThemedText> : null}
      <View style={{ height: 8 }} />
      {values.map((v, i) => (
        <Bar key={i} label={labels[i]} value={v} max={computedMax} />
      ))}
    </View>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const w = useSharedValue(0);
  React.useEffect(() => {
    const pct = Math.min(1, value / max);
    w.value = withTiming(pct, { duration: 600 });
  }, [value, max, w]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: w.value }],
  }));

  return (
    <View style={styles.barRow}>
      <ThemedText style={styles.barLabel}>{label}</ThemedText>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, aStyle]} />
      </View>
      <ThemedText style={styles.barValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  barLabel: { width: 64 },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(127,127,127,0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    transform: [{ scaleX: 1 }],
  },
  barFill: {
    flex: 1,
    backgroundColor: 'rgba(10, 126, 164, 0.9)',
    transformOrigin: 'left center',
  },
  barValue: {
    width: 40,
    textAlign: 'right',
  },
});