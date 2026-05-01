import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId?: string | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerId
}) => {
  const isEditMode = !!customerId;
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loyaltyTier, setLoyaltyTier] = useState('Standard');

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        fetchCustomerDetails();
      } else {
        resetForm();
      }
    }
  }, [isOpen, customerId]);

  const fetchCustomerDetails = async () => {
    setFetchingData(true);
    try {
      const response = await api.get(`/api/v1/customers/${customerId}`);
      const customer = response.data;
      
      setName(customer.companyName || customer.name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setLoyaltyTier(customer.loyaltyTier || 'Standard');
    } catch (err) {
      error('Error', 'Failed to load customer details');
      onClose();
    } finally {
      setFetchingData(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setLoyaltyTier('Standard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name, // Backend might map this to companyName or name
      email,
      phone,
      loyaltyTier
    };

    try {
      if (isEditMode) {
        await api.put(`/api/v1/customers/${customerId}`, payload);
        success('Customer Updated', `${name} has been updated successfully.`);
      } else {
        await api.post('/api/v1/customers', payload);
        success('Customer Added', `${name} has been added to your customers.`);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Failed to save customer', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Customer' : 'Add New Customer'}
      size="md"
    >
      {fetchingData ? (
        <div className="p-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company / Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., PT Maju Mundur"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="contact@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="+62 812 3456 7890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loyalty Tier</label>
              <select
                value={loyaltyTier}
                onChange={(e) => setLoyaltyTier(e.target.value)}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="Standard">Standard</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
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
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Customer')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
