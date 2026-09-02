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
    const { container } = render(<Dashboard />, { roleValue: { role: null, user: null, loading: true, refreshRole: vi.fn() as any } });
    
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
      roleValue: { role: 'User' as any, user: { fullName: 'John Doe' } as any, loading: false, refreshRole: vi.fn() as any } 
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
      roleValue: { role: 'Manager' as any, user: { fullName: 'Admin User', name: 'Admin User' } as any, loading: false, refreshRole: vi.fn() as any } 
    });

    await waitFor(() => {
      expect(screen.getByText(/Good/i)).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Orders Today')).toBeInTheDocument();
    });
  });
});
