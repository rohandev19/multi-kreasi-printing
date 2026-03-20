import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Customer {
  id: string;
  companyName: string;
  email: string;
  phone: string | null;
  loyaltyTier: string;
  totalOrders: number;
}

const tierColors: Record<string, string> = {
  Bronze: 'bg-amber-100 text-amber-700',
  Silver: 'bg-gray-100 text-gray-700',
  Gold: 'bg-yellow-100 text-yellow-700',
  Platinum: 'bg-cyan-100 text-cyan-700',
};

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/v1/customers');
      // Handle if response is wrapped in a data property or is directly an array
      const customerData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setCustomers(customerData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load customers');
      setCustomers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Loyalty Tier
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Total Orders
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No customers yet. Add your first customer to get started.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {customer.companyName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {customer.phone || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${tierColors[customer.loyaltyTier] || 'bg-gray-100 text-gray-700'}`}>
                        {customer.loyaltyTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right tabular-nums font-medium text-slate-900">
                      {customer.totalOrders || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
