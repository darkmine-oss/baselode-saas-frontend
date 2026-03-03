import { useState, useRef, useEffect, type FormEvent } from 'react';
import type { ChatMessage } from '../types';
import type { SavedExtent } from '../hooks/useChat';
import styles from './ChatPanel.module.css';

interface ChatPanelProps {
  messages: ChatMessage[];
  streaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  resetChat: () => void;
  savedExtents: SavedExtent[];
}

export function ChatPanel({ messages, streaming, sendMessage, resetChat, savedExtents }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showExtents, setShowExtents] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');
    await sendMessage(text);
  }

  const insertExtent = (extent: SavedExtent) => {
    const extentText = `[Extent: ${extent.name} - N:${extent.bounds.north.toFixed(4)}, S:${extent.bounds.south.toFixed(4)}, E:${extent.bounds.east.toFixed(4)}, W:${extent.bounds.west.toFixed(4)}]`;
    setInput((prev) => prev + (prev ? ' ' : '') + extentText);
    setShowExtents(false);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        Chat
        <button
          className={styles.newChatBtn}
          onClick={resetChat}
          disabled={streaming}
          title="Start a new chat"
        >
          New chat
        </button>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <p className={styles.empty}>No messages yet</p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={styles.message}>
            <span className={styles.messageName}>
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </span>
            <span className={styles.messageContent}>
              {msg.content}
              {streaming && msg.role === 'assistant' && msg === messages[messages.length - 1] && (
                <span className={styles.streamingDot} />
              )}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {savedExtents.length > 0 && (
        <div style={{ padding: '8px', borderTop: '1px solid #e0e0e0' }}>
          <button
            onClick={() => setShowExtents(!showExtents)}
            style={{
              width: '100%',
              padding: '6px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              textAlign: 'left',
            }}
          >
            {showExtents ? '▼' : '▶'} Saved Extents ({savedExtents.length})
          </button>
          {showExtents && (
            <div style={{ marginTop: '8px', maxHeight: '150px', overflowY: 'auto' }}>
              {savedExtents.map((extent) => (
                <div
                  key={extent.id}
                  onClick={() => insertExtent(extent)}
                  style={{
                    padding: '6px 8px',
                    marginBottom: '4px',
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff';
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>{extent.name}</div>
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    N:{extent.bounds.north.toFixed(4)}, S:{extent.bounds.south.toFixed(4)}<br />
                    E:{extent.bounds.east.toFixed(4)}, W:{extent.bounds.west.toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <form className={styles.inputArea} onSubmit={handleSend}>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={streaming}
          />
          <button className={styles.sendBtn} type="submit" disabled={streaming}>
            {streaming ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
