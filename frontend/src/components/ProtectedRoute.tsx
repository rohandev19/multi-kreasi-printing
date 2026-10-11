import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRoleContext } from '../contexts/RoleContext';
import type { UserRole } from '../contexts/RoleContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredAction?: string;
  requiredSubject?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, requiredAction, requiredSubject }) => {
  const { role, loading, hasAccess, hasPermission } = useRoleContext();
  const location = useLocation();
  const [showUnauthorizedMsg, setShowUnauthorizedMsg] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    let authorized = true;
    if (allowedRoles && !hasAccess(allowedRoles)) {
      authorized = false;
    }
    if (requiredAction && requiredSubject && !hasPermission(requiredAction, requiredSubject)) {
      authorized = false;
    }

    if (!loading && token && !authorized) {
      console.warn(`Unauthorized access attempt to ${location.pathname} by role: ${role}`);
      setShowUnauthorizedMsg(true);
      const timer = setTimeout(() => setShowUnauthorizedMsg(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, token, allowedRoles, requiredAction, requiredSubject, hasAccess, hasPermission, location.pathname, role]);

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

  let authorized = true;
  if (allowedRoles && !hasAccess(allowedRoles)) authorized = false;
  if (requiredAction && requiredSubject && !hasPermission(requiredAction, requiredSubject)) authorized = false;

  if (!authorized) {
    return (
      <>
        {showUnauthorizedMsg && (
          <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md z-50">
            <p className="font-bold">Akses Ditolak</p>
            <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
        )}
        <Navigate to="/" replace />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
