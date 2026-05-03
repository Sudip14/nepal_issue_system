import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
import authController from '../controllers/authController';
import dashboardController from '../controllers/dashboardController';
import issueController from '../controllers/issueController';
import API from '../api/axios';

const COLORS = ['#1D4ED8', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0E7490'];

function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const me = await authController.getMe();
      setUsername(me.username);
      if (me.user_type !== 'admin') navigate('/dashboard');

      const [s, h, i] = await Promise.all([
        dashboardController.fetchStats(),
        dashboardController.fetchHeatmap(),
        dashboardController.fetchIssues({}),
      ]);
      setStats(s);
      setHeatmap(h);
      setIssues(i);
    } catch { navigate('/login'); }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await issueController.updateStatus(id, newStatus);
      setMsg(`✅ Status updated to "${newStatus}"!`);
      const i = await dashboardController.fetchIssues({});
      setIssues(i);
      const s = await dashboardController.fetchStats();
      setStats(s);
      setTimeout(() => setMsg(''), 3000);
    } catch { setMsg('❌ Failed.'); }
  };

  const handleLogout = () => authController.logout(navigate);

  // Chart data
  const categoryData = stats?.by_category?.map(c => ({
    name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    count: c.count,
  })) || [];

  const severityData = stats?.by_severity?.map(s => ({
    name: s.severity === 1 ? 'Low' : s.severity === 2 ? 'Medium' : s.severity === 3 ? 'High' : 'Critical',
    count: s.count,
  })) || [];

  const statusData = stats ? [
    { name: 'Pending', value: stats.pending, color: '#D97706' },
    { name: 'Under Review', value: stats.under_review || 0, color: '#1D4ED8' },
    { name: 'In Progress', value: stats.in_progress, color: '#059669' },
    { name: 'Resolved', value: stats.resolved, color: '#064E3B' },
    { name: 'Assigned', value: stats.assigned || 0, color: '#7C3AED' },
  ].filter(d => d.value > 0) : [];

  const wardData = heatmap.map(w => ({
    name: `W${w.ward_number}`,
    total: w.total,
    resolved: w.resolved,
    pending: w.pending,
  }));

  const maxWard = Math.max(...heatmap.map(w => w.total), 1);

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'charts', label: '📈 Charts' },
    { id: 'issues', label: '🔥 Issues' },
    { id: 'heatmap', label: '🗺 Heatmap' },
  ];

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F8F9FF' }}>
      <Navbar username={username} userType="admin" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {msg && (
          <div style={{ background: msg.includes('✅') ? '#D1FAE5' : '#FEE2E2', color: msg.includes('✅') ? '#065F46' : '#991B1B', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '0.5px solid #E2E8F0', marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '10px 20px', fontSize: 13, cursor: 'pointer',
              background: 'none', border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #1D4ED8' : '2px solid transparent',
              color: activeTab === t.id ? '#1D4ED8' : '#64748B',
              fontWeight: activeTab === t.id ? 600 : 400,
              marginBottom: -1,
            }}>{t.label}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <StatCards stats={stats} accentColor="#0F2044" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 8 }}>

              {/* Status Pie Chart */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 16px', fontWeight: 600, color: '#0F2044' }}>Issues by Status</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Bar Chart */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 16px', fontWeight: 600, color: '#0F2044' }}>Issues by Category</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Ward bar chart */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
              <p style={{ margin: '0 0 16px', fontWeight: 600, color: '#0F2044' }}>Issues per Ward — Pending vs Resolved</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={wardData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pending" name="Pending" fill="#D97706" radius={[4,4,0,0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#059669" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Severity pie */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 16px', fontWeight: 600, color: '#0F2044' }}>Issues by Severity</p>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="count" label={({ name }) => name}>
                      {severityData.map((_, i) => <Cell key={i} fill={['#6B7280','#D97706','#EF4444','#DC2626'][i]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Priority scores */}
              <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
                <p style={{ margin: '0 0 16px', fontWeight: 600, color: '#0F2044' }}>Top Issues by Priority Score</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={[...issues].sort((a,b) => b.priority_score - a.priority_score).slice(0,5).map(i => ({
                    name: i.title.length > 12 ? i.title.substring(0,12)+'...' : i.title,
                    score: parseFloat(i.priority_score?.toFixed(1)),
                  }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" fontSize={11} />
                    <YAxis dataKey="name" type="category" fontSize={10} width={80} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#1D4ED8" radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
            <p style={{ margin: '0 0 16px', fontWeight: 600, color: '#0F2044' }}>🔥 All Issues — Ranked by Priority</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {issues.map((issue, index) => (
                <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '0.5px solid #E2E8F0', borderRadius: 10 }}>
                  <span style={{
                    background: index === 0 ? '#D97706' : index === 1 ? '#64748B' : index === 2 ? '#92400E' : '#E2E8F0',
                    color: index < 3 ? '#fff' : '#374151',
                    borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700, minWidth: 28, textAlign: 'center'
                  }}>#{index + 1}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>{issue.title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>
                      Ward {issue.ward_number} · {issue.reporter_name} · Score: {issue.priority_score?.toFixed(1)} · ▲ {issue.vote_count}
                    </p>
                  </div>
                  <select
                    value={issue.status}
                    onChange={e => handleStatusUpdate(issue.id, e.target.value)}
                    style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12, cursor: 'pointer', background: '#F8F9FF', color: '#0F2044' }}
                  >
                    {['pending','under_review','assigned','in_progress','resolved','rejected'].map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Heatmap Tab */}
        {activeTab === 'heatmap' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
              <p style={{ margin: '0 0 14px', fontWeight: 600, color: '#0F2044' }}>📊 Ward Heatmap</p>
              {heatmap.map(w => (
                <div key={w.ward_number} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#64748B', width: 55 }}>Ward {w.ward_number}</span>
                  <div style={{ flex: 1, height: 18, borderRadius: 4, background: `rgba(29,78,216,${0.15 + (w.total / maxWard) * 0.8})`, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                    <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{w.total} issue{w.total !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
              <p style={{ margin: '0 0 14px', fontWeight: 600, color: '#0F2044' }}>📋 Issues by Category</p>
              {stats?.by_category?.map(c => (
                <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #F1F5F9' }}>
                  <span style={{ fontSize: 13, color: '#475569', textTransform: 'capitalize' }}>{c.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: Math.max(c.count * 30, 20), height: 8, borderRadius: 4, background: '#1D4ED8' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0F2044' }}>{c.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;