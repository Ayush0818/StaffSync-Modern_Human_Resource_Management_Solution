import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaTachometerAlt,
  FaUser,
  FaCalendarCheck,
  FaCalendarAlt,
  FaBullhorn,
  FaGraduationCap,
  FaUsers,
  FaUserTie,
  FaChartBar,
  FaBuilding
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'employee';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <FaBuilding className="me-2 text-warning" />
        <span>StaffSync HRM</span>
      </div>

      <ul className="nav-list">
        {/* EMPLOYEE LINKS */}
        {role === 'employee' && (
          <>
            <li className="nav-item">
              <NavLink to="/employee/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaTachometerAlt />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/employee/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaUser />
                <span>My Profile</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/employee/attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaCalendarCheck />
                <span>Attendance</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/employee/leaves" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaCalendarAlt />
                <span>Leaves</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/employee/announcements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaBullhorn />
                <span>Announcements</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/employee/trainings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaGraduationCap />
                <span>Trainings</span>
              </NavLink>
            </li>
          </>
        )}

        {/* MANAGER LINKS */}
        {role === 'manager' && (
          <>
            <li className="nav-item">
              <NavLink to="/manager/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaTachometerAlt />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/manager/team" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaUsers />
                <span>My Team</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/manager/leaves" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaCalendarAlt />
                <span>Leave Requests</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/manager/attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaCalendarCheck />
                <span>Attendance</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/manager/trainings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaGraduationCap />
                <span>Trainings</span>
              </NavLink>
            </li>
          </>
        )}

        {/* HR ADMIN LINKS */}
        {role === 'hr' && (
          <>
            <li className="nav-item">
              <NavLink to="/hr/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaTachometerAlt />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/hr/employees" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaUsers />
                <span>Employees</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/hr/managers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaUserTie />
                <span>Managers</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/hr/attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaCalendarCheck />
                <span>Attendance</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/hr/leaves" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaCalendarAlt />
                <span>Leaves</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/hr/announcements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaBullhorn />
                <span>Announcements</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/hr/trainings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaGraduationCap />
                <span>Trainings</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/hr/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <FaChartBar />
                <span>Reports</span>
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
