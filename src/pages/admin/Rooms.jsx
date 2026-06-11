import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Layout from '../../components/Layout';
import { Modal, SearchBar, StatusBadge, EmptyState } from '../../components/UI';
import { Plus, BedDouble, Package } from 'lucide-react';

export default function AdminRooms() {
  const { rooms, addRoom } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({ number: '', floor: '', capacity: '', type: 'single' });

  const filtered = rooms.filter(r => {
    const ms = r.number.includes(search) || r.type.includes(search.toLowerCase());
    const mf = filter === 'all' || r.status === filter;
    return ms && mf;
  });

  const handleAdd = (e) => {
    e.preventDefault();
    addRoom({ ...form, floor: Number(form.floor), capacity: Number(form.capacity) });
    setShowModal(false);
    setForm({ number: '', floor: '', capacity: '', type: 'single' });
  };

  const occupancyPct = (r) => Math.round((r.occupied / r.capacity) * 100);
  const statusColor = { available: 'var(--success)', full: 'var(--danger)', maintenance: 'var(--warning)' };

  return (
    <Layout>
      <div className="fade-in">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1>Rooms & Inventory</h1>
            <p>Manage room assignments and asset inventory</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add Room
          </button>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Rooms', value: rooms.length, color: 'var(--accent)' },
            { label: 'Available', value: rooms.filter(r => r.status === 'available').length, color: 'var(--success)' },
            { label: 'Fully Occupied', value: rooms.filter(r => r.status === 'full').length, color: 'var(--danger)' },
            { label: 'Total Capacity', value: rooms.reduce((s, r) => s + r.capacity, 0), color: 'var(--accent-2)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ '--accent-color': s.color }}>
              <span className="label">{s.label}</span>
              <span className="value">{s.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3" style={{ marginBottom: 20, flexWrap: 'wrap' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search room number..." />
          <div className="flex gap-2">
            {['all', 'available', 'full', 'maintenance'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? <EmptyState title="No rooms found" desc="Try adjusting your search or filters" icon="🚪" /> : (
          <div className="grid-3">
            {filtered.map(r => (
              <div key={r.id} className="card" style={{ borderTop: `2px solid ${statusColor[r.status] || 'var(--border)'}`, cursor: 'pointer' }}
                onClick={() => setSelectedRoom(r)}>
                <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                  <div className="flex items-center gap-3">
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColor[r.status] }}>
                      <BedDouble size={18} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Room {r.number}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Floor {r.floor}</div>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div className="flex justify-between" style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    <span>Occupancy</span>
                    <span>{r.occupied}/{r.capacity}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${occupancyPct(r)}%`, background: occupancyPct(r) === 100 ? 'var(--danger)' : 'var(--accent)' }} />
                  </div>
                </div>

                <div className="flex justify-between" style={{ fontSize: 12 }}>
                  <span className="text-muted">Type</span>
                  <StatusBadge status={r.type} />
                </div>
                <div className="flex justify-between" style={{ fontSize: 12, marginTop: 6 }}>
                  <span className="text-muted">Assets</span>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Package size={12} /> {r.assets.length} items
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Room Detail Modal */}
        {selectedRoom && (
          <Modal title={`Room ${selectedRoom.number} — Assets`} onClose={() => setSelectedRoom(null)}
            footer={<button className="btn btn-secondary" onClick={() => setSelectedRoom(null)}>Close</button>}
          >
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              {[
                { label: 'Type', value: selectedRoom.type },
                { label: 'Floor', value: selectedRoom.floor },
                { label: 'Occupied', value: `${selectedRoom.occupied}/${selectedRoom.capacity}` },
                { label: 'Status', value: selectedRoom.status },
              ].map(info => (
                <div key={info.label} style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{info.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{info.value}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, marginBottom: 10 }}>Asset Register</div>
            {selectedRoom.assets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>No assets recorded</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>#</th><th>Asset</th><th>Quantity</th><th>Status</th></tr></thead>
                  <tbody>
                    {selectedRoom.assets.map((a, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td>{a.name}</td>
                        <td>{a.qty}</td>
                        <td><span className="badge badge-green">OK</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Modal>
        )}

        {/* Add Room Modal */}
        {showModal && (
          <Modal title="Add New Room" onClose={() => setShowModal(false)}
            footer={<>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}>Add Room</button>
            </>}
          >
            <div className="form-grid">
              <div className="input-group">
                <label>Room Number *</label>
                <input className="input" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="e.g. 301" required />
              </div>
              <div className="input-group">
                <label>Floor *</label>
                <input className="input" type="number" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} placeholder="e.g. 3" required />
              </div>
              <div className="input-group">
                <label>Capacity *</label>
                <input className="input" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="1, 2 or 3" required />
              </div>
              <div className="input-group">
                <label>Room Type *</label>
                <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                </select>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
