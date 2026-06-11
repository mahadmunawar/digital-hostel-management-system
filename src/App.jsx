import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/UI';

import Login from './pages/Login';
import StudentRegister from './pages/student/Register';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminRooms from './pages/admin/Rooms';
import AdminComplaints from './pages/admin/Complaints';
import { AdminPayments, AdminBroadcast } from './pages/admin/PaymentsAndBroadcast';

import { WardenDashboard, WardenRooms, WardenComplaints, WardenVisitors, WardenMess, WardenBroadcast } from './pages/warden/WardenPages';
import { GuardDashboard, GuardVisitors, GuardLateArrivals } from './pages/guard/GuardPages';
import { StudentDashboard, StudentComplaints, StudentVisitors, StudentPayments, StudentMess, StudentBroadcasts } from './pages/student/StudentPages';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useApp();
  const location = useLocation();
  if (!currentUser) return <Navigate to="/" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) return <Navigate to={`/${currentUser.role}`} replace />;
  return children;
}

function AppRoutes() {
  const { currentUser } = useApp();
  return (
    <>
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to={`/${currentUser.role}`} replace /> : <Login />} />
        <Route path="/register" element={<StudentRegister />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute allowedRoles={['admin']}><AdminRooms /></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute allowedRoles={['admin']}><AdminComplaints /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayments /></ProtectedRoute>} />
        <Route path="/admin/broadcast" element={<ProtectedRoute allowedRoles={['admin']}><AdminBroadcast /></ProtectedRoute>} />
        <Route path="/warden" element={<ProtectedRoute allowedRoles={['warden']}><WardenDashboard /></ProtectedRoute>} />
        <Route path="/warden/rooms" element={<ProtectedRoute allowedRoles={['warden']}><WardenRooms /></ProtectedRoute>} />
        <Route path="/warden/complaints" element={<ProtectedRoute allowedRoles={['warden']}><WardenComplaints /></ProtectedRoute>} />
        <Route path="/warden/visitors" element={<ProtectedRoute allowedRoles={['warden']}><WardenVisitors /></ProtectedRoute>} />
        <Route path="/warden/mess" element={<ProtectedRoute allowedRoles={['warden']}><WardenMess /></ProtectedRoute>} />
        <Route path="/warden/broadcast" element={<ProtectedRoute allowedRoles={['warden']}><WardenBroadcast /></ProtectedRoute>} />
        <Route path="/guard" element={<ProtectedRoute allowedRoles={['guard']}><GuardDashboard /></ProtectedRoute>} />
        <Route path="/guard/visitors" element={<ProtectedRoute allowedRoles={['guard']}><GuardVisitors /></ProtectedRoute>} />
        <Route path="/guard/late-arrivals" element={<ProtectedRoute allowedRoles={['guard']}><GuardLateArrivals /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/complaints" element={<ProtectedRoute allowedRoles={['student']}><StudentComplaints /></ProtectedRoute>} />
        <Route path="/student/visitors" element={<ProtectedRoute allowedRoles={['student']}><StudentVisitors /></ProtectedRoute>} />
        <Route path="/student/payments" element={<ProtectedRoute allowedRoles={['student']}><StudentPayments /></ProtectedRoute>} />
        <Route path="/student/mess" element={<ProtectedRoute allowedRoles={['student']}><StudentMess /></ProtectedRoute>} />
        <Route path="/student/broadcasts" element={<ProtectedRoute allowedRoles={['student']}><StudentBroadcasts /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
