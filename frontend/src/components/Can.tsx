import React from 'react';
import { useRoleContext } from '../contexts/RoleContext';

export interface CanProps {
  action: string;
  subject: string;
  data?: any;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Komponen deklaratif untuk membungkus elemen UI berdasarkan Permission.
 * Jika user memiliki permission (action, subject, data) yang diminta, children akan dirender.
 * Jika tidak, fallback (default: null) akan dirender.
 */
export const Can: React.FC<CanProps> = ({ action, subject, data, children, fallback = null }) => {
  const { hasPermission } = useRoleContext();

  if (hasPermission(action, subject, data)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default Can;
