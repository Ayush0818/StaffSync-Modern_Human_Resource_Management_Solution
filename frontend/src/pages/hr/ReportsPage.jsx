import React, { useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
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
import { format, subMonths } from 'date-fns';
import { FaChartBar, FaUsers, FaCalendarCheck, FaCalendarTimes, FaChartPie, FaBuilding } from 'react-icons/fa';
import StatCard from '../../components/common/StatCard';
import { fetchEmployees } from '../../redux/slices/employeeSlice';
import { fetchAllLeaves } from '../../redux/slices/leaveSlice';
import { fetchAllAttendance } from '../../redux/slices/attendanceSlice';

const PIE_COLORS = ['#3498DB', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C'];

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { employees, loading: employeesLoading } = useSelector((state) => state.employees);
  const { leaves, loading: leavesLoading } = useSelector((state) => state.leaves);
  const { records: attendanceRecords, loading: attendanceLoading } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchAllLeaves());
    dispatch(fetchAllAttendance());
  }, [dispatch]);

  const today = new Date();

  // 1. Calculate Monthly Attendance Trends (last 6 months)
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(today, i);
    const monthKey = format(d, 'yyyy-MM');
    const label = format(d, 'MMM');
    last6Months.push({ monthKey, month: label, Present: 0, Absent: 0, Late: 0 });
  }

  (attendanceRecords || []).forEach((r) => {
    if (!r.date) return;
    try {
      const recDate = typeof r.date === 'string' ? new Date(r.date) : r.date;
      if (isNaN(recDate.getTime())) return;
      const key = format(recDate, 'yyyy-MM');
      const bucket = last6Months.find((b) => b.monthKey === key);
      if (bucket) {
        if (r.status === 'present') bucket.Present += 1;
        else if (r.status === 'absent') bucket.Absent += 1;
        else if (r.status === 'late') bucket.Late += 1;
        else if (r.status === 'half-day') bucket.Present += 1;
      }
    } catch {
      // ignore parsing error
    }
  });

  const monthlyAttendanceData = last6Months.map(({ month, Present, Absent, Late }) => ({
    month,
    Present,
    Absent,
    Late
  }));

  // 2. Current Month Attendance Rate
  const currentMonthKey = format(today, 'yyyy-MM');
  const currentMonthRecords = (attendanceRecords || []).filter((r) => {
    if (!r.date) return false;
    try {
      const recDate = typeof r.date === 'string' ? new Date(r.date) : r.date;
      return format(recDate, 'yyyy-MM') === currentMonthKey;
    } catch {
      return false;
    }
  });

  const totalCurrentMonth = currentMonthRecords.length;
  const presentCurrentMonth = currentMonthRecords.filter(
    (r) => r.status === 'present' || r.status === 'late' || r.status === 'half-day'
  ).length;

  const monthlyAttendanceRate = attendanceLoading
    ? 'Loading...'
    : totalCurrentMonth > 0
    ? `${((presentCurrentMonth / totalCurrentMonth) * 100).toFixed(1)}%`
    : '0%';

  // 3. Leave Category Breakdown (casual, sick, earned, unpaid)
  const leaveCategoryCounts = {
    casual: 0,
    sick: 0,
    earned: 0,
    unpaid: 0
  };

  (leaves || []).forEach((l) => {
    const type = (l.leaveType || '').toLowerCase();
    if (leaveCategoryCounts.hasOwnProperty(type)) {
      leaveCategoryCounts[type] += 1;
    } else if (type) {
      leaveCategoryCounts[type] = (leaveCategoryCounts[type] || 0) + 1;
    }
  });

  const leavePieData = Object.keys(leaveCategoryCounts)
    .filter((k) => leaveCategoryCounts[k] > 0)
    .map((k) => ({
      name: k.charAt(0).toUpperCase() + k.slice(1),
      value: leaveCategoryCounts[k]
    }));

  // 4. Headcount Distribution by Department
  const deptCounts = (employees || []).reduce((acc, emp) => {
    const dept = emp.department || 'Other';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const departmentBarData = Object.keys(deptCounts).map((dept) => ({
    department: dept,
    headcount: deptCounts[dept]
  }));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">HR Analytics & Reports</h3>
          <p className="text-muted mb-0">Visual analysis of organizational attendance trends, leave allocations, and headcount.</p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={4}>
          <StatCard
            title="Total Active Workforce"
            value={employeesLoading ? 'Loading...' : employees?.length || 0}
            icon={FaUsers}
            color="primary"
            subtitle="Registered employees"
          />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard
            title="Monthly Attendance Rate"
            value={monthlyAttendanceRate}
            icon={FaCalendarCheck}
            color="success"
            subtitle="Current month rate"
          />
        </Col>
        <Col xs={12} sm={4}>
          <StatCard
            title="Total Leave Applications"
            value={leavesLoading ? 'Loading...' : leaves?.length || 0}
            icon={FaCalendarTimes}
            color="warning"
            subtitle="All recorded leaves"
          />
        </Col>
      </Row>

      {/* Charts Grid */}
      <Row className="g-4 mb-4">
        {/* Attendance Trends */}
        <Col lg={7}>
          <Card className="card-custom h-100">
            <Card.Header className="card-header-custom d-flex align-items-center gap-2">
              <FaChartBar className="text-primary" />
              <span className="fw-semibold">Monthly Attendance Trends (Last 6 Months)</span>
            </Card.Header>
            <Card.Body>
              {attendanceLoading ? (
                <div className="text-center py-5 text-muted">Loading attendance trends...</div>
              ) : (
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyAttendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Present" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Absent" fill="#E74C3C" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Late" fill="#F39C12" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Leave Category Breakdown */}
        <Col lg={5}>
          <Card className="card-custom h-100">
            <Card.Header className="card-header-custom d-flex align-items-center gap-2">
              <FaChartPie className="text-primary" />
              <span className="fw-semibold">Leave Category Breakdown</span>
            </Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center">
              {leavesLoading ? (
                <div className="text-center py-5 text-muted">Loading leave statistics...</div>
              ) : leavePieData.length === 0 ? (
                <div className="text-center py-5 text-muted">No leave applications recorded yet.</div>
              ) : (
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leavePieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {leavePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Headcount by Department */}
        <Col xs={12}>
          <Card className="card-custom">
            <Card.Header className="card-header-custom d-flex align-items-center gap-2">
              <FaBuilding className="text-primary" />
              <span className="fw-semibold">Headcount Distribution by Department</span>
            </Card.Header>
            <Card.Body>
              {employeesLoading ? (
                <div className="text-center py-5 text-muted">Loading department headcount...</div>
              ) : departmentBarData.length === 0 ? (
                <div className="text-center py-5 text-muted">No employees registered yet.</div>
              ) : (
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentBarData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                      <XAxis dataKey="department" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="headcount" fill="var(--primary, #1E3A5F)" radius={[4, 4, 0, 0]} name="Headcount" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsPage;
