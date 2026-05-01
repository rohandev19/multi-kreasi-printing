import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

type DialogVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  loading?: boolean;
}

const VARIANT_CONFIG: Record<DialogVariant, {
  icon: React.ReactNode;
  iconBg: string;
  buttonClass: string;
}> = {
  danger: {
    icon: <Trash2 size={24} className="text-red-600" />,
    iconBg: 'bg-red-100',
    buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  warning: {
    icon: <AlertTriangle size={24} className="text-amber-600" />,
    iconBg: 'bg-amber-100',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
  },
  info: {
    icon: <Info size={24} className="text-blue-600" />,
    iconBg: 'bg-blue-100',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
};

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
  const config = VARIANT_CONFIG[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.iconBg} flex items-center justify-center`}>
            {config.icon}
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${config.buttonClass}`}
        >
          {loading ? 'Processing...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
