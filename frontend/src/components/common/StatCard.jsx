import React from 'react';
import { Card } from 'react-bootstrap';

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => {
  return (
    <Card className="stat-card h-100 shadow-sm border-0">
      <Card.Body className="d-flex align-items-center justify-content-between p-3">
        <div>
          <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.8rem' }}>
            {title}
          </span>
          <h3 className="fw-bold my-1 text-dark">{value ?? 0}</h3>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        {Icon && (
          <div className={`icon-box bg-${color} bg-opacity-10 text-${color}`}>
            <Icon size={24} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default StatCard;
