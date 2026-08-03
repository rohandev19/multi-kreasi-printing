/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const Production = lazy(() => import('./pages/Production'));
const Customers = lazy(() => import('./pages/Customers'));
const Invoices = lazy(() => import('./pages/Invoices'));
const DesignFiles = lazy(() => import('./pages/DesignFiles'));
const Warehouse = lazy(() => import('./pages/Warehouse'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail').then(m => ({ default: m.OrderDetail })));
const Notifications = lazy(() => import('./pages/Notifications').then(m => ({ default: m.Notifications })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));
const Users = lazy(() => import('./pages/Users'));
const Settings = lazy(() => import('./pages/Settings'));
const AuditLog = lazy(() => import('./pages/AuditLog'));
const Reports = lazy(() => import('./pages/Reports'));
const Quotations = lazy(() => import('./pages/Quotations'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
import { RoleProvider } from './contexts/RoleContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';

import { PublicLayout } from './components/layout/public/PublicLayout';
import { HomePage } from './pages/public/HomePage';
import { ProductsCatalog } from './pages/public/ProductsCatalog';
import { CartPage } from './pages/public/CartPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { TermsPage } from './pages/public/TermsPage';
import { CheckoutPage } from './pages/public/CheckoutPage';
import { PaymentPage } from './pages/public/PaymentPage';
import { ProductDetail } from './pages/public/ProductDetail';

const Register = lazy(() => import('./pages/public/Register').then(m => ({ default: m.RegisterPage })));
const VerifyEmail = lazy(() => import('./pages/public/VerifyEmail').then(m => ({ default: m.VerifyEmailPage })));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/public/ResetPassword').then(m => ({ default: m.ResetPassword })));
import { FaqPage } from './pages/public/FaqPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicy';

const LoadingSpinner = () => (
  <div className="flex h-full items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <RoleProvider>
      {children}
    </RoleProvider>
  </ToastProvider>
);

export const router = createBrowserRouter([
  {
    element: <AppProviders><Outlet /></AppProviders>,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: '/',
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'products',
            element: <ProductsCatalog />,
          },
          {
            path: 'products/:id',
            element: <ProductDetail />,
          },
          {
            path: 'cart',
            element: <CartPage />,
          },
          {
            path: 'about',
            element: <AboutPage />,
          },
          {
            path: 'contact',
            element: <ContactPage />,
          },
          {
            path: 'terms',
            element: <TermsPage />,
          },
          {
            path: 'faq',
            element: <FaqPage />,
          },
          {
            path: 'privacy-policy',
            element: <PrivacyPolicyPage />,
          },
          {
            path: 'checkout',
            element: <CheckoutPage />,
          },
          {
            path: 'payment/:orderId',
            element: <PaymentPage />,
          },
        ],
      },
      {
        path: '/login',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: '/register',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: '/verify-email/:token',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <VerifyEmail />
          </Suspense>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: '/reset-password/:token',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ResetPassword />
          </Suspense>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
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
            path: 'profile',
            element: (
              <Suspense fallback={<LoadingSpinner />}>
                <Profile />
              </Suspense>
            ),
          },
          {
            path: 'orders',
            element: (
              <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Designer', 'Production_Staff', 'Finance_Staff', 'Sales']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Orders />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'orders/:id',
            element: (
              <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Designer', 'Production_Staff', 'Finance_Staff', 'Sales']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <OrderDetail />
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
              <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Finance_Staff', 'Sales']}>
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
          {
            path: 'users',
            element: (
              <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Users />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'settings',
            element: (
              <ProtectedRoute allowedRoles={['Owner']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Settings />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'audit-log',
            element: (
              <ProtectedRoute allowedRoles={['Owner', 'Manager']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <AuditLog />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'reports',
            element: (
              <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Finance_Staff']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Reports />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'quotations',
            element: (
              <ProtectedRoute allowedRoles={['Owner', 'Manager', 'Sales']}>
                <Suspense fallback={<LoadingSpinner />}>
                  <Quotations />
                </Suspense>
              </ProtectedRoute>
            ),
          },

          {
            path: 'notifications',
            element: (
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Notifications />
                </Suspense>
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);
