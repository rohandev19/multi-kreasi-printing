import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleProvider, useRoleContext } from '../RoleContext';
import api from '../../api/axios';

vi.mock('../../api/axios', () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

const TestComponent = () => {
  const { role, user, loading } = useRoleContext();

  if (loading) return <div>Loading role...</div>;

  return (
    <div>
      <span data-testid="role-value">{role || 'No Role'}</span>
      <span data-testid="user-name">{user?.fullName || user?.name || 'No User'}</span>
    </div>
  );
};

describe('RoleContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('fetches role on mount if token exists', async () => {
    localStorage.setItem('token', 'fake-token');
    
    // Mock successful profile fetch
    (api.get as any).mockResolvedValueOnce({
      data: {
        role: 'Manager',
        fullName: 'Manager User'
      }
    });

    render(
      <BrowserRouter>
        <RoleProvider>
          <TestComponent />
        </RoleProvider>
      </BrowserRouter>
    );

    // Initial state
    expect(screen.getByText('Loading role...')).toBeInTheDocument();

    // After fetch
    await waitFor(() => {
      expect(screen.getByTestId('role-value')).toHaveTextContent('Manager');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Manager User');
    });
  });

  it('does not fetch if no token exists', async () => {
    render(
      <BrowserRouter>
        <RoleProvider>
          <TestComponent />
        </RoleProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('role-value')).toHaveTextContent('No Role');
    });

    expect(api.get).not.toHaveBeenCalled();
  });
});
