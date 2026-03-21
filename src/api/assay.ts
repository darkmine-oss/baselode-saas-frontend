import { API_BASE_URL } from './config';
import { supabase } from '../lib/supabase';
import type { StripLogPayload } from '../components/StripLogChart';

async function authedGet(url: string): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return fetch(url, { headers });
}

export async function fetchAssayStripLog(holeId: string): Promise<StripLogPayload> {
  const res = await authedGet(`${API_BASE_URL}/geochemistry/${encodeURIComponent(holeId)}`);
  if (!res.ok) throw new Error(`Geochemistry fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchGeologyStripLog(holeId: string): Promise<StripLogPayload> {
  const res = await authedGet(`${API_BASE_URL}/geology/${encodeURIComponent(holeId)}`);
  if (!res.ok) throw new Error(`Geology fetch failed: ${res.status}`);
  return res.json();
}
