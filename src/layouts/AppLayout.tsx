import type { ReactNode } from 'react';
import type { ChatMessage } from '../types';
import { Sidebar } from '../components/Sidebar';
import { ChatDataTable } from '../components/ChatDataTable';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children?: ReactNode;
  messages: ChatMessage[];
  streaming: boolean;
  sendMessage: (content: string) => Promise<void>;
}

export function AppLayout({ children, messages, streaming, sendMessage }: AppLayoutProps) {
  const latestAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const dataAttachments = latestAssistant?.data;

  return (
    <div className={styles.layout}>
      <Sidebar messages={messages} streaming={streaming} sendMessage={sendMessage} />
      <main className={styles.main}>
        {children ?? (
          dataAttachments && dataAttachments.length > 0 ? (
            <div className={styles.dataArea}>
              {dataAttachments.map((attachment, i) => (
                <ChatDataTable key={i} type={attachment.type} payload={attachment.payload} />
              ))}
            </div>
          ) : (
            <p className={styles.placeholder}>Data visualization area</p>
          )
        )}
      </main>
    </div>
  );
}
