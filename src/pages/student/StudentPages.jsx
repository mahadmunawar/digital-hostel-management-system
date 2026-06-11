import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout';
import { Modal, StatCard, EmptyState } from '../../components/UI';
import { Plus, MessageSquare, UserCheck, CreditCard, Bell, AlertTriangle, Info, Zap, Download, BedDouble, UtensilsCrossed, X } from 'lucide-react';

/* ─── STUDENT DASHBOARD ─── */
export function StudentDashboard() {
  const { currentUser, complaints, visitors, payments, broadcasts, markBroadcastRead } = useApp();

  const myComplaints = complaints.filter(c => c.studentId === currentUser.id);
  const myVisitors = visitors.filter(v => v.studentId === currentUser.id);
  const myPayments = payments.filter(p => p.studentId === currentUser.id);
  const unreadBroadcasts = broadcasts.filter(b => !b.readers.includes(currentUser.id));

  const URGENCY_COLORS = { info: 'var(--accent)', warning: 'var(--warning)', critical: 'var(--danger)' };
  const URGENCY_ICONS = { info: <Info size={16} />, warning: <AlertTriangle size={16} />, critical: <Zap size={16} /> };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <h1>Welcome, {currentUser.name.split(' ')[0]} 👋</h1>
          <p>Student ID: {currentUser.studentId} · Room {currentUser.room} · FAST-NUCES Karachi</p>
        </div>

        {/* Unread broadcasts */}
        {unreadBroadcasts.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div className="section-title">📣 Unread Notices</div>
            {unreadBroadcasts.map(b => (
              <div key={b.id} className={`broadcast-banner ${b.urgency}`} style={{ marginBottom: 8 }}>
                <span style={{ color: URGENCY_COLORS[b.urgency], marginTop: 1 }}>{URGENCY_ICONS[b.urgency]}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{b.title}</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{b.message}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>By {b.authorName} · {new Date(b.date).toLocaleString()}</div>
                </div>
                <button className="btn-icon" onClick={() => markBroadcastRead(b.id)}><X size={13} /></button>
              </div>
            ))}
          </div>
        )}

        <div className="grid-4" style={{ marginBottom: 24 }}>
          <StatCard label="My Room" value={`#${currentUser.room}`} sub="Current assignment" color="var(--accent)" icon={<BedDouble size={18} />} />
          <StatCard label="My Complaints" value={myComplaints.length} sub={`${myComplaints.filter(c => c.status === 'resolved').length} resolved`} color="var(--warning)" icon={<MessageSquare size={18} />} />
          <StatCard label="Visitor Requests" value={myVisitors.length} sub={`${myVisitors.filter(v => v.status === 'approved').length} approved`} color="var(--success)" icon={<UserCheck size={18} />} />
          <StatCard label="Fee Status" value={myPayments.some(p => p.status === 'overdue') ? 'Overdue' : 'Clear'} sub="March 2026" color={myPayments.some(p => p.status === 'overdue') ? 'var(--danger)' : 'var(--success)'} icon={<CreditCard size={18} />} />
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="section-title">My Recent Complaints</div>
            {myComplaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>No complaints submitted</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myComplaints.slice(0, 3).map(c => (
                  <div key={c.id} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.subject}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.date}</div>
                    </div>
                    <span className={`badge badge-${c.status === 'resolved' ? 'green' : c.status === 'in-progress' ? 'yellow' : 'blue'}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card">
            <div className="section-title">My Visitor Requests</div>
            {myVisitors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>No visitor requests</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myVisitors.slice(0, 3).map(v => (
                  <div key={v.id} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{v.visitorName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.relationship} · {v.expectedDate}</div>
                    </div>
                    <span className={`badge badge-${v.status === 'approved' ? 'green' : v.status === 'rejected' ? 'red' : 'yellow'}`}>{v.status}</span>
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

/* ─── STUDENT COMPLAINTS ─── */
export function StudentComplaints() {
  const { currentUser, complaints, addComplaint } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: 'maintenance', subject: '', description: '', priority: 'medium' });

  const myComplaints = complaints.filter(c => c.studentId === currentUser.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.subject || !form.description) return;
    addComplaint(form);
    setShowModal(false);
    setForm({ category: 'maintenance', subject: '', description: '', priority: 'medium' });
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1>My Complaints</h1>
            <p>Submit and track your hostel complaints</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> New Complaint</button>
        </div>

        <div className="grid-3" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total', value: myComplaints.length, color: 'var(--accent)' },
            { label: 'In Progress', value: myComplaints.filter(c => c.status === 'in-progress').length, color: 'var(--warning)' },
            { label: 'Resolved', value: myComplaints.filter(c => c.status === 'resolved').length, color: 'var(--success)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--accent-color': s.color }}>
              <span className="label">{s.label}</span>
              <span className="value">{s.value}</span>
            </div>
          ))}
        </div>

        {myComplaints.length === 0 ? (
          <EmptyState title="No complaints yet" desc="Submit a complaint to get started" icon="📋" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myComplaints.map(c => (
              <div key={c.id} className="card" style={{ borderLeft: `3px solid ${c.status === 'resolved' ? 'var(--success)' : c.status === 'in-progress' ? 'var(--warning)' : 'var(--accent)'}` }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{c.id}</span>
                    <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>{c.category}</span>
                    <span className={`badge badge-${c.priority === 'critical' ? 'red' : c.priority === 'high' ? 'yellow' : c.priority === 'medium' ? 'blue' : 'gray'}`}>{c.priority}</span>
                  </div>
                  <span className={`badge badge-${c.status === 'resolved' ? 'green' : c.status === 'in-progress' ? 'yellow' : 'blue'}`}>{c.status}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{c.subject}</div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.description}</p>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Submitted: {c.date} · Updated: {c.updatedAt}</div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <Modal title="Submit Complaint" onClose={() => setShowModal(false)}
            footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Submit Complaint</button></>}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-grid">
                <div className="input-group">
                  <label>Category *</label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="maintenance">Maintenance</option>
                    <option value="food">Food / Mess</option>
                    <option value="security">Security</option>
                    <option value="administrative">Administrative</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Priority</label>
                  <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="input-group span-2">
                  <label>Subject *</label>
                  <input className="input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Brief description of the issue" required />
                </div>
                <div className="input-group span-2">
                  <label>Description *</label>
                  <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Provide full details of your complaint..." rows={4} required />
                </div>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  );
}

/* ─── STUDENT VISITORS ─── */
export function StudentVisitors() {
  const { currentUser, visitors, addVisitor } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ visitorName: '', visitorCnic: '', relationship: '', expectedDate: '', expectedTime: '' });

  const myVisitors = visitors.filter(v => v.studentId === currentUser.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.visitorName || !form.visitorCnic || !form.expectedDate) return;
    addVisitor(form);
    setShowModal(false);
    setForm({ visitorName: '', visitorCnic: '', relationship: '', expectedDate: '', expectedTime: '' });
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1>Visitor Requests</h1>
            <p>Submit and track visitor approval requests</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Request Visitor</button>
        </div>

        {myVisitors.length === 0 ? (
          <EmptyState title="No visitor requests" desc="Submit a request to invite a visitor to the hostel" icon="👥" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Visitor Name</th><th>CNIC</th><th>Relationship</th><th>Expected Date</th><th>Time</th><th>Status</th><th>Entry</th><th>Exit</th></tr></thead>
              <tbody>
                {myVisitors.map(v => (
                  <tr key={v.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{v.id}</td>
                    <td style={{ fontWeight: 500 }}>{v.visitorName}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{v.visitorCnic}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{v.relationship}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.expectedDate}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.expectedTime}</td>
                    <td><span className={`badge badge-${v.status === 'approved' ? 'green' : v.status === 'rejected' ? 'red' : 'yellow'}`}>{v.status}</span></td>
                    <td style={{ fontSize: 12, color: v.entryTime ? 'var(--success)' : 'var(--text-muted)' }}>{v.entryTime || '—'}</td>
                    <td style={{ fontSize: 12, color: v.exitTime ? 'var(--danger)' : 'var(--text-muted)' }}>{v.exitTime || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <Modal title="Request Visitor" onClose={() => setShowModal(false)}
            footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}>Submit Request</button></>}>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group span-2">
                  <label>Visitor Full Name *</label>
                  <input className="input" value={form.visitorName} onChange={e => setForm(f => ({ ...f, visitorName: e.target.value }))} placeholder="e.g. Ahmed Ali" required />
                </div>
                <div className="input-group">
                  <label>Visitor CNIC *</label>
                  <input className="input" value={form.visitorCnic} onChange={e => setForm(f => ({ ...f, visitorCnic: e.target.value }))} placeholder="XXXXX-XXXXXXX-X" required />
                </div>
                <div className="input-group">
                  <label>Relationship *</label>
                  <select className="input" value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Relative">Relative</option>
                    <option value="Friend">Friend</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Expected Date *</label>
                  <input className="input" type="date" value={form.expectedDate} onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))} required />
                </div>
                <div className="input-group">
                  <label>Expected Time</label>
                  <input className="input" type="time" value={form.expectedTime} onChange={e => setForm(f => ({ ...f, expectedTime: e.target.value }))} />
                </div>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  );
}

/* ─── STUDENT PAYMENTS ─── */
export function StudentPayments() {
  const { currentUser, payments, addPayment } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null);
  const [form, setForm] = useState({ month: 'April 2026', amount: 8500 });

  const myPayments = payments.filter(p => p.studentId === currentUser.id);
  const hasPendingThis = myPayments.some(p => p.status === 'pending' || p.status === 'overdue');

  const handleSubmit = (e) => {
    e.preventDefault();
    const receipt = addPayment({ ...form });
    setShowModal(false);
    setShowReceipt(receipt);
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1>My Payments</h1>
            <p>Hostel fee payment history and receipts</p>
          </div>
          {hasPendingThis && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><CreditCard size={14} /> Pay Fee</button>
          )}
        </div>

        <div className="grid-3" style={{ marginBottom: 24 }}>
          <div className="stat-card" style={{ '--accent-color': 'var(--success)' }}>
            <span className="label">Total Paid</span>
            <span className="value">Rs. {myPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0).toLocaleString()}</span>
          </div>
          <div className="stat-card" style={{ '--accent-color': myPayments.some(p => p.status === 'overdue') ? 'var(--danger)' : 'var(--success)' }}>
            <span className="label">Current Status</span>
            <span className="value" style={{ fontSize: 22 }}>{myPayments.some(p => p.status === 'overdue') ? 'Overdue' : 'Clear'}</span>
          </div>
          <div className="stat-card" style={{ '--accent-color': 'var(--accent)' }}>
            <span className="label">Receipts</span>
            <span className="value">{myPayments.filter(p => p.receipt).length}</span>
          </div>
        </div>

        {showReceipt && (
          <div style={{ background: 'rgba(34,211,165,0.08)', border: '1px solid rgba(34,211,165,0.3)', borderRadius: 10, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--success)', marginBottom: 3 }}>✓ Payment Successful!</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Receipt: <strong>{showReceipt}</strong></div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-success" onClick={() => alert(`Downloading receipt ${showReceipt}...`)}><Download size={12} /> Download</button>
              <button className="btn-icon" onClick={() => setShowReceipt(null)}><X size={13} /></button>
            </div>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead><tr><th>Receipt No.</th><th>Month</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {myPayments.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No payment records found</td></tr>
              ) : myPayments.map(p => (
                <tr key={p.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: p.receipt ? 'var(--accent)' : 'var(--text-muted)' }}>{p.receipt || '—'}</span></td>
                  <td style={{ fontWeight: 500 }}>{p.month}</td>
                  <td><strong>Rs. {p.amount.toLocaleString()}</strong></td>
                  <td><span className={`badge badge-${p.status === 'paid' ? 'green' : p.status === 'overdue' ? 'red' : 'yellow'}`}>{p.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.date || 'Pending'}</td>
                  <td>
                    {p.status === 'paid' ? (
                      <button className="btn btn-sm btn-secondary"><Download size={12} /> Receipt</button>
                    ) : (
                      <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>Pay Now</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <Modal title="Submit Fee Payment" onClose={() => setShowModal(false)}
            footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}><CreditCard size={13} /> Confirm Payment</button></>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>Fee Month</label>
                <select className="input" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}>
                  {['March 2026', 'April 2026', 'May 2026'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Amount</label>
                <input className="input" value={`Rs. ${form.amount.toLocaleString()}`} readOnly style={{ opacity: 0.7 }} />
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.4px' }}>Payment Summary</div>
                <div className="flex justify-between" style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Hostel Fee ({form.month})</span>
                  <span>Rs. {form.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between" style={{ fontSize: 13, marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)', fontWeight: 600 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--accent)' }}>Rs. {form.amount.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                A digital receipt will be generated upon confirmation.
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}

/* ─── STUDENT MESS ─── */
export function StudentMess() {
  const { messMenu } = useApp();
  const [optOuts, setOptOuts] = useState({});
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  const toggleOptOut = (day, meal) => {
    const key = `${day}-${meal}`;
    setOptOuts(o => ({ ...o, [key]: !o[key] }));
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <h1>Mess Menu</h1>
          <p>Weekly meal schedule · Opt out of meals in advance</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messMenu.map(m => {
            const isToday = m.day === today;
            return (
              <div key={m.day} className="card" style={{ borderLeft: isToday ? '3px solid var(--accent)' : '3px solid var(--border)' }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, minWidth: 90 }}>{m.day}</div>
                  {isToday && <span className="badge badge-blue">Today</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {['breakfast', 'lunch', 'dinner'].map(meal => {
                    const key = `${m.day}-${meal}`;
                    const optedOut = optOuts[key];
                    return (
                      <div key={meal} style={{ background: optedOut ? 'rgba(255,77,109,0.06)' : 'var(--bg-secondary)', borderRadius: 8, padding: '12px 14px', border: `1px solid ${optedOut ? 'rgba(255,77,109,0.2)' : 'transparent'}`, opacity: optedOut ? 0.6 : 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                            {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'} {meal}
                          </div>
                          {isToday && (
                            <button onClick={() => toggleOptOut(m.day, meal)}
                              style={{ fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', color: optedOut ? 'var(--danger)' : 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                              {optedOut ? 'Opted Out' : 'Opt Out'}
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: optedOut ? 'var(--text-muted)' : 'var(--text-secondary)', lineHeight: 1.5 }}>{m[meal]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

/* ─── STUDENT BROADCASTS ─── */
export function StudentBroadcasts() {
  const { currentUser, broadcasts, markBroadcastRead } = useApp();

  const URGENCY_COLORS = { info: 'var(--accent)', warning: 'var(--warning)', critical: 'var(--danger)' };
  const URGENCY_ICONS = { info: <Info size={18} />, warning: <AlertTriangle size={18} />, critical: <Zap size={18} /> };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <h1>Hostel Notices</h1>
          <p>Emergency broadcasts and announcements from management</p>
        </div>

        <div className="grid-3" style={{ marginBottom: 24 }}>
          <div className="stat-card" style={{ '--accent-color': 'var(--accent)' }}>
            <span className="label">Total Notices</span>
            <span className="value">{broadcasts.length}</span>
          </div>
          <div className="stat-card" style={{ '--accent-color': 'var(--warning)' }}>
            <span className="label">Unread</span>
            <span className="value">{broadcasts.filter(b => !b.readers.includes(currentUser.id)).length}</span>
          </div>
          <div className="stat-card" style={{ '--accent-color': 'var(--success)' }}>
            <span className="label">Read</span>
            <span className="value">{broadcasts.filter(b => b.readers.includes(currentUser.id)).length}</span>
          </div>
        </div>

        {broadcasts.length === 0 ? (
          <EmptyState title="No notices yet" desc="Broadcasts from admin and warden will appear here" icon="📢" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {broadcasts.map(b => {
              const isRead = b.readers.includes(currentUser.id);
              return (
                <div key={b.id} className="card" style={{
                  borderLeft: `3px solid ${URGENCY_COLORS[b.urgency]}`,
                  opacity: isRead ? 0.7 : 1,
                  transition: 'opacity 0.2s'
                }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                    <div className="flex items-center gap-10">
                      <span style={{ color: URGENCY_COLORS[b.urgency] }}>{URGENCY_ICONS[b.urgency]}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                          {b.title}
                          {!isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px var(--accent)' }} />}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          By {b.authorName} · {new Date(b.date).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge badge-${b.urgency === 'info' ? 'blue' : b.urgency === 'warning' ? 'yellow' : 'red'}`}>{b.urgency}</span>
                      {isRead
                        ? <span style={{ fontSize: 11, color: 'var(--success)' }}>✓ Read</span>
                        : <button className="btn btn-sm btn-secondary" onClick={() => markBroadcastRead(b.id)}>Mark Read</button>
                      }
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{b.message}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
