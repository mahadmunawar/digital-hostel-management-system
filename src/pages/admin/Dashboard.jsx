import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout';
import { StatCard } from '../../components/UI';
import { Users, BedDouble, MessageSquare, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const CHART_COLORS = ['#4f8ef7', '#7c5cfc', '#22d3a5', '#f5a623'];

export default function AdminDashboard() {
  const { users, rooms, complaints, payments, broadcasts } = useApp();

  const students = users.filter(u => u.role === 'student');
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pendingComplaints = complaints.filter(c => c.status !== 'resolved').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;

  const complaintData = [
    { name: 'Received', value: complaints.filter(c => c.status === 'received').length },
    { name: 'In Progress', value: complaints.filter(c => c.status === 'in-progress').length },
    { name: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length },
  ];

  const roomData = [
    { name: 'Full', value: rooms.filter(r => r.status === 'full').length },
    { name: 'Available', value: rooms.filter(r => r.status === 'available').length },
    { name: 'Maintenance', value: rooms.filter(r => r.status === 'maintenance').length },
  ];

  const paymentMonths = [
    { month: 'Oct', collected: 42000, due: 8500 },
    { month: 'Nov', collected: 51000, due: 0 },
    { month: 'Dec', collected: 47500, due: 8500 },
    { month: 'Jan', collected: 55000, due: 0 },
    { month: 'Feb', collected: 51000, due: 8500 },
    { month: 'Mar', collected: totalRevenue, due: overduePayments * 8500 },
  ];

  const customTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? `Rs. ${p.value.toLocaleString()}` : p.value}</p>)}
      </div>
    );
  };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p>System overview and key performance metrics</p>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          <StatCard label="Total Students" value={students.length} sub="Active residents" color="#4f8ef7" icon={<Users size={18} />} />
          <StatCard label="Available Rooms" value={availableRooms} sub={`of ${rooms.length} total`} color="#22d3a5" icon={<BedDouble size={18} />} />
          <StatCard label="Open Complaints" value={pendingComplaints} sub="Awaiting resolution" color="#f5a623" icon={<MessageSquare size={18} />} />
          <StatCard label="Revenue (Mar)" value={`${(totalRevenue / 1000).toFixed(0)}k`} sub="Rs collected this month" color="#7c5cfc" icon={<CreditCard size={18} />} />
        </div>

        {overduePayments > 0 && (
          <div style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <AlertTriangle size={18} color="var(--danger)" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--danger)' }}>{overduePayments} students</strong> have overdue payments this month. Send reminder notices from the Payments module.
            </span>
          </div>
        )}

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="section-title">Monthly Revenue</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={paymentMonths} barSize={20}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="collected" fill="#4f8ef7" name="Collected" radius={[4, 4, 0, 0]} />
                <Bar dataKey="due" fill="#ff4d6d" name="Overdue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, fontWeight: 600 }}>Complaints</div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={complaintData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {complaintData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                {complaintData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i], display: 'inline-block' }} />
                    {d.name}: {d.value}
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, fontWeight: 600 }}>Room Status</div>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={roomData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                    {roomData.map((_, i) => <Cell key={i} fill={['#ff4d6d', '#22d3a5', '#f5a623'][i]} />)}
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                {roomData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: ['#ff4d6d', '#22d3a5', '#f5a623'][i], display: 'inline-block' }} />
                    {d.name}: {d.value}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="card" style={{ background: 'rgba(79,142,247,0.06)', borderColor: 'rgba(79,142,247,0.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Broadcasts Sent</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginTop: 6 }}>{broadcasts.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>This semester</div>
            </div>

            <div className="card" style={{ background: 'rgba(124,92,252,0.06)', borderColor: 'rgba(124,92,252,0.2)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Staff Accounts</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--accent-2)', marginTop: 6 }}>{users.filter(u => u.role !== 'student').length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Wardens + Guards</div>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="section">
          <div className="section-title">Recent Complaints</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Student</th><th>Category</th><th>Subject</th><th>Priority</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td><span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>{c.id}</span></td>
                    <td>{c.studentName}</td>
                    <td><span className={`badge badge-${c.category === 'maintenance' ? 'yellow' : c.category === 'security' ? 'red' : c.category === 'food' ? 'green' : 'blue'}`}>{c.category}</span></td>
                    <td style={{ maxWidth: 200 }}><span className="truncate" style={{ display: 'block' }}>{c.subject}</span></td>
                    <td><span className={`badge badge-${c.priority === 'critical' ? 'red' : c.priority === 'high' ? 'yellow' : c.priority === 'medium' ? 'blue' : 'gray'}`}>{c.priority}</span></td>
                    <td><span className={`badge badge-${c.status === 'resolved' ? 'green' : c.status === 'in-progress' ? 'yellow' : 'blue'}`}>{c.status}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
