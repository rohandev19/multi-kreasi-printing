import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { Download } from '@phosphor-icons/react';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string | null;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  invoiceId
}) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/api/v1/invoices/${invoiceId}`);
        setInvoice(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat detail faktur tagihan');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && invoiceId) {
      fetchInvoice();
    } else {
      setInvoice(null);
      setError('');
    }
  }, [isOpen, invoiceId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const statusColors: Record<string, string> = {
    Unpaid: 'bg-red-100 text-red-700',
    Partial: 'bg-amber-100 text-amber-700',
    Paid: 'bg-emerald-100 text-emerald-700',
  };

  const statusLabels: Record<string, string> = {
    Unpaid: 'Belum Bayar',
    Partial: 'Dibayar Sebagian',
    Paid: 'Lunas',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Faktur Tagihan" size="lg">
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
        ) : invoice ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</h3>
                <p className="text-slate-500 text-sm mt-1">Diterbitkan: {formatDate(invoice.createdAt)}</p>
                <p className="text-slate-500 text-sm">Jatuh Tempo: {formatDate(invoice.dueDate)}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[invoice.status] || 'bg-slate-100 text-slate-700'}`}>
                {statusLabels[invoice.status] || invoice.status}
              </span>
            </div>

            {/* Bill To / From */}
            <div className="grid grid-cols-2 gap-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ditagihkan Kepada</p>
                <p className="font-semibold text-slate-800">{invoice.customer?.companyName || invoice.customer?.name}</p>
                <p className="text-sm text-slate-600">{invoice.customer?.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nomor Pesanan Referensi</p>
                <p className="font-semibold text-slate-900">{invoice.order?.orderNumber}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-between items-center py-4 border-b border-slate-100">
              <span className="font-bold text-slate-800">Total Tagihan</span>
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(invoice.amount)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-slate-600">Sudah Dibayar</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(invoice.paidAmount || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-slate-600">Sisa Pembayaran</span>
              <span className="font-bold text-red-600">{formatCurrency(invoice.amount - (invoice.paidAmount || 0))}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">Faktur tagihan tidak ditemukan.</div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Tutup
        </button>
        {invoice && (
          <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
            <Download size={16} weight="regular" />
            Unduh PDF
          </button>
        )}
      </div>
    </Modal>
  );
};
