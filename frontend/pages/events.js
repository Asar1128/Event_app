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
    <main className="events-page">
      <nav className="topbar">
        <div className="brand"><span className="brand-mark">E</span><span>Evently</span></div>
        <div className="topbar-actions"><span className="user-avatar">✦</span><button onClick={logout} className="logout-button">Log out</button></div>
      </nav>
      <section className="events-content">
        <div className="events-heading">
          <div><div className="eyebrow">Curated for you</div><h1>Upcoming events</h1><p>Make plans for something worth remembering.</p></div>
          <div className="event-count">{events.length || 0}<span>events</span></div>
        </div>
        <div className="event-grid">
          {events.map((ev) => (
            <article key={ev.id} className="event-card">
              <div className="event-card-top"><span className="event-date">{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span><span className="event-arrow">↗</span></div>
              <div className="event-icon">✦</div>
              <h3>{ev.title}</h3>
              <p className="event-meta">◷ {ev.date} <span>·</span> {ev.location}</p>
              <p className="event-description">{ev.description}</p>
              <button className="event-link">View details <span>→</span></button>
            </article>
          ))}
        </div>
        {error && <p className="form-error">{error}</p>}
      </section>
    </main>
  );
}
