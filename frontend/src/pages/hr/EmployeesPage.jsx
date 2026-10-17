import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Modal, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getFriendlyError } from '../../utils/errorMessages';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  hardDeleteEmployee
} from '../../redux/slices/employeeSlice';
import { fetchManagers } from '../../redux/slices/managerSlice';
import { DEPARTMENTS } from '../../utils/constants';
import { formatDate, getFullName } from '../../utils/formatDate';

const EmployeesPage = () => {
  const dispatch = useDispatch();
  const { employees, loading } = useSelector((state) => state.employees);
  const { managers } = useSelector((state) => state.managers);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteId, setDeleteId] = useState(null);      // soft delete (deactivate)
  const [hardDeleteId, setHardDeleteId] = useState(null); // hard delete (permanent)
  const [viewEmployee, setViewEmployee] = useState(null);

  const initialForm = {
    name: '',
    email: '',
    password: '',
    employeeCode: '',
    department: 'Engineering',
    designation: '',
    phone: '',
    address: '',
    manager: '',
    status: 'active'
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchManagers());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: getFullName(emp),
      email: emp.email || '',
      password: '',
      employeeCode: emp.employeeCode || '',
      department: emp.department || 'Engineering',
      designation: emp.designation || '',
      phone: emp.phone || '',
      address: emp.address || '',
      manager: emp.manager?._id || emp.manager || '',
      status: emp.status || 'active'
    });
    setShowModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (editingEmployee) {
      const res = await dispatch(updateEmployee({ id: editingEmployee._id, data: formData }));
      if (updateEmployee.fulfilled.match(res)) {
        toast.success('Employee updated successfully');
        setShowModal(false);
        dispatch(fetchEmployees());
      } else {
        toast.error(getFriendlyError(res.payload, 'Failed to update employee. Please try again.'));
      }
    } else {
      const res = await dispatch(createEmployee(formData));
      if (createEmployee.fulfilled.match(res)) {
        toast.success('Employee created successfully');
        setShowModal(false);
        dispatch(fetchEmployees());
      } else {
        toast.error(getFriendlyError(res.payload, 'Could not create employee. Please check all fields.'));
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const res = await dispatch(deleteEmployee(deleteId));
    if (deleteEmployee.fulfilled.match(res)) {
      toast.success('Employee deactivated successfully');
      setDeleteId(null);
      dispatch(fetchEmployees());
    } else {
      toast.error(getFriendlyError(res.payload, 'Could not deactivate this employee. Please try again.'));
    }
  };

  const handleHardDeleteConfirm = async () => {
    if (!hardDeleteId) return;
    const res = await dispatch(hardDeleteEmployee(hardDeleteId));
    if (hardDeleteEmployee.fulfilled.match(res)) {
      toast.success('Employee permanently deleted');
      setHardDeleteId(null);
    } else {
      toast.error(getFriendlyError(res.payload, 'Could not delete this employee. Please try again.'));
    }
  };

  // Filtered List
  const filteredEmployees = (employees || []).filter((emp) => {
    const matchesSearch =
      !searchTerm ||
      getFullName(emp).toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = !selectedDept || emp.department === selectedDept;
    const matchesStatus = !selectedStatus || emp.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const columns = [
    {
      header: 'Emp Code',
      render: (row) => <code>{row.employeeCode || row._id?.slice(-6) || 'EMP-100'}</code>
    },
    {
      header: 'Name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-dark">{getFullName(row)}</div>
          <small className="text-muted">{row.email}</small>
        </div>
      )
    },
    {
      header: 'Department',
      accessor: 'department'
    },
    {
      header: 'Designation',
      accessor: 'designation'
    },
    {
      header: 'Manager',
      render: (row) => getFullName(row.managerId || row.manager) || 'Direct / HR'
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
        <div className="d-flex gap-2">
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => setViewEmployee(row)}
            title="View Details"
          >
            <FaEye />
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            title="Edit Employee"
          >
            <FaEdit />
          </Button>
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => setDeleteId(row._id)}
            title="Deactivate (disable login)"
          >
            🚫
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => setHardDeleteId(row._id)}
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
          <h3 className="fw-bold text-dark mb-1">Employee Directory</h3>
          <p className="text-muted mb-0">Manage complete staff records, roles, departmental assignments, and credentials.</p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2"
          onClick={handleOpenAdd}
          style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <FaUserPlus /> Add Employee
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="card-custom mb-4">
        <Card.Body className="p-3">
          <Row className="g-2">
            <Col md={4}>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <FaSearch />
                </span>
                <Form.Control
                  placeholder="Search by name, email, or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Col>
            <Col md={4}>
              <Form.Select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>
            <Col md={1} className="d-grid">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDept('');
                  setSelectedStatus('');
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Employees Table */}
      <Card className="card-custom">
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={filteredEmployees}
            loading={loading}
            emptyMessage="No employees found matching the filters."
          />
        </Card.Body>
      </Card>

      {/* Add / Edit Employee Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">
            {editingEmployee ? 'Edit Employee Details' : 'Add New Employee'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitForm}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Work Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="email@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              {!editingEmployee && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Temporary Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter initial password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Employee Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. EMP-101"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
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
                  <Form.Label className="fw-semibold small">Designation</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="+1 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Reporting Manager</Form.Label>
                  <Form.Select
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  >
                    <option value="">-- No Manager / Direct HR --</option>
                    {managers &&
                      managers.map((mgr) => (
                        <option key={mgr._id} value={mgr._id}>
                          {getFullName(mgr)} ({mgr.department})
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Street, City, State, ZIP"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Employment Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingEmployee ? 'Save Changes' : 'Create Employee'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* View Employee Profile Modal */}
      <Modal show={!!viewEmployee} onHide={() => setViewEmployee(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Employee Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewEmployee && (
            <div>
              <div className="text-center mb-3">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-2"
                  style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}
                >
                  {getFullName(viewEmployee).charAt(0).toUpperCase()}
                </div>
                <h5 className="fw-bold mb-0">{getFullName(viewEmployee)}</h5>
                <small className="text-muted">{viewEmployee.designation}</small>
              </div>
              <ul className="list-group list-group-flush small">
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Employee Code:</strong> <span>{viewEmployee.employeeCode}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Department:</strong> <span>{viewEmployee.department}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Email:</strong> <span>{viewEmployee.email}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Phone:</strong> <span>{viewEmployee.phone || 'N/A'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Manager:</strong> <span>{getFullName(viewEmployee.managerId || viewEmployee.manager) || 'None'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Status:</strong> <span className="text-capitalize">{viewEmployee.status}</span>
                </li>
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setViewEmployee(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Deactivate Confirmation */}
      <ConfirmModal
        show={!!deleteId}
        title="Deactivate Employee"
        message="Are you sure you want to deactivate this employee? They will no longer be able to log in. You can reactivate them later."
        confirmText="Deactivate"
        confirmVariant="warning"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />

      {/* Permanent Delete Confirmation */}
      <ConfirmModal
        show={!!hardDeleteId}
        title="⚠️ Permanently Delete Employee"
        message="This will permanently remove the employee and their account from the system. This action cannot be undone. Are you absolutely sure?"
        confirmText="Delete Permanently"
        confirmVariant="danger"
        onConfirm={handleHardDeleteConfirm}
        onCancel={() => setHardDeleteId(null)}
      />
    </div>
  );
};

export default EmployeesPage;
