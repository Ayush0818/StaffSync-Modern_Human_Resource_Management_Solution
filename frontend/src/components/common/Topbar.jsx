import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Badge } from 'react-bootstrap';
import { FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import NotificationDropdown from './NotificationDropdown';
import { useTheme } from '../../context/ThemeContext';

const Topbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { darkMode, toggleDarkMode } = useTheme();

  const getPageTitle = (pathname) => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Dashboard';
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const displayName = user?.name || user?.email || 'User';

  return (
    <header className="topbar">
      <div>
        <h5 className="topbar-title mb-0">{getPageTitle(location.pathname)}</h5>
      </div>

      <div className="topbar-right">
        {/* Dark Mode Toggle */}
        <button
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <FaSun style={{ color: '#F39C12' }} /> : <FaMoon style={{ color: '#1E3A5F' }} />}
        </button>

        {/* Notification Bell */}
        <NotificationDropdown />

        {/* User Info & Avatar */}
        <div className="d-flex align-items-center gap-2">
          <div className="avatar-circle">
            {getInitials(displayName)}
          </div>
          <div className="d-none d-md-block text-start">
            <div className="fw-semibold small text-dark">{displayName}</div>
            <Badge bg="secondary" style={{ fontSize: '0.65rem' }}>
              {user?.role ? user.role.toUpperCase() : 'USER'}
            </Badge>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline-danger"
          size="sm"
          className="d-flex align-items-center gap-1"
          onClick={handleLogout}
          title="Sign out of your account"
        >
          <FaSignOutAlt />
          <span className="d-none d-sm-inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
