// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId: string | null;
}

const paymentSchema = z.object({
  amount: z.coerce.number().min(1, 'Nominal pembayaran harus lebih dari 0'),
  method: z.enum(['Bank Transfer', 'Cash', 'Credit Card', 'QRIS']).default('Bank Transfer'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoiceId
}) => {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      method: 'Bank Transfer'
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        amount: 0,
        method: 'Bank Transfer'
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: PaymentFormValues) => {
    setLoading(true);
    try {
      await api.post(`/api/v1/invoices/${invoiceId}/payment`, data);
      success('Pembayaran Dicatat', `Pembayaran sebesar Rp ${data.amount.toLocaleString('id-ID')} berhasil dicatat.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Gagal Mencatat Pembayaran', err.response?.data?.message || 'Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat Pembayaran" size="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nominal Pembayaran (IDR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 sm:text-sm">Rp</span>
              </div>
              <input
                type="number"
                min="1"
                {...register('amount')}
                className={`w-full pl-9 border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.amount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Metode Pembayaran <span className="text-red-500">*</span>
            </label>
            <select
              {...register('method')}
              className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.method ? 'border-red-500' : ''}`}
            >
              <option value="Bank Transfer">Transfer Bank</option>
              <option value="Cash">Tunai (Cash)</option>
              <option value="Credit Card">Kartu Kredit</option>
              <option value="QRIS">QRIS / E-Wallet</option>
            </select>
            {errors.method && <p className="text-red-500 text-xs mt-1">{errors.method.message}</p>}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
          >
            {loading ? 'Mencatat...' : 'Catat Pembayaran'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
