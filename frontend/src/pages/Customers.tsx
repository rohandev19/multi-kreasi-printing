import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { CustomersTable } from '../components/tables/CustomersTable';

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

  const handleViewCustomer = (id: string) => {
    alert(`View customer ${id}`);
  };

  const handleEditCustomer = (id: string) => {
    alert(`Edit customer ${id}`);
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      alert(`Delete customer ${id}`);
    }
  };

  const handleViewPaymentHistory = (id: string) => {
    alert(`View payment history for customer ${id}`);
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canManage = role === 'Owner' || role === 'Manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
        {canManage && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
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
    </div>
  );
}
