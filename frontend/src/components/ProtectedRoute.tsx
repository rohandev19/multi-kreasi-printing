import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRoleContext, UserRole } from '../contexts/RoleContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { role, loading, hasAccess } = useRoleContext();
  const location = useLocation();
  const [showUnauthorizedMsg, setShowUnauthorizedMsg] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!loading && token && allowedRoles && !hasAccess(allowedRoles)) {
      console.warn(`Unauthorized access attempt to ${location.pathname} by role: ${role}`);
      setShowUnauthorizedMsg(true);
      // Optional: hide message after 3 seconds, or handle it globally with a toast
      const timer = setTimeout(() => setShowUnauthorizedMsg(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, token, allowedRoles, hasAccess, location.pathname, role]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !hasAccess(allowedRoles)) {
    return (
      <>
        {showUnauthorizedMsg && (
          <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50">
            <p className="font-bold">Access Denied</p>
            <p>You do not have permission to access this page.</p>
          </div>
        )}
        <Navigate to="/" replace />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
