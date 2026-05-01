import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe();
    fetchIssues();
    fetchStats();
    fetchHeatmap();
  }, []);

  const fetchMe = async () => {
    try {
      const res = await API.get('/api/auth/me/');
      setUsername(res.data.username);
      if (res.data.user_type !== 'admin') navigate('/dashboard');
    } catch { navigate('/login'); }
  };

  const fetchIssues = async () => {
    try {
      const res = await API.get('/api/issues/');
      setIssues(res.data.results || res.data);
    } catch { navigate('/login'); }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/api/issues/stats/');
      setStats(res.data);
    } catch {}
  };

  const fetchHeatmap = async () => {
    try {
      const res = await API.get('/api/issues/heatmap/');
      setHeatmap(res.data);
    } catch {}
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.patch(`/api/issues/${id}/update_status/`, {
        status: newStatus,
        message: `Status updated to ${newStatus}`,
      });
      setMsg(`✅ Status updated to "${newStatus}"!`);
      fetchIssues();
      fetchStats();
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Failed.'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const maxWard = Math.max(...heatmap.map(w => w.total), 1);

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F8F9FF' }}>

      {/* Navbar */}
      <div style={{ background: '#0F2044', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>👑 Admin Panel — Nepal Issue System</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#93C5FD', fontSize: 13 }}>👑 {username}</span>
          <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer"
            style={{ background: '#7C3AED', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', cursor: 'pointer', fontSize: 13, textDecoration: 'none' }}>
            Django Admin ↗
          </a>
          <button onClick={handleLogout} style={{ background: 'transparent', color: '#93C5FD', border: '1px solid #93C5FD', borderRadius: 8, padding: '6px 16px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {msg && (
          <div style={{ background: msg.includes('✅') ? '#D1FAE5' : '#FEE2E2', color: msg.includes('✅') ? '#065F46' : '#991B1B', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {msg}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Issues', value: stats.total, color: '#0F2044' },
              { label: 'Pending', value: stats.pending, color: '#D97706' },
              { label: 'In Progress', value: stats.in_progress, color: '#1D4ED8' },
              { label: 'Resolved', value: stats.resolved, color: '#059669' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '1rem', textAlign: 'center', border: '0.5px solid #E2E8F0' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>{s.label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 600, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

          {/* Ward Heatmap */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
            <p style={{ margin: '0 0 14px', fontWeight: 600, color: '#0F2044' }}>📊 Ward Heatmap</p>
            {heatmap.length === 0 && <p style={{ color: '#64748B', fontSize: 13 }}>No data yet</p>}
            {heatmap.map(w => (
              <div key={w.ward_number} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#64748B', width: 52 }}>Ward {w.ward_number}</span>
                <div style={{ flex: 1, height: 14, borderRadius: 4, background: `rgba(29,78,216,${0.15 + (w.total / maxWard) * 0.8})` }} />
                <span style={{ fontSize: 12, fontWeight: 500, width: 20 }}>{w.total}</span>
              </div>
            ))}
          </div>

          {/* Category stats */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
            <p style={{ margin: '0 0 14px', fontWeight: 600, color: '#0F2044' }}>📋 Issues by Category</p>
            {stats?.by_category?.map(c => (
              <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid #F1F5F9' }}>
                <span style={{ fontSize: 13, color: '#475569' }}>{c.category}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F2044' }}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* All Issues with priority rank */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
          <p style={{ margin: '0 0 16px', fontWeight: 600, color: '#0F2044' }}>🔥 All Issues — Ranked by Priority</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {issues.map((issue, index) => (
              <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '0.5px solid #E2E8F0', borderRadius: 10 }}>
                <span style={{ background: index === 0 ? '#D97706' : index === 1 ? '#64748B' : index === 2 ? '#92400E' : '#E2E8F0', color: index < 3 ? '#fff' : '#374151', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>
                  #{index + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{issue.title}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>Ward {issue.ward_number} · {issue.reporter_name} · Score: {issue.priority_score?.toFixed(1)}</p>
                </div>
                <select
                  value={issue.status}
                  onChange={e => handleStatusUpdate(issue.id, e.target.value)}
                  style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12, cursor: 'pointer', background: '#F8F9FF', color: '#0F2044' }}
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
