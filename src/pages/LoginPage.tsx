import { useState, type FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const successMessage = (location.state as { message?: string })?.message;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Enter your credentials to continue</p>

        {successMessage && (
          <p className={styles.error} style={{ color: '#16a34a', background: 'rgba(22, 163, 74, 0.08)', borderColor: 'rgba(22, 163, 74, 0.2)' }}>
            {successMessage}
          </p>
        )}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">Password</label>
          <input
            id="password"
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        <p className={styles.link} style={{ textAlign: 'right', marginTop: '0', marginBottom: '0' }}>
          <Link to="/forgot-password">Forgot password?</Link>
        </p>

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className={styles.link}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}
