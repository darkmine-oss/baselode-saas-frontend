import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './SidebarMenu.module.css';

export function SidebarMenu() {
  const { logout } = useAuth();

  return (
    <nav className={styles.nav}>
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.active : ''}`
        }
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.active : ''}`
        }
      >
        Profile
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `${styles.link} ${isActive ? styles.active : ''}`
        }
      >
        Settings
      </NavLink>
      <button className={styles.logoutBtn} onClick={logout}>
        Logout
      </button>
    </nav>
  );
}
