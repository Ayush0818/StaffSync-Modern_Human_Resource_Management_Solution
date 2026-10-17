import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, FaEdit, FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../../components/common/Loader';
import { fetchMyProfile, updateEmployee } from '../../redux/slices/employeeSlice';
import { fetchLeaveBalance } from '../../redux/slices/leaveSlice';
import { formatDate, getFullName } from '../../utils/formatDate';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { myProfile, loading } = useSelector((state) => state.employees);
  const { leaveBalance } = useSelector((state) => state.leaves);
  const { user } = useSelector((state) => state.auth);

  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    address: ''
  });

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchLeaveBalance());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) {
      setFormData({
        phone: myProfile.phone || '',
        address: myProfile.address || ''
      });
    }
  }, [myProfile]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const id = myProfile?._id || user?._id;
    if (!id) return;

    const result = await dispatch(updateEmployee({ id, data: formData }));
    if (updateEmployee.fulfilled.match(result)) {
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
      dispatch(fetchMyProfile());
    } else {
      toast.error(result.payload || 'Failed to update profile');
    }
  };

  if (loading && !myProfile) {
    return <Loader message="Loading profile details..." />;
  }

  const profile = myProfile || user || {};

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Profile</h3>
          <p className="text-muted mb-0">View and update your personal and job information.</p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2"
          onClick={() => setShowEditModal(true)}
          style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <FaEdit /> Edit Profile
        </Button>
      </div>

      <Row className="g-4">
        {/* Profile Card & Avatar */}
        <Col lg={4}>
          <Card className="card-custom text-center p-4">
            <Card.Body>
              <div className="position-relative d-inline-block mb-3">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                  style={{ width: '110px', height: '110px', fontSize: '2.5rem' }}
                >
                  {getFullName(profile).charAt(0).toUpperCase()}
                </div>
                <label
                  htmlFor="photo-upload"
                  className="btn btn-sm btn-secondary position-absolute bottom-0 end-0 rounded-circle"
                  style={{ width: '32px', height: '32px', padding: '5px' }}
                  title="Update photo"
                >
                  <FaCamera size={14} />
                  <input id="photo-upload" type="file" style={{ display: 'none' }} accept="image/*" />
                </label>
              </div>

              <h4 className="fw-bold mb-1">{getFullName(profile) || 'Staff Member'}</h4>
              <p className="text-muted mb-2">{profile.designation || 'Software Engineer'}</p>
              <span className="badge bg-success mb-3 text-capitalize">{profile.status || 'Active'}</span>

              <hr />

              <div className="text-start">
                <div className="mb-2">
                  <small className="text-muted d-block">Employee ID</small>
                  <strong>{profile.employeeCode || profile.employeeId || 'EMP-1001'}</strong>
                </div>
                <div className="mb-2">
                  <small className="text-muted d-block">Reporting Manager</small>
                  <strong>{getFullName(profile.managerId || profile.manager) || 'Direct Supervisor'}</strong>
                </div>
                <div>
                  <small className="text-muted d-block">Date of Joining</small>
                  <strong>{formatDate(profile.dateOfJoining || profile.createdAt)}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Details & Leave Balances */}
        <Col lg={8}>
          {/* Detailed Info */}
          <Card className="card-custom mb-4">
            <Card.Header className="card-header-custom">
              <span className="fw-semibold">Personal & Department Information</span>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div className="p-3 border rounded bg-light">
                    <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                      <FaBuilding className="text-primary" /> Department
                    </div>
                    <div className="fw-bold text-dark">{profile.department || 'Engineering'}</div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 border rounded bg-light">
                    <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                      <FaBriefcase className="text-primary" /> Designation
                    </div>
                    <div className="fw-bold text-dark">{profile.designation || 'Software Engineer'}</div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 border rounded bg-light">
                    <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                      <FaEnvelope className="text-primary" /> Work Email
                    </div>
                    <div className="fw-bold text-dark">{profile.email || user?.email || 'N/A'}</div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 border rounded bg-light">
                    <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                      <FaPhone className="text-primary" /> Contact Phone
                    </div>
                    <div className="fw-bold text-dark">{profile.phone || 'Not provided'}</div>
                  </div>
                </Col>

                <Col md={12}>
                  <div className="p-3 border rounded bg-light">
                    <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                      <FaMapMarkerAlt className="text-primary" /> Residential Address
                    </div>
                    <div className="fw-bold text-dark">{profile.address || 'Not specified'}</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Leave Balances Summary */}
          <Card className="card-custom">
            <Card.Header className="card-header-custom">
              <span className="fw-semibold">Annual Leave Balance</span>
            </Card.Header>
            <Card.Body>
              <Row className="g-3 text-center">
                <Col xs={4}>
                  <div className="p-3 border rounded bg-light">
                    <span className="text-muted small text-uppercase">Casual Leave</span>
                    <h3 className="fw-bold text-primary my-1">{leaveBalance?.casual ?? 6}</h3>
                    <small className="text-muted">Days Left</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="p-3 border rounded bg-light">
                    <span className="text-muted small text-uppercase">Sick Leave</span>
                    <h3 className="fw-bold text-danger my-1">{leaveBalance?.sick ?? 6}</h3>
                    <small className="text-muted">Days Left</small>
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="p-3 border rounded bg-light">
                    <span className="text-muted small text-uppercase">Earned Leave</span>
                    <h3 className="fw-bold text-success my-1">{leaveBalance?.earned ?? 6}</h3>
                    <small className="text-muted">Days Left</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Edit Profile Information</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter contact number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter current address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
