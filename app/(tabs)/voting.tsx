import React from 'react';
import { StyleSheet, View, Pressable, Modal } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import AnimatedGradientBackground from '@/components/AnimatedGradientBackground';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import GlassCard from '@/components/GlassCard';
import ScannerView from '@/components/ScannerView';
import { getJSON, setJSON } from '@/utils/storage';
import { simpleHash } from '@/utils/hash';

type Poll = {
  id: string;
  question: string;
  options: string[];
};

type Votes = {
  [optionIndex: number]: number;
};

type PollState = {
  votes: Votes;
  voters: Record<string, true>; // hashedId -> true
};

const POLL: Poll = {
  id: 'poll-2025-01',
  question: 'Which theme preset should be default?',
  options: ['Default', 'AMOLED', 'High Contrast'],
};

const STORAGE_KEY = (pollId: string) => `voting:${pollId}`;

export default function VotingScreen() {
  const [state, setState] = React.useState<PollState>({ votes: {}, voters: {} });
  const [modalVisible, setModalVisible] = React.useState(false);
  const [pendingOption, setPendingOption] = React.useState<number | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const data = await getJSON<PollState>(STORAGE_KEY(POLL.id), { votes: {}, voters: {} });
    setState(data);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openScanner = (optionIndex: number) => {
    setPendingOption(optionIndex);
    setModalVisible(true);
  };

  const onScanned = async (idRaw: string) => {
    setModalVisible(false);

    const hashed = simpleHash(idRaw);
    const already = state.voters[hashed];
    if (already) {
      setMessage('You have already voted in this poll.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (pendingOption == null) return;

    const next: PollState = {
      votes: { ...state.votes, [pendingOption]: (state.votes[pendingOption] || 0) + 1 },
      voters: { ...state.voters, [hashed]: true },
    };

    await setJSON(STORAGE_KEY(POLL.id), next);
    setState(next);
    setPendingOption(null);
    setMessage('Vote submitted. Thank you!');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setMessage(null), 2500);
  };

  const total = Object.values(state.votes).reduce((a, b) => a + b, 0) || 0;

  return (
    <AnimatedGradientBackground intensity={0.9}>
      <ThemedView style={styles.container}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText type="title">Voting</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <GlassCard>
            <ThemedText type="subtitle">{POLL.question}</ThemedText>
            <View style={{ height: 12 }} />
            <View style={{ gap: 10 }}>
              {POLL.options.map((opt, i) => {
                const count = state.votes[i] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <GlassCard key={i} style={styles.optionCard} onPress={() => openScanner(i)}>
                    <ThemedText type="defaultSemiBold">{opt}</ThemedText>
                    <ThemedText>
                      {count} vote{count === 1 ? '' : 's'} ({pct}%)
                    </ThemedText>
                  </GlassCard>
                );
              })}
            </View>
            <View style={{ height: 8 }} />
            <ThemedText>Total votes: {total}</ThemedText>
            {message ? (
              <>
                <View style={{ height: 6 }} />
                <ThemedText>{message}</ThemedText>
              </>
            ) : null}
          </GlassCard>
        </Animated.View>

        <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <AnimatedGradientBackground intensity={1}>
            <ThemedView style={styles.modalContainer}>
              <ThemedText type="title">Verify ID</ThemedText>
              <View style={{ height: 12 }} />
              <ScannerView onCodeScanned={onScanned} />
              <View style={{ height: 12 }} />
              <Pressable onPress={() => setModalVisible(false)} style={styles.btn}>
                <ThemedText type="defaultSemiBold">Cancel</ThemedText>
              </Pressable>
            </ThemedView>
          </AnimatedGradientBackground>
        </Modal>
      </ThemedView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  optionCard: { padding: 12, marginBottom: 4 },
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
  modalContainer: { flex: 1, padding: 24, gap: 12 },
});