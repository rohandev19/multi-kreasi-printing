import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import Login from '../Login';
import api from '../../api/axios';

vi.mock('../../api/axios', () => {
  return {
    default: {
      post: vi.fn(),
    },
  };
});

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(<Login />);
    
    expect(screen.getByRole('heading', { name: /MK Printing/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@mkprinting.com')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
  });

  it('shows validation errors if fields are empty', async () => {
    render(<Login />);
    
    const submitBtn = screen.getByRole('button', { name: /Log In/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    // Mock successful login response
    (api.post as any).mockResolvedValueOnce({
      data: {
        data: {
          token: 'fake-jwt-token',
        }
      }
    });

    const { container } = render(<Login />);
    
    const emailInput = screen.getByPlaceholderText('admin@mkprinting.com');
    // Find password input by name attribute since there's no placeholder
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement;
    const submitBtn = screen.getByRole('button', { name: /Log In/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
