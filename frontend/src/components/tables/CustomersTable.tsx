import React from 'react';
import { Edit, Eye, Trash2, CreditCard } from 'lucide-react';

interface Customer {
  id: string;
  companyName: string;
  email: string;
  phone: string | null;
  loyaltyTier: string;
  totalOrders: number;
  totalRevenue?: number;
  outstandingBalance?: number;
  paymentHistory?: any[]; // Simplified for now
}

interface CustomersTableProps {
  customers: Customer[];
  userRole: string;
  loading: boolean;
  onViewCustomer: (id: string) => void;
  onEditCustomer?: (id: string) => void;
  onDeleteCustomer?: (id: string) => void;
  onViewPaymentHistory?: (id: string) => void;
}

const tierColors: Record<string, string> = {
  Bronze: 'bg-amber-100 text-amber-700',
  Silver: 'bg-gray-100 text-gray-700',
  Gold: 'bg-yellow-100 text-yellow-700',
  Platinum: 'bg-cyan-100 text-cyan-700',
};

export const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  userRole,
  loading,
  onViewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onViewPaymentHistory,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isFinance = userRole === 'Finance_Staff';
  const canManage = userRole === 'Owner' || userRole === 'Manager';

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-slate-900">{customer.companyName}</div>
                <div className="text-sm text-slate-500">{customer.email}</div>
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${tierColors[customer.loyaltyTier] || 'bg-gray-100 text-gray-700'}`}>
                {customer.loyaltyTier}
              </span>
            </div>
            
            <div className="text-sm text-slate-700">
              <span className="text-slate-500 mr-2">Phone:</span>
              {customer.phone || '-'}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm border-t border-slate-100 pt-2">
              <div>
                <span className="text-slate-500 block text-xs">Total Orders</span>
                <span className="font-medium text-slate-900">{customer.totalOrders || 0}</span>
              </div>
              
              {(isFinance || canManage) && (
                <>
                  <div className="text-right">
                    <span className="text-slate-500 block text-xs">Total Revenue</span>
                    <span className="font-medium text-slate-900">
                      Rp {(customer.totalRevenue || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-between items-center text-xs pt-1 border-t border-slate-50">
                    <span className="text-slate-500">Outstanding Bal.</span>
                    <span className={`font-medium ${(customer.outstandingBalance || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      Rp {(customer.outstandingBalance || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => onViewCustomer(customer.id)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye size={18} />
              </button>
              {(isFinance || canManage) && onViewPaymentHistory && (
                <button
                  onClick={() => onViewPaymentHistory(customer.id)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Payment History"
                >
                  <CreditCard size={18} />
                </button>
              )}
              {canManage && onEditCustomer && (
                <button
                  onClick={() => onEditCustomer(customer.id)}
                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Edit Customer"
                >
                  <Edit size={18} />
                </button>
              )}
              {canManage && onDeleteCustomer && (
                <button
                  onClick={() => onDeleteCustomer(customer.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Customer"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            No customers found.
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hidden md:block">
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
              {(isFinance || canManage) && (
                <>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Outstanding Bal.
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={isFinance || canManage ? 8 : 6} className="px-6 py-12 text-center text-slate-500">
                  No customers found.
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
                  {(isFinance || canManage) && (
                    <>
                      <td className="px-6 py-4 text-sm text-right tabular-nums text-slate-700">
                        Rp {(customer.totalRevenue || 0).toLocaleString('id-ID')}
                      </td>
                      <td className={`px-6 py-4 text-sm text-right tabular-nums font-medium ${(customer.outstandingBalance || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        Rp {(customer.outstandingBalance || 0).toLocaleString('id-ID')}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onViewCustomer(customer.id)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {(isFinance || canManage) && onViewPaymentHistory && (
                      <button
                        onClick={() => onViewPaymentHistory(customer.id)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Payment History"
                      >
                        <CreditCard size={18} />
                      </button>
                    )}
                    {canManage && onEditCustomer && (
                      <button
                        onClick={() => onEditCustomer(customer.id)}
                        className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                        title="Edit Customer"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {canManage && onDeleteCustomer && (
                      <button
                        onClick={() => onDeleteCustomer(customer.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
