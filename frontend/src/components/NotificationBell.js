import { useState, useEffect } from 'react';
import API from '../api/axios';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/api/notifications/');
      const data = res.data.results || res.data;
      setNotifications(data);
      setUnread(data.length);
    } catch {}
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(!open); setUnread(0); }}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px 8px', fontSize: 18 }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: '#DC2626', color: '#fff',
            borderRadius: '50%', width: 16, height: 16,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 36,
          width: 320, background: '#fff',
          borderRadius: 12, border: '0.5px solid #E2E8F0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          zIndex: 1000, maxHeight: 400, overflowY: 'auto',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#0F2044' }}>🔔 Notifications</p>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#64748B' }}>✕</button>
          </div>

          {notifications.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: 13 }}>
              No notifications yet
            </div>
          )}

          {notifications.map(n => (
            <div key={n.id} style={{ padding: '12px 16px', borderBottom: '0.5px solid #F1F5F9', background: '#fff' }}>
              <p style={{ margin: '0 0 4px', fontSize: 13, color: '#0F2044', lineHeight: 1.4 }}>
                {n.message}
              </p>
              <p style={{ margin: 0, fontSize: 11, color: '#64748B' }}>
                📱 {n.channel} · {timeAgo(n.created_at)}
              </p>
            </div>
          ))}

          {notifications.length > 0 && (
            <div style={{ padding: '10px 16px', textAlign: 'center' }}>
              <button onClick={fetchNotifications}
                style={{ background: 'none', border: 'none', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;