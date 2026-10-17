import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Badge, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaEdit, FaTrash, FaUserPlus, FaGraduationCap } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  fetchTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  enrollEmployee
} from '../../redux/slices/trainingSlice';
import { fetchEmployees } from '../../redux/slices/employeeSlice';
import { formatDate, getFullName } from '../../utils/formatDate';
import { DEPARTMENTS, TRAINING_MODES } from '../../utils/constants';

const HRTrainingsPage = () => {
  const dispatch = useDispatch();
  const { trainings, loading } = useSelector((state) => state.trainings);
  const { employees } = useSelector((state) => state.employees);

  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Enroll modal
  const [enrollTraining, setEnrollTraining] = useState(null);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  const initialForm = {
    title: '',
    description: '',
    trainer: '',
    department: 'Engineering',
    startDate: '',
    endDate: '',
    mode: 'online',
    maxParticipants: 30,
    status: 'upcoming'
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchTrainings());
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleOpenCreate = () => {
    setEditingTraining(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTraining(t);
    setFormData({
      title: t.title || '',
      description: t.description || '',
      trainer: t.trainer || '',
      department: t.department || 'Engineering',
      startDate: t.startDate ? t.startDate.slice(0, 10) : '',
      endDate: t.endDate ? t.endDate.slice(0, 10) : '',
      mode: t.mode || 'online',
      maxParticipants: t.maxParticipants || 30,
      status: t.status || 'upcoming'
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingTraining) {
      const res = await dispatch(updateTraining({ id: editingTraining._id, data: formData }));
      if (updateTraining.fulfilled.match(res)) {
        toast.success('Training updated successfully');
        setShowModal(false);
        dispatch(fetchTrainings());
      } else {
        toast.error(res.payload || 'Failed to update training');
      }
    } else {
      const res = await dispatch(createTraining(formData));
      if (createTraining.fulfilled.match(res)) {
        toast.success('Training created successfully');
        setShowModal(false);
        dispatch(fetchTrainings());
      } else {
        toast.error(res.payload || 'Failed to create training');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const res = await dispatch(deleteTraining(deleteId));
    if (deleteTraining.fulfilled.match(res)) {
      toast.success('Training removed');
      setDeleteId(null);
      dispatch(fetchTrainings());
    } else {
      toast.error(res.payload || 'Failed to delete');
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmpId || !enrollTraining) return;

    const res = await dispatch(
      enrollEmployee({ id: enrollTraining._id, employeeId: selectedEmpId })
    );
    if (enrollEmployee.fulfilled.match(res)) {
      toast.success('Employee enrolled successfully!');
      setEnrollTraining(null);
      setSelectedEmpId('');
      dispatch(fetchTrainings());
    } else {
      toast.error(res.payload || 'Enrollment failed');
    }
  };

  const filteredTrainings = (trainings || []).filter((t) => {
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesDept = !deptFilter || t.department === deptFilter;
    return matchesStatus && matchesDept;
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'ongoing':
        return <Badge bg="warning" text="dark">Ongoing</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      default:
        return <Badge bg="info">Upcoming</Badge>;
    }
  };

  const columns = [
    {
      header: 'Program Title',
      render: (row) => (
        <div>
          <div className="fw-semibold text-dark">{row.title}</div>
          <small className="text-muted">{row.trainer || 'External Mentor'}</small>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Dates',
      render: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`
    },
    {
      header: 'Mode',
      render: (row) => <Badge bg="secondary" className="text-capitalize">{row.mode || 'Online'}</Badge>
    },
    {
      header: 'Enrolled / Cap',
      render: (row) => `${row.enrolledEmployees?.length || 0} / ${row.maxParticipants || 30}`
    },
    {
      header: 'Status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              setEnrollTraining(row);
              setSelectedEmpId('');
            }}
            title="Enroll Employee"
          >
            <FaUserPlus />
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            title="Edit"
          >
            <FaEdit />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => setDeleteId(row._id)}
            title="Delete"
          >
            <FaTrash />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">Corporate Training Programs</h3>
          <p className="text-muted mb-0">Schedule professional certifications, skill upgrade workshops, and assign staff.</p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2"
          onClick={handleOpenCreate}
          style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <FaPlus /> New Training Session
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="card-custom mb-4">
        <Card.Body className="p-3">
          <Row className="g-2">
            <Col md={5}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </Form.Select>
            </Col>
            <Col md={5}>
              <Form.Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="d-grid">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setStatusFilter('');
                  setDeptFilter('');
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="card-custom">
        <Card.Header className="card-header-custom d-flex align-items-center gap-2">
          <FaGraduationCap className="text-primary" />
          <span className="fw-semibold">All Training Workshops</span>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={filteredTrainings}
            loading={loading}
            emptyMessage="No training sessions found matching filters."
          />
        </Card.Body>
      </Card>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">
            {editingTraining ? 'Edit Training Session' : 'Create New Training Session'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Program Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Enterprise Security & Compliance Workshop"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Syllabus, topics, and learning expectations..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Trainer Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Lead Instructor"
                    value={formData.trainer}
                    onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Department</Form.Label>
                  <Form.Select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
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

              <Col md={6}>
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

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Mode</Form.Label>
                  <Form.Select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  >
                    {TRAINING_MODES.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Max Seats</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="500"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingTraining ? 'Update Session' : 'Save & Publish'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Enroll Employee Modal */}
      <Modal show={!!enrollTraining} onHide={() => setEnrollTraining(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Assign Employee to Training</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEnrollSubmit}>
          <Modal.Body>
            <p className="small text-muted mb-3">
              Session: <strong>{enrollTraining?.title}</strong>
            </p>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Select Employee</Form.Label>
              <Form.Select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                required
              >
                <option value="">-- Choose employee to enroll --</option>
                {employees &&
                  employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {getFullName(emp)} ({emp.department} - {emp.designation})
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEnrollTraining(null)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Confirm Assignment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        show={!!deleteId}
        title="Delete Training Session"
        message="Are you sure you want to permanently delete this training program? All registrations will be purged."
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default HRTrainingsPage;
