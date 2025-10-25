import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import AnimatedGradientBackground from '@/components/AnimatedGradientBackground';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import GlassCard from '@/components/GlassCard';
import ScannerView from '@/components/ScannerView';
import { pushUnique, getJSON } from '@/utils/storage';

type AttendanceRecord = {
  id: string;
  time: number;
};

const STORAGE_KEY = 'attendance:records';

export default function AttendanceScreen() {
  const [last, setLast] = React.useState<AttendanceRecord | null>(null);
  const [recent, setRecent] = React.useState<AttendanceRecord[]>([]);

  const refresh = React.useCallback(async () => {
    const list = await getJSON<AttendanceRecord[]>(STORAGE_KEY, []);
    setRecent(list);
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const onScanned = async (id: string) => {
    const record: AttendanceRecord = { id, time: Date.now() };
    await pushUnique<AttendanceRecord>(STORAGE_KEY, record);
    setLast(record);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    refresh();
  };

  return (
    <AnimatedGradientBackground intensity={0.9}>
      <ThemedView style={styles.container}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText type="title">Attendance</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <ScannerView onCodeScanned={onScanned} />
        </Animated.View>

        {last && (
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <GlassCard>
              <ThemedText type="subtitle">Last scanned</ThemedText>
              <ThemedText>ID: {last.id}</ThemedText>
              <ThemedText>Time: {new Date(last.time).toLocaleString()}</ThemedText>
            </GlassCard>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <GlassCard>
            <ThemedText type="subtitle">Recent</ThemedText>
            <View style={{ gap: 8, marginTop: 8 }}>
              {recent.length === 0 ? (
                <ThemedText>No records yet.</ThemedText>
              ) : (
                recent.slice(0, 5).map((r) => (
                  <View key={r.id + r.time}>
                    <ThemedText>ID: {r.id}</ThemedText>
                    <ThemedText>{new Date(r.time).toLocaleString()}</ThemedText>
                  </View>
                ))
              )}
            </View>
          </GlassCard>
        </Animated.View>
      </ThemedView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
});