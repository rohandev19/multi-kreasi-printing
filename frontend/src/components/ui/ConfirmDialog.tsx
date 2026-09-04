import React from 'react';
import { Modal } from './Modal';
import { Trash, Warning, Info } from '@phosphor-icons/react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash size={24} className="text-[var(--color-error-600)]" weight="regular" />,
          bg: 'var(--color-error-100)',
          btn: 'var(--color-error-600)',
        };
      case 'warning':
        return {
          icon: <Warning size={24} className="text-[var(--color-warning-600)]" weight="regular" />,
          bg: 'var(--color-warning-100)',
          btn: 'var(--color-warning-600)',
        };
      case 'info':
        return {
          icon: <Info size={24} className="text-[var(--color-info-600)]" weight="regular" />,
          bg: 'var(--color-info-100)',
          btn: 'var(--color-info-600)',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" hideHeader>
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: styles.bg }}>
          {styles.icon}
        </div>
        <div className="flex-1 pt-1 text-left">
          <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end gap-3 border-t pt-4" style={{ borderColor: 'var(--border-default)' }}>
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:opacity-50"
          style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-150 disabled:opacity-50"
          style={{ backgroundColor: styles.btn }}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
