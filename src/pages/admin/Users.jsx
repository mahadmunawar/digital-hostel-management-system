import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout';
import { Modal, SearchBar, Avatar, StatusBadge } from '../../components/UI';
import { Plus, Trash2, Shield, UserCog } from 'lucide-react';

export default function AdminUsers() {
  const { users, addUser, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'warden', cnic: '', phone: '' });

  const ROLE_COLORS = { admin: '#ff4d6d', warden: '#7c5cfc', guard: '#f5a623', student: '#22d3a5' };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || u.role === filter;
    return matchSearch && matchFilter;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { showToast('Please fill all required fields', 'error'); return; }
    addUser({ ...form });
    setShowModal(false);
    setForm({ name: '', email: '', password: '', role: 'warden', cnic: '', phone: '' });
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1>User Management</h1>
            <p>Manage all system accounts and access roles</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add Account
          </button>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {['admin', 'warden', 'guard', 'student'].map(role => (
            <div key={role} className="card" style={{ borderLeft: `2px solid ${ROLE_COLORS[role]}`, paddingLeft: 18 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{role}s</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: ROLE_COLORS[role] }}>{users.filter(u => u.role === role).length}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between" style={{ marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
          <div className="flex gap-2">
            {['all', 'admin', 'warden', 'guard', 'student'].map(r => (
              <button key={r} onClick={() => setFilter(r)}
                className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}>{r}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th><th>Email</th><th>Role</th><th>CNIC</th><th>Phone</th><th>Student ID</th><th>Room</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} color={ROLE_COLORS[u.role]} size={32} />
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className="badge" style={{ background: `${ROLE_COLORS[u.role]}18`, color: ROLE_COLORS[u.role] }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{u.cnic || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.phone || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent)' }}>{u.studentId || '—'}</td>
                  <td>{u.room ? <span className="badge badge-blue">{u.room}</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add User Modal */}
        {showModal && (
          <Modal title="Create New Account" onClose={() => setShowModal(false)}
            footer={<>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Create Account</button>
            </>}
          >
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group span-2">
                  <label>Full Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Muhammad Ali" required />
                </div>
                <div className="input-group">
                  <label>Email *</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@dhms.edu" required />
                </div>
                <div className="input-group">
                  <label>Password *</label>
                  <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimum 8 chars" required />
                </div>
                <div className="input-group">
                  <label>Role *</label>
                  <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="warden">Warden</option>
                    <option value="guard">Security Guard</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>CNIC</label>
                  <input className="input" value={form.cnic} onChange={e => setForm(f => ({ ...f, cnic: e.target.value }))} placeholder="XXXXX-XXXXXXX-X" />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0300-XXXXXXX" />
                </div>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
