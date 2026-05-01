import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  under_review: { bg: '#DBEAFE', color: '#1E40AF' },
  assigned: { bg: '#EDE9FE', color: '#5B21B6' },
  in_progress: { bg: '#D1FAE5', color: '#065F46' },
  resolved: { bg: '#A7F3D0', color: '#064E3B' },
  rejected: { bg: '#FEE2E2', color: '#991B1B' },
};

function AuthorityDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe();
    fetchIssues();
    fetchStats();
  }, [filterStatus]);

  const fetchMe = async () => {
    try {
      const res = await API.get('/api/auth/me/');
      setUsername(res.data.username);
      if (res.data.user_type === 'citizen') navigate('/dashboard');
    } catch { navigate('/login'); }
  };

  const fetchIssues = async () => {
    try {
      let url = '/api/issues/?';
      if (filterStatus !== 'all') url += `status=${filterStatus}&`;
      const res = await API.get(url);
      setIssues(res.data.results || res.data);
    } catch { navigate('/login'); }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/api/issues/stats/');
      setStats(res.data);
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
    } catch { setMsg('❌ Failed to update status.'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F0FFF4' }}>

      {/* Navbar */}
      <div style={{ background: '#065F46', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>🏛 Authority Dashboard</span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#6EE7B7', fontSize: 13 }}>👤 {username}</span>
          <button onClick={handleLogout} style={{ background: 'transparent', color: '#6EE7B7', border: '1px solid #6EE7B7', borderRadius: 8, padding: '6px 16px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {msg && (
          <div style={{ background: msg.includes('✅') ? '#D1FAE5' : '#FEE2E2', color: msg.includes('✅') ? '#065F46' : '#991B1B', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {msg}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total', value: stats.total, color: '#065F46' },
              { label: 'Pending', value: stats.pending, color: '#D97706' },
              { label: 'In Progress', value: stats.in_progress, color: '#1D4ED8' },
              { label: 'Resolved', value: stats.resolved, color: '#059669' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '1rem', textAlign: 'center', border: '0.5px solid #D1FAE5' }}>
                <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>{s.label}</p>
                <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 600, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div style={{ marginBottom: 16 }}>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #D1FAE5', fontSize: 13, background: '#fff' }}>
            <option value="all">All statuses</option>
            {Object.entries(STATUS_COLORS).map(([k]) => (
              <option key={k} value={k}>{k.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        {/* Issues */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {issues.map((issue, index) => {
            const sta = STATUS_COLORS[issue.status] || STATUS_COLORS.pending;
            return (
              <div key={issue.id} style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', border: '0.5px solid #D1FAE5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* Priority rank number */}
                    <span style={{ background: '#065F46', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>
                      #{index + 1}
                    </span>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#0F2044' }}>{issue.title}</p>
                  </div>
                  <span style={{ fontSize: 12, color: '#64748B' }}>Ward {issue.ward_number}</span>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span style={{ background: sta.bg, color: sta.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                    {issue.status?.replace('_', ' ')}
                  </span>
                  <span style={{ background: '#F3F4F6', color: '#374151', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                    Priority: {issue.priority_score?.toFixed(1)}
                  </span>
                  <span style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                    ▲ {issue.vote_count} votes
                  </span>
                </div>

                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#475569' }}>{issue.address}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#64748B' }}>👥 {issue.affected_people_count} affected · by {issue.reporter_name}</span>
                  <select
                    value={issue.status}
                    onChange={e => handleStatusUpdate(issue.id, e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #059669', fontSize: 12, cursor: 'pointer', background: '#F0FFF4', color: '#065F46', fontWeight: 500 }}
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AuthorityDashboard;