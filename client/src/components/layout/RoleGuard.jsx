import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export const RoleGuard = ({ allowedRole, children }) => {
  const { user } = useAuth();

  if (!user || user.role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleGuard;
