import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../utils/test-utils';
import { Modal } from '../Modal';

describe('Modal Component', () => {
  it('renders correctly when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div data-testid="modal-content">Modal Content Here</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    // Find the close button (assuming it has an aria-label="Close modal" or similar, or just find the X button)
    // In our Modal component, it's typically a button with the X icon. Let's find it by role.
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
