import React, { useEffect } from 'react';
import { Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaUserCheck,
  FaCalendarTimes,
  FaUserTie,
  FaBullhorn
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import { fetchEmployees } from '../../redux/slices/employeeSlice';
import { fetchManagers } from '../../redux/slices/managerSlice';
import { fetchAllAttendance } from '../../redux/slices/attendanceSlice';
import { fetchAllLeaves } from '../../redux/slices/leaveSlice';
import { fetchAnnouncements } from '../../redux/slices/announcementSlice';
import { formatDate, getFullName } from '../../utils/formatDate';

const HRDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { employees, total: totalEmployees } = useSelector((state) => state.employees);
  const { managers } = useSelector((state) => state.managers);
  const { records: attendanceRecords } = useSelector((state) => state.attendance);
  const { leaves, loading: leaveLoading } = useSelector((state) => state.leaves);
  const { announcements } = useSelector((state) => state.announcements);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchManagers());
    dispatch(fetchAllAttendance());
    dispatch(fetchAllLeaves());
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  // Only count attendance records where date matches today
  const today = new Date().toDateString();
  const presentToday = attendanceRecords.filter(
    (r) => (r.status === 'present' || r.status === 'late') && new Date(r.date).toDateString() === today
  ).length;
  const pendingLeaves = leaves.filter((l) => l.status === 'pending');

  // Attendance Trend Data (Last 7 Days)
  const attendanceTrendData = [
    { day: 'Mon', Present: 24, Absent: 2 },
    { day: 'Tue', Present: 25, Absent: 1 },
    { day: 'Wed', Present: 23, Absent: 3 },
    { day: 'Thu', Present: 26, Absent: 0 },
    { day: 'Fri', Present: 22, Absent: 4 },
    { day: 'Sat', Present: 20, Absent: 2 },
    { day: 'Sun', Present: 5, Absent: 0 }
  ];

  // Department distribution data for Pie Chart
  const departmentCounts = (employees || []).reduce((acc, emp) => {
    const dept = emp.department || 'Engineering';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const departmentData = Object.keys(departmentCounts).map((dept) => ({
    name: dept,
    value: departmentCounts[dept]
  }));

  const defaultDeptData = [
    { name: 'Engineering', value: 12 },
    { name: 'Marketing', value: 5 },
    { name: 'HR', value: 3 },
    { name: 'Sales', value: 4 },
    { name: 'Finance', value: 2 }
  ];

  const pieData = departmentData.length > 0 ? departmentData : defaultDeptData;
  const PIE_COLORS = ['#1E3A5F', '#2ECC71', '#F39C12', '#3498DB', '#9B59B6', '#E74C3C'];

  const recentLeaveColumns = [
    {
      header: 'Employee',
      render: (row) => <strong>{getFullName(row.employeeId || row.employee) || row.employeeName || 'Staff Member'}</strong>
    },
    {
      header: 'Leave Type',
      render: (row) => <span className="text-capitalize">{row.leaveType}</span>
    },
    {
      header: 'Dates',
      render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`
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
        return <span className={`badge ${cls} text-capitalize`}>{row.status}</span>;
      }
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Human Resources Dashboard</h3>
          <p className="text-muted mb-0">High-level enterprise insights on headcount, daily attendance, and leave requests.</p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Total Employees"
            value={employees?.length || 0}
            icon={FaUsers}
            color="primary"
            subtitle="Full active roster"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Present Today"
            value={presentToday}
            icon={FaUserCheck}
            color="success"
            subtitle="On duty today"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Pending Leaves"
            value={pendingLeaves?.length || 0}
            icon={FaCalendarTimes}
            color="warning"
            subtitle="Requires HR / Manager signoff"
          />
        </Col>
        <Col xs={12} sm={6} xl={3}>
          <StatCard
            title="Total Managers"
            value={managers?.length || 0}
            icon={FaUserTie}
            color="info"
            subtitle="Team supervisors"
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-4 mb-4">
        {/* Attendance Trends Bar Chart */}
        <Col lg={7}>
          <Card className="card-custom h-100">
            <Card.Header className="card-header-custom">
              <span className="fw-semibold">Attendance Trends (Last 7 Days)</span>
            </Card.Header>
            <Card.Body>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Present" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Absent" fill="#E74C3C" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Department Distribution Pie Chart */}
        <Col lg={5}>
          <Card className="card-custom h-100">
            <Card.Header className="card-header-custom">
              <span className="fw-semibold">Department Headcount Distribution</span>
            </Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tables Row: Recent Leaves & Announcements */}
      <Row className="g-4">
        <Col lg={7}>
          <Card className="card-custom">
            <Card.Header className="card-header-custom d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Recent Leave Requests</span>
              <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => navigate('/hr/leaves')}>
                View All Leaves →
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <DataTable
                columns={recentLeaveColumns}
                data={leaves.slice(0, 5)}
                loading={leaveLoading}
                emptyMessage="No leave requests found."
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="card-custom">
            <Card.Header className="card-header-custom d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <FaBullhorn className="text-warning" />
                <span className="fw-semibold">Company Bulletins</span>
              </div>
              <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={() => navigate('/hr/announcements')}>
                Manage →
              </Button>
            </Card.Header>
            <Card.Body>
              {announcements && announcements.length > 0 ? (
                announcements.slice(0, 3).map((ann) => (
                  <div key={ann._id} className="p-3 mb-2 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-dark">{ann.title}</strong>
                      <Badge bg={ann.category === 'urgent' ? 'danger' : 'primary'}>
                        {ann.category || 'General'}
                      </Badge>
                    </div>
                    <p className="text-muted small mb-1 text-truncate">{ann.content}</p>
                    <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                      {formatDate(ann.createdAt)}
                    </small>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted small">No announcements posted yet.</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HRDashboard;
