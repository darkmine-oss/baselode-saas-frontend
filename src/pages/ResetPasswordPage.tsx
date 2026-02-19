import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { supabase } from '../lib/supabase';
import styles from './LoginPage.module.css';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    // Check if we have a valid session (from the reset token)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidToken(true);
      } else {
        setError('Invalid or expired reset link. Please request a new one.');
      }
      setCheckingToken(false);
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await resetPassword({ password });
      // Sign out after password reset
      await supabase.auth.signOut();
      navigate('/login', { state: { message: 'Password reset successful. Please sign in with your new password.' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  if (checkingToken) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.subtitle}>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invalid reset link</h1>
          <p className={styles.error}>{error}</p>
          <button 
            className={`${styles.button} ${styles.buttonSpacing}`}
            onClick={() => navigate('/forgot-password')}
          >
            Request new reset link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Create new password</h1>
        <p className={styles.subtitle}>Enter your new password below</p>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">New password</label>
          <input
            id="password"
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            minLength={6}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            className={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            minLength={6}
          />
        </div>

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}
