# DHMS — Digital Hostel Management System
### FAST-NUCES Karachi · FSE Course Project

A complete React frontend featuring role-based access for Admin, Warden, Security Guard, and Student.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Demo Accounts

| Role           | Email              | Password   |
|----------------|--------------------|------------|
| Administrator  | admin@dhms.edu     | admin123   |
| Warden         | warden@dhms.edu    | warden123  |
| Security Guard | guard@dhms.edu     | guard123   |
| Student        | student@dhms.edu   | student123 |

Use the Quick Demo Access buttons on the login screen for one-click login.

## Tech Stack
- React 18 + Vite
- React Router v6 (protected routes, RBAC)
- Recharts (dashboard charts)
- Lucide React (icons)
- Google Fonts: Syne + DM Sans

## Features
All 8 modules from the proposal are implemented:
1. User Management — RBAC login, admin creates staff, student self-registration
2. Room & Inventory — Room cards, occupancy bars, asset register modal
3. Complaint Management — Submit, track, resolve pipeline with live status
4. Visitor Management — Request, approve, entry/exit logging by guard
5. Payment Management — Fee submission, digital receipt generation
6. Mess Management — Weekly menu, meal opt-out by students
7. Emergency Broadcast (Innovation) — Real-time banners on all dashboards
8. Asset Inventory Tracking (Innovation) — Per-room asset register

## Project Structure
```
src/
  context/AppContext.jsx       Global state (mock data + actions)
  components/
    Layout.jsx                 App shell with sidebar
    Sidebar.jsx                Role-aware navigation
    UI.jsx                     Reusable components
  pages/
    Login.jsx
    admin/                     Dashboard, Users, Rooms, Complaints, Payments, Broadcast
    warden/                    Dashboard, Rooms, Complaints, Visitors, Mess, Broadcast
    guard/                     Dashboard, Visitor Log, Late Arrivals
    student/                   Dashboard, Complaints, Visitors, Payments, Mess, Notices
```

## Connect a Backend
Replace mock functions in `AppContext.jsx` with real API calls.
Suggested: Python Flask/Django + PostgreSQL (as per proposal).

## Build
```bash
npm run build   # outputs to dist/
```
