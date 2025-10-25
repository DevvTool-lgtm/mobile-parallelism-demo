import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import GlassCard from '@/components/GlassCard';
import { ThemedText } from '@/components/ThemedText';

type Props = {
  onCodeScanned: (data: string) => void;
};

export default function ScannerViewWeb({ onCodeScanned }: Props) {
  const [value, setValue] = React.useState('');
  return (
    <GlassCard style={styles.card}>
      <ThemedText type="subtitle">Enter ID (web fallback)</ThemedText>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Type or paste ID and press Enter"
        style={styles.input}
        onSubmitEditing={() => {
          if (value.trim()) onCodeScanned(value.trim());
        }}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { width: '100%' },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(127,127,127,0.35)',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
});