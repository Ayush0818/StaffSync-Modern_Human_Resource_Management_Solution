import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ message = 'Loading...', size = 'border' }) => {
  return (
    <div className="loader-container text-center py-5">
      <Spinner animation={size} variant="primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      {message && <p className="mt-3 text-muted fw-semibold">{message}</p>}
    </div>
  );
};

export default Loader;
