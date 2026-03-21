import type { ReactNode } from 'react';
import { SidebarMenu } from '../components/SidebarMenu';
import styles from './PageShell.module.css';

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.menuSection}>
          <SidebarMenu />
        </div>
      </aside>
      <div className={styles.content}>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
