import React from 'react';
import { StyleSheet, View, Pressable, TextInput, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import AnimatedGradientBackground from '@/components/AnimatedGradientBackground';
import GlassCard from '@/components/GlassCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getAdminEmails, getPollResults, getRecentAttendance, getSupabase, isSupabaseConfigured } from '@/utils/supabase';
import { IconSymbol } from '@/components/ui/IconSymbol';

function useAuth() {
  const supa = getSupabase();
  const [email, setEmail] = React.useState<string | null>(null);

  const signIn = async (address: string) => {
    if (!supa) return { ok: false, message: 'Backend not configured' };
    setEmail(address);
    const { error } = await supa.auth.signInWithOtp({ email: address, options: { shouldCreateUser: false } });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  };

  const verify = async (address: string, token: string) => {
    const supa = getSupabase();
    if (!supa) return { ok: false, message: 'Backend not configured' };
    const { data, error } = await supa.auth.verifyOtp({ email: address, token, type: 'email' });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  };

  const signOut = async () => {
    const supa = getSupabase();
    if (!supa) return;
    await supa.auth.signOut();
    setEmail(null);
  };

  const getUserEmail = async () => {
    const supa = getSupabase();
    if (!supa) return null;
    const { data } = await supa.auth.getUser();
    return data.user?.email ?? null;
  };

  return { signIn, verify, signOut, getUserEmail };
}

export default function AdminScreen() {
  const configured = isSupabaseConfigured();
  const { signIn, verify, signOut, getUserEmail } = useAuth();

  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [signedInEmail, setSignedInEmail] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  const [attendance, setAttendance] = React.useState<{ id: string; time: number }[]>([]);
  const [votes, setVotes] = React.useState<{ [idx: number]: number }>({});

  const allowed = React.useMemo(() => {
    if (!signedInEmail) return false;
    const admins = getAdminEmails();
    if (!admins || !admins.length) return true; // if no whitelist set, allow any signed-in user
    return admins.includes(signedInEmail);
  }, [signedInEmail]);

  const refresh = React.useCallback(async () => {
    if (!configured) return;
    const userEmail = await getUserEmail();
    setSignedInEmail(userEmail);
    if (!userEmail) return;
    setAttendance(await getRecentAttendance(1000));
    setVotes(await getPollResults('poll-2025-01'));
  }, [configured]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSignIn = async () => {
    const res = await signIn(email.trim());
    setMsg(res.ok ? 'Check your email for the OTP code.' : res.message || 'Failed to send OTP.');
  };

  const handleVerify = async () => {
    const res = await verify(email.trim(), code.trim());
    if (res.ok) {
      setMsg('Signed in.');
      await refresh();
    } else {
      setMsg(res.message || 'Verification failed.');
    }
  };

  const exportCSV = async () => {
    // Attendance CSV
    const attendanceCSV = ['id,time', ...attendance.map(r => `${JSON.stringify(r.id)},${new Date(r.time).toISOString()}`)].join('\n');
    const votesCSV = ['option,count', ...Object.entries(votes).map(([k,v]) => `${k},${v}`)].join('\n');

    if (Platform.OS === 'web') {
      // create download links
      const linkA = document.createElement('a');
      linkA.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(attendanceCSV);
      linkA.download = 'attendance.csv';
      linkA.click();

      const linkB = document.createElement('a');
      linkB.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(votesCSV);
      linkB.download = 'votes.csv';
      linkB.click();
      setMsg('CSV files downloaded.');
      return;
    }

    const dir = FileSystem.cacheDirectory || FileSystem.documentDirectory!;
    const pathA = dir + 'attendance.csv';
    const pathB = dir + 'votes.csv';
    await FileSystem.writeAsStringAsync(pathA, attendanceCSV, { encoding: FileSystem.EncodingType.UTF8 });
    await FileSystem.writeAsStringAsync(pathB, votesCSV, { encoding: FileSystem.EncodingType.UTF8 });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pathA);
      await Sharing.shareAsync(pathB);
      setMsg('CSV shared.');
    } else {
      setMsg('CSV saved to cache directory.');
    }
  };

  return (
    <AnimatedGradientBackground intensity={0.9}>
      <ThemedView style={styles.container}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <ThemedText type="title">Admin</ThemedText>
        </Animated.View>

        {!configured ? (
          <GlassCard>
            <ThemedText>Backend is not configured. Add Supabase URL and anon key in app.json extra.</ThemedText>
          </GlassCard>
        ) : !signedInEmail ? (
          <>
            <GlassCard>
              <ThemedText type="subtitle">Sign in</ThemedText>
              <ThemedText>Enter your email to receive a one-time code.</ThemedText>
              <View style={{ height: 8 }} />
              <TextInput
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              <View style={{ height: 8 }} />
              <Pressable onPress={handleSignIn} style={styles.btn}>
                <ThemedText type="defaultSemiBold">Send code</ThemedText>
              </Pressable>
            </GlassCard>

            <GlassCard>
              <ThemedText type="subtitle">Verify code</ThemedText>
              <ThemedText>Check your email and paste the code.</ThemedText>
              <View style={{ height: 8 }} />
              <TextInput placeholder="123456" value={code} onChangeText={setCode} keyboardType="number-pad" style={styles.input} />
              <View style={{ height: 8 }} />
              <Pressable onPress={handleVerify} style={styles.btn}>
                <ThemedText type="defaultSemiBold">Verify & Sign in</ThemedText>
              </Pressable>
              {msg ? (
                <>
                  <View style={{ height: 6 }} />
                  <ThemedText>{msg}</ThemedText>
                </>
              ) : null}
            </GlassCard>
          </>
        ) : !allowed ? (
          <GlassCard>
            <ThemedText>Your account does not have admin access.</ThemedText>
            <View style={{ height: 8 }} />
            <Pressable onPress={signOut} style={styles.btn}>
              <ThemedText type="defaultSemiBold">Sign out</ThemedText>
            </Pressable>
          </GlassCard>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <GlassCard>
                <ThemedText type="subtitle">Exports</ThemedText>
                <ThemedText>Download CSV for attendance and votes.</ThemedText>
                <View style={{ height: 8 }} />
                <Pressable onPress={exportCSV} style={styles.btn}>
                  <ThemedText type="defaultSemiBold">Export CSV</ThemedText>
                </Pressable>
                {msg ? (
                  <>
                    <View style={{ height: 6 }} />
                    <ThemedText>{msg}</ThemedText>
                  </>
                ) : null}
              </GlassCard>
            </Animated.View>
          </>
        )}
      </ThemedView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(127,127,127,0.35)',
    borderRadius: 10,
    padding: 10,
  },
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
});