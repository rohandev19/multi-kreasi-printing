import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { Download } from 'lucide-react';

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
    if (isOpen && invoiceId) {
      fetchInvoice();
    } else {
      setInvoice(null);
      setError('');
    }
  }, [isOpen, invoiceId]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/v1/invoices/${invoiceId}`);
      setInvoice(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details" size="lg">
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
        ) : invoice ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</h3>
                <p className="text-slate-500 text-sm mt-1">Issued: {formatDate(invoice.createdAt)}</p>
                <p className="text-slate-500 text-sm">Due: {formatDate(invoice.dueDate)}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[invoice.status] || 'bg-slate-100 text-slate-700'}`}>
                {invoice.status}
              </span>
            </div>

            {/* Bill To / From */}
            <div className="grid grid-cols-2 gap-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
                <p className="font-semibold text-slate-800">{invoice.customer?.companyName || invoice.customer?.name}</p>
                <p className="text-sm text-slate-600">{invoice.customer?.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reference Order</p>
                <p className="font-semibold text-indigo-600">{invoice.order?.orderNumber}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="flex justify-between items-center py-4 border-b border-slate-100">
              <span className="font-bold text-slate-800">Total Amount</span>
              <span className="text-2xl font-bold text-slate-900">{formatCurrency(invoice.amount)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-slate-600">Amount Paid</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(invoice.paidAmount || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-slate-600">Balance Due</span>
              <span className="font-bold text-red-600">{formatCurrency(invoice.amount - (invoice.paidAmount || 0))}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">Invoice not found.</div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
        {invoice && (
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Download size={16} />
            Download PDF
          </button>
        )}
      </div>
    </Modal>
  );
};
