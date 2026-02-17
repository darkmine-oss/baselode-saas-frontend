import { useState, useRef, useEffect, type FormEvent } from 'react';
import type { ChatMessage } from '../types';
import styles from './ChatPanel.module.css';

interface ChatPanelProps {
  messages: ChatMessage[];
  streaming: boolean;
  sendMessage: (content: string) => Promise<void>;
}

export function ChatPanel({ messages, streaming, sendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('');
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

  return (
    <div className={styles.panel}>
      <div className={styles.header}>Chat</div>

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
