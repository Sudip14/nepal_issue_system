function StatCards({ stats, accentColor = '#0F2044' }) {
  if (!stats) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
      {[
        { label: 'Total', value: stats.total, color: accentColor },
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
  );
}

export default StatCards;