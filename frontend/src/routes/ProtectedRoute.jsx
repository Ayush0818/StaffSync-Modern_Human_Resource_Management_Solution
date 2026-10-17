import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, token } = useSelector(selectAuth);

  // If there is no token or user is not logged in, redirect to login
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not authorized for this section, redirect to unauthorized page
  if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized: render nested routes
  return <Outlet />;
};

export default ProtectedRoute;
