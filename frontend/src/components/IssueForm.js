import { useState } from 'react';
import issueController from '../controllers/issueController';

const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, width: '100%', boxSizing: 'border-box', background: '#fff' };

function IssueForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'road',
    severity: 2, address: '', ward_number: '',
    latitude: '27.7172', longitude: '85.3240',
    affected_people_count: 1,
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await issueController.createIssue(form);
      onSuccess('Issue reported successfully!');
    } catch {
      onSuccess('Failed to submit. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', marginBottom: 24, border: '0.5px solid #E2E8F0' }}>
      <h3 style={{ margin: '0 0 1rem', color: '#0F2044' }}>Report New Issue</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input style={inp} placeholder="Issue title" value={form.title} onChange={e => set('title', e.target.value)} required />
          <select style={inp} value={form.category} onChange={e => set('category', e.target.value)}>
            {[['road','🛣 Road'],['water','💧 Water'],['power','⚡ Power'],['waste','🗑 Waste'],['drainage','🌊 Drainage'],['sanitation','🚿 Sanitation'],['other','📌 Other']].map(([k,v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select style={inp} value={form.severity} onChange={e => set('severity', +e.target.value)}>
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
            <option value={4}>Critical</option>
          </select>
          <input style={inp} placeholder="Ward number" value={form.ward_number} onChange={e => set('ward_number', e.target.value)} required />
          <input style={inp} placeholder="Address / landmark" value={form.address} onChange={e => set('address', e.target.value)} required />
          <input style={inp} type="number" placeholder="Affected people" value={form.affected_people_count} onChange={e => set('affected_people_count', +e.target.value)} min={1} />
        </div>
        <textarea style={{ ...inp, width: '100%', marginTop: 12, resize: 'vertical', boxSizing: 'border-box' }} rows={3}
          placeholder="Describe the issue..." value={form.description} onChange={e => set('description', e.target.value)} required />
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 8, background: '#1D4ED8', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            {loading ? 'Submitting...' : 'Submit Issue'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default IssueForm;