import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Tag, WarningCircle, ChatText } from '@phosphor-icons/react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    subject: '',
    category: 'Order_Issue',
    priority: 'Normal',
    orderId: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      toastError('Validasi Gagal', 'Subjek dan deskripsi kendala wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        subject: formData.subject.trim(),
        category: formData.category,
        priority: formData.priority,
        description: formData.description.trim(),
      };
      if (formData.orderId.trim()) {
        payload.orderId = formData.orderId.trim();
      }

      await api.post('/api/v1/tickets', payload);
      success('Tiket Berhasil Dibuat', 'Tim support kami akan segera menindaklanjuti kendala Anda.');
      setFormData({
        subject: '',
        category: 'Order_Issue',
        priority: 'Normal',
        orderId: '',
        description: '',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError('Gagal', err.response?.data?.message || 'Gagal mengirim tiket bantuan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Tiket Bantuan & Dukungan">
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            Subjek Kendala <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Kendala Warna Cetak Kurang Pekat"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Kategori Kendala
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="Order_Issue">Kendala Pesanan (Order Issue)</option>
                <option value="Design_Problem">Masalah Desain (Design Problem)</option>
                <option value="Payment_Question">Pertanyaan Pembayaran (Payment)</option>
                <option value="Technical_Issue">Masalah Teknis Sistem (Technical)</option>
                <option value="General_Inquiry">Pertanyaan Umum (General Inquiry)</option>
              </select>
              <Tag size={16} className="absolute right-3 top-3 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
              Tingkat Urgensi / Prioritas
            </label>
            <div className="relative">
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="Low">Rendah (Low)</option>
                <option value="Normal">Normal (Standard)</option>
                <option value="High">Tinggi (High Priority)</option>
                <option value="Urgent">Mendesak (Urgent - Segera ditangani)</option>
              </select>
              <WarningCircle size={16} className="absolute right-3 top-3 text-[var(--text-secondary)] pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            ID / Nomor Pesanan Terkait (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: ORD-2026-0012 atau ID pesanan"
            value={formData.orderId}
            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
            Rincian &amp; Deskripsi Masalah <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              required
              rows={4}
              placeholder="Jelaskan secara rinci kendala yang Anda hadapi agar tim kami dapat memberikan solusi secepatnya..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-black"
            />
            <ChatText size={18} className="absolute right-3 top-3 text-[var(--text-secondary)] pointer-events-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-black text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? 'Mengirim...' : 'Kirim Tiket'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
