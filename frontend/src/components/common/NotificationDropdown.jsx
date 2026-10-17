import React, { useEffect } from 'react';
import { Dropdown, Badge, Button } from 'react-bootstrap';
import { FaBell, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead
} from '../../redux/slices/notificationSlice';
import { formatDate } from '../../utils/formatDate';

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    dispatch(markAsRead(id));
  };

  const handleMarkAll = (e) => {
    e.stopPropagation();
    dispatch(markAllAsRead());
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle as="div" className="notification-bell-btn position-relative" style={{ cursor: 'pointer' }}>
        <FaBell size={20} className="text-secondary" />
        {unreadCount > 0 && (
          <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-dropdown-menu shadow p-0" style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }}>
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light">
          <span className="fw-bold fs-6">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={handleMarkAll}>
              Mark all read
            </Button>
          )}
        </div>

        {notifications && notifications.length > 0 ? (
          notifications.slice(0, 10).map((item) => (
            <Dropdown.Item
              key={item._id}
              className={`p-3 border-bottom text-wrap ${!item.isRead ? 'bg-light' : ''}`}
              onClick={() => !item.isRead && dispatch(markAsRead(item._id))}
            >
              <div className="d-flex align-items-start gap-2">
                <FaInfoCircle className="text-primary mt-1 flex-shrink-0" />
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong className="small text-dark">{item.title}</strong>
                    {!item.isRead && (
                      <span
                        className="badge bg-primary rounded-pill"
                        style={{ fontSize: '0.65rem', cursor: 'pointer' }}
                        onClick={(e) => handleMarkAsRead(item._id, e)}
                        title="Mark as read"
                      >
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-muted small mb-1">{item.message}</p>
                  <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                    {formatDate(item.createdAt, 'dd MMM, hh:mm a')}
                  </small>
                </div>
              </div>
            </Dropdown.Item>
          ))
        ) : (
          <div className="text-center py-4 text-muted small">
            <FaCheckCircle className="text-success mb-2 d-block mx-auto" size={24} />
            No new notifications
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;
