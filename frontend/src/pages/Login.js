import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/api/token/', form);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password!');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Nepal Issue Reporting</h2>
        <p style={styles.sub}>Sign in to your account</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <button style={styles.btn} type="submit">Login</button>
        </form>
        <p style={styles.link}>
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F5FF' },
  card: { background: '#fff', padding: '2rem', borderRadius: 12, width: 360, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' },
  title: { margin: 0, fontSize: 22, fontWeight: 600, color: '#0F2044' },
  sub: { color: '#64748B', fontSize: 14, marginBottom: 24 },
  input: { width: '100%', padding: '10px 12px', marginBottom: 12, borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', padding: '11px', background: '#1D4ED8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' },
  error: { color: '#DC2626', fontSize: 13, marginBottom: 12 },
  link: { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748B' },
};

export default Login;