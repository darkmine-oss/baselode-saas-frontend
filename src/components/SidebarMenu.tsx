import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './SidebarMenu.module.css';

const navItems = [{ to: '/dashboard', label: 'Dashboard' }];

function getNavLinkClassName(isActive: boolean): string {
  return `${styles.link} ${isActive ? styles.active : ''}`;
}

export function SidebarMenu() {
  const { logout } = useAuth();

  return (
    <nav className={styles.nav}>
      {navItems.map(({ to, label }) => (
        <NavLink key={to} to={to} className={({ isActive }) => getNavLinkClassName(isActive)}>
          {label}
        </NavLink>
      ))}
      <button className={styles.logoutBtn} onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
