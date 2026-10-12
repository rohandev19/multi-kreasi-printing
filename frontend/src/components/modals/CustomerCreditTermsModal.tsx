import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { ShieldCheck, Calendar, CreditCard, WarningCircle } from '@phosphor-icons/react';

interface CustomerCreditTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer: {
    id: string;
    companyName: string;
    creditLimit: number;
    paymentTermDays: number;
    creditStatus: string;
    creditNotes?: string | null;
    currentOutstanding?: number;
  } | null;
}

export const CustomerCreditTermsModal: React.FC<CustomerCreditTermsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customer,
}) => {
  const { success, error: toastError } = useToast();
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [paymentTermDays, setPaymentTermDays] = useState<number>(0);
  const [creditStatus, setCreditStatus] = useState<string>('ACTIVE');
  const [creditNotes, setCreditNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setCreditLimit(Number(customer.creditLimit || 0));
      setPaymentTermDays(Number(customer.paymentTermDays || 0));
      setCreditStatus(customer.creditStatus || 'ACTIVE');
      setCreditNotes(customer.creditNotes || '');
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(`/api/v1/customers/${customer.id}/credit-terms`, {
        creditLimit: Number(creditLimit),
        paymentTermDays: Number(paymentTermDays),
        creditStatus,
        creditNotes,
      });
      success(
        'Plafon & Kredit Diperbarui',
        `Ketentuan kredit untuk ${customer.companyName} telah berhasil disimpan.`,
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(
        'Gagal Menyimpan Kredit',
        err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data kredit.',
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Kelola Plafon & Term of Payment (TOP)`}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-5">
          {/* Company Brief Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Nama Perusahaan
              </p>
              <h4 className="text-base font-bold text-slate-900">{customer.companyName}</h4>
            </div>
            {customer.currentOutstanding !== undefined && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Piutang Berjalan</p>
                <p className="text-sm font-bold text-slate-800">
                  {formatCurrency(customer.currentOutstanding)}
                </p>
              </div>
            )}
          </div>

          {/* Credit Limit Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <CreditCard size={16} className="text-slate-500" />
              Plafon Kredit Maksimal (IDR)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 sm:text-sm font-semibold">
                Rp
              </div>
              <input
                type="number"
                min="0"
                step="500000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                className="pl-10 block w-full rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
                placeholder="Contoh: 50000000"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Format: {formatCurrency(creditLimit)}
            </p>
          </div>

          {/* Payment Terms (TOP) Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar size={16} className="text-slate-500" />
              Term of Payment (TOP)
            </label>
            <select
              value={paymentTermDays}
              onChange={(e) => setPaymentTermDays(parseInt(e.target.value, 10))}
              className="block w-full rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
            >
              <option value="0">Cash / Prepaid (Tanpa Tempo / DP Penuh)</option>
              <option value="14">Net 14 Hari (TOP 14 Hari)</option>
              <option value="30">Net 30 Hari (TOP 30 Hari - Standard B2B)</option>
              <option value="45">Net 45 Hari (TOP 45 Hari)</option>
              <option value="60">Net 60 Hari (TOP 60 Hari - Enterprise)</option>
              <option value="90">Net 90 Hari (TOP 90 Hari - Khusus Korporat)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Faktur yang diterbitkan akan otomatis jatuh tempo {paymentTermDays} hari setelah invoice terbit.
            </p>
          </div>

          {/* Credit Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-slate-500" />
              Status Fasilitas Kredit
            </label>
            <select
              value={creditStatus}
              onChange={(e) => setCreditStatus(e.target.value)}
              className="block w-full rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900 sm:text-sm font-medium"
            >
              <option value="ACTIVE">ACTIVE (Fasilitas Kredit Aktif)</option>
              <option value="ON_HOLD">ON_HOLD (Hold Sementara - Verifikasi Piutang)</option>
              <option value="SUSPENDED">SUSPENDED (Ditangguhkan / Blacklist Kredit)</option>
            </select>
            {creditStatus !== 'ACTIVE' && (
              <div className="flex items-center gap-2 mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                <WarningCircle size={16} className="shrink-0 text-amber-600" />
                <span>
                  Status {creditStatus} akan otomatis memblokir pesanan bertempo baru sampai akun diaktifkan kembali.
                </span>
              </div>
            )}
          </div>

          {/* Credit Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Catatan & Riwayat Kebijakan Kredit
            </label>
            <textarea
              rows={3}
              value={creditNotes}
              onChange={(e) => setCreditNotes(e.target.value)}
              className="block w-full rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900 sm:text-sm"
              placeholder="Catatan analisis keuangan, histori plafon, atau pertimbangan persetujuan manajemen..."
            />
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
            className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
          >
            {loading ? 'Menyimpan...' : 'Simpan Ketentuan Kredit'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
