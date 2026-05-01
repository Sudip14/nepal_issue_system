import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', phone_number: '', ward_number: '', district: 'Kathmandu' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/api/auth/register/', form);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Try a different username.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.sub}>Join the Nepal Issue Reporting System</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {[
            { key: 'username', placeholder: 'Username' },
            { key: 'email', placeholder: 'Email' },
            { key: 'password', placeholder: 'Password', type: 'password' },
            { key: 'phone_number', placeholder: 'Phone number' },
            { key: 'ward_number', placeholder: 'Ward number' },
            { key: 'district', placeholder: 'District' },
          ].map(f => (
            <input
              key={f.key}
              style={styles.input}
              type={f.type || 'text'}
              placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            />
          ))}
          <button style={styles.btn} type="submit">Register</button>
        </form>
        <p style={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
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

export default Register;