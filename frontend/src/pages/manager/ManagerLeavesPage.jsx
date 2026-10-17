import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Tab, Tabs } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck, FaTimes, FaComment } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DataTable from '../../components/common/DataTable';
import { fetchAllLeaves, approveLeave, rejectLeave } from '../../redux/slices/leaveSlice';
import { formatDate, getFullName } from '../../utils/formatDate';

const ManagerLeavesPage = () => {
  const dispatch = useDispatch();
  const { leaves, loading } = useSelector((state) => state.leaves);

  const [activeTab, setActiveTab] = useState('pending');
  const [modalAction, setModalAction] = useState(null); // { type: 'approve' | 'reject', leaveId: '' }
  const [comments, setComments] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  useEffect(() => {
    dispatch(fetchAllLeaves());
  }, [dispatch]);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!modalAction) return;

    const { type, leaveId } = modalAction;
    let res;
    if (type === 'approve') {
      res = await dispatch(approveLeave({ id: leaveId, comments }));
    } else {
      res = await dispatch(rejectLeave({ id: leaveId, comments }));
    }

    if (res.meta.requestStatus === 'fulfilled') {
      toast.success(`Leave request ${type === 'approve' ? 'approved' : 'rejected'} successfully`);
      setModalAction(null);
      setComments('');
      dispatch(fetchAllLeaves());
    } else {
      toast.error(res.payload || `Failed to ${type} leave`);
    }
  };

  // Filter leaves based on active tab and optional date range
  const filteredLeaves = (leaves || []).filter((leave) => {
    // Status check
    const statusMatch = activeTab === 'all' || leave.status === activeTab;
    if (!statusMatch) return false;

    // Date range filter
    if (dateFilter.start && new Date(leave.startDate) < new Date(dateFilter.start)) {
      return false;
    }
    if (dateFilter.end && new Date(leave.endDate) > new Date(dateFilter.end)) {
      return false;
    }

    return true;
  });

  const columns = [
    {
      header: 'Employee',
      render: (row) => (
        <div>
          <div className="fw-semibold">{getFullName(row.employeeId || row.employee) || 'Employee'}</div>
          <small className="text-muted">{(row.employeeId || row.employee)?.department || 'Department'}</small>
        </div>
      )
    },
    {
      header: 'Type',
      render: (row) => <span className="text-capitalize fw-semibold">{row.leaveType}</span>
    },
    {
      header: 'From',
      render: (row) => formatDate(row.startDate)
    },
    {
      header: 'To',
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
      header: 'Manager Comments',
      render: (row) => row.comments || <span className="text-muted small">None</span>
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
                onClick={() => setModalAction({ type: 'approve', leaveId: row._id })}
                className="d-flex align-items-center gap-1"
              >
                <FaCheck /> Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setModalAction({ type: 'reject', leaveId: row._id })}
                className="d-flex align-items-center gap-1"
              >
                <FaTimes /> Reject
              </Button>
            </div>
          );
        }
        const cls =
          row.status === 'approved'
            ? 'badge-approved'
            : row.status === 'rejected'
            ? 'badge-rejected'
            : 'badge-pending';
        return <span className={`badge ${cls} text-capitalize`}>{row.status}</span>;
      }
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Team Leave Requests</h3>
          <p className="text-muted mb-0">Review, approve, or decline team member time-off requests.</p>
        </div>
      </div>

      <Card className="card-custom">
        <Card.Header className="card-header-custom p-0 border-bottom-0">
          <div className="d-flex flex-wrap justify-content-between align-items-center p-3 gap-3">
            {/* Tabs for Pending, Approved, Rejected */}
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="border-bottom-0"
            >
              <Tab eventKey="pending" title="Pending" />
              <Tab eventKey="approved" title="Approved" />
              <Tab eventKey="rejected" title="Rejected" />
              <Tab eventKey="all" title="All Records" />
            </Tabs>

            {/* Date Range Filter */}
            <div className="d-flex align-items-center gap-2">
              <Form.Control
                type="date"
                size="sm"
                value={dateFilter.start}
                onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                placeholder="From date"
              />
              <span className="text-muted small">to</span>
              <Form.Control
                type="date"
                size="sm"
                value={dateFilter.end}
                onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                placeholder="To date"
              />
              {(dateFilter.start || dateFilter.end) && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setDateFilter({ start: '', end: '' })}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={filteredLeaves}
            loading={loading}
            emptyMessage={`No ${activeTab} leave requests found.`}
          />
        </Card.Body>
      </Card>

      {/* Decision & Comment Modal */}
      <Modal show={!!modalAction} onHide={() => setModalAction(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">
            {modalAction?.type === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleActionSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">
                <FaComment className="me-1 text-primary" /> Optional Feedback or Comments
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Add comments for the employee (e.g. coverage arranged, schedule conflict)..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setModalAction(null)}>
              Cancel
            </Button>
            <Button
              variant={modalAction?.type === 'approve' ? 'success' : 'danger'}
              type="submit"
            >
              Confirm {modalAction?.type === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagerLeavesPage;
