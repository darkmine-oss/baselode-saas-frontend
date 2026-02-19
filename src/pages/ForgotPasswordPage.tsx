import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../api/auth';
import styles from './LoginPage.module.css';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await requestPasswordReset({ email });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.subtitle}>
            We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
          </p>
          <Link to="/login" className={styles.buttonLink}>
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.subtitle}>Enter your email to receive a password reset link</p>

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

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>

        <p className={styles.link}>
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
