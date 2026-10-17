import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Badge, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendarCheck, FaSearch, FaClock, FaFileDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import { fetchAllAttendance, markAttendance } from '../../redux/slices/attendanceSlice';
import { fetchEmployees } from '../../redux/slices/employeeSlice';
import { formatDate } from '../../utils/formatDate';
import { DEPARTMENTS } from '../../utils/constants';

const HRAttendancePage = () => {
  const dispatch = useDispatch();
  const { records, loading } = useSelector((state) => state.attendance);
  const { employees } = useSelector((state) => state.employees);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedDept, setSelectedDept] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');

  const [showMarkModal, setShowMarkModal] = useState(false);
  const [manualData, setManualData] = useState({
    employeeId: '',
    date: todayStr,
    status: 'present',
    checkIn: '09:00',
    checkOut: '17:00'
  });

  useEffect(() => {
    dispatch(fetchAllAttendance({ date: selectedDate }));
    dispatch(fetchEmployees());
  }, [dispatch, selectedDate]);

  const handleManualMark = async (e) => {
    e.preventDefault();
    if (!manualData.employeeId) {
      toast.warning('Please select an employee');
      return;
    }

    // Build full datetime strings for checkIn and checkOut
    const payload = {
      employeeId: manualData.employeeId,
      date: manualData.date,
      status: manualData.status,
      checkIn: new Date(`${manualData.date}T${manualData.checkIn}:00`).toISOString(),
      checkOut: new Date(`${manualData.date}T${manualData.checkOut}:00`).toISOString()
    };

    const res = await dispatch(markAttendance(payload));
    if (markAttendance.fulfilled.match(res)) {
      toast.success('Attendance recorded successfully');
      setShowMarkModal(false);
      setManualData({ employeeId: '', date: todayStr, status: 'present', checkIn: '09:00', checkOut: '17:00' });
      dispatch(fetchAllAttendance({ date: selectedDate }));
    } else {
      toast.error(res.payload || 'Failed to mark attendance');
    }
  };

  // Populated field from backend is 'employeeId' (mongoose populate keeps field name)
  const getEmpData = (row) => row.employeeId || row.employee || {};

  // Filter records
  const filteredRecords = (records || []).filter((r) => {
    const emp = getEmpData(r);
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const matchesSearch =
      !searchEmployee ||
      fullName.includes(searchEmployee.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchEmployee.toLowerCase());
    const matchesDept = !selectedDept || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const presentCount = filteredRecords.filter((r) => r.status === 'present').length;
  const lateCount    = filteredRecords.filter((r) => r.status === 'late').length;
  const halfDayCount = filteredRecords.filter((r) => r.status === 'half-day').length;
  const totalEmployees = employees?.length || 0;
  const absentCount = Math.max(0, totalEmployees - (presentCount + lateCount + halfDayCount));

  const columns = [
    {
      header: 'Employee Code',
      render: (row) => <code>{getEmpData(row).employeeCode || '—'}</code>
    },
    {
      header: 'Employee Name',
      render: (row) => {
        const emp = getEmpData(row);
        return (
          <div>
            <div className="fw-semibold">{`${emp.firstName || ''} ${emp.lastName || ''}`.trim() || '—'}</div>
            <small className="text-muted">{emp.department || ''}</small>
          </div>
        );
      }
    },
    {
      header: 'Check In',
      render: (row) => row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
    },
    {
      header: 'Check Out',
      render: (row) => row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
    },
    {
      header: 'Hours',
      render: (row) => row.totalHours ? `${row.totalHours} hrs` : '—'
    },
    {
      header: 'Status',
      render: (row) => {
        const status = row.status || 'absent';
        const bg = status === 'present' ? 'success' : status === 'late' ? 'warning' : status === 'half-day' ? 'info' : 'danger';
        return <Badge bg={bg} className="text-capitalize">{status}</Badge>;
      }
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Company-Wide Attendance</h3>
          <p className="text-muted mb-0">Daily check-in verification, exception handling, and attendance adjustment.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" className="d-flex align-items-center gap-2" onClick={() => toast.info('Export ready')}>
            <FaFileDownload /> Export CSV
          </Button>
          <Button
            variant="primary"
            className="d-flex align-items-center gap-2"
            onClick={() => setShowMarkModal(true)}
            style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
          >
            <FaClock /> Mark Attendance
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <StatCard title="Present" value={presentCount} color="success" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Late Arrivals" value={lateCount} color="warning" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Half Day" value={halfDayCount} color="info" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard title="Absent / Not Checked In" value={absentCount} color="danger" />
        </Col>
      </Row>

      {/* Filter Toolbar */}
      <Card className="card-custom mb-4">
        <Card.Body className="p-3">
          <Row className="g-2">
            <Col md={4}>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted"><FaSearch /></span>
                <Form.Control
                  placeholder="Search employee name or code..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                />
              </div>
            </Col>
            <Col md={4}>
              <Form.Select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                <option value="">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Control
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Attendance Table */}
      <Card className="card-custom">
        <Card.Header className="card-header-custom d-flex align-items-center gap-2">
          <FaCalendarCheck className="text-primary" />
          <span className="fw-semibold">Attendance Log for {selectedDate}</span>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={filteredRecords}
            loading={loading}
            emptyMessage={`No attendance recorded for ${selectedDate}.`}
          />
        </Card.Body>
      </Card>

      {/* Manual Mark Attendance Modal */}
      <Modal show={showMarkModal} onHide={() => setShowMarkModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Manually Record Attendance</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleManualMark}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Select Employee</Form.Label>
              <Form.Select
                value={manualData.employeeId}
                onChange={(e) => setManualData({ ...manualData, employeeId: e.target.value })}
                required
              >
                <option value="">-- Choose employee --</option>
                {employees && employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {`${emp.firstName} ${emp.lastName}`} — {emp.department} ({emp.employeeCode})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Date</Form.Label>
              <Form.Control
                type="date"
                value={manualData.date}
                onChange={(e) => setManualData({ ...manualData, date: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Status</Form.Label>
              <Form.Select
                value={manualData.status}
                onChange={(e) => setManualData({ ...manualData, status: e.target.value })}
              >
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="absent">Absent</option>
                <option value="on-leave">On Leave</option>
              </Form.Select>
            </Form.Group>

            <Row className="g-2">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Check In Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={manualData.checkIn}
                    onChange={(e) => setManualData({ ...manualData, checkIn: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Check Out Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={manualData.checkOut}
                    onChange={(e) => setManualData({ ...manualData, checkOut: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowMarkModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Attendance</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default HRAttendancePage;
