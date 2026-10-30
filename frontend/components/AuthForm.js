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
    <main style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{isLogin ? 'Login' : 'Create account'}</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <p>
        {isLogin ? (
          <>No account? <Link href="/register">Register</Link></>
        ) : (
          <>Have an account? <Link href="/login">Login</Link></>
        )}
      </p>
    </main>
  );
}
