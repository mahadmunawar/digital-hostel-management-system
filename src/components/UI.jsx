import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && <CheckCircle size={16} color="var(--success)" />}
          {t.type === 'error' && <AlertCircle size={16} color="var(--danger)" />}
          {t.type === 'info' && <Info size={16} color="var(--accent)" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <h2>{title}</h2>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function StatCard({ label, value, sub, color = 'var(--accent)', icon }) {
  return (
    <div className="stat-card" style={{ '--accent-color': color }}>
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        {icon && <span style={{ color, opacity: 0.7 }}>{icon}</span>}
      </div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

export function Avatar({ name, color = '#4f8ef7', size = 36 }) {
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div className="avatar" style={{ background: `${color}22`, color, width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

export function EmptyState({ title, desc, icon }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: 48, opacity: 0.2 }}>{icon || '📭'}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-bar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    received: ['badge-blue', 'Received'],
    'in-progress': ['badge-yellow', 'In Progress'],
    resolved: ['badge-green', 'Resolved'],
    pending: ['badge-yellow', 'Pending'],
    approved: ['badge-green', 'Approved'],
    rejected: ['badge-red', 'Rejected'],
    paid: ['badge-green', 'Paid'],
    overdue: ['badge-red', 'Overdue'],
    available: ['badge-green', 'Available'],
    full: ['badge-red', 'Full'],
    maintenance: ['badge-yellow', 'Maintenance'],
    active: ['badge-blue', 'Active'],
    info: ['badge-blue', 'Info'],
    warning: ['badge-yellow', 'Warning'],
    critical: ['badge-red', 'Critical'],
    low: ['badge-gray', 'Low'],
    medium: ['badge-yellow', 'Medium'],
    high: ['badge-red', 'High'],
    single: ['badge-blue', 'Single'],
    double: ['badge-purple', 'Double'],
    triple: ['badge-green', 'Triple'],
  };
  const [cls, label] = map[status] || ['badge-gray', status];
  return <span className={`badge ${cls}`}>{label}</span>;
}
