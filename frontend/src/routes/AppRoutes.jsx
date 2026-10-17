import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';

// Layout & Protected Route
import Layout from '../components/common/Layout';
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';

// Employee Pages
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import ProfilePage from '../pages/employee/ProfilePage';
import AttendancePage from '../pages/employee/AttendancePage';
import LeavePage from '../pages/employee/LeavePage';
import AnnouncementsPage from '../pages/employee/AnnouncementsPage';
import TrainingsPage from '../pages/employee/TrainingsPage';

// Manager Pages
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import TeamPage from '../pages/manager/TeamPage';
import ManagerLeavesPage from '../pages/manager/ManagerLeavesPage';
import ManagerTrainingsPage from '../pages/manager/ManagerTrainingsPage';
import ManagerAttendancePage from '../pages/manager/ManagerAttendancePage';

// HR Pages
import HRDashboard from '../pages/hr/HRDashboard';
import EmployeesPage from '../pages/hr/EmployeesPage';
import ManagersPage from '../pages/hr/ManagersPage';
import HRAttendancePage from '../pages/hr/HRAttendancePage';
import HRLeavesPage from '../pages/hr/HRLeavesPage';
import HRAnnouncementsPage from '../pages/hr/HRAnnouncementsPage';
import ReportsPage from '../pages/hr/ReportsPage';
import HRTrainingsPage from '../pages/hr/HRTrainingsPage';

// Root redirect component
const RootRedirect = () => {
  const { isAuthenticated, token, user } = useSelector(selectAuth);

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role;
  if (role === 'hr') {
    return <Navigate to="/hr/dashboard" replace />;
  } else if (role === 'manager') {
    return <Navigate to="/manager/dashboard" replace />;
  } else {
    return <Navigate to="/employee/dashboard" replace />;
  }
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Path */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Employee Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['employee', 'hr', 'manager']} />}>
        <Route element={<Layout />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/profile" element={<ProfilePage />} />
          <Route path="/employee/attendance" element={<AttendancePage />} />
          <Route path="/employee/leaves" element={<LeavePage />} />
          <Route path="/employee/announcements" element={<AnnouncementsPage />} />
          <Route path="/employee/trainings" element={<TrainingsPage />} />
        </Route>
      </Route>

      {/* Manager Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['manager', 'hr']} />}>
        <Route element={<Layout />}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/team" element={<TeamPage />} />
          <Route path="/manager/leaves" element={<ManagerLeavesPage />} />
          <Route path="/manager/trainings" element={<ManagerTrainingsPage />} />
          <Route path="/manager/attendance" element={<ManagerAttendancePage />} />
        </Route>
      </Route>

      {/* HR Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['hr']} />}>
        <Route element={<Layout />}>
          <Route path="/hr/dashboard" element={<HRDashboard />} />
          <Route path="/hr/employees" element={<EmployeesPage />} />
          <Route path="/hr/managers" element={<ManagersPage />} />
          <Route path="/hr/attendance" element={<HRAttendancePage />} />
          <Route path="/hr/leaves" element={<HRLeavesPage />} />
          <Route path="/hr/announcements" element={<HRAnnouncementsPage />} />
          <Route path="/hr/reports" element={<ReportsPage />} />
          <Route path="/hr/trainings" element={<HRTrainingsPage />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
