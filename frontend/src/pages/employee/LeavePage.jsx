import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import { applyLeave, fetchMyLeaves, fetchLeaveBalance, cancelLeave } from '../../redux/slices/leaveSlice';
import { formatDate, getDaysDifference } from '../../utils/formatDate';
import { LEAVE_TYPES } from '../../utils/constants';

const LeavePage = () => {
  const dispatch = useDispatch();
  const { myLeaves, leaveBalance, loading } = useSelector((state) => state.leaves);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [cancelModalId, setCancelModalId] = useState(null);

  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    dispatch(fetchMyLeaves());
    dispatch(fetchLeaveBalance());
  }, [dispatch]);

  // Calculate total days automatically based on selected start and end dates
  const calculatedDays = formData.startDate && formData.endDate
    ? getDaysDifference(formData.startDate, formData.endDate)
    : 1;

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      toast.warning('Please select both start and end dates');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error('End date cannot be earlier than start date');
      return;
    }

    const payload = {
      ...formData,
      totalDays: calculatedDays
    };

    const res = await dispatch(applyLeave(payload));
    if (applyLeave.fulfilled.match(res)) {
      toast.success('Leave application submitted successfully!');
      setShowApplyModal(false);
      setFormData({ leaveType: 'casual', startDate: '', endDate: '', reason: '' });
      dispatch(fetchMyLeaves());
      dispatch(fetchLeaveBalance());
    } else {
      toast.error(res.payload || 'Failed to apply for leave');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalId) return;
    const res = await dispatch(cancelLeave(cancelModalId));
    if (cancelLeave.fulfilled.match(res)) {
      toast.success('Leave application cancelled');
      setCancelModalId(null);
      dispatch(fetchMyLeaves());
      dispatch(fetchLeaveBalance());
    } else {
      toast.error(res.payload || 'Failed to cancel leave');
    }
  };

  const columns = [
    {
      header: 'Leave Type',
      render: (row) => <span className="text-capitalize fw-semibold">{row.leaveType}</span>
    },
    {
      header: 'From Date',
      render: (row) => formatDate(row.startDate)
    },
    {
      header: 'To Date',
      render: (row) => formatDate(row.endDate)
    },
    {
      header: 'Days',
      accessor: 'totalDays'
    },
    {
      header: 'Reason',
      render: (row) => <span className="text-truncate d-inline-block" style={{ maxWidth: '220px' }}>{row.reason}</span>
    },
    {
      header: 'Status',
      render: (row) => {
        const cls =
          row.status === 'approved'
            ? 'badge-approved'
            : row.status === 'rejected'
            ? 'badge-rejected'
            : 'badge-pending';
        return <span className={`badge ${cls} text-capitalize`}>{row.status || 'pending'}</span>;
      }
    },
    {
      header: 'Actions',
      render: (row) => {
        if (row.status === 'pending') {
          return (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setCancelModalId(row._id)}
              className="d-flex align-items-center gap-1"
            >
              <FaTimes /> Cancel
            </Button>
          );
        }
        return <span className="text-muted small">--</span>;
      }
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Leave Management</h3>
          <p className="text-muted mb-0">Check your available leave balance and submit new leave requests.</p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2"
          onClick={() => setShowApplyModal(true)}
          style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <FaPlus /> Apply Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={4}>
          <StatCard
            title="Casual Leaves"
            value={leaveBalance?.casual ?? 6}
            color="primary"
            subtitle="Available this year"
          />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard
            title="Sick Leaves"
            value={leaveBalance?.sick ?? 6}
            color="danger"
            subtitle="Available this year"
          />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard
            title="Earned Leaves"
            value={leaveBalance?.earned ?? 6}
            color="success"
            subtitle="Available this year"
          />
        </Col>
      </Row>

      {/* Leave Application History Table */}
      <Card className="card-custom">
        <Card.Header className="card-header-custom d-flex align-items-center gap-2">
          <FaCalendarAlt className="text-primary" />
          <span className="fw-semibold">My Leave Applications</span>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={myLeaves}
            loading={loading}
            emptyMessage="You have not submitted any leave applications yet."
          />
        </Card.Body>
      </Card>

      {/* Apply Leave Modal Form */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Apply for Leave</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleApplySubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Leave Type</Form.Label>
              <Form.Select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                required
              >
                {LEAVE_TYPES.map((lt) => (
                  <option key={lt.value} value={lt.value}>
                    {lt.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row className="g-2 mb-3">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mb-3 p-2 bg-light rounded text-center small text-secondary">
              Total Duration: <strong>{calculatedDays} day(s)</strong>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Reason for Leave</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="State the reason for your leave request..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowApplyModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              Submit Request
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Confirm Cancellation Dialog */}
      <ConfirmModal
        show={!!cancelModalId}
        title="Cancel Leave Request"
        message="Are you sure you want to cancel this pending leave request?"
        confirmText="Yes, Cancel Leave"
        confirmVariant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalId(null)}
      />
    </div>
  );
};

export default LeavePage;
