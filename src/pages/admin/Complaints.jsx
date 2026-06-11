import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout';
import { Modal, SearchBar, EmptyState } from '../../components/UI';
import { Eye } from 'lucide-react';

const PRIORITY_BADGE = { critical: 'badge-red', high: 'badge-yellow', medium: 'badge-blue', low: 'badge-gray' };
const STATUS_BADGE = { received: 'badge-blue', 'in-progress': 'badge-yellow', resolved: 'badge-green' };

export default function AdminComplaints() {
  const { complaints, updateComplaint } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = complaints.filter(c => {
    const ms = c.studentName.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search);
    const mf = filter === 'all' || c.status === filter;
    return ms && mf;
  });

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <h1>Complaint Management</h1>
          <p>Audit all hostel complaints and monitor resolution timelines</p>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total', value: complaints.length, color: 'var(--accent)' },
            { label: 'Received', value: complaints.filter(c => c.status === 'received').length, color: 'var(--accent)' },
            { label: 'In Progress', value: complaints.filter(c => c.status === 'in-progress').length, color: 'var(--warning)' },
            { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, color: 'var(--success)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--accent-color': s.color }}>
              <span className="label">{s.label}</span>
              <span className="value">{s.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between" style={{ marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search complaints..." />
          <div className="flex gap-2">
            {['all', 'received', 'in-progress', 'resolved'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}>{f.replace('-', ' ')}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? <EmptyState title="No complaints found" desc="Try adjusting your filters" icon="📋" /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Student</th><th>Category</th><th>Subject</th><th>Priority</th><th>Status</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{c.id}</span></td>
                    <td style={{ fontWeight: 500 }}>{c.studentName}</td>
                    <td><span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{c.category}</span></td>
                    <td><span style={{ maxWidth: 180, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.subject}</span></td>
                    <td><span className={`badge ${PRIORITY_BADGE[c.priority]}`}>{c.priority}</span></td>
                    <td><span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.date}</td>
                    <td><button className="btn-icon" onClick={() => setSelected(c)}><Eye size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <Modal title={`Complaint ${selected.id}`} onClose={() => setSelected(null)}
            footer={<button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{selected.studentName} · {selected.date}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{selected.subject}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selected.description}</p>
              </div>
              <div className="flex gap-2">
                <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{selected.category}</span>
                <span className={`badge ${PRIORITY_BADGE[selected.priority]}`}>{selected.priority} priority</span>
                <span className={`badge ${STATUS_BADGE[selected.status]}`}>{selected.status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last updated: {selected.updatedAt}</div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
