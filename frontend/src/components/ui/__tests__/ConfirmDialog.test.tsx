import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../../utils/test-utils';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog Component', () => {
  it('renders correctly with title and message', () => {
    render(
      <ConfirmDialog 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}} 
        title="Delete Item" 
        message="Are you sure you want to delete this?" 
      />
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={handleConfirm} 
        title="Confirm" 
        message="Message" 
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders different variant styles', () => {
    render(
      <ConfirmDialog 
        isOpen={true} 
        onClose={() => {}} 
        onConfirm={() => {}} 
        title="Danger" 
        message="Message" 
        variant="danger"
        confirmLabel="Delete"
      />
    );

    const deleteBtn = screen.getByText('Delete');
    expect(deleteBtn).toBeInTheDocument();
    expect(deleteBtn.className).toMatch(/bg-red-600/);
  });
});
