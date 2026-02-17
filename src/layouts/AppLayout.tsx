import type { ChatMessage } from '../types';
import { Sidebar } from '../components/Sidebar';
import { ChatDataTable } from '../components/ChatDataTable';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  messages: ChatMessage[];
  streaming: boolean;
  sendMessage: (content: string) => Promise<void>;
}

function getLatestAssistantMessage(messages: ChatMessage[]): ChatMessage | undefined {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'assistant') {
      return messages[index];
    }
  }
  return undefined;
}

export function AppLayout({ messages, streaming, sendMessage }: AppLayoutProps) {
  const latestAssistant = getLatestAssistantMessage(messages);
  const dataAttachments = latestAssistant?.data;

  return (
    <div className={styles.layout}>
      <Sidebar messages={messages} streaming={streaming} sendMessage={sendMessage} />
      <main className={styles.main}>
        {dataAttachments && dataAttachments.length > 0 ? (
          <div className={styles.dataArea}>
            {dataAttachments.map((attachment, i) => (
              <ChatDataTable key={i} type={attachment.type} payload={attachment.payload} />
            ))}
          </div>
        ) : (
          <p className={styles.placeholder}>Data visualization area</p>
        )}
      </main>
    </div>
  );
}
