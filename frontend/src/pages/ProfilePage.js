import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import authController from '../controllers/authController';
import API from '../api/axios';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [myIssues, setMyIssues] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadMyIssues();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authController.getMe();
      setUser(data);
      setForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        ward_number: data.ward_number || '',
        district: data.district || 'Kathmandu',
      });
    } catch { navigate('/login'); }
  };

  const loadMyIssues = async () => {
    try {
      const res = await API.get('/api/issues/');
      const all = res.data.results || res.data;
      // Filter issues reported by current user
      const meRes = await API.get('/api/auth/me/');
      const mine = all.filter(i => i.reporter_name === meRes.data.username);
      setMyIssues(mine);
    } catch {}
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await API.patch('/api/auth/me/', form);
      setMsg('✅ Profile updated successfully!');
      setEditing(false);
      loadProfile();
    } catch {
      setMsg('❌ Failed to update profile.');
    }
    setLoading(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const STATUS_COLORS = {
    pending: { bg: '#FEF3C7', color: '#92400E' },
    under_review: { bg: '#DBEAFE', color: '#1E40AF' },
    assigned: { bg: '#EDE9FE', color: '#5B21B6' },
    in_progress: { bg: '#D1FAE5', color: '#065F46' },
    resolved: { bg: '#A7F3D0', color: '#064E3B' },
    rejected: { bg: '#FEE2E2', color: '#991B1B' },
  };

  const inp = {
    padding: '9px 12px', borderRadius: 8,
    border: '1px solid #E2E8F0', fontSize: 13,
    width: '100%', boxSizing: 'border-box', background: '#fff'
  };

  if (!user) return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F0F5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#64748B' }}>Loading profile...</p>
    </div>
  );

  const userBadge = user.user_type === 'admin' ? '👑 Admin' : user.user_type === 'authority' ? '🏛 Authority' : '👤 Citizen';
  const badgeColor = user.user_type === 'admin' ? '#7C3AED' : user.user_type === 'authority' ? '#059669' : '#1D4ED8';

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#F0F5FF' }}>
      <Navbar username={user.username} userType={user.user_type} />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '1.5rem 1rem' }}>

        {msg && (
          <div style={{ background: msg.includes('✅') ? '#D1FAE5' : '#FEE2E2', color: msg.includes('✅') ? '#065F46' : '#991B1B', padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {msg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>

          {/* Left — Avatar & info */}
          <div>
            {/* Avatar card */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '0.5px solid #E2E8F0', textAlign: 'center', marginBottom: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 32 }}>
                {user.user_type === 'admin' ? '👑' : user.user_type === 'authority' ? '🏛' : '👤'}
              </div>
              <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 18, color: '#0F2044' }}>
                {user.first_name || user.username}
              </p>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: '#64748B' }}>@{user.username}</p>
              <span style={{ background: badgeColor, color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                {userBadge}
              </span>
            </div>

            {/* Stats card */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0', marginBottom: 16 }}>
              <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#0F2044', fontSize: 14 }}>My Stats</p>
              {[
                { label: 'Issues Reported', value: myIssues.length, icon: '📋' },
                { label: 'Resolved', value: myIssues.filter(i => i.status === 'resolved').length, icon: '✅' },
                { label: 'Pending', value: myIssues.filter(i => i.status === 'pending').length, icon: '⏳' },
                { label: 'Reputation Score', value: user.reputation_score?.toFixed(1) || '0.0', icon: '⭐' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #F1F5F9' }}>
                  <span style={{ fontSize: 13, color: '#475569' }}>{s.icon} {s.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0F2044' }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Account info */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem', border: '0.5px solid #E2E8F0' }}>
              <p style={{ margin: '0 0 12px', fontWeight: 600, color: '#0F2044', fontSize: 14 }}>Account Info</p>
              {[
                { label: 'Member since', value: new Date(user.date_joined).toLocaleDateString() },
                { label: 'Verified', value: user.is_verified ? '✅ Yes' : '❌ No' },
                { label: 'Ward', value: user.ward_number || 'Not set' },
                { label: 'District', value: user.district || 'Kathmandu' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid #F1F5F9' }}>
                  <span style={{ fontSize: 12, color: '#64748B' }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#0F2044' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Edit form + My issues */}
          <div>
            {/* Edit profile */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '0.5px solid #E2E8F0', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#0F2044', fontSize: 16 }}>Edit Profile</p>
                <button
                  onClick={() => setEditing(!editing)}
                  style={{ background: editing ? '#FEE2E2' : '#F0F5FF', color: editing ? '#991B1B' : '#1D4ED8', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                >
                  {editing ? 'Cancel' : '✏️ Edit'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'first_name', label: 'First Name' },
                  { key: 'last_name', label: 'Last Name' },
                  { key: 'email', label: 'Email' },
                  { key: 'phone_number', label: 'Phone Number' },
                  { key: 'ward_number', label: 'Ward Number' },
                  { key: 'district', label: 'District' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: '#64748B', display: 'block', marginBottom: 4 }}>{f.label}</label>
                    <input
                      style={{ ...inp, background: editing ? '#fff' : '#F8FAFC', cursor: editing ? 'text' : 'not-allowed' }}
                      value={form[f.key] || ''}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      disabled={!editing}
                    />
                  </div>
                ))}
              </div>

              {editing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    style={{ background: '#1D4ED8', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', cursor: 'pointer', fontWeight: 500, fontSize: 14 }}
                  >
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* My reported issues */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '0.5px solid #E2E8F0' }}>
              <p style={{ margin: '0 0 16px', fontWeight: 600, color: '#0F2044', fontSize: 16 }}>
                📋 My Reported Issues ({myIssues.length})
              </p>
              {myIssues.length === 0 && (
                <p style={{ color: '#64748B', fontSize: 13, textAlign: 'center', padding: '2rem 0' }}>
                  You haven't reported any issues yet.
                </p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myIssues.map((issue, i) => {
                  const sta = STATUS_COLORS[issue.status] || STATUS_COLORS.pending;
                  return (
                    <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '0.5px solid #E2E8F0', borderRadius: 10 }}>
                      <span style={{ background: '#F0F5FF', color: '#1D4ED8', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>
                        #{i + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#0F2044' }}>{issue.title}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>
                          Ward {issue.ward_number} · {new Date(issue.created_at).toLocaleDateString()} · Score: {issue.priority_score?.toFixed(1)}
                        </p>
                      </div>
                      <span style={{ background: sta.bg, color: sta.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                        {issue.status?.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 500 }}>▲ {issue.vote_count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;