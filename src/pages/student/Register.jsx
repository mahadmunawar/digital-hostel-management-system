import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BedDouble, ArrowLeft } from 'lucide-react';

export default function StudentRegister() {
  const navigate = useNavigate();
  const { addUser, showToast } = useApp();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    studentId: '', cnic: '', phone: '', room: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match', 'error'); return;
    }
    if (!form.studentId.match(/^\d{2}[A-Z]-\d{4}$/)) {
      showToast('Student ID must be in format: 24I-0001', 'error'); return;
    }
    if (!form.cnic.match(/^\d{5}-\d{7}-\d$/)) {
      showToast('CNIC must be in format: XXXXX-XXXXXXX-X', 'error'); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    addUser({ ...form, role: 'student' });
    showToast('Account created! Please login.', 'success');
    navigate('/');
    setLoading(false);
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', right: '8%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,165,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', marginBottom: 24, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'rgba(34,211,165,0.12)', border: '1px solid rgba(34,211,165,0.25)', marginBottom: 16, color: 'var(--success)' }}>
            <BedDouble size={24} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>Student Registration</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 13 }}>Create your DHMS hostel account</p>
        </div>

        <div className="card" style={{ padding: 28, borderColor: 'var(--border-light)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ gap: 14 }}>
              <div className="input-group span-2"><label>Full Name *</label><input className="input" {...f('name')} placeholder="Muhammad Ali Khan" required /></div>
              <div className="input-group span-2"><label>Email Address *</label><input className="input" type="email" {...f('email')} placeholder="24I-0001@nu.edu.pk" required /></div>
              <div className="input-group"><label>Student ID *</label><input className="input" {...f('studentId')} placeholder="24I-0001" required /></div>
              <div className="input-group"><label>CNIC *</label><input className="input" {...f('cnic')} placeholder="42201-1234567-1" required /></div>
              <div className="input-group"><label>Phone Number *</label><input className="input" {...f('phone')} placeholder="0300-1234567" required /></div>
              <div className="input-group"><label>Room Number</label><input className="input" {...f('room')} placeholder="e.g. 101" /></div>
              <div className="input-group"><label>Password *</label><input className="input" type="password" {...f('password')} placeholder="Min 8 characters" required /></div>
              <div className="input-group"><label>Confirm Password *</label><input className="input" type="password" {...f('confirmPassword')} placeholder="Repeat password" required /></div>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}
              style={{ justifyContent: 'center', padding: '12px 20px', fontSize: 14, marginTop: 20, background: 'var(--success)' }}>
              {loading ? 'Creating Account...' : 'Create Student Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
