import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Avatar } from './UI';
import {
  LayoutDashboard, Users, BedDouble, MessageSquare, UserCheck,
  CreditCard, UtensilsCrossed, Megaphone, LogOut, Shield,
  ChevronRight, Bell
} from 'lucide-react';

const NAV_ITEMS = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/rooms', label: 'Rooms & Inventory', icon: BedDouble },
    { to: '/admin/complaints', label: 'Complaints', icon: MessageSquare },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/broadcast', label: 'Broadcast', icon: Megaphone },
  ],
  warden: [
    { to: '/warden', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/warden/rooms', label: 'Room Management', icon: BedDouble },
    { to: '/warden/complaints', label: 'Complaints', icon: MessageSquare },
    { to: '/warden/visitors', label: 'Visitor Approvals', icon: UserCheck },
    { to: '/warden/mess', label: 'Mess Management', icon: UtensilsCrossed },
    { to: '/warden/broadcast', label: 'Broadcast', icon: Megaphone },
  ],
  guard: [
    { to: '/guard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/guard/visitors', label: 'Visitor Log', icon: UserCheck },
    { to: '/guard/late-arrivals', label: 'Late Arrivals', icon: Shield },
  ],
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/complaints', label: 'My Complaints', icon: MessageSquare },
    { to: '/student/visitors', label: 'Visitor Requests', icon: UserCheck },
    { to: '/student/payments', label: 'Payments', icon: CreditCard },
    { to: '/student/mess', label: 'Mess Menu', icon: UtensilsCrossed },
    { to: '/student/broadcasts', label: 'Notices', icon: Bell },
  ],
};

const ROLE_COLORS = { admin: '#ff4d6d', warden: '#7c5cfc', guard: '#f5a623', student: '#22d3a5' };
const ROLE_LABELS = { admin: 'Administrator', warden: 'Warden', guard: 'Security Guard', student: 'Student' };

export default function Sidebar() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const items = NAV_ITEMS[currentUser?.role] || [];
  const color = ROLE_COLORS[currentUser?.role] || '#4f8ef7';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside style={{
      width: 240, flexShrink: 0, background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
            <BedDouble size={18} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>DHMS</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hostel System</div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={currentUser?.name} color={color} size={34} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser?.name}</div>
            <div style={{ fontSize: 11, color, textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>{ROLE_LABELS[currentUser?.role]}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, padding: '6px 8px 10px' }}>Navigation</div>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to.split('/').length <= 2}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8,
              textDecoration: 'none', marginBottom: 2,
              fontSize: 13, fontWeight: 500,
              background: isActive ? `${color}15` : 'transparent',
              color: isActive ? color : 'var(--text-secondary)',
              borderLeft: isActive ? `2px solid ${color}` : '2px solid transparent',
              transition: 'all 0.15s',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={15} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={12} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 12px', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleLogout} className="btn btn-secondary w-full" style={{ justifyContent: 'center', gap: 8, fontSize: 13 }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
