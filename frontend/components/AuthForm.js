import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isLogin = mode === 'login';

  async function submit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch(`/api/${isLogin ? 'login' : 'register'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setError(data.error || 'Something went wrong');
    if (isLogin) {
      localStorage.setItem('token', data.token);
      router.push('/events');
    } else {
      router.push('/login');
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-brand">
          <span className="brand-mark">E</span>
          <span>Evently</span>
        </div>
        <div className="auth-card">
          <div className="eyebrow">{isLogin ? 'Welcome back' : 'Join the community'}</div>
          <h1>{isLogin ? 'Sign in to Evently' : 'Create your account'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Discover experiences worth showing up for.' : 'Find your next memorable experience.'}
          </p>
          <form onSubmit={submit} className="auth-form">
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="primary-button">{isLogin ? 'Sign in' : 'Create account'} <span>→</span></button>
          </form>
          {error && <p className="form-error">{error}</p>}
          <p className="auth-switch">
            {isLogin ? (
              <>New to Evently? <Link href="/register">Create an account</Link></>
            ) : (
              <>Already have an account? <Link href="/login">Sign in</Link></>
            )}
          </p>
        </div>
      </section>
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />
    </main>
  );
}
