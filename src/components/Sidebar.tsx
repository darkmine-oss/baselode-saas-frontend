import type { ChatMessage } from '../types';
import type { SavedExtent } from '../hooks/useChat';
import { SidebarMenu } from './SidebarMenu';
import { ChatPanel } from './ChatPanel';
import styles from './Sidebar.module.css';

interface SidebarProps {
  messages: ChatMessage[];
  streaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  savedExtents: SavedExtent[];
}

export function Sidebar({ messages, streaming, sendMessage, savedExtents }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.menuSection}>
        <SidebarMenu />
      </div>
      <div className={styles.chatSection}>
        <ChatPanel 
          messages={messages} 
          streaming={streaming} 
          sendMessage={sendMessage}
          savedExtents={savedExtents}
        />
      </div>
    </aside>
  );
}
