import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout';
import { Modal, SearchBar, EmptyState, StatCard } from '../../components/UI';
import { Check, X, MessageSquare, BedDouble, UtensilsCrossed, Megaphone, Clock, AlertTriangle, Info, Zap } from 'lucide-react';

export function WardenDashboard() {
  const { rooms, complaints, visitors, lateArrivals } = useApp();
  const pendingVisitors = visitors.filter(v => v.status === 'pending').length;
  const openComplaints = complaints.filter(c => c.status !== 'resolved').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <h1>Warden Dashboard</h1>
          <p>Hostel operations overview</p>
        </div>
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <StatCard label="Available Rooms" value={availableRooms} sub={`of ${rooms.length} total`} color="var(--success)" icon={<BedDouble size={18} />} />
          <StatCard label="Pending Visitors" value={pendingVisitors} sub="Awaiting approval" color="var(--warning)" icon={<Clock size={18} />} />
          <StatCard label="Open Complaints" value={openComplaints} sub="Needs attention" color="var(--danger)" icon={<MessageSquare size={18} />} />
          <StatCard label="Late Arrivals" value={lateArrivals.length} sub="This month" color="var(--accent)" />
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="section-title">Pending Visitor Approvals</div>
            {visitors.filter(v => v.status === 'pending').length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>✓ All visitor requests processed</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {visitors.filter(v => v.status === 'pending').map(v => (
                  <div key={v.id} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{v.visitorName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.studentName} · {v.expectedDate}</div>
                    </div>
                    <span className="badge badge-yellow">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card">
            <div className="section-title">Late Arrivals (Recent)</div>
            {lateArrivals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>No late arrivals recorded</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lateArrivals.slice(0, 4).map(l => (
                  <div key={l.id} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{l.studentName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.date} at {l.time}</div>
                    </div>
                    <span className="badge badge-red">Late</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function WardenRooms() {
  const { rooms, addRoom } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ number: '', floor: '', capacity: '', type: 'single' });

  const handleAdd = (e) => {
    e.preventDefault();
    addRoom({ ...form, floor: Number(form.floor), capacity: Number(form.capacity) });
    setShowModal(false);
    setForm({ number: '', floor: '', capacity: '', type: 'single' });
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header flex items-center justify-between">
          <div><h1>Room Management</h1><p>Assign rooms and manage asset inventory</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Room</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Room</th><th>Floor</th><th>Type</th><th>Occupancy</th><th>Status</th><th>Assets</th></tr></thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id}>
                  <td><strong>Room {r.number}</strong></td>
                  <td>{r.floor}</td>
                  <td><span className={`badge badge-${r.type === 'single' ? 'blue' : r.type === 'double' ? 'purple' : 'green'}`}>{r.type}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className="progress-fill" style={{ width: `${(r.occupied / r.capacity) * 100}%`, background: r.occupied === r.capacity ? 'var(--danger)' : 'var(--accent)' }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.occupied}/{r.capacity}</span>
                    </div>
                  </td>
                  <td><span className={`badge badge-${r.status === 'available' ? 'green' : r.status === 'full' ? 'red' : 'yellow'}`}>{r.status}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{r.assets.length} items</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showModal && (
          <Modal title="Add Room" onClose={() => setShowModal(false)}
            footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleAdd}>Add</button></>}>
            <div className="form-grid">
              <div className="input-group"><label>Room Number</label><input className="input" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="e.g. 301" /></div>
              <div className="input-group"><label>Floor</label><input className="input" type="number" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} placeholder="3" /></div>
              <div className="input-group"><label>Capacity</label><input className="input" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="1-3" /></div>
              <div className="input-group"><label>Type</label><select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="single">Single</option><option value="double">Double</option><option value="triple">Triple</option></select></div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}

export function WardenComplaints() {
  const { complaints, updateComplaint } = useApp();
  const [selected, setSelected] = useState(null);
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');

  const handleUpdate = () => {
    updateComplaint(selected.id, { ...(priority && { priority }), ...(status && { status }) });
    setSelected(null); setPriority(''); setStatus('');
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header"><h1>Complaints</h1><p>Manage and resolve student complaints</p></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Student</th><th>Category</th><th>Subject</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{c.id}</td>
                  <td>{c.studentName}</td>
                  <td><span className="badge badge-blue">{c.category}</span></td>
                  <td style={{ maxWidth: 200 }}><span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.subject}</span></td>
                  <td><span className={`badge badge-${c.priority === 'critical' ? 'red' : c.priority === 'high' ? 'yellow' : c.priority === 'medium' ? 'blue' : 'gray'}`}>{c.priority}</span></td>
                  <td><span className={`badge badge-${c.status === 'resolved' ? 'green' : c.status === 'in-progress' ? 'yellow' : 'blue'}`}>{c.status}</span></td>
                  <td><button className="btn btn-sm btn-secondary" onClick={() => { setSelected(c); setPriority(c.priority); setStatus(c.status); }}>Update</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selected && (
          <Modal title={`Update Complaint ${selected.id}`} onClose={() => setSelected(null)}
            footer={<><button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button><button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button></>}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>{selected.subject}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.description}</p>
            </div>
            <div className="form-grid">
              <div className="input-group"><label>Priority</label><select className="input" value={priority} onChange={e => setPriority(e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
              <div className="input-group"><label>Status</label><select className="input" value={status} onChange={e => setStatus(e.target.value)}><option value="received">Received</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option></select></div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}

export function WardenVisitors() {
  const { visitors, updateVisitor } = useApp();

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header"><h1>Visitor Approvals</h1><p>Review and approve visitor requests from students</p></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Visitor</th><th>CNIC</th><th>Student</th><th>Relationship</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {visitors.map(v => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 500 }}>{v.visitorName}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{v.visitorCnic}</td>
                  <td>{v.studentName}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.relationship}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{v.expectedDate}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{v.expectedTime}</td>
                  <td><span className={`badge badge-${v.status === 'approved' ? 'green' : v.status === 'rejected' ? 'red' : 'yellow'}`}>{v.status}</span></td>
                  <td>
                    {v.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-success" onClick={() => updateVisitor(v.id, { status: 'approved' })}><Check size={12} /> Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={() => updateVisitor(v.id, { status: 'rejected' })}><X size={12} /> Reject</button>
                      </div>
                    )}
                    {v.status !== 'pending' && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Processed</span>}
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

export function WardenMess() {
  const { messMenu, updateMessMenu } = useApp();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (day) => {
    const entry = messMenu.find(m => m.day === day);
    setEditing(day);
    setForm({ ...entry });
  };

  const handleSave = () => {
    updateMessMenu(editing, form);
    setEditing(null);
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header"><h1>Mess Management</h1><p>Publish weekly meal menus for students</p></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messMenu.map(m => (
            <div key={m.day} className="card" style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 80px', alignItems: 'center', gap: 16 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>{m.day}</div>
              {['breakfast', 'lunch', 'dinner'].map(meal => (
                <div key={meal}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3 }}>{meal}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m[meal]}</div>
                </div>
              ))}
              <button className="btn btn-sm btn-secondary" onClick={() => startEdit(m.day)}>Edit</button>
            </div>
          ))}
        </div>

        {editing && (
          <Modal title={`Edit ${editing} Menu`} onClose={() => setEditing(null)}
            footer={<><button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>Save</button></>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['breakfast', 'lunch', 'dinner'].map(meal => (
                <div key={meal} className="input-group">
                  <label>{meal.charAt(0).toUpperCase() + meal.slice(1)}</label>
                  <input className="input" value={form[meal] || ''} onChange={e => setForm(f => ({ ...f, [meal]: e.target.value }))} placeholder={`${meal} items...`} />
                </div>
              ))}
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}

export function WardenBroadcast() {
  const { broadcasts, addBroadcast, users } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', urgency: 'info' });
  const students = users.filter(u => u.role === 'student');

  const URGENCY_ICONS = { info: <Info size={16} />, warning: <AlertTriangle size={16} />, critical: <Zap size={16} /> };
  const URGENCY_COLORS = { info: 'var(--accent)', warning: 'var(--warning)', critical: 'var(--danger)' };

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
          <div><h1>Broadcast Notices</h1><p>Send urgent notices to all students</p></div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Megaphone size={13} /> New Broadcast</button>
        </div>
        {broadcasts.length === 0 ? <EmptyState title="No broadcasts yet" desc="Publish your first notice" icon="📢" /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {broadcasts.map(b => (
              <div key={b.id} className="card" style={{ borderLeft: `3px solid ${URGENCY_COLORS[b.urgency]}` }}>
                <div className="flex items-center gap-10" style={{ marginBottom: 8 }}>
                  <span style={{ color: URGENCY_COLORS[b.urgency] }}>{URGENCY_ICONS[b.urgency]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{b.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>By {b.authorName} · {new Date(b.date).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{b.readers.length}/{students.length} read</div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{b.message}</p>
              </div>
            ))}
          </div>
        )}
        {showModal && (
          <Modal title="New Broadcast" onClose={() => setShowModal(false)}
            footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Publish</button></>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group"><label>Urgency</label><select className="input" value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}><option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option></select></div>
              <div className="input-group"><label>Title</label><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Broadcast title..." /></div>
              <div className="input-group"><label>Message</label><textarea className="input" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={4} placeholder="Your message..." /></div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
