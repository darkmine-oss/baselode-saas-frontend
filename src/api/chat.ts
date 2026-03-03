import type { ChatInstance } from '../types';
import { API_BASE_URL } from './config';
import { supabase } from '../lib/supabase';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export class AuthError extends Error {
  constructor(message = 'Session expired. Please log in again.') {
    super(message);
    this.name = 'AuthError';
  }
}

async function authedFetch(url: string, init: RequestInit): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { ...JSON_HEADERS };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) throw new AuthError();
  return res;
}

function parseSSELine(line: string): { field: string; value: string } | null {
  const trimmed = line.replace(/\r$/, '');
  if (!trimmed || trimmed.startsWith(':')) return null;
  const colonIdx = trimmed.indexOf(':');
  if (colonIdx === -1) return { field: trimmed, value: '' };
  const field = trimmed.slice(0, colonIdx);
  let value = trimmed.slice(colonIdx + 1);
  if (value.startsWith(' ')) value = value.slice(1);
  return { field, value };
}

export async function streamResponse(
  response: Response,
  onChunk: (text: string) => void,
  onInstance?: (instance: ChatInstance) => void,
  onData?: (payload: Record<string, unknown>) => void,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';
  let currentEvent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const rawLine of lines) {
      const parsed = parseSSELine(rawLine);
      if (!parsed) continue;

      if (parsed.field === 'event') {
        currentEvent = parsed.value;
        continue;
      }

      if (parsed.field === 'data') {
        const data = parsed.value;
        if (data === '[DONE]') {
          currentEvent = '';
          continue;
        }

        const json = JSON.parse(data.replace(/\bNaN\b/g, 'null'));
        if (currentEvent === 'instance' && onInstance) {
          onInstance(json as ChatInstance);
        } else if (currentEvent === 'data' && onData) {
          onData(json as Record<string, unknown>);
        } else {
          full += json.text;
          onChunk(full);
        }
        currentEvent = '';
      }
    }
  }

  return full;
}

export async function createChat(message: string): Promise<Response> {
  const res = await authedFetch(`${API_BASE_URL}/chat/`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Chat creation failed: ${res.status}`);
  return res;
}

export async function sendMessage(instanceId: string, message: string): Promise<Response> {
  const res = await authedFetch(`${API_BASE_URL}/chat/${instanceId}`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Send message failed: ${res.status}`);
  return res;
}

export async function saveData(
  chatId: string,
  name: string,
  shape: unknown,
): Promise<void> {
  const res = await authedFetch(`${API_BASE_URL}/save_data`, {
    method: 'POST',
    body: JSON.stringify({ chatId, name, shape }),
  });
  if (!res.ok) throw new Error(`Save data failed: ${res.status}`);
}
