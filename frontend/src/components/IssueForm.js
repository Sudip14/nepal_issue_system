import { useState } from 'react';
import API from '../api/axios';

const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, width: '100%', boxSizing: 'border-box', background: '#fff' };

function IssueForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'road',
    severity: 2, address: '', ward_number: '',
    latitude: '27.7172', longitude: '85.3240',
    affected_people_count: 1,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (image) formData.append('image', image);
      await API.post('/api/issues/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess('Issue reported successfully!');
      setImage(null);
      setPreview(null);
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

        <textarea
          style={{ ...inp, width: '100%', marginTop: 12, resize: 'vertical', boxSizing: 'border-box' }}
          rows={3} placeholder="Describe the issue..."
          value={form.description} onChange={e => set('description', e.target.value)} required
        />

        {/* Image upload */}
        <div style={{ marginTop: 12, padding: '12px', border: '1px dashed #CBD5E1', borderRadius: 8, background: '#F8FAFC' }}>
          <label style={{ fontSize: 12, color: '#64748B', display: 'block', marginBottom: 8, fontWeight: 500 }}>
            📸 Attach photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files[0];
              if (file) {
                setImage(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
            style={{ fontSize: 13, color: '#475569' }}
          />
          {preview && (
            <div style={{ marginTop: 10, position: 'relative', display: 'inline-block', width: '100%' }}>
              <img
                src={preview} alt="Preview"
                style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '0.5px solid #E2E8F0' }}
              />
              <button
                type="button"
                onClick={() => { setImage(null); setPreview(null); }}
                style={{ position: 'absolute', top: 6, right: 6, background: '#DC2626', color: '#fff', border: 'none', borderRadius: '50%', width: 26, height: 26, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
              >✕</button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer', background: '#fff' }}>Cancel</button>
          <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 8, background: '#1D4ED8', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            {loading ? 'Submitting...' : '📤 Submit Issue'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default IssueForm;