import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const Production = lazy(() => import('./pages/Production'));
const Customers = lazy(() => import('./pages/Customers'));
const Invoices = lazy(() => import('./pages/Invoices'));
const DesignFiles = lazy(() => import('./pages/DesignFiles'));
const Warehouse = lazy(() => import('./pages/Warehouse'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const Login = lazy(() => import('./pages/Login'));

import { RoleProvider } from './contexts/RoleContext';
import ProtectedRoute from './components/ProtectedRoute';

const LoadingSpinner = () => (
  <div className="flex h-full items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <RoleProvider>
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      </RoleProvider>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Designer', 'Production_Staff', 'Finance_Staff']}>
            <Suspense fallback={<LoadingSpinner />}>
              <Orders />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'production',
        element: (
          <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Production_Staff']}>
            <Suspense fallback={<LoadingSpinner />}>
              <Production />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'customers',
        element: (
          <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Finance_Staff']}>
            <Suspense fallback={<LoadingSpinner />}>
              <Customers />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'invoices',
        element: (
          <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Finance_Staff', 'Customer']}>
            <Suspense fallback={<LoadingSpinner />}>
              <Invoices />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'design',
        element: (
          <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Designer']}>
            <Suspense fallback={<LoadingSpinner />}>
              <DesignFiles />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'warehouse',
        element: (
          <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Warehouse_Staff']}>
            <Suspense fallback={<LoadingSpinner />}>
              <Warehouse />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-orders',
        element: (
          <ProtectedRoute allowedRoles={['Customer']}>
            <Suspense fallback={<LoadingSpinner />}>
              <MyOrders />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
