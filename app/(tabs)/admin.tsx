import React from 'react';
import { StyleSheet, View, Pressable, TextInput, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import AnimatedGradientBackground from '@/components/AnimatedGradientBackground';
import GlassCard from '@/components/GlassCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import {
  getPollResults,
  getRecentAttendance,
  getSupabase,
  isSupabaseConfigured,
  isUserAdmin,
  listProfiles,
  setProfileRole,
} from '@/utils/supabase';
import LiveBarChart from '@/components/LiveBarChart';

function useAuth() {
  const supa = getSupabase();
  const [email, setEmail] = React.useState<string | null>(null);

  const signIn = async (address: string) => {
    if (!supa) return { ok: false, message: 'Backend not configured' };
    setEmail(address);
    const { error } = await supa.auth.signInWithOtp({ email: address, options: { shouldCreateUser: true } });
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

  return { signIn, verify, signOut };
}

export default function AdminScreen() {
  const configured = isSupabaseConfigured();
  const { signIn, verify, signOut } = useAuth();

  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [signedIn, setSignedIn] = React.useState<boolean>(false);
  const [allowed, setAllowed] = React.useState<boolean>(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const [attendance, setAttendance] = React.useState<{ id: string; time: number }[]>([]);
  const [votes, setVotes] = React.useState<{ [idx: number]: number }>({});
  const [profiles, setProfiles] = React.useState<{ email: string; role: 'user' | 'admin' }[]>([]);
  const [roleEmail, setRoleEmail] = React.useState('');
  const [roleValue, setRoleValue] = React.useState<'user' | 'admin'>('user');

  const refreshData = React.useCallback(async () => {
    if (!configured) return;
    setAttendance(await getRecentAttendance(1000));
    setVotes(await getPollResults('poll-2025-01'));
    setProfiles(await listProfiles());
  }, [configured]);

  const refreshAuth = React.useCallback(async () => {
    if (!configured) return;
    try {
      const supa = getSupabase();
      if (!supa) return;
      const { data } = await supa.auth.getUser();
      const hasUser = !!data.user;
      setSignedIn(hasUser);
      setAllowed(hasUser ? await isUserAdmin() : false);
    } catch {
      setSignedIn(false);
      setAllowed(false);
    }
  }, [configured]);

  React.useEffect(() => {
    refreshAuth();
    refreshData();
  }, [refreshAuth, refreshData]);

  const handleSignIn = async () => {
    const res = await signIn(email.trim());
    setMsg(res.ok ? 'Check your email for the OTP code.' : res.message || 'Failed to send OTP.');
  };

  const handleVerify = async () => {
    const res = await verify(email.trim(), code.trim());
    if (res.ok) {
      setMsg('Signed in.');
      await refreshAuth();
      await refreshData();
    } else {
      setMsg(res.message || 'Verification failed.');
    }
  };

  const exportCSV = async () => {
    const attendanceCSV = ['id,time', ...attendance.map(r => `${JSON.stringify(r.id)},${new Date(r.time).toISOString()}`)].join('\n');
    const votesCSV = ['option,count', ...Object.entries(votes).map(([k,v]) => `${k},${v}`)].join('\n');

    if (Platform.OS === 'web') {
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

  // Aggregations for charts
  const voteLabels = ['0', '1', '2'];
  const voteValues = voteLabels.map((_, i) => votes[i] || 0);

  const days = 7;
  const now = Date.now();
  const dayMillis = 24 * 3600 * 1000;
  const attendanceBuckets = Array.from({ length: days }, (_, i) => {
    const start = new Date(now - (days - 1 - i) * dayMillis);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + dayMillis);
    const count = attendance.filter(a => a.time >= start.getTime() && a.time < end.getTime()).length;
    return { label: `${start.getMonth() + 1}/${start.getDate()}`, count };
  });

  const handleRoleUpdate = async () => {
    const res = await setProfileRole(roleEmail.trim().toLowerCase(), roleValue);
    setMsg(res.ok ? 'Role updated.' : res.message || 'Failed to update role.');
    await refreshData();
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
        ) : !signedIn ? (
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
            <Animated.View entering={FadeInDown.delay(130).springify()}>
              <GlassCard>
                <ThemedText type="subtitle">Live dashboard</ThemedText>
                <View style={{ height: 8 }} />
                <LiveBarChart
                  title="Votes (by option)"
                  labels={voteLabels}
                  values={voteValues}
                />
                <View style={{ height: 16 }} />
                <LiveBarChart
                  title="Attendance (last 7 days)"
                  labels={attendanceBuckets.map(b => b.label)}
                  values={attendanceBuckets.map(b => b.count)}
                />
              </GlassCard>
            </Animated.View>

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

            <Animated.View entering={FadeInDown.delay(180).springify()}>
              <GlassCard>
                <ThemedText type="subtitle">Role management</ThemedText>
                <ThemedText>Assign admin role by email. Only admins can modify roles.</ThemedText>
                <View style={{ height: 8 }} />
                <TextInput
                  placeholder="user@example.com"
                  value={roleEmail}
                  onChangeText={setRoleEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
                <View style={{ height: 8 }} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable onPress={() => setRoleValue('user')} style={[styles.btn, roleValue === 'user' && styles.btnActive]}>
                    <ThemedText type="defaultSemiBold">User</ThemedText>
                  </Pressable>
                  <Pressable onPress={() => setRoleValue('admin')} style={[styles.btn, roleValue === 'admin' && styles.btnActive]}>
                    <ThemedText type="defaultSemiBold">Admin</ThemedText>
                  </Pressable>
                </View>
                <View style={{ height: 8 }} />
                <Pressable onPress={handleRoleUpdate} style={styles.btn}>
                  <ThemedText type="defaultSemiBold">Upsert role</ThemedText>
                </Pressable>

                <View style={{ height: 12 }} />
                <ThemedText type="subtitle">Profiles</ThemedText>
                <View style={{ height: 6 }} />
                {profiles.length === 0 ? (
                  <ThemedText>No profiles found.</ThemedText>
                ) : (
                  profiles.map((p) => (
                    <View key={p.email} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <ThemedText>{p.email}</ThemedText>
                      <ThemedText type="defaultSemiBold">{p.role.toUpperCase()}</ThemedText>
                    </View>
                  ))
                )}
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
  btnActive: {
    backgroundColor: 'rgba(10, 126, 164, 0.2)',
  },
});