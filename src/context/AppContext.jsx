import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [messMenu, setMessMenu] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [lateArrivals, setLateArrivals] = useState([]);
  const [toasts, setToasts] = useState([]);

  // FIX: Replace 'YOUR_LAPTOP_IP' with your actual IPv4 address from ipconfig
const API_BASE = "http://localhost:5000/api";

  // --- 1. GLOBAL DATA SYNC ---
  useEffect(() => {
    const syncData = async () => {
      try {
        const res = await fetch(`${API_BASE}/all-data`);
        const data = await res.json();
        setUsers(data.users || []);
        setRooms(data.rooms || []);
        setComplaints(data.complaints || []);
        setVisitors(data.visitors || []);
        setPayments(data.payments || []);
        setMessMenu(data.messMenu || []);
        setBroadcasts(data.broadcasts || []);
        setLateArrivals(data.lateArrivals || []);
      } catch (err) {
        console.error("Backend offline. Dashboard metrics will be empty.");
      }
    };
    syncData();
    const interval = setInterval(syncData, 30000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. AUTHENTICATION ---
  // FIX: Hit the API directly so newly registered accounts always work,
  // instead of searching the local users[] state which is loaded once on mount.
  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return { success: false };
      const user = await res.json();
      if (user && user.role) {
        setCurrentUser(user);
        // Also refresh users list so new accounts appear in admin panel
        const all = await fetch(`${API_BASE}/all-data`);
        const data = await all.json();
        setUsers(data.users || []);
        return { success: true, role: user.role };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  };

  const logout = () => setCurrentUser(null);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  // --- 3. STUDENT ACTIONS ---
  const addComplaint = async (data) => {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, studentId: currentUser.id, studentName: currentUser.name })
    });
    const newC = await res.json();
    setComplaints(prev => [newC, ...prev]);
    showToast('Complaint submitted successfully', 'success');
  };

  const addVisitor = async (data) => {
    const res = await fetch(`${API_BASE}/visitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, studentId: currentUser.id, studentName: currentUser.name })
    });
    const newV = await res.json();
    setVisitors(prev => [newV, ...prev]);
    showToast('Visitor request sent', 'success');
  };

  const addPayment = async (data) => {
    const receiptNo = `REC-${Date.now()}`;
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, receipt: receiptNo, studentId: currentUser.id })
    });
    const newP = await res.json();
    setPayments(prev => [newP, ...prev]);
    return receiptNo;
  };

  // --- 4. WARDEN & ADMIN ACTIONS ---
  const updateComplaint = async (id, updates) => {
    await fetch(`${API_BASE}/complaints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    showToast('Status updated', 'success');
  };

  const updateVisitor = async (id, updates) => {
    await fetch(`${API_BASE}/visitors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const addRoom = async (data) => {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const newRoom = await res.json();
    setRooms(prev => [...prev, newRoom]);
    showToast('Room created', 'success');
  };

  const addBroadcast = async (data) => {
    const res = await fetch(`${API_BASE}/broadcasts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, authorName: currentUser.name })
    });
    const newB = await res.json();
    setBroadcasts(prev => [newB, ...prev]);
    showToast('Broadcast live!', 'success');
  };

  // FIX: addUser now detects if it's a student registering or an admin adding staff
  // Routes to /api/register for students or /api/users/staff for warden/guard
  const addUser = async (data) => {
    try {
      const endpoint = data.role === 'student' ? '/register' : '/users/staff';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Failed to create account', 'error');
        return null;
      }
      const newUser = await res.json();
      setUsers(prev => [...prev, newUser]);
      showToast(`${data.role} account created successfully`, 'success');
      return newUser;
    } catch (error) {
      showToast('Network error — is the backend running?', 'error');
      return null;
    }
  };

  // --- 5. GUARD ACTIONS ---
  const addLateArrival = async (data) => {
    const res = await fetch(`${API_BASE}/late-arrivals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const newL = await res.json();
    setLateArrivals(prev => [newL, ...prev]);
    showToast('Late arrival logged', 'warning');
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, rooms, complaints, visitors, payments, messMenu,
      broadcasts, lateArrivals, toasts,
      login, logout, showToast,
      addComplaint, updateComplaint,
      addVisitor, updateVisitor,
      addPayment, addBroadcast,
      addRoom, addLateArrival,
      addUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);