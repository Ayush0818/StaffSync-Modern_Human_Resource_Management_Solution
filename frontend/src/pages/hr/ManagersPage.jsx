import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Badge, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserPlus, FaUsers, FaUserTie, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  fetchManagers,
  createManager,
  updateManager,
  deleteManager,
  hardDeleteManager
} from '../../redux/slices/managerSlice';
import { DEPARTMENTS } from '../../utils/constants';
import { getFullName } from '../../utils/formatDate';
import { getFriendlyError } from '../../utils/errorMessages';

const ManagersPage = () => {
  const dispatch = useDispatch();
  const { managers, loading } = useSelector((state) => state.managers);

  const [showAddModal, setShowAddModal] = useState(false);
  const [viewTeamManager, setViewTeamManager] = useState(null);
  const [editMgr, setEditMgr] = useState(null);
  const [hardDeleteMgrId, setHardDeleteMgrId] = useState(null);

  const initialForm = {
    name: '',
    email: '',
    password: '',
    department: 'Engineering',
    phone: '',
    status: 'active'
  };

  const [formData, setFormData] = useState(initialForm);

  const initialEditForm = {
    name: '',
    email: '',
    department: 'Engineering',
    phone: '',
    status: 'active'
  };

  const [editFormData, setEditFormData] = useState(initialEditForm);

  useEffect(() => {
    dispatch(fetchManagers());
  }, [dispatch]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createManager(formData));
    if (createManager.fulfilled.match(res)) {
      toast.success('Manager account created successfully');
      setShowAddModal(false);
      setFormData(initialForm);
      dispatch(fetchManagers());
    } else {
      toast.error(getFriendlyError(res.payload, 'Failed to create manager'));
    }
  };

  const handleOpenEdit = (mgr) => {
    setEditMgr(mgr);
    setEditFormData({
      name: getFullName(mgr),
      email: mgr.userId?.email || mgr.email || '',
      department: mgr.department || 'Engineering',
      phone: mgr.phone || '',
      status: mgr.status || 'active'
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editMgr) return;
    const res = await dispatch(updateManager({ id: editMgr._id, data: editFormData }));
    if (updateManager.fulfilled.match(res)) {
      toast.success('Manager updated successfully');
      setEditMgr(null);
      dispatch(fetchManagers());
    } else {
      toast.error(getFriendlyError(res.payload, 'Failed to update manager'));
    }
  };

  const handleDeactivate = async (id) => {
    const res = await dispatch(deleteManager(id));
    if (deleteManager.fulfilled.match(res)) {
      toast.success('Manager deactivated successfully');
      dispatch(fetchManagers());
    } else {
      toast.error(getFriendlyError(res.payload, 'Failed to deactivate manager'));
    }
  };

  const handleHardDeleteConfirm = async () => {
    if (!hardDeleteMgrId) return;
    const res = await dispatch(hardDeleteManager(hardDeleteMgrId));
    if (hardDeleteManager.fulfilled.match(res)) {
      toast.success('Manager permanently deleted');
      setHardDeleteMgrId(null);
      dispatch(fetchManagers());
    } else {
      toast.error(getFriendlyError(res.payload, 'Failed to delete manager'));
    }
  };

  const columns = [
    {
      header: 'Manager Name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-dark">
            {getFullName(row)}
          </div>
          <small className="text-muted">{row.userId?.email || row.email || ''}</small>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Phone',
      render: (row) => row.phone || 'N/A'
    },
    {
      header: 'Direct Reportees',
      render: (row) => (
        <Badge bg="primary" pill>
          {row.teamMembers?.length || 0} Members
        </Badge>
      )
    },
    {
      header: 'Status',
      render: (row) => {
        const status = row.status || 'active';
        return <Badge bg={status === 'active' ? 'success' : 'secondary'} className="text-capitalize">{status}</Badge>;
      }
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="d-flex align-items-center gap-1">
          <Button
            variant="outline-primary"
            size="sm"
            className="d-flex align-items-center gap-1"
            onClick={() => setViewTeamManager(row)}
            title="View Team"
          >
            <FaUsers /> View Team
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            title="Edit Manager"
          >
            <FaEdit />
          </Button>
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => handleDeactivate(row._id)}
            title="Deactivate (soft delete)"
          >
            🚫
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => setHardDeleteMgrId(row._id)}
            title="Permanently Delete"
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
          <h3 className="fw-bold text-dark mb-1">Managers Overview</h3>
          <p className="text-muted mb-0">Supervise departmental leaders, review reporting structures, and team rosters.</p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2"
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <FaUserPlus /> Add Manager
        </Button>
      </div>

      <Card className="card-custom">
        <Card.Header className="card-header-custom d-flex align-items-center gap-2">
          <FaUserTie className="text-primary" />
          <span className="fw-semibold">All Team Managers</span>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={managers}
            loading={loading}
            emptyMessage="No managers registered yet."
          />
        </Card.Body>
      </Card>

      {/* Add Manager Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Add New Manager</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Manager name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Work Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="manager@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Initial Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Temporary login password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </Form.Group>

            <Row className="g-2">
              <Col md={6}>
                <Form.Group className="mb-3">
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
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Phone</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Manager
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Team Modal */}
      <Modal show={!!viewTeamManager} onHide={() => setViewTeamManager(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">
            Team Roster: {viewTeamManager ? `${viewTeamManager.firstName} ${viewTeamManager.lastName}` : ''} ({viewTeamManager?.department})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewTeamManager?.teamMembers && viewTeamManager.teamMembers.length > 0 ? (
            <ul className="list-group">
              {viewTeamManager.teamMembers.map((member, index) => {
                const emp = member.employee || member;
                const fullName = emp.firstName && emp.lastName
                  ? `${emp.firstName} ${emp.lastName}`
                  : emp.name || 'Team Member';
                return (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-dark">{fullName}</div>
                      <small className="text-muted">{emp.designation || 'Specialist'} • {emp.employeeCode || ''}</small>
                    </div>
                    <Badge bg="success">Active</Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-4 text-muted">
              No reportees currently assigned to this manager.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewTeamManager(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Manager Modal */}
      <Modal show={!!editMgr} onHide={() => setEditMgr(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Edit Manager Profile</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Manager name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Work Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="manager@company.com"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
              />
            </Form.Group>

            <Row className="g-2">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Department</Form.Label>
                  <Form.Select
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Phone</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Phone number"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Status</Form.Label>
              <Form.Select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditMgr(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Permanent Delete Confirmation Modal */}
      <ConfirmModal
        show={!!hardDeleteMgrId}
        title="⚠️ Permanently Delete Manager"
        message="This will permanently remove the manager and their account from the system. Any assigned direct reportees will be unlinked. This action cannot be undone. Are you sure?"
        confirmText="Delete Permanently"
        confirmVariant="danger"
        onConfirm={handleHardDeleteConfirm}
        onCancel={() => setHardDeleteMgrId(null)}
      />
    </div>
  );
};

export default ManagersPage;
