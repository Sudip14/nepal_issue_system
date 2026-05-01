import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const CAT_COLORS = {
  road: { bg: '#FEF3C7', color: '#92400E', label: '🛣 Road' },
  water: { bg: '#DBEAFE', color: '#1E40AF', label: '💧 Water' },
  power: { bg: '#EDE9FE', color: '#5B21B6', label: '⚡ Power' },
  waste: { bg: '#D1FAE5', color: '#065F46', label: '🗑 Waste' },
  drainage: { bg: '#CFFAFE', color: '#0E7490', label: '🌊 Drainage' },
  sanitation: { bg: '#FCE7F3', color: '#9D174D', label: '🚿 Sanitation' },
  other: { bg: '#F3F4F6', color: '#374151', label: '📌 Other' },
};

const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  under_review: { bg: '#DBEAFE', color: '#1E40AF' },
  assigned: { bg: '#EDE9FE', color: '#5B21B6' },
  in_progress: { bg: '#D1FAE5', color: '#065F46' },
  resolved: { bg: '#A7F3D0', color: '#064E3B' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
};

function Badge({ text, bg, color }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
      {text}
    </span>
  );
}

function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({
    title: '', description: '', category: 'road',
    severity: 2, address: '', ward_number: '',
    latitude: '27.7172', longitude: '85.3240',
    affected_people_count: 1,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
    fetchStats();
  }, [filterCat, filterStatus]);

  const fetchIssues = async () => {
    try {
      let url = '/api/issues/?';
      if (filterCat !== 'all') url += `category=${filterCat}&`;
      if (filterStatus !== 'all') url += `status=${filterStatus}&`;
      const res = await API.get(url);
      setIssues(res.data.results || res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/api/issues/stats/');
      setStats(res.data);
    } catch (err) {}
  };

  const handleVote = async (id) => {
    try {
      await API.post(`/api/issues/${id}/vote/`);
      fetchIssues();
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/issues/', form);
      setMsg('Issue reported successfully!');
      setShowForm(false);
      setForm({ title: '', description: '', category: 'road', severity: 2, address: '', ward_number: '', latitude: '27.7172', longitude: '85.3240', affected_people_count: 1 });
      fetchIssues();
      fetchStats();
    } catch (err) {
      setMsg('Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F0F5FF' }}>

      {/* Navbar */}
      <div style={{ background: '#0F2044', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>🇳🇵 Nepal Issue Reporting</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowForm(!showForm)} style={{ background: '#1D4ED8', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', cursor: 'pointer', fontWeight: 500 }}>
            + Report Issue
          </button>
          <button onClick={handleLogout} style={{ background: 'transparent', color: '#93C5FD', border: '1px solid #93C5FD', borderRadius: 8, padding: '6px 16px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Success message */}
        {msg && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {msg} <span style={{ cursor: 'pointer', float: 'right' }} onClick={() => setMsg('')}>✕</span>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total', value: stats.total, color: '#0F2044' },
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

        {/* Report Form */}
        {showForm && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', marginBottom: 24, border: '0.5px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#0F2044' }}>Report New Issue</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input style={inp} placeholder="Issue title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                <select style={inp} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {Object.entries(CAT_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select style={inp} value={form.severity} onChange={e => setForm({ ...form, severity: +e.target.value })}>
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                  <option value={4}>Critical</option>
                </select>
                <input style={inp} placeholder="Ward number" value={form.ward_number} onChange={e => setForm({ ...form, ward_number: e.target.value })} required />
                <input style={inp} placeholder="Address / landmark" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required />
                <input style={inp} type="number" placeholder="Affected people" value={form.affected_people_count} onChange={e => setForm({ ...form, affected_people_count: +e.target.value })} min={1} />
              </div>
              <textarea style={{ ...inp, width: '100%', marginTop: 12, resize: 'vertical', boxSizing: 'border-box' }} rows={3} placeholder="Describe the issue..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer', background: '#fff' }}>Cancel</button>
                <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 8, background: '#1D4ED8', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                  {loading ? 'Submitting...' : 'Submit Issue'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <select style={inp} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">All categories</option>
            {Object.entries(CAT_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select style={inp} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {Object.entries(STATUS_COLORS).map(([k]) => <option key={k} value={k}>{k.replace('_', ' ')}</option>)}
          </select>
        </div>

        {/* Issue list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {issues.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B', background: '#fff', borderRadius: 12 }}>
              No issues found. Be the first to report one!
            </div>
          )}
          {issues.map(issue => {
            const cat = CAT_COLORS[issue.category] || CAT_COLORS.other;
            const sta = STATUS_COLORS[issue.status] || STATUS_COLORS.pending;
            const sevLabels = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
            const sevColors = { 1: '#6B7280', 2: '#D97706', 3: '#EF4444', 4: '#7C2D12' };
            return (
              <div key={issue.id} style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', border: '0.5px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#0F2044' }}>{issue.title}</p>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Ward {issue.ward_number}</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  <Badge text={cat.label} bg={cat.bg} color={cat.color} />
                  <Badge text={issue.status?.replace('_', ' ')} bg={sta.bg} color={sta.color} />
                  <Badge text={sevLabels[issue.severity]} bg="#F3F4F6" color={sevColors[issue.severity]} />
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#475569' }}>{issue.address}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <span style={{ fontSize: 12, color: '#64748B' }}>👥 {issue.affected_people_count} affected</span>
                    <span style={{ fontSize: 12, color: '#64748B' }}>📅 {new Date(issue.created_at).toLocaleDateString()}</span>
                    <span style={{ fontSize: 12, color: '#64748B' }}>reported by {issue.reporter_name}</span>
                  </div>
                  <button onClick={() => handleVote(issue.id)} style={{ background: issue.has_voted ? '#1D4ED8' : '#F0F5FF', color: issue.has_voted ? '#fff' : '#1D4ED8', border: '1px solid #1D4ED8', borderRadius: 8, padding: '4px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                    ▲ {issue.vote_count}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, width: '100%', boxSizing: 'border-box', background: '#fff' };

export default Dashboard;