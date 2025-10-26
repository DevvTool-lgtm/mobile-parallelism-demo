import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { pushUnique, getJSON, setJSON } from '@/utils/storage';
import { simpleHash } from '@/utils/hash';

type AttendanceRecord = { id: string; time: number };
type PollState = { votes: { [optionIndex: number]: number }; voters: Record<string, true> };

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  const extra = (Constants.expoConfig as any)?.extra ?? {};
  const url = extra.supabaseUrl as string | undefined;
  const key = extra.supabaseAnonKey as string | undefined;
  if (url && key) {
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export function isSupabaseConfigured(): boolean {
  return !!getSupabase();
}

const ATTENDANCE_LOCAL_KEY = 'attendance:records';

export async function recordAttendance(id: string): Promise<void> {
  const time = Date.now();
  // Always store locally
  await pushUnique<AttendanceRecord>(ATTENDANCE_LOCAL_KEY, { id, time });
  // Best-effort remote
  const supa = getSupabase();
  if (supa) {
    try {
      await supa.from('attendance').insert({ id, time: new Date(time).toISOString() });
    } catch {
      // ignore, offline or table missing
    }
  }
}

export async function getRecentAttendance(limit = 20): Promise<AttendanceRecord[]> {
  const supa = getSupabase();
  if (supa) {
    try {
      const { data, error } = await supa
        .from('attendance')
        .select('id,time')
        .order('time', { ascending: false })
        .limit(limit);
      if (!error && data) {
        return data.map((r: any) => ({ id: r.id, time: Date.parse(r.time) }));
      }
    } catch {}
  }
  const local = await getJSON<AttendanceRecord[]>(ATTENDANCE_LOCAL_KEY, []);
  return local.slice(0, limit);
}

export async function submitVote(pollId: string, optionIndex: number, rawId: string): Promise<{ ok: boolean; message?: string }> {
  const supa = getSupabase();
  const voter_hash = simpleHash(rawId);
  if (supa) {
    try {
      const { error } = await supa.from('vote_records').insert({ poll_id: pollId, option: optionIndex, voter_hash });
      if (error) {
        if ((error as any).code === '23505') {
          return { ok: false, message: 'You have already voted in this poll.' };
        }
        // Fallback: treat as offline
      } else {
        return { ok: true };
      }
    } catch {}
  }
  // Offline fallback: local vote cache
  const key = `voting:${pollId}`;
  const state = await getJSON<PollState>(key, { votes: {}, voters: {} });
  if (state.voters[voter_hash]) {
    return { ok: false, message: 'You have already voted in this poll.' };
  }
  state.votes[optionIndex] = (state.votes[optionIndex] || 0) + 1;
  state.voters[voter_hash] = true;
  await setJSON(key, state);
  return { ok: true };
}

export async function getPollResults(pollId: string): Promise<{ [optionIndex: number]: number }> {
  const supa = getSupabase();
  if (supa) {
    try {
      const { data, error } = await supa
        .from('vote_records')
        .select('option')
        .eq('poll_id', pollId);
      if (!error && data) {
        const map: { [idx: number]: number } = {};
        for (const row of data as any[]) {
          const idx = Number(row.option);
          map[idx] = (map[idx] || 0) + 1;
        }
        return map;
      }
    } catch {}
  }
  const key = `voting:${pollId}`;
  const state = await getJSON<PollState>(key, { votes: {}, voters: {} });
  return state.votes;
}

export async function getCurrentUserEmail(): Promise<string | null> {
  const supa = getSupabase();
  if (!supa) return null;
  try {
    const { data } = await supa.auth.getUser();
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

export async function isUserAdmin(): Promise<boolean> {
  const supa = getSupabase();
  if (!supa) return false;
  const email = await getCurrentUserEmail();
  if (!email) return false;
  try {
    const { data, error } = await supa.from('profiles').select('role').eq('email', email).maybeSingle();
    if (!error && data) {
      return data.role === 'admin';
    }
  } catch {}
  return false;
}

export async function listProfiles(): Promise<{ email: string; role: 'user' | 'admin' }[]> {
  const supa = getSupabase();
  if (!supa) return [];
  try {
    const { data, error } = await supa.from('profiles').select('email,role').order('email', { ascending: true });
    if (!error && data) {
      return data as any;
    }
  } catch {}
  return [];
}

export async function setProfileRole(email: string, role: 'user' | 'admin'): Promise<{ ok: boolean; message?: string }> {
  const supa = getSupabase();
  if (!supa) return { ok: false, message: 'Backend not configured' };
  try {
    const { error } = await supa.from('profiles').upsert({ email: email.toLowerCase(), role });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Failed to update role' };
  }
}

export function getBrand() {
  const extra = (Constants.expoConfig as any)?.extra ?? {};
  return extra.brand || {};
}