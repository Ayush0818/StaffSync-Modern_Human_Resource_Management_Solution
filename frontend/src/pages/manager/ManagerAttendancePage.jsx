import React, { useState, useEffect } from 'react';
import { Card, Form, Badge, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendarAlt, FaUsers } from 'react-icons/fa';
import DataTable from '../../components/common/DataTable';
import { fetchAllAttendance } from '../../redux/slices/attendanceSlice';
import { formatDate, getFullName } from '../../utils/formatDate';

const ManagerAttendancePage = () => {
  const dispatch = useDispatch();
  const { records, loading } = useSelector((state) => state.attendance);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useEffect(() => {
    dispatch(fetchAllAttendance({ date: selectedDate }));
  }, [dispatch, selectedDate]);

  // Filter records by selected date
  const filteredRecords = (records || []).filter((r) => {
    if (!r.date) return false;
    return r.date.toString().slice(0, 10) === selectedDate;
  });

  const columns = [
    {
      header: 'Employee Name',
      render: (row) => (
        <div>
          <div className="fw-semibold">{getFullName(row.employeeId || row.employee) || 'Employee'}</div>
          <small className="text-muted">{(row.employeeId || row.employee)?.employeeCode || 'EMP-000'}</small>
        </div>
      )
    },
    {
      header: 'Department',
      render: (row) => (row.employeeId || row.employee)?.department || 'General'
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
      header: 'Hours Worked',
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
          <h3 className="fw-bold text-dark mb-1">Team Daily Attendance</h3>
          <p className="text-muted mb-0">Track daily check-ins, check-outs, and shift status for your team members.</p>
        </div>
      </div>

      <Card className="card-custom">
        <Card.Header className="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <FaUsers className="text-primary" />
            <span className="fw-semibold">Attendance Log for Selected Date</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <FaCalendarAlt className="text-muted" />
            <Form.Control
              type="date"
              size="sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: '160px' }}
            />
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={filteredRecords}
            loading={loading}
            emptyMessage={`No attendance entries recorded for ${selectedDate}.`}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default ManagerAttendancePage;
