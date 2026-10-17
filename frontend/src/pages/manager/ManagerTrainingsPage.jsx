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

const ManagerTrainingsPage = () => {
  const dispatch = useDispatch();
  const { trainings, loading } = useSelector((state) => state.trainings);
  const { employees } = useSelector((state) => state.employees);

  const [showModal, setShowModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Enroll modal states
  const [enrollModalTraining, setEnrollModalTraining] = useState(null);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  const initialForm = {
    title: '',
    description: '',
    trainer: '',
    department: 'Engineering',
    startDate: '',
    endDate: '',
    mode: 'online',
    maxParticipants: 20
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

  const handleOpenEdit = (training) => {
    setEditingTraining(training);
    setFormData({
      title: training.title || '',
      description: training.description || '',
      trainer: training.trainer || '',
      department: training.department || 'Engineering',
      startDate: training.startDate ? training.startDate.slice(0, 10) : '',
      endDate: training.endDate ? training.endDate.slice(0, 10) : '',
      mode: training.mode || 'online',
      maxParticipants: training.maxParticipants || 20
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
        toast.success('Training session created successfully');
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
      toast.error(res.payload || 'Failed to delete training');
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmpId || !enrollModalTraining) return;

    const res = await dispatch(
      enrollEmployee({ id: enrollModalTraining._id, employeeId: selectedEmpId })
    );
    if (enrollEmployee.fulfilled.match(res)) {
      toast.success('Employee enrolled successfully in training!');
      setEnrollModalTraining(null);
      setSelectedEmpId('');
      dispatch(fetchTrainings());
    } else {
      toast.error(res.payload || 'Enrollment failed');
    }
  };

  const columns = [
    {
      header: 'Title',
      render: (row) => <strong>{row.title}</strong>
    },
    {
      header: 'Trainer',
      accessor: 'trainer'
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
      header: 'Actions',
      render: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              setEnrollModalTraining(row);
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
            title="Edit Training"
          >
            <FaEdit />
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => setDeleteId(row._id)}
            title="Delete Training"
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
          <h3 className="fw-bold text-dark mb-1">Team Training Programs</h3>
          <p className="text-muted mb-0">Create corporate learning workshops and enroll team members.</p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2"
          onClick={handleOpenCreate}
          style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <FaPlus /> Create Training
        </Button>
      </div>

      <Card className="card-custom">
        <Card.Header className="card-header-custom d-flex align-items-center gap-2">
          <FaGraduationCap className="text-primary" />
          <span className="fw-semibold">All Training Sessions</span>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={trainings}
            loading={loading}
            emptyMessage="No training programs scheduled yet."
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
                  <Form.Label className="fw-semibold small">Training Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Modern Full-Stack Development with React"
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
                    placeholder="Overview and objectives of this training..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Trainer / Instructor</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Trainer name or firm"
                    value={formData.trainer}
                    onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Target Department</Form.Label>
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

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Delivery Mode</Form.Label>
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

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Max Participants</Form.Label>
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
              {editingTraining ? 'Update Training' : 'Schedule Training'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Enroll Employee Modal */}
      <Modal show={!!enrollModalTraining} onHide={() => setEnrollModalTraining(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Enroll Employee in Training</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEnrollSubmit}>
          <Modal.Body>
            <p className="small text-muted mb-3">
              Session: <strong>{enrollModalTraining?.title}</strong>
            </p>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Select Employee</Form.Label>
              <Form.Select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                required
              >
                <option value="">-- Choose employee --</option>
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
            <Button variant="secondary" onClick={() => setEnrollModalTraining(null)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Confirm Enrollment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={!!deleteId}
        title="Delete Training Session"
        message="Are you sure you want to cancel and delete this training program? All enrolled employees will be unassigned."
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default ManagerTrainingsPage;
