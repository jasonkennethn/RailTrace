import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard' 
}) => {
  const { user } = useAuth();

  // If user is not logged in, they shouldn't be here
  if (!user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user's role is in the allowed roles
  if (!allowedRoles.includes(user.role)) {
    // Always redirect to dashboard instead of unauthorized page to prevent errors
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;