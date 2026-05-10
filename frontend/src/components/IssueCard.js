import Badge from './Badge';

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

const SEV_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical' };
const SEV_COLORS = { 1: '#6B7280', 2: '#D97706', 3: '#EF4444', 4: '#7C2D12' };

function IssueCard({ issue, index, canUpdateStatus, onVote, onStatusUpdate }) {
  const cat = CAT_COLORS[issue.category] || CAT_COLORS.other;
  const sta = STATUS_COLORS[issue.status] || STATUS_COLORS.pending;

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', border: '0.5px solid #E2E8F0' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {index !== undefined && (
            <span style={{
              background: index === 0 ? '#D97706' : index === 1 ? '#64748B' : index === 2 ? '#92400E' : '#E2E8F0',
              color: index < 3 ? '#fff' : '#374151',
              borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700
            }}>#{index + 1}</span>
          )}
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#0F2044' }}>{issue.title}</p>
        </div>
        <span style={{ fontSize: 12, color: '#64748B' }}>Ward {issue.ward_number}</span>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <Badge text={cat.label} bg={cat.bg} color={cat.color} />
        <Badge text={issue.status?.replace('_', ' ')} bg={sta.bg} color={sta.color} />
        <Badge text={SEV_LABELS[issue.severity]} bg="#F3F4F6" color={SEV_COLORS[issue.severity]} />
        {issue.priority_score !== undefined && (
          <Badge text={`Score: ${issue.priority_score?.toFixed(1)}`} bg="#F0F5FF" color="#1D4ED8" />
        )}
      </div>

      {/* Address */}
      <p style={{ margin: '0 0 10px', fontSize: 13, color: '#475569' }}>{issue.address}</p>
{/* Issue image */}
{issue.image && (
  <img
    src={issue.image.startsWith('http') ? issue.image : `http://127.0.0.1:8000${issue.image}`}
    alt="Issue"
    style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8, marginBottom: 10, border: '0.5px solid #E2E8F0', cursor: 'pointer' }}
    onClick={() => {
      const url = issue.image.startsWith('http') ? issue.image : `http://127.0.0.1:8000${issue.image}`;
      window.open(url, '_blank');
    }}
  />
)}
      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>👥 {issue.affected_people_count}</span>
          <span style={{ fontSize: 12, color: '#64748B' }}>📅 {new Date(issue.created_at).toLocaleDateString()}</span>
          <span style={{ fontSize: 12, color: '#64748B' }}>by {issue.reporter_name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {canUpdateStatus && (
            <select
              value={issue.status}
              onChange={e => onStatusUpdate(issue.id, e.target.value)}
              style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #1D4ED8', fontSize: 12, cursor: 'pointer', background: '#F0F5FF', color: '#1D4ED8', fontWeight: 500 }}
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
          <button
            onClick={() => onVote(issue.id)}
            style={{ background: issue.has_voted ? '#1D4ED8' : '#F0F5FF', color: issue.has_voted ? '#fff' : '#1D4ED8', border: '1px solid #1D4ED8', borderRadius: 8, padding: '4px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
          >
            ▲ {issue.vote_count}
          </button>
        </div>
      </div>
    </div>
  );
}

export default IssueCard;