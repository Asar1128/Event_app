import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Events() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetch('/api/events', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          router.replace('/login');
          return [];
        }
        if (!res.ok) throw new Error('Failed to load events');
        return res.json();
      })
      .then(setEvents)
      .catch((e) => setError(e.message));
  }, [router]);

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  return (
    <main style={{ maxWidth: 640, margin: '60px auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Upcoming Events</h1>
        <button onClick={logout}>Logout</button>
      </div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {events.map((ev) => (
        <div key={ev.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>{ev.title}</h3>
          <p style={{ margin: '4px 0', color: '#555' }}>{ev.date} · {ev.location}</p>
          <p style={{ margin: 0 }}>{ev.description}</p>
        </div>
      ))}
    </main>
  );
}
