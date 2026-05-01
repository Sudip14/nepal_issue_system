import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StatCards from '../components/StatCards';
import IssueCard from '../components/IssueCard';
import IssueForm from '../components/IssueForm';
import authController from '../controllers/authController';
import issueController from '../controllers/issueController';
import dashboardController from '../controllers/dashboardController';

function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState({ username: '', user_type: 'citizen' });
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadIssues();
    loadStats();
  }, [filterCat, filterStatus]);

  const loadUser = async () => {
    try {
      const data = await authController.getMe();
      setUser(data);
      if (data.user_type === 'admin') navigate('/admin-panel');
      if (data.user_type === 'authority') navigate('/authority');
    } catch { navigate('/login'); }
  };

  const loadIssues = async () => {
    try {
      const data = await issueController.fetchIssues({ category: filterCat, status: filterStatus });
      setIssues(data);
    } catch { navigate('/login'); }
  };

  const loadStats = async () => {
    try {
      const data = await dashboardController.fetchStats();
      setStats(data);
    } catch {}
  };

  const handleVote = async (id) => {
    try {
      await issueController.vote(id);
      loadIssues();
    } catch {}
  };

  const showMsg = (text) => {
    setMsg(text);
    setShowForm(false);
    loadIssues();
    loadStats();
    setTimeout(() => setMsg(''), 4000);
  };

  const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, background: '#fff' };

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F0F5FF' }}>
      <Navbar username={user.username} userType={user.user_type} onReport={() => setShowForm(!showForm)} />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {msg && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {msg}
          </div>
        )}

        <div style={{ background: '#DBEAFE', color: '#1E40AF', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          👤 <b>Citizen View</b> — Report issues and vote. Only authorities can update status.
        </div>

        <StatCards stats={stats} />

        {showForm && <IssueForm onSuccess={showMsg} onCancel={() => setShowForm(false)} />}

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <select style={inp} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">All categories</option>
            {[['road','🛣 Road'],['water','💧 Water'],['power','⚡ Power'],['waste','🗑 Waste'],['drainage','🌊 Drainage'],['sanitation','🚿 Sanitation'],['other','📌 Other']].map(([k,v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select style={inp} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All statuses</option>
            {['pending','under_review','assigned','in_progress','resolved','rejected'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {issues.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B', background: '#fff', borderRadius: 12 }}>
              No issues found. Be the first to report one!
            </div>
          )}
          {issues.map((issue, i) => (
            <IssueCard key={issue.id} issue={issue} index={i} canUpdateStatus={false} onVote={handleVote} onStatusUpdate={() => {}} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;