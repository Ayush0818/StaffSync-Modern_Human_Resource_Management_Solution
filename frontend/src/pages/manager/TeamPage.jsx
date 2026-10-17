import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserPlus, FaTrash, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import { fetchMyTeam, addTeamMember, removeTeamMember } from '../../redux/slices/managerSlice';
import { fetchEmployees } from '../../redux/slices/employeeSlice';
import { getFullName } from '../../utils/formatDate';

const TeamPage = () => {
  const dispatch = useDispatch();
  const { myTeam, loading } = useSelector((state) => state.managers);
  const { employees } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [removeId, setRemoveId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyTeam());
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      toast.warning('Please select an employee to add');
      return;
    }

    const managerId = user?.managerId || user?._id;
    const res = await dispatch(addTeamMember({ managerId, employeeId: selectedEmployeeId }));
    if (addTeamMember.fulfilled.match(res)) {
      toast.success('Team member added successfully!');
      setShowAddModal(false);
      setSelectedEmployeeId('');
      dispatch(fetchMyTeam());
    } else {
      toast.error(res.payload || 'Failed to add team member');
    }
  };

  const handleRemoveMember = async () => {
    if (!removeId) return;
    const managerId = user?.managerId || user?._id;
    const res = await dispatch(removeTeamMember({ managerId, employeeId: removeId }));
    if (removeTeamMember.fulfilled.match(res)) {
      toast.success('Team member removed from your team');
      setRemoveId(null);
      dispatch(fetchMyTeam());
    } else {
      toast.error(res.payload || 'Failed to remove team member');
    }
  };

  const columns = [
    {
      header: 'Employee Code',
      render: (row) => {
        const emp = row.employee || row;
        return <code>{emp.employeeCode || emp._id?.slice(-6) || 'EMP-000'}</code>;
      }
    },
    {
      header: 'Name',
      render: (row) => {
        const emp = row.employee || row;
        return <strong>{getFullName(emp)}</strong>;
      }
    },
    {
      header: 'Designation',
      render: (row) => {
        const emp = row.employee || row;
        return emp.designation || 'Software Engineer';
      }
    },
    {
      header: 'Department',
      render: (row) => {
        const emp = row.employee || row;
        return emp.department || 'General';
      }
    },
    {
      header: 'Contact',
      render: (row) => {
        const emp = row.employee || row;
        return (
          <div>
            <div>{emp.email}</div>
            <small className="text-muted">{emp.phone || 'No phone'}</small>
          </div>
        );
      }
    },
    {
      header: 'Status',
      render: (row) => {
        const emp = row.employee || row;
        const status = emp.status || 'active';
        return <Badge bg={status === 'active' ? 'success' : 'secondary'} className="text-capitalize">{status}</Badge>;
      }
    },
    {
      header: 'Actions',
      render: (row) => {
        const emp = row.employee || row;
        return (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => setRemoveId(emp._id)}
            title="Remove from team"
          >
            <FaTrash />
          </Button>
        );
      }
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-1">My Team Directory</h3>
          <p className="text-muted mb-0">View all reportees under your supervision and manage membership.</p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2"
          onClick={() => setShowAddModal(true)}
          style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <FaUserPlus /> Add Team Member
        </Button>
      </div>

      <Card className="card-custom">
        <Card.Header className="card-header-custom d-flex align-items-center gap-2">
          <FaUsers className="text-primary" />
          <span className="fw-semibold">Team Members List ({myTeam?.length || 0})</span>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={myTeam}
            loading={loading}
            emptyMessage="No team members currently assigned to you."
          />
        </Card.Body>
      </Card>

      {/* Add Member Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Assign Employee to Team</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddMember}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Select Employee</Form.Label>
              <Form.Select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                required
              >
                <option value="">-- Choose an employee --</option>
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
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add to My Team
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Remove Confirmation Modal */}
      <ConfirmModal
        show={!!removeId}
        title="Remove Team Member"
        message="Are you sure you want to remove this employee from your team? They will need to be reassigned."
        confirmText="Remove"
        confirmVariant="danger"
        onConfirm={handleRemoveMember}
        onCancel={() => setRemoveId(null)}
      />
    </div>
  );
};

export default TeamPage;
