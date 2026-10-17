import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Badge, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaBullhorn, FaEdit, FaTrash, FaThumbtack } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin
} from '../../redux/slices/announcementSlice';
import { formatDate } from '../../utils/formatDate';
import { ANNOUNCEMENT_CATEGORIES } from '../../utils/constants';

const HRAnnouncementsPage = () => {
  const dispatch = useDispatch();
  const { announcements, loading } = useSelector((state) => state.announcements);

  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const initialForm = {
    title: '',
    content: '',
    category: 'general',
    targetAudience: 'All',
    isPinned: false,
    expiresAt: ''
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (ann) => {
    setEditingAnnouncement(ann);
    setFormData({
      title: ann.title || '',
      content: ann.content || '',
      category: ann.category || 'general',
      targetAudience: ann.targetAudience || 'All',
      isPinned: !!ann.isPinned,
      expiresAt: ann.expiresAt ? ann.expiresAt.slice(0, 10) : ''
    });
    setShowModal(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (editingAnnouncement) {
      const res = await dispatch(updateAnnouncement({ id: editingAnnouncement._id, data: formData }));
      if (updateAnnouncement.fulfilled.match(res)) {
        toast.success('Announcement updated successfully');
        setShowModal(false);
        dispatch(fetchAnnouncements());
      } else {
        toast.error(res.payload || 'Failed to update announcement');
      }
    } else {
      const res = await dispatch(createAnnouncement(formData));
      if (createAnnouncement.fulfilled.match(res)) {
        toast.success('Announcement published successfully');
        setShowModal(false);
        dispatch(fetchAnnouncements());
      } else {
        toast.error(res.payload || 'Failed to create announcement');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    const res = await dispatch(deleteAnnouncement(deleteId));
    if (deleteAnnouncement.fulfilled.match(res)) {
      toast.success('Announcement deleted');
      setDeleteId(null);
      dispatch(fetchAnnouncements());
    } else {
      toast.error(res.payload || 'Failed to delete');
    }
  };

  const handleTogglePin = async (id) => {
    const res = await dispatch(togglePin(id));
    if (togglePin.fulfilled.match(res)) {
      toast.success('Announcement pin status updated');
      dispatch(fetchAnnouncements());
    } else {
      toast.error(res.payload || 'Failed to toggle pin');
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'urgent':
        return <Badge bg="danger">Urgent</Badge>;
      case 'event':
        return <Badge bg="primary">Event</Badge>;
      case 'policy':
        return <Badge bg="warning" text="dark">Policy</Badge>;
      default:
        return <Badge bg="success">General</Badge>;
    }
  };

  const columns = [
    {
      header: 'Title',
      render: (row) => (
        <div className="d-flex align-items-center gap-2">
          {row.isPinned && <FaThumbtack className="text-primary flex-shrink-0" title="Pinned" />}
          <div>
            <div className="fw-semibold text-dark">{row.title}</div>
            <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '240px' }}>
              {row.content}
            </small>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      render: (row) => getCategoryBadge(row.category)
    },
    {
      header: 'Audience',
      render: (row) => <span className="badge bg-light text-dark border">{row.targetAudience || 'All'}</span>
    },
    {
      header: 'Date Posted',
      render: (row) => formatDate(row.createdAt)
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant={row.isPinned ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => handleTogglePin(row._id)}
            title={row.isPinned ? 'Unpin' : 'Pin to top'}
          >
            <FaThumbtack />
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
          <h3 className="fw-bold text-dark mb-1">Company Announcements</h3>
          <p className="text-muted mb-0">Broadcast company-wide notices, policy changes, and event invitations.</p>
        </div>
        <Button
          variant="primary"
          className="d-flex align-items-center gap-2"
          onClick={handleOpenAdd}
          style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
        >
          <FaPlus /> New Announcement
        </Button>
      </div>

      <Card className="card-custom">
        <Card.Header className="card-header-custom d-flex align-items-center gap-2">
          <FaBullhorn className="text-primary" />
          <span className="fw-semibold">All Published Bulletins</span>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={announcements}
            loading={loading}
            emptyMessage="No announcements created yet."
          />
        </Card.Body>
      </Card>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">
            {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitForm}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Annual Company Offsite 2026 Announcement"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Content Details</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Enter full announcement message..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Category</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {ANNOUNCEMENT_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Target Audience</Form.Label>
                  <Form.Select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  >
                    <option value="All">All Company Employees</option>
                    <option value="Engineering">Engineering Only</option>
                    <option value="Managers">Managers Only</option>
                    <option value="Marketing">Marketing Only</option>
                    <option value="Sales">Sales Only</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Expiration Date (Optional)</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6} className="d-flex align-items-center">
                <Form.Check
                  type="checkbox"
                  id="pinCheck"
                  label="Pin this announcement to top of feed"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="mt-3 fw-semibold text-secondary"
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingAnnouncement ? 'Save Changes' : 'Publish Announcement'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        show={!!deleteId}
        title="Delete Announcement"
        message="Are you sure you want to permanently delete this announcement? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default HRAnnouncementsPage;
