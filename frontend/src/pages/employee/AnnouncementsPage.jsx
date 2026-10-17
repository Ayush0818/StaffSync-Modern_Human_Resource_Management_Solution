import React, { useEffect } from 'react';
import { Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaThumbtack, FaCalendarAlt, FaUser } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { fetchAnnouncements } from '../../redux/slices/announcementSlice';
import { formatDate } from '../../utils/formatDate';

const AnnouncementsPage = () => {
  const dispatch = useDispatch();
  const { announcements, loading } = useSelector((state) => state.announcements);

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const getCategoryBadge = (category) => {
    switch (category?.toLowerCase()) {
      case 'urgent':
        return <Badge bg="danger">Urgent</Badge>;
      case 'event':
        return <Badge bg="primary">Event</Badge>;
      case 'policy':
        return <Badge bg="warning" text="dark">Policy Update</Badge>;
      case 'general':
      default:
        return <Badge bg="success">General</Badge>;
    }
  };

  // Sort: pinned announcements first, then by date descending
  const sortedAnnouncements = Array.isArray(announcements)
    ? [...announcements].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
    : [];

  if (loading && announcements.length === 0) {
    return <Loader message="Loading announcements..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Company Announcements</h3>
          <p className="text-muted mb-0">Stay updated with company-wide notices, events, and policy updates.</p>
        </div>
      </div>

      {sortedAnnouncements.length === 0 ? (
        <Alert variant="info">No company announcements found at this time.</Alert>
      ) : (
        <Row className="g-3">
          {sortedAnnouncements.map((item) => (
            <Col xs={12} key={item._id}>
              <Card
                className={`card-custom ${item.isPinned ? 'border-primary border-2' : ''}`}
                style={item.isPinned ? { backgroundColor: '#F8FBFF' } : {}}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      {item.isPinned && (
                        <FaThumbtack className="text-primary me-1" title="Pinned Announcement" />
                      )}
                      <h5 className="fw-bold text-dark mb-0">{item.title}</h5>
                    </div>
                    {getCategoryBadge(item.category)}
                  </div>

                  <p className="text-secondary mt-2 mb-3" style={{ lineHeight: '1.6' }}>
                    {item.content}
                  </p>

                  <div className="d-flex flex-wrap align-items-center gap-3 text-muted small border-top pt-2">
                    <span className="d-flex align-items-center gap-1">
                      <FaCalendarAlt /> {formatDate(item.createdAt)}
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <FaUser /> Posted by: {item.postedBy?.name || item.author || 'HR Department'}
                    </span>
                    {item.targetAudience && (
                      <span className="badge bg-light text-dark border">
                        Target: {item.targetAudience}
                      </span>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AnnouncementsPage;
