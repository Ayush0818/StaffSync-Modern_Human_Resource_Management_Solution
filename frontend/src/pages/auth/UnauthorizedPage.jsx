import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Card, Container } from 'react-bootstrap';
import { FaShieldAlt } from 'react-icons/fa';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleReturn = () => {
    const role = user?.role;
    if (role === 'hr') navigate('/hr/dashboard');
    else if (role === 'manager') navigate('/manager/dashboard');
    else if (role === 'employee') navigate('/employee/dashboard');
    else navigate('/login');
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card className="text-center shadow-sm p-4 border-0" style={{ maxWidth: '480px' }}>
        <Card.Body>
          <div className="text-danger mb-3">
            <FaShieldAlt size={56} />
          </div>
          <h2 className="fw-bold mb-2">403 - Access Denied</h2>
          <p className="text-muted mb-4">
            You do not have permission to view this page. If you believe this is an error, please contact your HR administrator.
          </p>
          <Button variant="primary" onClick={handleReturn} className="px-4">
            Return to Dashboard
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UnauthorizedPage;
