import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BedDouble, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@dhms.edu', password: 'admin123', color: '#ff4d6d' },
  { label: 'Warden', email: 'warden@dhms.edu', password: 'warden123', color: '#7c5cfc' },
  { label: 'Guard', email: 'guard@dhms.edu', password: 'guard123', color: '#f5a623' },
  { label: 'Student', email: 'student@dhms.edu', password: 'student123', color: '#22d3a5' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(`/${result.role}`);
    } else {
      setError('Invalid email or password. Try a demo account below.');
    }
    setLoading(false);
  };

  const fillDemo = (account) => {
    setForm({ email: account.email, password: account.password });
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 20, position: 'relative', overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,92,252,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 18, background: 'rgba(79,142,247,0.12)', border: '1px solid rgba(79,142,247,0.2)', marginBottom: 20, color: 'var(--accent)' }}>
            <BedDouble size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            DHMS
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
            Digital Hostel Management System
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: 2, fontSize: 12, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            FAST-NUCES · Karachi Campus
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: 28, borderColor: 'var(--border-light)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="you@dhms.edu"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ paddingRight: 42 }}
                  required
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', padding: '12px 20px', fontSize: 14, marginTop: 4 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Signing in...
                </span>
              ) : (
                <><ArrowRight size={15} /> Sign In</>
              )}
            </button>
          </form>
        </div>

        {/* Register Link */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            color: 'var(--accent)', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', padding: '9px 18px',
            border: '1px solid rgba(79,142,247,0.25)',
            borderRadius: 8, background: 'rgba(79,142,247,0.07)',
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,142,247,0.07)'}
          >
            <UserPlus size={14} />
            New student? Register here
          </Link>
        </div>

        {/* Demo Accounts */}
        <div style={{ marginTop: 24 }}>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14, fontWeight: 600 }}>Quick Demo Access</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.label} onClick={() => fillDemo(acc)}
                style={{
                  background: `${acc.color}0d`, border: `1px solid ${acc.color}30`,
                  borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
                  color: acc.color, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  transition: 'all 0.15s', textAlign: 'left'
                }}
                onMouseEnter={e => e.target.style.background = `${acc.color}18`}
                onMouseLeave={e => e.target.style.background = `${acc.color}0d`}
              >
                {acc.label}
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 400, marginTop: 1 }}>{acc.email}</div>
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'var(--text-muted)' }}>
          © 2026 DHMS · FSE Course Project · FAST-NUCES
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}