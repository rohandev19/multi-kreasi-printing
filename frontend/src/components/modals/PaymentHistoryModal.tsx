import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { CreditCard, Calendar } from 'lucide-react';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  customerId
}) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      setLoading(true);
      setError('');
      try {
        // Assuming endpoint is like /api/v1/customers/:id/payments or similar
        // Or we filter invoices by customer
        const response = await api.get(`/api/v1/customers/${customerId}/payments`);
        setPayments(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && customerId) {
      fetchPaymentHistory();
    } else {
      setPayments([]);
      setError('');
    }
  }, [isOpen, customerId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment History" size="md">
      <div className="p-0">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
            <p>No payment history found for this customer.</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <ul className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <li key={payment.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 text-sm mb-1">{formatCurrency(payment.amount)}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(payment.date)}</span>
                      <span>•</span>
                      <span>{payment.method}</span>
                      {payment.invoiceNumber && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-indigo-600">{payment.invoiceNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700">
                    {payment.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end rounded-b-xl">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};
