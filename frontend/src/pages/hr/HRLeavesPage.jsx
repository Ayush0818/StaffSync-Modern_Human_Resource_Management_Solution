import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Tab, Tabs, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck, FaTimes, FaComment, FaCalendarAlt, FaSyncAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DataTable from '../../components/common/DataTable';
import { fetchAllLeaves, approveLeave, rejectLeave } from '../../redux/slices/leaveSlice';
import { formatDate, getFullName } from '../../utils/formatDate';
import { getFriendlyError } from '../../utils/errorMessages';
import { DEPARTMENTS } from '../../utils/constants';

const HRLeavesPage = () => {
  const dispatch = useDispatch();
  const { leaves, loading, error } = useSelector((state) => state.leaves);

  const [activeTab, setActiveTab] = useState('all');
  const [selectedDept, setSelectedDept] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Decision Modal
  const [decisionModal, setDecisionModal] = useState(null); // { type: 'approve'|'reject', leaveId: '' }
  const [comments, setComments] = useState('');

  const handleRefresh = () => {
    dispatch(fetchAllLeaves());
  };

  useEffect(() => {
    dispatch(fetchAllLeaves());
  }, [dispatch]);

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!decisionModal) return;

    const { type, leaveId } = decisionModal;
    let res;
    if (type === 'approve') {
      res = await dispatch(approveLeave({ id: leaveId, comments }));
    } else {
      res = await dispatch(rejectLeave({ id: leaveId, comments }));
    }

    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(`Leave request ${type === 'approve' ? 'approved' : 'rejected'} successfully`);
      setDecisionModal(null);
      setComments('');
      dispatch(fetchAllLeaves());
    } else {
      toast.error(getFriendlyError(res.payload, `Failed to ${type} leave`));
    }
  };

  // Filter leaves
  const filteredLeaves = (leaves || []).filter((l) => {
    const matchesTab = activeTab === 'all' || l.status === activeTab;
    const empDept = (l.employeeId?.department || l.employee?.department || '');
    const matchesDept = !selectedDept || empDept === selectedDept;

    let matchesDate = true;
    if (filterDate) {
      const s = l.startDate ? (typeof l.startDate === 'string' ? l.startDate.slice(0, 10) : new Date(l.startDate).toISOString().slice(0, 10)) : '';
      const e = l.endDate ? (typeof l.endDate === 'string' ? l.endDate.slice(0, 10) : new Date(l.endDate).toISOString().slice(0, 10)) : '';
      matchesDate = Boolean(s && e && s <= filterDate && e >= filterDate);
    }

    return matchesTab && matchesDept && matchesDate;
  });

  const columns = [
    {
      header: 'Employee',
      render: (row) => (
        <div>
          <div className="fw-semibold text-dark">{getFullName(row.employeeId || row.employee) || 'Employee'}</div>
          <small className="text-muted">{(row.employeeId || row.employee)?.department || 'Department'}</small>
        </div>
      )
    },
    {
      header: 'Leave Type',
      render: (row) => <span className="text-capitalize fw-semibold">{row.leaveType}</span>
    },
    {
      header: 'Start Date',
      render: (row) => formatDate(row.startDate)
    },
    {
      header: 'End Date',
      render: (row) => formatDate(row.endDate)
    },
    {
      header: 'Days',
      accessor: 'totalDays'
    },
    {
      header: 'Reason',
      render: (row) => <span className="text-truncate d-inline-block" style={{ maxWidth: '180px' }}>{row.reason}</span>
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
            <div className="d-flex gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => setDecisionModal({ type: 'approve', leaveId: row._id })}
                title="Approve"
              >
                <FaCheck />
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setDecisionModal({ type: 'reject', leaveId: row._id })}
                title="Reject"
              >
                <FaTimes />
              </Button>
            </div>
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
          <h3 className="fw-bold text-dark mb-1">Leave Requests Management</h3>
          <p className="text-muted mb-0">Oversee employee leave requests, review justifications, and enforce leave policies.</p>
        </div>
        <Button
          variant="outline-primary"
          className="d-flex align-items-center gap-2"
          onClick={handleRefresh}
          disabled={loading}
        >
          <FaSyncAlt className={loading ? 'fa-spin' : ''} /> Refresh
        </Button>
      </div>

      <Card className="card-custom">
        <Card.Header className="card-header-custom p-0 border-bottom-0">
          <div className="d-flex flex-wrap justify-content-between align-items-center p-3 gap-3">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="border-bottom-0"
            >
              <Tab eventKey="all" title="All Requests" />
              <Tab eventKey="pending" title="Pending" />
              <Tab eventKey="approved" title="Approved" />
              <Tab eventKey="rejected" title="Rejected" />
            </Tabs>

            <div className="d-flex align-items-center gap-2">
              <Form.Select
                size="sm"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ width: '180px' }}
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>

              <Form.Control
                type="date"
                size="sm"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                style={{ width: '150px' }}
                title="Filter by active date"
              />

              {(selectedDept || filterDate) && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedDept('');
                    setFilterDate('');
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {error && (
            <div className="alert alert-warning m-3 d-flex justify-content-between align-items-center">
              <span>{getFriendlyError(error, 'Could not load leave records.')}</span>
              <Button size="sm" variant="outline-dark" onClick={handleRefresh}>
                Retry
              </Button>
            </div>
          )}
          {!loading && (!leaves || leaves.length === 0) ? (
            <div className="text-center py-5">
              <p className="text-muted mb-3">No leave applications have been submitted yet.</p>
              <Button variant="outline-primary" size="sm" onClick={handleRefresh}>
                <FaSyncAlt className="me-1" /> Refresh Leaves
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredLeaves}
              loading={loading}
              emptyMessage="No leave records matching the criteria."
            />
          )}
        </Card.Body>
      </Card>

      {/* Decision Modal */}
      <Modal show={!!decisionModal} onHide={() => setDecisionModal(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">
            {decisionModal?.type === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleDecisionSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">
                <FaComment className="me-1 text-primary" /> Optional Feedback or Comments
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Remarks or reason for this decision..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDecisionModal(null)}>
              Cancel
            </Button>
            <Button
              variant={decisionModal?.type === 'approve' ? 'success' : 'danger'}
              type="submit"
            >
              Confirm {decisionModal?.type === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HRLeavesPage;
