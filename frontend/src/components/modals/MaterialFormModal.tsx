// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  materialId?: string | null;
}

const materialSchema = z.object({
  name: z.string().min(1, 'Nama bahan baku wajib diisi'),
  sku: z.string().min(1, 'Kode SKU wajib diisi'),
  category: z.enum(['Paper', 'Ink', 'Vinyl', 'Laminate', 'Packaging', 'Other']).default('Paper'),
  unit: z.enum(['sheets', 'm²', 'liters', 'kg', 'pieces', 'boxes']).default('sheets'),
  minStock: z.coerce.number().min(0, 'Batas stok minimum tidak boleh bernilai negatif'),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

export const MaterialFormModal: React.FC<MaterialFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  materialId
}) => {
  const isEditMode = !!materialId;
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: 'Paper',
      unit: 'sheets',
      minStock: 0,
    }
  });

  useEffect(() => {
    const fetchMaterialDetails = async () => {
      setFetchingData(true);
      try {
        const response = await api.get(`/api/v1/inventory/${materialId}`);
        const material = response.data;
        
        reset({
          name: material.name || '',
          sku: material.sku || '',
          category: material.category || 'Paper',
          unit: material.unit || 'sheets',
          minStock: material.minStock || 0,
        });
      } catch {
        error('Gagal', 'Gagal memuat detail bahan baku');
        onClose();
      } finally {
        setFetchingData(false);
      }
    };

    if (isOpen) {
      if (isEditMode) {
        fetchMaterialDetails();
      } else {
        reset({
          name: '',
          sku: '',
          category: 'Paper',
          unit: 'sheets',
          minStock: 0,
        });
      }
    }
  }, [isOpen, materialId, isEditMode, error, onClose, reset]);

  const onSubmit = async (data: MaterialFormValues) => {
    setLoading(true);

    try {
      if (isEditMode) {
        await api.put(`/api/v1/inventory/${materialId}`, data);
        success('Bahan Baku Diperbarui', `${data.name} berhasil diperbarui.`);
      } else {
        await api.post('/api/v1/inventory', data);
        success('Bahan Baku Ditambahkan', `${data.name} berhasil ditambahkan ke inventaris.`);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Gagal menyimpan bahan baku', err.response?.data?.message || 'Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Ubah Bahan Baku' : 'Tambah Bahan Baku Baru'}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Bahan Baku <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register('name')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                placeholder="contoh: Kertas HVS A4 80gsm"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kode SKU <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('sku')}
                  className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.sku ? 'border-red-500' : ''}`}
                  placeholder="contoh: PPR-A4-80"
                />
                {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  {...register('category')}
                  className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="Paper">Kertas (Paper)</option>
                  <option value="Ink">Tinta (Ink)</option>
                  <option value="Vinyl">Vinyl</option>
                  <option value="Laminate">Laminasi (Laminate)</option>
                  <option value="Packaging">Kemasan (Packaging)</option>
                  <option value="Other">Lainnya</option>
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Satuan Pengukuran <span className="text-red-500">*</span></label>
                <select
                  {...register('unit')}
                  className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.unit ? 'border-red-500' : ''}`}
                >
                  <option value="sheets">Lembar (Sheets)</option>
                  <option value="m²">Meter Persegi (m²)</option>
                  <option value="liters">Liter</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="pieces">Pcs / Buah</option>
                  <option value="boxes">Kotak / Box</option>
                </select>
                {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Peringatan Min. Stok <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="0"
                  {...register('minStock')}
                  className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.minStock ? 'border-red-500' : ''}`}
                  placeholder="contoh: 1000"
                />
                {errors.minStock && <p className="text-red-500 text-xs mt-1">{errors.minStock.message}</p>}
              </div>
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
              {loading ? 'Menyimpan...' : (isEditMode ? 'Simpan Perubahan' : 'Tambah Bahan Baku')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
