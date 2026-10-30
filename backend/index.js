const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: 5432,
  user: process.env.DB_USER || 'events',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'events',
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Hardcoded events
const EVENTS = [
  { id: 1, title: 'Tech Meetup', date: '2026-11-15', location: 'Lahore', description: 'Monthly meetup for developers.' },
  { id: 2, title: 'DevOps Workshop', date: '2026-11-22', location: 'Islamabad', description: 'Hands-on CI/CD and Kubernetes.' },
  { id: 3, title: 'Startup Pitch Night', date: '2026-12-05', location: 'Karachi', description: 'Founders pitch to local investors.' },
  { id: 4, title: 'Open Source Day', date: '2026-12-12', location: 'Online', description: 'Contribute to open source together.' },
];

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Email and password (min 6 chars) required' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [email.toLowerCase(), hash]);
    res.status(201).json({ message: 'Registered' });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const { rows } = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/events', auth, (req, res) => res.json(EVENTS));

async function init() {
  for (let i = 0; i < 30; i++) {
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      )`);
      return;
    } catch (e) {
      console.log('Waiting for database...', e.message);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error('Database not reachable, exiting');
  process.exit(1);
}

init().then(() => app.listen(4000, () => console.log('Backend listening on 4000')));
