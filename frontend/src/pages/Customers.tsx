import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { CustomersTable } from '../components/tables/CustomersTable';
import { CustomerFormModal } from '../components/modals/CustomerFormModal';
import { CustomerDetailModal } from '../components/modals/CustomerDetailModal';
import { PaymentHistoryModal } from '../components/modals/PaymentHistoryModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';

interface Customer {
  id: string;
  companyName: string;
  email: string;
  phone: string | null;
  loyaltyTier: string;
  totalOrders: number;
  totalRevenue?: number;
  outstandingBalance?: number;
}

export default function Customers() {
  const { role, loading: roleLoading } = useRoleContext();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { success, error: toastError } = useToast();

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!roleLoading && role) {
      fetchCustomers();
    }
  }, [role, roleLoading]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/v1/customers');
      const customerData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setCustomers(customerData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setSelectedCustomerId(null);
    setIsFormOpen(true);
  };

  const handleViewCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setIsDetailOpen(true);
  };

  const handleEditCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setIsFormOpen(true);
  };

  const handleDeleteCustomer = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/customers/${deleteId}`);
      success('Customer Deleted', 'The customer has been deleted.');
      fetchCustomers();
    } catch (err: any) {
      toastError('Failed to delete', err.response?.data?.message || 'Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleViewPaymentHistory = (id: string) => {
    setSelectedCustomerId(id);
    setIsHistoryOpen(true);
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const canManage = role === 'Owner' || role === 'Manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
        {canManage && (
          <button 
            onClick={handleAddCustomer}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Add Customer
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <CustomersTable
        customers={customers}
        userRole={role || ''}
        loading={loading}
        onViewCustomer={handleViewCustomer}
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        onViewPaymentHistory={handleViewPaymentHistory}
      />

      {/* Modals */}
      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchCustomers}
        customerId={selectedCustomerId}
      />

      <CustomerDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        customerId={selectedCustomerId}
      />

      <PaymentHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        customerId={selectedCustomerId}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={isDeleting}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
