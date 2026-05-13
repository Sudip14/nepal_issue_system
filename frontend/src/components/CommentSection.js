import { useState, useEffect } from 'react';
import API from '../api/axios';

const avatarColors = ['#1D4ED8', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777'];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function Avatar({ name, size = 32 }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const bg = getAvatarColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.4, flexShrink: 0
    }}>
      {initial}
    </div>
  );
}

function timeAgo(dateString) {
  if (!dateString) return 'just now';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CommentItem({ comment, currentUser, onReply, depth = 0 }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    await onReply(comment.id, replyText.trim());
    setReplyText('');
    setShowReply(false);
    setSubmitting(false);
  };

  const isOfficial = comment.user_role === 'authority' || comment.user_role === 'admin' || comment.user_role === 'super_admin';

  return (
    <div style={{ marginLeft: depth > 0 ? 48 : 0, marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar name={comment.user_name} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#1E293B' }}>
              {comment.user_name || 'Anonymous'}
            </span>
            {isOfficial && (
              <span style={{
                background: '#DBEAFE', color: '#1D4ED8', fontSize: 11,
                padding: '2px 8px', borderRadius: 12, fontWeight: 600
              }}>
                ✓ Official
              </span>
            )}
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{comment.time_ago || timeAgo(comment.created_at)}</span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {comment.content}
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button
              onClick={() => setShowReply(!showReply)}
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', fontWeight: 500, padding: 0 }}
            >
              💬 Reply
            </button>
          </div>

          {showReply && (
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <Avatar name={currentUser?.username || 'You'} size={28} />
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: '1px solid #E2E8F0', fontSize: 13
                  }}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowReply(false)}
                    style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || submitting}
                    style={{
                      padding: '6px 14px', borderRadius: 6, background: '#1D4ED8',
                      color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer',
                      opacity: !replyText.trim() || submitting ? 0.6 : 1
                    }}
                  >
                    {submitting ? 'Posting...' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ issueId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get(`/api/issues/${issueId}/comments/`);

      // 🆕 DEBUG: Log the full response
      console.log('Full API response:', res);
      console.log('Response data:', res.data);

      // 🆕 Handle DRF paginated response (results array) or direct array
      let commentData = [];
      if (Array.isArray(res.data)) {
        commentData = res.data;
      } else if (res.data && Array.isArray(res.data.results)) {
        commentData = res.data.results;
      } else if (res.data && res.data.comments) {
        commentData = res.data.comments;
      }

      console.log('Parsed comments:', commentData);
      setComments(commentData);
    } catch (err) {
      console.error('Failed to load comments:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.detail || err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (issueId) {
      fetchComments();
    }
  }, [issueId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await API.post(`/api/issues/${issueId}/add_comment/`, {
        content: newComment.trim()
      });
      console.log('Comment posted:', res.data);
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Failed to post comment:', err);
      console.error('Error response:', err.response?.data);
      console.error('Status:', err.response?.status);
      alert('Failed to post comment. Error: ' + (err.response?.data?.error || err.response?.data?.detail || err.message));
    }
    setSubmitting(false);
  };

  const handleReply = async (parentId, content) => {
    try {
      const res = await API.post(`/api/issues/${issueId}/add_comment/`, {
        content,
        parent_id: parentId
      });
      console.log('Reply posted:', res.data);
      fetchComments();
    } catch (err) {
      console.error('Failed to post reply:', err);
      alert('Failed to post reply. Error: ' + (err.response?.data?.error || err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>
        Loading comments...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#DC2626', background: '#FEF2F2', borderRadius: 8 }}>
        <p style={{ margin: 0, fontSize: 14 }}>❌ Error: {error}</p>
        <button 
          onClick={fetchComments}
          style={{ marginTop: 10, padding: '6px 14px', borderRadius: 6, background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', border: '0.5px solid #E2E8F0', marginTop: 16 }}>
      <h3 style={{ margin: '0 0 1rem', color: '#0F2044', fontSize: 18 }}>
        💬 Comments ({comments.length})
      </h3>

      {/* New comment input */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <Avatar name={currentUser?.username || 'You'} />
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Type your comment here..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              fontSize: 14,
              outline: 'none'
            }}
            onKeyPress={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>
              {currentUser?.username ? `Posting as ${currentUser.username}` : 'Posting as guest'}
            </span>
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || submitting}
              style={{
                padding: '8px 20px', borderRadius: 8, background: '#1D4ED8',
                color: '#fff', border: 'none', fontSize: 14, cursor: 'pointer',
                fontWeight: 500, opacity: !newComment.trim() || submitting ? 0.6 : 1
              }}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94A3B8' }}>
            <p style={{ fontSize: 14, margin: 0 }}>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onReply={handleReply}
            />
          ))
        )}
      </div>
    </div>
  );
}