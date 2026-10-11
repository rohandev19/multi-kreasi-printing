// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId?: string | null;
}

const customerSchema = z.object({
  name: z.string().min(1, 'Nama atau perusahaan wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional(),
  loyaltyTier: z.enum(['Standard', 'Silver', 'Gold', 'Platinum']).default('Standard'),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerId
}) => {
  const isEditMode = !!customerId;
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      loyaltyTier: 'Standard',
    }
  });

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      setFetchingData(true);
      try {
        const response = await api.get(`/api/v1/customers/${customerId}`);
        const customer = response.data;
        
        reset({
          name: customer.companyName || customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          loyaltyTier: customer.loyaltyTier || 'Standard',
        });
      } catch {
        error('Gagal', 'Gagal memuat detail pelanggan');
        onClose();
      } finally {
        setFetchingData(false);
      }
    };

    if (isOpen) {
      if (isEditMode) {
        fetchCustomerDetails();
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          loyaltyTier: 'Standard',
        });
      }
    }
  }, [isOpen, customerId, isEditMode, error, onClose, reset]);

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true);

    try {
      if (isEditMode) {
        await api.put(`/api/v1/customers/${customerId}`, data);
        success('Pelanggan Diperbarui', `${data.name} berhasil diperbarui.`);
      } else {
        await api.post('/api/v1/customers', data);
        success('Pelanggan Ditambahkan', `${data.name} berhasil ditambahkan ke daftar pelanggan.`);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Gagal menyimpan pelanggan', err.response?.data?.message || 'Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Ubah Pelanggan' : 'Tambah Pelanggan Baru'}
      size="md"
    >
      {fetchingData ? (
        <div className="p-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Perusahaan / Nama Pelanggan <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register('name')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                placeholder="contoh: PT Maju Mundur"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                {...register('email')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                placeholder="kontak@perusahaan.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
              <input
                type="tel"
                {...register('phone')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+62 812 3456 7890"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tingkat Loyalitas</label>
              <select
                {...register('loyaltyTier')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.loyaltyTier ? 'border-red-500' : ''}`}
              >
                <option value="Standard">Standard</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
              {errors.loyaltyTier && <p className="text-red-500 text-xs mt-1">{errors.loyaltyTier.message}</p>}
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
              className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Pelanggan')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
