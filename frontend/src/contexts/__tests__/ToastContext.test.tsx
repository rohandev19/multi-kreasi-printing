import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '../../utils/test-utils';
import { useToast, ToastProvider } from '../ToastContext';

const TestComponent = () => {
  const { success, error, info } = useToast();

  return (
    <div>
      <button onClick={() => success('Success Title', 'Success Message')}>Show Success</button>
      <button onClick={() => error('Error Title', 'Error Message')}>Show Error</button>
      <button onClick={() => info('Info Title', 'Info Message')}>Show Info</button>
    </div>
  );
};

describe('ToastContext', () => {
  it('renders children correctly', () => {
    render(
      <ToastProvider>
        <div>Test Child</div>
      </ToastProvider>
    );
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('shows success toast when triggered', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Success'));
    expect(screen.getByText('Success Title')).toBeInTheDocument();
    expect(screen.getByText('Success Message')).toBeInTheDocument();
  });

  it('shows error toast when triggered', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Show Error'));
    expect(screen.getByText('Error Title')).toBeInTheDocument();
    expect(screen.getByText('Error Message')).toBeInTheDocument();
  });
});
