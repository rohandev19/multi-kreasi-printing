import React from 'react';
import type { UserRole } from '../../contexts/RoleContext'; // Use type import

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customer?: { name: string; email: string };
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  designFile?: { status: string };
  productionJob?: { status: string };
}

interface OrdersTableProps {
  orders: Order[];
  userRole: UserRole | null;
  loading: boolean;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  userRole,
  loading,
  onView,
  onEdit,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="animate-pulse flex flex-col">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex border-b border-slate-200 p-4 gap-4">
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-4 bg-slate-200 rounded w-32"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
              <div className="h-4 bg-slate-200 rounded w-24 flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        No orders found.
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'Pending_Approval':
        return 'bg-amber-100 text-amber-700';
      case 'Approved':
      case 'Design_Approved':
        return 'bg-blue-100 text-blue-700';
      case 'In_Production':
      case 'Design_In_Progress':
        return 'bg-indigo-100 text-indigo-700';
      case 'Completed':
      case 'Paid':
        return 'bg-emerald-100 text-emerald-700';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  // Determine which columns to show based on role
  const showCustomer = userRole === 'Owner' || userRole === 'Manager' || userRole === 'Finance_Staff';
  const showPayment = userRole === 'Owner' || userRole === 'Finance_Staff' || userRole === 'Manager';
  const showDesignStatus = userRole === 'Owner' || userRole === 'Manager' || userRole === 'Designer';
  const showProductionStatus = userRole === 'Owner' || userRole === 'Manager' || userRole === 'Production_Staff';

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-slate-900">{order.orderNumber}</div>
                <div className="text-xs text-slate-500">{formatDate(order.createdAt)}</div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            
            {showCustomer && order.customer && (
              <div className="text-sm">
                <span className="text-slate-500 mr-2">Customer:</span>
                <span className="font-medium text-slate-900">{order.customer.name}</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 text-sm">
              {showDesignStatus && order.designFile && (
                <div className="bg-slate-50 px-2 py-1 rounded">
                  <span className="text-slate-500 text-xs block">Design</span>
                  <span className={`font-medium ${getStatusColor(order.designFile.status).replace('bg-', 'text-').split(' ')[1]}`}>
                    {order.designFile.status.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
              {showProductionStatus && order.productionJob && (
                <div className="bg-slate-50 px-2 py-1 rounded">
                  <span className="text-slate-500 text-xs block">Production</span>
                  <span className={`font-medium ${getStatusColor(order.productionJob.status).replace('bg-', 'text-').split(' ')[1]}`}>
                    {order.productionJob.status.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
            
            {showPayment && (
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
                <div className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => onView(order.id)}
                className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
              >
                View
              </button>
              {onEdit && (userRole === 'Owner' || userRole === 'Manager') && (
                <button 
                  onClick={() => onEdit(order.id)}
                  className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto hidden md:block">
        <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500 uppercase tracking-wider">
            <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
            <th className="px-6 py-4 whitespace-nowrap">Date</th>
            {showCustomer && <th className="px-6 py-4 whitespace-nowrap">Customer</th>}
            <th className="px-6 py-4 whitespace-nowrap">Order Status</th>
            {showDesignStatus && <th className="px-6 py-4 whitespace-nowrap">Design</th>}
            {showProductionStatus && <th className="px-6 py-4 whitespace-nowrap">Production</th>}
            {showPayment && <th className="px-6 py-4 whitespace-nowrap text-right">Total / Payment</th>}
            <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                {order.orderNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-sm">
                {formatDate(order.createdAt)}
              </td>
              
              {showCustomer && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{order.customer?.name || 'Unknown'}</div>
                  <div className="text-sm text-slate-500">{order.customer?.email || ''}</div>
                </td>
              )}
              
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </td>
              
              {showDesignStatus && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.designFile ? (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.designFile.status)}`}>
                      {order.designFile.status.replace(/_/g, ' ')}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm">-</span>
                  )}
                </td>
              )}
              
              {showProductionStatus && (
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.productionJob ? (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.productionJob.status)}`}>
                      {order.productionJob.status.replace(/_/g, ' ')}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm">-</span>
                  )}
                </td>
              )}
              
              {showPayment && (
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-bold text-slate-900">{formatCurrency(order.totalAmount)}</div>
                  <div className="mt-1 text-xs">
                    <span className={`px-2 py-0.5 font-medium rounded ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </td>
              )}
              
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => onView(order.id)}
                  className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                >
                  View
                </button>
                {onEdit && (userRole === 'Owner' || userRole === 'Manager') && (
                  <button 
                    onClick={() => onEdit(order.id)}
                    className="text-indigo-600 hover:text-indigo-900 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
};
