import { useState } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
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
        <button
          className={styles.toggleButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </aside>
      {isCollapsed && (
        <button
          className={styles.showButton}
          onClick={() => setIsCollapsed(false)}
          aria-label="Show sidebar"
        >
          →
        </button>
      )}
    </>
  );
}
