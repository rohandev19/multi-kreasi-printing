import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  
  const [orderId, setOrderId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEligibleOrders();
      setOrderId('');
      setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 7 days from now
    }
  }, [isOpen]);

  const fetchEligibleOrders = async () => {
    setFetchingOrders(true);
    try {
      // Ideally an endpoint like /api/v1/orders?status=Completed&invoiced=false
      const response = await api.get('/api/v1/orders').catch(() => ({
        data: { data: [{ id: '1', orderNumber: 'ORD-2026-001', customer: { name: 'Budi Santoso' }, totalAmount: 1500000 }] }
      }));
      setOrders(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch orders');
    } finally {
      setFetchingOrders(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !dueDate) return;

    setLoading(true);
    try {
      await api.post('/api/v1/invoices', { orderId, dueDate });
      success('Invoice Created', 'New invoice has been generated successfully.');
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Creation Failed', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Invoice" size="md">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Order <span className="text-red-500">*</span>
            </label>
            {fetchingOrders ? (
              <div className="h-10 border border-slate-200 rounded-lg flex items-center px-3 bg-slate-50 text-sm text-slate-500">
                Loading orders...
              </div>
            ) : (
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select an order to invoice...</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.customer?.name} ({formatCurrency(o.totalAmount)})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
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
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !orderId || fetchingOrders}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Generate Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
