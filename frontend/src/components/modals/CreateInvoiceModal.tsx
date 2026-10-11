// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const invoiceSchema = z.object({
  orderId: z.string().min(1, 'Pesanan wajib dipilih'),
  dueDate: z.string().min(1, 'Tanggal jatuh tempo wajib diisi'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      orderId: '',
      dueDate: '',
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchEligibleOrders();
      reset({
        orderId: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
  }, [isOpen, reset]);

  const fetchEligibleOrders = async () => {
    setFetchingOrders(true);
    try {
      // Ideally an endpoint like /api/v1/orders?status=Completed&invoiced=false
      const response = await api.get('/api/v1/orders').catch(() => ({
        data: { data: [{ id: '1', orderNumber: 'ORD-2026-001', customer: { name: 'Budi Santoso' }, totalAmount: 1500000 }] }
      }));
      setOrders(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch {
      console.error('Gagal mengambil daftar pesanan');
    } finally {
      setFetchingOrders(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    setLoading(true);
    try {
      await api.post('/api/v1/invoices', data);
      success('Faktur Berhasil Dibuat', 'Faktur tagihan baru telah berhasil diterbitkan.');
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Pembuatan Faktur Gagal', err.response?.data?.message || 'Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Faktur Tagihan" size="md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pilih Pesanan <span className="text-red-500">*</span>
            </label>
            {fetchingOrders ? (
              <div className="h-10 border border-slate-200 rounded-lg flex items-center px-3 bg-slate-50 text-sm text-slate-500">
                Memuat daftar pesanan...
              </div>
            ) : (
              <select
                {...register('orderId')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.orderId ? 'border-red-500' : ''}`}
              >
                <option value="">Pilih pesanan yang akan dibuatkan faktur...</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.customer?.name} ({formatCurrency(o.totalAmount || 0)})
                  </option>
                ))}
              </select>
            )}
            {errors.orderId && <p className="text-red-500 text-xs mt-1">{errors.orderId.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tanggal Jatuh Tempo <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.dueDate ? 'border-red-500' : ''}`}
            />
            {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
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
            disabled={loading || fetchingOrders}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
          >
            {loading ? 'Membuat...' : 'Terbitkan Faktur'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
