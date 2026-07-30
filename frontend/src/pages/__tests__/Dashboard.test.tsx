import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../utils/test-utils';
import Dashboard from '../Dashboard';
import api from '../../api/axios';

vi.mock('../../api/axios', () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

describe('Dashboard Page', () => {
  it('renders loading state initially if role loading', () => {
    const { container } = render(<Dashboard />, { roleValue: { role: null, user: null, loading: true, logout: vi.fn(), refreshRole: vi.fn() } });
    
    // Check for animate-pulse which signifies loading
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders User dashboard view for normal user role', async () => {
    // Mock standard user data fetch (legacy endpoint)
    (api.get as any).mockResolvedValueOnce({
      data: {
        widgets: []
      }
    });

    render(<Dashboard />, { 
      roleValue: { role: 'User', user: { fullName: 'John Doe' }, loading: false, logout: vi.fn(), refreshRole: vi.fn() } 
    });

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('No dashboard widgets available for your role.')).toBeInTheDocument();
    });
  });

  it('renders Admin dashboard view for Manager role', async () => {
    // Mock admin data fetch (5 calls)
    (api.get as any)
      .mockResolvedValueOnce({ data: { totalRevenue: { value: 125000 } } }) // kpiRes
      .mockResolvedValueOnce({ data: [] }) // revRes
      .mockResolvedValueOnce({ data: [] }) // ordersRes
      .mockResolvedValueOnce({ data: [] }) // jobsRes
      .mockResolvedValueOnce({ data: { ordersToday: 12, pendingApprovals: 5, lowStockAlerts: 1 } }); // metricsRes

    render(<Dashboard />, { 
      roleValue: { role: 'Manager', user: { fullName: 'Admin User', name: 'Admin User' }, loading: false, logout: vi.fn(), refreshRole: vi.fn() } 
    });

    await waitFor(() => {
      expect(screen.getByText(/Good afternoon/i)).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Orders Today')).toBeInTheDocument();
    });
  });
});
