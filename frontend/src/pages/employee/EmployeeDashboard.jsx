import React, { useEffect } from 'react';
import { Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendarDay, FaCheckCircle, FaHourglassHalf, FaUmbrellaBeach, FaBullhorn } from 'react-icons/fa';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import Loader from '../../components/common/Loader';
import { fetchMyProfile } from '../../redux/slices/employeeSlice';
import { fetchMyAttendance, fetchSummary } from '../../redux/slices/attendanceSlice';
import { fetchMyLeaves, fetchLeaveBalance } from '../../redux/slices/leaveSlice';
import { fetchAnnouncements } from '../../redux/slices/announcementSlice';
import { formatDate, getFullName } from '../../utils/formatDate';

const EmployeeDashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { myProfile, loading: profileLoading } = useSelector((state) => state.employees);
  const { records: attendanceRecords, summary, loading: attLoading } = useSelector((state) => state.attendance);
  const { myLeaves, leaveBalance, loading: leaveLoading } = useSelector((state) => state.leaves);
  const { announcements } = useSelector((state) => state.announcements);

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchMyAttendance());
    dispatch(fetchSummary());
    dispatch(fetchMyLeaves());
    dispatch(fetchLeaveBalance());
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const employeeName = getFullName(myProfile) || user?.name || 'Employee';

  // Last 7 attendance records
  const recentAttendance = Array.isArray(attendanceRecords)
    ? [...attendanceRecords].slice(0, 7)
    : [];

  // Recent 5 leaves
  const recentLeaves = Array.isArray(myLeaves)
    ? [...myLeaves].slice(0, 5)
    : [];

  // Pending leaves count
  const pendingLeavesCount = Array.isArray(myLeaves)
    ? myLeaves.filter((l) => l.status === 'pending').length
    : 0;

  // Remaining leave balance
  const remainingLeaves = leaveBalance
    ? (leaveBalance.casual || 0) + (leaveBalance.sick || 0) + (leaveBalance.earned || 0)
    : 18;

  const attendanceColumns = [
    {
      header: 'Date',
      render: (row) => formatDate(row.date)
    },
    {
      header: 'Check In',
      render: (row) => (row.checkInTime ? formatDate(row.checkInTime, 'hh:mm a') : '--')
    },
    {
      header: 'Check Out',
      render: (row) => (row.checkOutTime ? formatDate(row.checkOutTime, 'hh:mm a') : '--')
    },
    {
      header: 'Status',
      render: (row) => {
        const status = row.status || 'present';
        const color = status === 'present' ? 'success' : status === 'late' ? 'warning' : 'danger';
        return <Badge bg={color} className="text-capitalize">{status}</Badge>;
      }
    }
  ];

  const leaveColumns = [
    {
      header: 'Type',
      render: (row) => <span className="text-capitalize fw-semibold">{row.leaveType || 'General'}</span>
    },
    {
      header: 'Dates',
      render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`
    },
    {
      header: 'Days',
      accessor: 'totalDays'
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
    }
  ];

  if (profileLoading && !myProfile) {
    return <Loader message="Loading employee dashboard..." />;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Welcome back, {employeeName}! 👋</h3>
          <p className="text-muted mb-0">Here is a quick overview of your work, attendance, and leave status.</p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Working Days"
            value={summary?.totalWorkingDays || 22}
            icon={FaCalendarDay}
            color="primary"
            subtitle="Current month"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Days Present"
            value={summary?.present || attendanceRecords?.length || 0}
            icon={FaCheckCircle}
            color="success"
            subtitle="Recorded this month"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Pending Leaves"
            value={pendingLeavesCount}
            icon={FaHourglassHalf}
            color="warning"
            subtitle="Awaiting manager approval"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Leave Balance"
            value={remainingLeaves}
            icon={FaUmbrellaBeach}
            color="info"
            subtitle="Days available this year"
          />
        </Col>
      </Row>

      <Row className="g-4">
        {/* Recent Attendance */}
        <Col lg={7}>
          <Card className="card-custom">
            <Card.Header className="card-header-custom">
              <span className="fw-semibold">Recent Attendance (Last 7 Days)</span>
            </Card.Header>
            <Card.Body className="p-0">
              <DataTable
                columns={attendanceColumns}
                data={recentAttendance}
                loading={attLoading}
                emptyMessage="No attendance records found for this period."
              />
            </Card.Body>
          </Card>

          {/* Recent Leave Requests */}
          <Card className="card-custom">
            <Card.Header className="card-header-custom">
              <span className="fw-semibold">Recent Leave Requests</span>
            </Card.Header>
            <Card.Body className="p-0">
              <DataTable
                columns={leaveColumns}
                data={recentLeaves}
                loading={leaveLoading}
                emptyMessage="No recent leave requests."
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Announcements Sidebar */}
        <Col lg={5}>
          <Card className="card-custom">
            <Card.Header className="card-header-custom d-flex align-items-center">
              <FaBullhorn className="text-warning me-2" />
              <span className="fw-semibold">Company Announcements</span>
            </Card.Header>
            <Card.Body>
              {announcements && announcements.length > 0 ? (
                announcements.slice(0, 3).map((ann) => (
                  <div key={ann._id} className="p-3 mb-3 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="fw-bold text-dark mb-0">{ann.title}</h6>
                      <Badge bg={ann.category === 'urgent' ? 'danger' : 'primary'} className="text-capitalize">
                        {ann.category || 'General'}
                      </Badge>
                    </div>
                    <p className="text-muted small mb-2">{ann.content}</p>
                    <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                      Posted on {formatDate(ann.createdAt)}
                    </small>
                  </div>
                ))
              ) : (
                <Alert variant="info" className="mb-0 small">
                  No announcements at this time.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboard;
