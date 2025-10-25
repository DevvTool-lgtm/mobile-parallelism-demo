import { useState } from 'react';
import { Alert, StyleSheet, TextInput, Pressable, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ResetPasswordScreen() {
  const { resetPassword } = useAuth();
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await resetPassword(email.trim(), password);
      Alert.alert('Success', 'Your password has been reset. You can now sign in.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Please try again');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Reset password</ThemedText>
      <ThemedText>Enter your new password</ThemedText>

      <View style={styles.form}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="New password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <Pressable onPress={onSubmit} disabled={busy} style={[styles.button, busy && { opacity: 0.7 }]}>
          <ThemedText style={styles.buttonLabel}>{busy ? 'Resetting…' : 'Reset password'}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.links}>
        <Link href="/auth/login">Back to sign in</Link>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 16,
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    gap: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors[(useColorScheme() ?? 'light') as 'light' | 'dark'].tint,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
  },
  links: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
});