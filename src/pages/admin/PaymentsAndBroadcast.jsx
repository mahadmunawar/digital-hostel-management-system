import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout';
import { SearchBar, EmptyState, Modal } from '../../components/UI';
import { Download, Megaphone, AlertTriangle, Info, Zap } from 'lucide-react';

export function AdminPayments() {
  const { payments, users, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = payments.filter(p => {
    const ms = p.studentName.toLowerCase().includes(search.toLowerCase()) || (p.receipt || '').includes(search);
    const mf = filter === 'all' || p.status === filter;
    return ms && mf;
  });

  const totalCollected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <h1>Payment Management</h1>
          <p>Monitor hostel fee payments and generate financial reports</p>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Collected', value: `Rs. ${totalCollected.toLocaleString()}`, color: 'var(--success)' },
            { label: 'Outstanding', value: `Rs. ${totalPending.toLocaleString()}`, color: 'var(--danger)' },
            { label: 'Paid', value: payments.filter(p => p.status === 'paid').length, color: 'var(--accent)' },
            { label: 'Overdue', value: payments.filter(p => p.status === 'overdue').length, color: 'var(--warning)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--accent-color': s.color }}>
              <span className="label">{s.label}</span>
              <span className="value" style={{ fontSize: typeof s.value === 'string' ? 20 : 32 }}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between" style={{ marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or receipt..." />
          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'overdue'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead><tr><th>Receipt</th><th>Student</th><th>Month</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{p.receipt || '—'}</span></td>
                  <td style={{ fontWeight: 500 }}>{p.studentName}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{p.month}</td>
                  <td><span style={{ fontWeight: 600 }}>Rs. {p.amount.toLocaleString()}</span></td>
                  <td>
                    <span className={`badge ${p.status === 'paid' ? 'badge-green' : p.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>{p.status}</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.date || 'Not paid'}</td>
                  <td>
                    {p.status === 'paid' ? (
                      <button className="btn btn-sm btn-secondary" onClick={() => showToast(`Receipt ${p.receipt} downloaded`, 'success')}>
                        <Download size={12} /> Receipt
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-danger" onClick={() => showToast('Reminder sent to student', 'info')}>
                        Remind
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}

const URGENCY_ICONS = { info: <Info size={18} />, warning: <AlertTriangle size={18} />, critical: <Zap size={18} /> };
const URGENCY_COLORS = { info: 'var(--accent)', warning: 'var(--warning)', critical: 'var(--danger)' };

export function AdminBroadcast() {
  const { broadcasts, addBroadcast, users } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', urgency: 'info' });

  const students = users.filter(u => u.role === 'student');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return;
    addBroadcast(form);
    setShowModal(false);
    setForm({ title: '', message: '', urgency: 'info' });
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1>Emergency Broadcast</h1>
            <p>Send instant notices to all student dashboards</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Megaphone size={14} /> New Broadcast
          </button>
        </div>

        {broadcasts.length === 0 ? <EmptyState title="No broadcasts yet" desc="Create your first broadcast to notify all students" icon="📢" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {broadcasts.map(b => (
              <div key={b.id} className="card" style={{ borderLeft: `3px solid ${URGENCY_COLORS[b.urgency]}` }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                  <div className="flex items-center gap-10">
                    <span style={{ color: URGENCY_COLORS[b.urgency] }}>{URGENCY_ICONS[b.urgency]}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{b.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        By {b.authorName} · {new Date(b.date).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge badge-${b.urgency === 'info' ? 'blue' : b.urgency === 'warning' ? 'yellow' : 'red'}`}>{b.urgency}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.readers.length}/{students.length} read</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{b.message}</p>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <Modal title="Compose Broadcast" onClose={() => setShowModal(false)}
            footer={<>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}><Megaphone size={13} /> Publish Broadcast</button>
            </>}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label>Urgency Level *</label>
                <select className="input" value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
                  <option value="info">ℹ️ Info — General announcement</option>
                  <option value="warning">⚠️ Warning — Action may be needed</option>
                  <option value="critical">🚨 Critical — Urgent attention required</option>
                </select>
              </div>
              <div className="input-group">
                <label>Title *</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Water Outage Notice" required />
              </div>
              <div className="input-group">
                <label>Message *</label>
                <textarea className="input" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Write your message here..." rows={4} required />
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                📣 This broadcast will be sent to <strong style={{ color: 'var(--text-primary)' }}>{students.length} students</strong> immediately.
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
