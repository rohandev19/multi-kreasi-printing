import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { CheckCircle, UserCheck, CalendarBlank, NotePencil, ShieldCheck } from '@phosphor-icons/react';

interface ConfirmDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shipmentId: string | null;
  shipmentNumber?: string;
}

export const ConfirmDeliveryModal: React.FC<ConfirmDeliveryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  shipmentId,
  shipmentNumber,
}) => {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  // Form states
  const [receivedBy, setReceivedBy] = useState('');
  const [deliveredAt, setDeliveredAt] = useState(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm for datetime-local input
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [podNotes, setPodNotes] = useState('');
  const [confirmedByPIC, setConfirmedByPIC] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shipmentId) return;

    if (!receivedBy.trim()) {
      toastError('Data Tidak Lengkap', 'Nama penerima / PIC di lokasi wajib diisi.');
      return;
    }

    if (!confirmedByPIC) {
      toastError('Konfirmasi Dibutuhkan', 'Harap centang verifikasi fisik serah terima barang.');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/api/v1/shipments/${shipmentId}/confirm-delivery`, {
        receivedBy: receivedBy.trim(),
        deliveredAt: deliveredAt ? new Date(deliveredAt).toISOString() : new Date().toISOString(),
        podNotes: podNotes.trim() || undefined,
        podSignature: `Confirmed by PIC: ${receivedBy.trim()} at ${new Date().toISOString()}`,
      });

      success('Pengiriman Diterima', `Surat Jalan ${shipmentNumber || ''} berhasil dikonfirmasi serah terimanya.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal mengonfirmasi serah terima pengiriman.';
      toastError('Gagal Konfirmasi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Konfirmasi Penerimaan (POD) - ${shipmentNumber || 'Surat Jalan'}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
          <ShieldCheck size={24} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-relaxed">
            <p className="font-bold">Proof of Delivery (POD) Digital</p>
            <p className="mt-0.5 text-emerald-800">
              Konfirmasi ini membuktikan barang cetakan fisik telah diserahkan dan diterima oleh pihak klien.
              Jika seluruh kuantitas pesanan telah selesai dikirim dan diterima, status pesanan akan otomatis terbarui menjadi <strong>Delivered</strong>.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <UserCheck size={16} className="text-slate-500" />
            Nama Penerima / PIC Klien <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Bpk. Bambang Sutrisno (Head of Warehouse)"
            value={receivedBy}
            onChange={(e) => setReceivedBy(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <CalendarBlank size={16} className="text-slate-500" />
            Waktu Serah Terima
          </label>
          <input
            type="datetime-local"
            value={deliveredAt}
            onChange={(e) => setDeliveredAt(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <NotePencil size={16} className="text-slate-500" />
            Catatan Kondisi Barang / Keterangan POD
          </label>
          <textarea
            rows={3}
            placeholder="Contoh: Barang diterima 10 box dalam kondisi tersegel baik, packaging rapi, kuantitas lengkap sesuai Surat Jalan."
            value={podNotes}
            onChange={(e) => setPodNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all resize-none"
          />
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedByPIC}
              onChange={(e) => setConfirmedByPIC(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-700 font-medium">
              Saya menyatakan bahwa barang cetakan fisik pada Surat Jalan ini telah diverifikasi, dicek kuantitasnya, dan resmi diserahterimakan.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading || !receivedBy.trim() || !confirmedByPIC}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </span>
            ) : (
              <>
                <CheckCircle size={16} weight="bold" />
                Konfirmasi Serah Terima (POD)
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
