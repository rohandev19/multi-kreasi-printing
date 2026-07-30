import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import { RoleProvider, useRoleContext } from '../RoleContext';
import api from '../../api/axios';
import { MemoryRouter } from 'react-router-dom';

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
      <span data-testid="user-name">{user?.fullName || 'No User'}</span>
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
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
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
      <RoleProvider>
        <TestComponent />
      </RoleProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('role-value')).toHaveTextContent('No Role');
    });

    expect(api.get).not.toHaveBeenCalled();
  });
});
