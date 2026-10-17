import React, { useEffect } from 'react';
import { Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaGraduationCap, FaUserTie, FaLaptop, FaCalendarAlt, FaClock } from 'react-icons/fa';
import Loader from '../../components/common/Loader';
import { fetchMyTrainings } from '../../redux/slices/trainingSlice';
import { formatDate } from '../../utils/formatDate';

const TrainingsPage = () => {
  const dispatch = useDispatch();
  const { myTrainings, loading } = useSelector((state) => state.trainings);

  useEffect(() => {
    dispatch(fetchMyTrainings());
  }, [dispatch]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'ongoing':
        return <Badge bg="warning" text="dark">Ongoing</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'upcoming':
      default:
        return <Badge bg="info">Upcoming</Badge>;
    }
  };

  const getModeBadge = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'online':
        return <Badge bg="primary">Online</Badge>;
      case 'offline':
        return <Badge bg="secondary">In-Person</Badge>;
      case 'hybrid':
      default:
        return <Badge bg="dark">Hybrid</Badge>;
    }
  };

  if (loading && myTrainings.length === 0) {
    return <Loader message="Loading your trainings..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Enrolled Trainings</h3>
          <p className="text-muted mb-0">Professional development sessions and skill development programs.</p>
        </div>
      </div>

      {myTrainings.length === 0 ? (
        <Alert variant="info" className="p-4 text-center">
          <FaGraduationCap size={36} className="text-primary mb-2 d-block mx-auto" />
          <h5>No Enrolled Trainings</h5>
          <p className="text-muted mb-0">
            You are currently not enrolled in any training programs. Your manager or HR will assign trainings based on your growth plan.
          </p>
        </Alert>
      ) : (
        <Row className="g-4">
          {myTrainings.map((training) => (
            <Col md={6} lg={4} key={training._id}>
              <Card className="card-custom h-100 shadow-sm border-0">
                <Card.Body className="d-flex flex-column p-4">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="fw-bold text-dark fs-5">{training.title}</span>
                    {getStatusBadge(training.status)}
                  </div>

                  <p className="text-muted small flex-grow-1 mb-3">
                    {training.description || 'Comprehensive workplace training and skill advancement.'}
                  </p>

                  <div className="border-top pt-3 small text-secondary">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaUserTie className="text-primary" />
                      <span>Trainer: <strong>{training.trainer || 'External Mentor'}</strong></span>
                    </div>

                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaLaptop className="text-primary" />
                      <span>Delivery Mode: {getModeBadge(training.mode)}</span>
                    </div>

                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FaCalendarAlt className="text-primary" />
                      <span>
                        {formatDate(training.startDate)} - {formatDate(training.endDate)}
                      </span>
                    </div>

                    {training.department && (
                      <div className="d-flex align-items-center gap-2">
                        <FaClock className="text-primary" />
                        <span>Department: {training.department}</span>
                      </div>
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

export default TrainingsPage;
