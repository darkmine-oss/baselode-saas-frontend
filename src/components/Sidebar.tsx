import type { ChatMessage } from '../types';
import { SidebarMenu } from './SidebarMenu';
import { ChatPanel } from './ChatPanel';
import styles from './Sidebar.module.css';

interface SidebarProps {
  messages: ChatMessage[];
  streaming: boolean;
  sendMessage: (content: string) => Promise<void>;
}

export function Sidebar({ messages, streaming, sendMessage }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.menuSection}>
        <SidebarMenu />
      </div>
      <div className={styles.chatSection}>
        <ChatPanel messages={messages} streaming={streaming} sendMessage={sendMessage} />
      </div>
    </aside>
  );
}
