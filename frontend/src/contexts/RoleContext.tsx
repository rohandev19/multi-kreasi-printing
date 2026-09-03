import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export type UserRole = 
  | 'Owner' 
  | 'Manager' 
  | 'Designer' 
  | 'Production_Staff' 
  | 'Warehouse_Staff' 
  | 'Finance_Staff'
  | 'Sales'
  | 'Customer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  fullName?: string;
}

export interface RoleContextType {
  role: UserRole | null;
  user: User | null;
  loading: boolean;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  refreshRole: () => Promise<void>;
  loginUser: (userData: User) => void;
  logoutUser: () => void;
}

export const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshRole = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/auth/me'); // Using the /me endpoint
      const userData = response.data;
      setUser(userData);
      setRole(userData.role);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('Failed to refresh role context:', error);
      
      // Only clear user data if it's an authentication error (401/403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        setRole(null);
        setUser(null);
        localStorage.removeItem('user');
        
        // If we are not on a public route, redirect to login
        const publicRoutes = ['/login', '/register', '/verify-email', '/products', '/cart', '/about', '/contact', '/terms', '/privacy', '/privacy-policy', '/help', '/faq'];
        const isPublicRoute = window.location.pathname === '/' || publicRoutes.some(route => window.location.pathname.startsWith(route));
        if (!isPublicRoute) {
          navigate('/login');
        }
      }
    }
  }, [navigate]);

  const loginUser = (userData: User) => {
    setUser(userData);
    setRole(userData.role);
    localStorage.setItem('user', JSON.stringify(userData));
    // Trigger storage event manually for other components listening to 'storage'
    window.dispatchEvent(new Event('storage'));
  };

  const logoutUser = useCallback(() => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const initRole = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const storedUserStr = localStorage.getItem('user');
      
      if (!token) {
        setLoading(false);
        return;
      }

      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          setUser(storedUser);
          setRole(storedUser.role);
        } catch (e: any) {
          console.error('Failed to parse stored user in RoleContext', e);
        }
      }

      // Always fetch latest to ensure it's up to date
      await refreshRole();
      setLoading(false);
    };

    initRole();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        if (e.newValue) {
          try {
            const storedUser = JSON.parse(e.newValue);
            setUser(storedUser);
            setRole(storedUser.role);
          } catch (error) {
            console.error('Failed to parse user from storage event', error);
          }
        } else {
          // User was removed in another tab
          setUser(null);
          setRole(null);
          navigate('/login');
        }
      } else if (e.key === 'token' && !e.newValue) {
        // Token was removed in another tab
        setUser(null);
        setRole(null);
        navigate('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate, refreshRole]);

  const hasAccess = (allowedRoles: UserRole[]) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  const hasPermission = (_permission: string) => {
    // Basic implementation for now, can be expanded if roles have distinct fine-grained permissions
    return true; 
  };

  return (
    <RoleContext.Provider value={{ role, user, loading, hasAccess, hasPermission, refreshRole, loginUser, logoutUser }}>
      {children}
    </RoleContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRoleContext = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
};
