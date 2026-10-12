import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { UploadSimple } from '@phosphor-icons/react';

interface CreateProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber?: string;
  currentLatestVersion?: number;
  onSuccess?: () => void;
}

export const CreateProofModal: React.FC<CreateProofModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  currentLatestVersion = 0,
  onSuccess,
}) => {
  const { success, error: toastError } = useToast();
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [version, setVersion] = useState(currentLatestVersion + 1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileUrl.trim()) {
      toastError('Berkas Wajib', 'Mohon masukkan tautan berkas proof cetak digital.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/api/v1/orders/${orderId}/proofs`, {
        fileUrl: fileUrl.trim(),
        fileName: fileName.trim() || undefined,
        version: Number(version) || (currentLatestVersion + 1),
        notes: notes.trim() || undefined,
      });

      success(
        'Bukti Cetak Diterbitkan',
        `Proof v${version} untuk pesanan #${orderNumber || orderId} berhasil diterbitkan dan siap ditinjau klien.`
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toastError('Gagal Menerbitkan Proof', err.response?.data?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Terbitkan Bukti Cetak (Proof v${version})`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500">Nomor Pesanan</p>
          <p className="text-sm font-bold text-slate-900">{orderNumber || orderId}</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Versi Bukti Cetak (Proof Version) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={version}
            onChange={(e) => setVersion(parseInt(e.target.value) || 1)}
            required
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            URL Berkas Proof (PDF / Gambar) <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://storage.mkprinting.co.id/proofs/ORD-001_v1.pdf"
            required
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Nama Berkas (Opsional)
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Katalog_PT_ABC_PressProof_v1.pdf"
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Catatan Pracetak & Penyesuaian Desainer (Opsional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Warna dikonversi ke CMYK FOGRA39, bleed 3mm ditambahkan di keempat sisi, garis lipat ditandai garis putus-putus..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <UploadSimple size={16} weight="bold" />
            {submitting ? 'Menerbitkan...' : 'Terbitkan Proof'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
