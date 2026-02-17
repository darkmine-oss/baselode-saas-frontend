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

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();
  const serialized = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`);
  return `{${serialized.join(',')}}`;
}

function getAttachmentBaseKey(type: string, payload: unknown): string {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const objectPayload = payload as Record<string, unknown>;
    const identifier = objectPayload.id ?? objectPayload.uuid ?? objectPayload.hole_id;
    if (typeof identifier === 'string' || typeof identifier === 'number') {
      return `${type}:${String(identifier)}`;
    }
  }

  return `${type}:${stableStringify(payload)}`;
}

export function AppLayout({ messages, streaming, sendMessage }: AppLayoutProps) {
  const latestAssistant = getLatestAssistantMessage(messages);
  const dataAttachments = latestAssistant?.data;
  const attachmentKeyCounts = new Map<string, number>();

  return (
    <div className={styles.layout}>
      <Sidebar messages={messages} streaming={streaming} sendMessage={sendMessage} />
      <main className={styles.main}>
        {dataAttachments && dataAttachments.length > 0 ? (
          <div className={styles.dataArea}>
            {dataAttachments.map((attachment) => {
              const baseKey = getAttachmentBaseKey(attachment.type, attachment.payload);
              const seenCount = attachmentKeyCounts.get(baseKey) ?? 0;
              attachmentKeyCounts.set(baseKey, seenCount + 1);
              const key = seenCount === 0 ? baseKey : `${baseKey}:${seenCount}`;

              return <ChatDataTable key={key} type={attachment.type} payload={attachment.payload} />;
            })}
          </div>
        ) : (
          <p className={styles.placeholder}>Data visualization area</p>
        )}
      </main>
    </div>
  );
}
