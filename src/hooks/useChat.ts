import { useState, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import * as chatApi from '../api/chat';

let nextId = 0;

export interface SavedExtent {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  geometry: GeoJSON.Feature;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const instanceIdRef = useRef<string | null>(null);
  const [savedExtents, setSavedExtents] = useState<SavedExtent[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = {
      id: String(++nextId),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    const assistantMsgId = String(++nextId);
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    try {
      let response: Response;

      if (!instanceIdRef.current) {
        response = await chatApi.createChat(content);
      } else {
        response = await chatApi.sendMessage(instanceIdRef.current, content);
      }

      await chatApi.streamResponse(
        response,
        (text) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: text } : m)),
          );
        },
        (instance) => {
          instanceIdRef.current = instance.id;
        },
        (payload) => {
          const type = typeof payload.type === 'string' ? payload.type : 'unknown';
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, data: [...(m.data ?? []), { type, payload }] }
                : m,
            ),
          );
        },
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: `Error: ${err instanceof Error ? err.message : 'Request failed'}` }
            : m,
        ),
      );
    } finally {
      setStreaming(false);
    }
  }, []);

  const addExtent = useCallback((extent: SavedExtent) => {
    setSavedExtents((prev) => [...prev, extent]);
    
    // Save to API (mocked)
    if (instanceIdRef.current) {
      chatApi.saveData(instanceIdRef.current, extent.name, extent)
        .catch((err) => {
          console.error('Failed to save extent:', err);
        });
    }
  }, []);

  return { 
    messages, 
    streaming, 
    sendMessage, 
    savedExtents, 
    addExtent,
    chatInstanceId: instanceIdRef.current,
  };
}
