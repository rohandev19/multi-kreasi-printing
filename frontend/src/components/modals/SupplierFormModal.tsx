import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Buildings, User, Envelope, Phone, MapPin } from '@phosphor-icons/react';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supplierId?: string | null;
}

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  supplierId,
}) => {
  const isEditMode = !!supplierId;
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (supplierId) {
        setFetching(true);
        api
          .get(`/api/v1/suppliers/${supplierId}`)
          .then((res) => {
            setFormData({
              name: res.data.name || '',
              contactPerson: res.data.contactPerson || '',
              email: res.data.email || '',
              phone: res.data.phone || '',
              address: res.data.address || '',
            });
          })
          .catch(() => {
            toastError('Gagal', 'Gagal memuat detail pemasok');
            onClose();
          })
          .finally(() => setFetching(false));
      } else {
        setFormData({
          name: '',
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
        });
      }
    }
  }, [isOpen, supplierId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toastError('Validasi Gagal', 'Nama pemasok / perusahaan wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/api/v1/suppliers/${supplierId}`, formData);
        success('Pemasok Diperbarui', `Data ${formData.name} berhasil diperbarui.`);
      } else {
        await api.post('/api/v1/suppliers', formData);
        success('Pemasok Ditambahkan', `Pemasok ${formData.name} berhasil ditambahkan.`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(
        'Gagal Menyimpan',
        err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data pemasok.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Data Pemasok' : 'Tambah Pemasok Baru'}
    >
      {fetching ? (
        <div className="py-12 text-center text-sm text-slate-500">Memuat data pemasok...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Perusahaan / Pemasok <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Buildings size={16} weight="bold" />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: PT Kertas Nusantara Jaya"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kontak Person (PIC)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={16} weight="bold" />
              </div>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Nama kontak perwakilan sales / account manager"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Envelope size={16} weight="bold" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sales@supplier.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone size={16} weight="bold" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="081234567890"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Kantor / Gudang Pemasok
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                <MapPin size={16} weight="bold" />
              </div>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alamat lengkap lokasi pengiriman atau warehouse supplier"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Pemasok'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
