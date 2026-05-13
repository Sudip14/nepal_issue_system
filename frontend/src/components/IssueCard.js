import { useState } from 'react';
import Badge from './Badge';
import CommentSection from './CommentSection';

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

function IssueCard({ issue, index, canUpdateStatus, onVote, onStatusUpdate, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const [showGallery, setShowGallery] = useState(false);  // 🆕
  const cat = CAT_COLORS[issue.category] || CAT_COLORS.other;
  const sta = STATUS_COLORS[issue.status] || STATUS_COLORS.pending;

  const commentCount = issue.comment_count || 0;
  const imageCount = issue.image_count || 0;  // 🆕

  // 🆕 Get all images (from gallery array or single image)
  const allImages = issue.gallery || issue.images || [];
  const hasImages = allImages.length > 0 || issue.image;

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

      {/* 🆕 IMAGE GALLERY PREVIEW */}
      {hasImages && (
        <div style={{ marginBottom: 10 }}>
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${Math.min(allImages.length || 1, 4)}, 1fr)`,
              gap: 4,
              borderRadius: 8,
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => setShowGallery(!showGallery)}
          >
            {/* Show first image or gallery images */}
            {allImages.length > 0 ? (
              allImages.slice(0, 4).map((img, idx) => (
                <div key={idx} style={{ position: 'relative', height: 120 }}>
                  <img
                    src={img.image_url || img.image}
                    alt={`Issue ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {idx === 3 && allImages.length > 4 && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 20,
                      fontWeight: 700
                    }}>
                      +{allImages.length - 4}
                    </div>
                  )}
                </div>
              ))
            ) : issue.image ? (
              <img
                src={issue.image.startsWith('http') ? issue.image : `http://127.0.0.1:8000${issue.image}`}
                alt="Issue"
                style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 8 }}
              />
            ) : null}
          </div>

          {/* 🆕 EXPANDED GALLERY */}
          {showGallery && allImages.length > 0 && (
            <div style={{ 
              marginTop: 8, 
              padding: 12, 
              background: '#F8FAFC', 
              borderRadius: 8,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 8
            }}>
              {allImages.map((img, idx) => (
                <div key={idx} style={{ borderRadius: 8, overflow: 'hidden' }}>
                  <img
                    src={img.image_url || img.image}
                    alt={`Gallery ${idx + 1}`}
                    style={{ width: '100%', height: 150, objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => window.open(img.image_url || img.image, '_blank')}
                  />
                  {img.caption && (
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748B', textAlign: 'center' }}>
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>👥 {issue.affected_people_count}</span>
          <span style={{ fontSize: 12, color: '#64748B' }}>📅 {new Date(issue.created_at).toLocaleDateString()}</span>
          <span style={{ fontSize: 12, color: '#64748B' }}>by {issue.reporter_name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* 🆕 IMAGE COUNT BUTTON */}
          {hasImages && (
            <button
              onClick={() => setShowGallery(!showGallery)}
              style={{ 
                background: showGallery ? '#059669' : '#D1FAE5', 
                color: showGallery ? '#fff' : '#065F46', 
                border: '1px solid #059669', 
                borderRadius: 8, 
                padding: '4px 14px', 
                cursor: 'pointer', 
                fontSize: 13, 
                fontWeight: 500 
              }}
            >
              🖼️ {imageCount || 1}
            </button>
          )}

          <button
            onClick={() => setShowComments(!showComments)}
            style={{ 
              background: showComments ? '#1D4ED8' : '#F0F5FF', 
              color: showComments ? '#fff' : '#1D4ED8', 
              border: '1px solid #1D4ED8', 
              borderRadius: 8, 
              padding: '4px 14px', 
              cursor: 'pointer', 
              fontSize: 13, 
              fontWeight: 500 
            }}
          >
            💬 {commentCount}
          </button>

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

      {/* COMMENTS SECTION */}
      {showComments && (
        <div style={{ marginTop: 16, borderTop: '1px solid #E2E8F0', paddingTop: 16 }}>
          <CommentSection issueId={issue.id} currentUser={currentUser} />
        </div>
      )}
    </div>
  );
}

export default IssueCard;