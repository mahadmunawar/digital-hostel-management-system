import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout';
import { Modal, StatCard, EmptyState } from '../../components/UI';
import { Shield, Clock, LogIn, LogOut, Plus } from 'lucide-react';

export function GuardDashboard() {
  const { visitors, lateArrivals } = useApp();
  const todayApproved = visitors.filter(v => v.status === 'approved').length;
  const checkedIn = visitors.filter(v => v.entryTime && !v.exitTime).length;
  const todayLate = lateArrivals.filter(l => l.date === new Date().toISOString().split('T')[0]).length;

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <h1>Guard Dashboard</h1>
          <p>Visitor entry/exit and security monitoring</p>
        </div>
        <div className="grid-3" style={{ marginBottom: 24 }}>
          <StatCard label="Approved Visitors" value={todayApproved} sub="Today's expected list" color="var(--success)" icon={<Shield size={18} />} />
          <StatCard label="Currently Inside" value={checkedIn} sub="Checked in, not exited" color="var(--accent)" icon={<LogIn size={18} />} />
          <StatCard label="Late Arrivals" value={lateArrivals.length} sub="Total logged" color="var(--warning)" icon={<Clock size={18} />} />
        </div>

        <div className="card">
          <div className="section-title">Today's Approved Visitors</div>
          {visitors.filter(v => v.status === 'approved').length === 0 ? (
            <EmptyState title="No approved visitors today" desc="Check back later" icon="👤" />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Visitor Name</th><th>Student</th><th>Expected Time</th><th>Entry</th><th>Exit</th><th>Status</th></tr></thead>
                <tbody>
                  {visitors.filter(v => v.status === 'approved').map(v => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 500 }}>{v.visitorName}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{v.studentName}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{v.expectedTime}</td>
                      <td style={{ color: v.entryTime ? 'var(--success)' : 'var(--text-muted)', fontSize: 12 }}>{v.entryTime || '—'}</td>
                      <td style={{ color: v.exitTime ? 'var(--danger)' : 'var(--text-muted)', fontSize: 12 }}>{v.exitTime || '—'}</td>
                      <td>
                        {v.entryTime && v.exitTime ? <span className="badge badge-gray">Exited</span>
                          : v.entryTime ? <span className="badge badge-green">Inside</span>
                            : <span className="badge badge-yellow">Expected</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export function GuardVisitors() {
  const { visitors, updateVisitor } = useApp();

  const logEntry = (v) => {
    const time = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: false });
    updateVisitor(v.id, { entryTime: time });
  };

  const logExit = (v) => {
    const time = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: false });
    updateVisitor(v.id, { exitTime: time });
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <h1>Visitor Log</h1>
          <p>Log entry and exit times for approved visitors</p>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Visitor</th><th>CNIC</th><th>Student</th><th>Relationship</th><th>Expected</th><th>Entry</th><th>Exit</th><th>Actions</th></tr></thead>
            <tbody>
              {visitors.map(v => (
                <tr key={v.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{v.id}</td>
                  <td style={{ fontWeight: 500 }}>{v.visitorName}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{v.visitorCnic}</td>
                  <td>{v.studentName}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.relationship}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.expectedDate} {v.expectedTime}</td>
                  <td style={{ color: v.entryTime ? 'var(--success)' : 'var(--text-muted)', fontSize: 12 }}>{v.entryTime || '—'}</td>
                  <td style={{ color: v.exitTime ? 'var(--danger)' : 'var(--text-muted)', fontSize: 12 }}>{v.exitTime || '—'}</td>
                  <td>
                    {v.status !== 'approved' ? (
                      <span className="badge badge-red">Not approved</span>
                    ) : !v.entryTime ? (
                      <button className="btn btn-sm btn-success" onClick={() => logEntry(v)}><LogIn size={12} /> Log Entry</button>
                    ) : !v.exitTime ? (
                      <button className="btn btn-sm btn-danger" onClick={() => logExit(v)}><LogOut size={12} /> Log Exit</button>
                    ) : (
                      <span className="badge badge-gray">Complete</span>
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

export function GuardLateArrivals() {
  const { lateArrivals, users, addLateArrival } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ studentId: '', time: '', note: '' });

  const students = users.filter(u => u.role === 'student');

  const handleSubmit = (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === Number(form.studentId));
    if (!student || !form.time) return;
    addLateArrival({ studentId: student.id, studentName: student.name, roomNo: student.room || '—', time: form.time, note: form.note });
    setShowModal(false);
    setForm({ studentId: '', time: '', note: '' });
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1>Late Arrivals</h1>
            <p>Log students returning after curfew — warden is notified automatically</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Log Late Arrival</button>
        </div>

        {lateArrivals.length === 0 ? <EmptyState title="No late arrivals" desc="No students have returned past curfew" icon="🌙" /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Room</th><th>Date</th><th>Time</th><th>Note</th><th>Alert</th></tr></thead>
              <tbody>
                {lateArrivals.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500 }}>{l.studentName}</td>
                    <td><span className="badge badge-blue">{l.roomNo}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.date}</td>
                    <td><span style={{ color: 'var(--warning)', fontWeight: 600 }}>{l.time}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{l.note || '—'}</td>
                    <td><span className="badge badge-green">✓ Warden Notified</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <Modal title="Log Late Arrival" onClose={() => setShowModal(false)}
            footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSubmit}><Shield size={13} /> Log Arrival</button></>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>Student *</label>
                <select className="input" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} required>
                  <option value="">Select student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} — Room {s.room}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>Arrival Time *</label>
                <input className="input" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required />
              </div>
              <div className="input-group">
                <label>Note (optional)</label>
                <input className="input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="e.g. Returned from hospital" />
              </div>
              <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--warning)' }}>
                ⚠️ The warden will be automatically notified of this late arrival.
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
