import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { Mail, Phone, ShoppingBag, CreditCard, Award } from 'lucide-react';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customerId
}) => {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/api/v1/customers/${customerId}`);
        setCustomer(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && customerId) {
      fetchCustomer();
    } else {
      setCustomer(null);
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

  const tierColors: Record<string, string> = {
    Standard: 'bg-slate-100 text-slate-700',
    Silver: 'bg-gray-200 text-gray-800',
    Gold: 'bg-amber-100 text-amber-700',
    Platinum: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Profile" size="md">
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
        ) : customer ? (
          <div className="space-y-6">
            {/* Header block */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{customer.companyName || customer.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5"><Mail size={16} className="text-slate-400" /> {customer.email}</div>
                  {customer.phone && <div className="flex items-center gap-1.5"><Phone size={16} className="text-slate-400" /> {customer.phone}</div>}
                </div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${tierColors[customer.loyaltyTier || 'Standard'] || tierColors.Standard}`}>
                <Award size={14} />
                {customer.loyaltyTier || 'Standard'}
              </span>
            </div>

            <hr className="border-slate-100" />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <ShoppingBag size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{customer.totalOrders || 0}</div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <CreditCard size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                </div>
                <div className="text-xl font-bold text-slate-900">{formatCurrency(customer.totalRevenue || 0)}</div>
              </div>
            </div>

            {/* Outstanding Balance Warning */}
            {customer.outstandingBalance > 0 && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-red-800">Outstanding Balance</h4>
                  <p className="text-xs text-red-600">Needs to be settled</p>
                </div>
                <div className="text-lg font-bold text-red-700">
                  {formatCurrency(customer.outstandingBalance)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">Customer data not found.</div>
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
