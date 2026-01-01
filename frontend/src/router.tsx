import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div className="flex h-full items-center justify-center">Loading...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
    ],
  },
]);
