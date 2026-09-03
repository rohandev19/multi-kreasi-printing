// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId?: string | null;
}

const customerSchema = z.object({
  name: z.string().min(1, 'Company / Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  loyaltyTier: z.enum(['Standard', 'Silver', 'Gold', 'Platinum']).default('Standard'),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

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
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      loyaltyTier: 'Standard',
    }
  });

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      setFetchingData(true);
      try {
        const response = await api.get(`/api/v1/customers/${customerId}`);
        const customer = response.data;
        
        reset({
          name: customer.companyName || customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          loyaltyTier: customer.loyaltyTier || 'Standard',
        });
      } catch {
        error('Error', 'Failed to load customer details');
        onClose();
      } finally {
        setFetchingData(false);
      }
    };

    if (isOpen) {
      if (isEditMode) {
        fetchCustomerDetails();
      } else {
        reset({
          name: '',
          email: '',
          phone: '',
          loyaltyTier: 'Standard',
        });
      }
    }
  }, [isOpen, customerId, isEditMode, error, onClose, reset]);

  const onSubmit = async (data: CustomerFormValues) => {
    setLoading(true);

    try {
      if (isEditMode) {
        await api.put(`/api/v1/customers/${customerId}`, data);
        success('Customer Updated', `${data.name} has been updated successfully.`);
      } else {
        await api.post('/api/v1/customers', data);
        success('Customer Added', `${data.name} has been added to your customers.`);
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company / Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register('name')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.name ? 'border-red-500' : ''}`}
                placeholder="e.g., PT Maju Mundur"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                {...register('email')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                placeholder="contact@company.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                {...register('phone')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="+62 812 3456 7890"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loyalty Tier</label>
              <select
                {...register('loyaltyTier')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.loyaltyTier ? 'border-red-500' : ''}`}
              >
                <option value="Standard">Standard</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
              {errors.loyaltyTier && <p className="text-red-500 text-xs mt-1">{errors.loyaltyTier.message}</p>}
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
