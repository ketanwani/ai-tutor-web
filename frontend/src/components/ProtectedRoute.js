import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, userType }) => {
  const { isAuthenticated, isParent, isStudent, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (userType === 'parent' && !isParent) {
    return <Navigate to="/student-dashboard" replace />;
  }

  if (userType === 'student' && !isStudent) {
    return <Navigate to="/parent-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
