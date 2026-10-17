import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaSignInAlt, FaSignOutAlt, FaClock, FaCalendarCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import { checkIn, checkOut, fetchMyAttendance, fetchSummary } from '../../redux/slices/attendanceSlice';
import { formatDate } from '../../utils/formatDate';

const AttendancePage = () => {
  const dispatch = useDispatch();
  const { records, todayRecord, summary, loading } = useSelector((state) => state.attendance);

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Keep digital clock updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    dispatch(fetchMyAttendance({ month: selectedMonth, year: selectedYear }));
    dispatch(fetchSummary({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  const hasCheckedIn = !!todayRecord?.checkInTime;
  const hasCheckedOut = !!todayRecord?.checkOutTime;

  const handleCheckIn = async () => {
    const res = await dispatch(checkIn());
    if (checkIn.fulfilled.match(res)) {
      toast.success('Successfully checked in for today!');
      dispatch(fetchMyAttendance());
    } else {
      toast.error(res.payload || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    const res = await dispatch(checkOut());
    if (checkOut.fulfilled.match(res)) {
      toast.success('Successfully checked out! Have a great evening.');
      dispatch(fetchMyAttendance());
    } else {
      toast.error(res.payload || 'Check-out failed');
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchMyAttendance({ month: selectedMonth, year: selectedYear }));
    dispatch(fetchSummary({ month: selectedMonth, year: selectedYear }));
  };

  const columns = [
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
      header: 'Work Hours',
      render: (row) => {
        if (!row.checkInTime || !row.checkOutTime) return '--';
        const start = new Date(row.checkInTime);
        const end = new Date(row.checkOutTime);
        const diffHrs = ((end - start) / (1000 * 60 * 60)).toFixed(1);
        return `${diffHrs} hrs`;
      }
    },
    {
      header: 'Status',
      render: (row) => {
        const status = row.status || 'present';
        const badgeColor =
          status === 'present'
            ? 'success'
            : status === 'late'
            ? 'warning'
            : status === 'half-day'
            ? 'info'
            : 'danger';
        return <Badge bg={badgeColor} className="text-capitalize">{status}</Badge>;
      }
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Attendance</h3>
          <p className="text-muted mb-0">Record your daily attendance and review attendance history.</p>
        </div>
      </div>

      {/* Today's Punch Card & Live Clock */}
      <Card className="card-custom mb-4 border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 text-primary mb-2">
                <FaClock size={22} />
                <span className="fs-5 fw-bold">{currentTime}</span>
              </div>
              <h5 className="text-dark fw-bold mb-1">Today's Status:</h5>
              <p className="text-muted small mb-0">
                {hasCheckedIn
                  ? `Checked in at ${formatDate(todayRecord.checkInTime, 'hh:mm a')}`
                  : 'You have not checked in yet today.'}
                {hasCheckedOut && ` • Checked out at ${formatDate(todayRecord.checkOutTime, 'hh:mm a')}`}
              </p>
            </Col>

            <Col md={6} className="text-center text-md-end">
              <div className="d-flex justify-content-center justify-content-md-end gap-3">
                <Button
                  variant="success"
                  size="lg"
                  className="px-4 fw-semibold"
                  disabled={hasCheckedIn || loading}
                  onClick={handleCheckIn}
                >
                  <FaSignInAlt className="me-2" />
                  {hasCheckedIn ? 'Checked In' : 'Check In'}
                </Button>

                <Button
                  variant="danger"
                  size="lg"
                  className="px-4 fw-semibold"
                  disabled={!hasCheckedIn || hasCheckedOut || loading}
                  onClick={handleCheckOut}
                >
                  <FaSignOutAlt className="me-2" />
                  {hasCheckedOut ? 'Checked Out' : 'Check Out'}
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Monthly Summary Stats */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <StatCard title="Present Days" value={summary?.present ?? 0} color="success" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Late Arrivals" value={summary?.late ?? 0} color="warning" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Half Days" value={summary?.halfDay ?? 0} color="info" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Absent Days" value={summary?.absent ?? 0} color="danger" />
        </Col>
      </Row>

      {/* Attendance History with Filter */}
      <Card className="card-custom">
        <Card.Header className="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <FaCalendarCheck className="text-primary" />
            <span className="fw-semibold">Attendance Log</span>
          </div>

          <Form className="d-flex gap-2" onSubmit={handleFilterSubmit}>
            <Form.Select
              size="sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </Form.Select>

            <Form.Select
              size="sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Form.Select>
          </Form>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={records}
            loading={loading}
            emptyMessage="No attendance records found for this period."
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default AttendancePage;
