import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Spinner, Button, Form, Alert } from 'react-bootstrap';
import { FaBuilding, FaLock, FaEnvelope } from 'react-icons/fa';
import { loginUser } from '../../redux/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Formik schema validation with Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required')
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      const resultAction = await dispatch(loginUser(values));
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success('Login successful! Welcome back.');
        const user = resultAction.payload.user || resultAction.payload.data?.user || resultAction.payload.data;
        const role = user?.role || 'employee';

        // Redirect based on user role
        if (role === 'hr') {
          navigate('/hr/dashboard');
        } else if (role === 'manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        toast.error(resultAction.payload || 'Login failed. Please check your credentials.');
      }
    }
  });

  const fillDemo = (email, password) => {
    formik.setFieldValue('email', email);
    formik.setFieldValue('password', password);
  };

  return (
    <div className="login-container">
      {/* Left Branding Panel */}
      <div className="login-brand-panel">
        <div style={{ maxWidth: '420px' }}>
          <div className="d-flex align-items-center justify-content-center mb-3">
            <FaBuilding size={48} className="text-warning me-3" />
            <h1 className="h2 fw-bold text-white mb-0">StaffSync</h1>
          </div>
          <p className="lead text-light opacity-75">
            Enterprise Human Resource Management System
          </p>
          <p className="text-light opacity-50 small mt-4">
            Streamline employee profiles, track attendance, manage leave requests, and schedule corporate trainings all in one unified platform.
          </p>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="login-form-panel">
        <div className="login-box">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark">Welcome Back</h2>
            <p className="text-muted">Sign in to your StaffSync account</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={formik.handleSubmit}>
            {/* Email Field */}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label className="fw-semibold small">Work Email</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <FaEnvelope />
                </span>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.email && !!formik.errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.email}
                </Form.Control.Feedback>
              </div>
            </Form.Group>

            {/* Password Field */}
            <Form.Group className="mb-4" controlId="password">
              <Form.Label className="fw-semibold small">Password</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <FaLock />
                </span>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.password && !!formik.errors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.password}
                </Form.Control.Feedback>
              </div>
            </Form.Group>

            {/* Submit Button */}
            <Button
              variant="primary"
              type="submit"
              className="w-100 py-2 fw-semibold"
              disabled={loading}
              style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" className="me-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </Form>

          {/* Quick Demo Credentials */}
          <div className="mt-4 p-3 bg-light rounded border text-center">
            <p className="fw-semibold small text-muted mb-2">Quick Demo Credentials (Click to fill):</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => fillDemo('hr@staffsync.com', 'hr123456')}
              >
                HR Admin
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => fillDemo('manager@staffsync.com', 'manager123456')}
              >
                Manager
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => fillDemo('employee@staffsync.com', 'emp123456')}
              >
                Employee
              </button>
            </div>
            <div className="mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
              Default: <strong>hr@staffsync.com</strong> / <strong>hr123456</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
