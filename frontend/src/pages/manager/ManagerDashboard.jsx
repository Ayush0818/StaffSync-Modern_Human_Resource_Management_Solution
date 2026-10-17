import React, { useEffect } from 'react';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaUsers, FaUserCheck, FaCalendarTimes, FaGraduationCap, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import { fetchMyTeam } from '../../redux/slices/managerSlice';
import { fetchPendingLeaves, approveLeave, rejectLeave } from '../../redux/slices/leaveSlice';
import { fetchTrainings } from '../../redux/slices/trainingSlice';
import { fetchAllAttendance } from '../../redux/slices/attendanceSlice';
import { formatDate, getFullName } from '../../utils/formatDate';

const ManagerDashboard = () => {
  const dispatch = useDispatch();

  const { myTeam } = useSelector((state) => state.managers);
  const { pendingLeaves, loading: leaveLoading } = useSelector((state) => state.leaves);
  const { trainings } = useSelector((state) => state.trainings);
  const { records: attendanceRecords } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchMyTeam());
    dispatch(fetchPendingLeaves());
    dispatch(fetchTrainings());
    dispatch(fetchAllAttendance());
  }, [dispatch]);

  const handleApprove = async (id) => {
    const res = await dispatch(approveLeave({ id, comments: 'Approved by Team Manager' }));
    if (approveLeave.fulfilled.match(res)) {
      toast.success('Leave request approved');
      dispatch(fetchPendingLeaves());
    } else {
      toast.error(res.payload || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    const res = await dispatch(rejectLeave({ id, comments: 'Rejected by Team Manager' }));
    if (rejectLeave.fulfilled.match(res)) {
      toast.info('Leave request rejected');
      dispatch(fetchPendingLeaves());
    } else {
      toast.error(res.payload || 'Failed to reject');
    }
  };

  // Team size
  const teamSize = myTeam?.length || 0;

  // Active trainings
  const activeTrainings = trainings.filter(
    (t) => t.status === 'ongoing' || t.status === 'upcoming'
  ).length;

  const pendingLeavesColumns = [
    {
      header: 'Employee',
      render: (row) => <strong>{getFullName(row.employeeId || row.employee) || 'Employee'}</strong>
    },
    {
      header: 'Type',
      render: (row) => <span className="text-capitalize">{row.leaveType}</span>
    },
    {
      header: 'Duration',
      render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)} (${row.totalDays}d)`
    },
    {
      header: 'Reason',
      render: (row) => <span className="text-truncate d-inline-block" style={{ maxWidth: '180px' }}>{row.reason}</span>
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant="success"
            size="sm"
            onClick={() => handleApprove(row._id)}
            title="Approve leave"
          >
            <FaCheck />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleReject(row._id)}
            title="Reject leave"
          >
            <FaTimes />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Manager Overview</h3>
          <p className="text-muted mb-0">Monitor team status, manage approvals, and review active programs.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Team Size"
            value={teamSize}
            icon={FaUsers}
            color="primary"
            subtitle="Direct reportees"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Present Today"
            value={attendanceRecords.filter(r => r.status === 'present').length || teamSize}
            icon={FaUserCheck}
            color="success"
            subtitle="Active on shift"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Pending Requests"
            value={pendingLeaves?.length || 0}
            icon={FaCalendarTimes}
            color="warning"
            subtitle="Leaves awaiting decision"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Active Trainings"
            value={activeTrainings}
            icon={FaGraduationCap}
            color="info"
            subtitle="Upskilling sessions"
          />
        </Col>
      </Row>

      <Row className="g-4">
        {/* Pending Leave Requests */}
        <Col lg={7}>
          <Card className="card-custom">
            <Card.Header className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Action Required: Pending Leave Approvals</span>
              <Badge bg="warning" text="dark">{pendingLeaves?.length || 0} Pending</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <DataTable
                columns={pendingLeavesColumns}
                data={pendingLeaves}
                loading={leaveLoading}
                emptyMessage="No pending leave applications from your team."
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Team Members List */}
        <Col lg={5}>
          <Card className="card-custom">
            <Card.Header className="card-header-custom">
              <span className="fw-semibold">My Team Members ({teamSize})</span>
            </Card.Header>
            <Card.Body>
              {myTeam && myTeam.length > 0 ? (
                <div className="list-group list-group-flush">
                  {myTeam.slice(0, 5).map((member) => {
                    const emp = member.employee || member;
                    return (
                      <div key={emp._id || member._id} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold text-dark">{getFullName(emp)}</div>
                          <small className="text-muted">{emp.designation || 'Team Member'} • {emp.department}</small>
                        </div>
                        <Badge bg="success">Active</Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted small">
                  No direct reportees found in your team.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerDashboard;
