import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

const PrivateRoute = ({ element, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }

  const role = getUserRole();
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" />;
  }

  return element;
};

export default PrivateRoute;
