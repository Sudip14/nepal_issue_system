import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IssueMap from '../components/IssueMap';
import Navbar from '../components/Navbar';
import authController from '../controllers/authController';
import issueController from '../controllers/issueController';

function MapPage() {
  const [issues, setIssues] = useState([]);
  const [user, setUser] = useState({ username: '', user_type: 'citizen' });
  const [filterCat, setFilterCat] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    loadIssues();
  }, [filterCat]);

  const loadUser = async () => {
    try {
      const data = await authController.getMe();
      setUser(data);
    } catch { navigate('/login'); }
  };

  const loadIssues = async () => {
    try {
      const data = await issueController.fetchIssues({ category: filterCat });
      setIssues(data);
    } catch {}
  };

  const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, background: '#fff' };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F0F5FF' }}>
      <Navbar username={user.username} userType={user.user_type} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: '#0F2044', fontSize: 20 }}>🗺 Issue Map — Kathmandu</h2>
          <select style={inp} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">All categories</option>
            {[['road','🛣 Road'],['water','💧 Water'],['power','⚡ Power'],['waste','🗑 Waste'],['drainage','🌊 Drainage'],['sanitation','🚿 Sanitation'],['other','📌 Other']].map(([k,v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['#6B7280','Low'],['#D97706','Medium'],['#EF4444','High'],['#DC2626','Critical']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 12, color: '#475569' }}>{label}</span>
            </div>
          ))}
        </div>

        <IssueMap issues={issues} />

        {/* Issue count */}
        <p style={{ margin: '12px 0 0', fontSize: 13, color: '#64748B', textAlign: 'center' }}>
          Showing {issues.filter(i => i.latitude && i.longitude).length} issues on map
        </p>
      </div>
    </div>
  );
}

export default MapPage;