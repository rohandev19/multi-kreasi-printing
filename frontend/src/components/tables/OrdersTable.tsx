import React, { useState } from 'react';
import type { UserRole } from '../../contexts/RoleContext';
import { Eye, MoreVertical, Package, ChevronLeft, ChevronRight, Check, X, Printer, Banknote } from 'lucide-react';

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customer?: { name: string; email: string };
  items: number;
  priority: 'Normal' | 'High' | 'Urgent';
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

interface OrdersTableProps {
  orders: Order[];
  userRole: UserRole | null;
  loading: boolean;
  onView: (id: string) => void;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  userRole,
  loading,
  onView,
  selectedIds,
  onSelect,
  onSelectAll,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="animate-pulse flex flex-col">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex border-b border-slate-100 p-4 gap-4 items-center">
              <div className="h-4 w-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-24"></div>
              <div className="h-4 bg-slate-200 rounded w-32 flex-1"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
              <div className="h-6 bg-slate-200 rounded-full w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No orders found</h3>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          Create your first order or adjust your filters to see results.
        </p>
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
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending_Approval': return 'bg-amber-100 text-amber-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'In_Production': return 'bg-indigo-100 text-indigo-700';
      case 'Quality_Check': return 'bg-purple-100 text-purple-700';
      case 'Ready': return 'bg-teal-100 text-teal-700';
      case 'Shipped': return 'bg-emerald-100 text-emerald-700';
      case 'Delivered': return 'bg-slate-800 text-white';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-amber-100 text-amber-700 font-bold';
      case 'Urgent': return 'bg-red-100 text-red-700 font-bold animate-pulse';
      default: return 'bg-slate-100 text-slate-600 font-medium';
    }
  };

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;

  const toggleAll = () => {
    if (isAllSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(orders.map(o => o.id));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold">
            <tr>
              <th className="px-5 py-4 w-12">
                <input 
                  type="checkbox" 
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  checked={isAllSelected}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-5 py-4">Order #</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Items</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Total (IDR)</th>
              <th className="px-5 py-4">Created Date</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const isSelected = selectedIds.includes(order.id);
              return (
                <tr key={order.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-5 py-4">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      checked={isSelected}
                      onChange={() => onSelect(order.id)}
                    />
                  </td>
                  <td className="px-5 py-4 font-medium text-indigo-600 cursor-pointer" onClick={() => onView(order.id)}>
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {order.customer?.name || 'Walk-in Customer'}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {order.items} {order.items === 1 ? 'item' : 'items'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-md ${getPriorityStyle(order.priority)}`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${getStatusColor(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-700 text-right">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onView(order.id)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                          className={`p-1.5 rounded-lg transition-colors ${openDropdown === order.id ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {openDropdown === order.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)}></div>
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 animate-fade-in">
                              {(userRole === 'Owner' || userRole === 'Manager') && (
                                <>
                                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <Check size={14} className="text-emerald-600" /> Approve Order
                                  </button>
                                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <X size={14} className="text-red-600" /> Reject Order
                                  </button>
                                </>
                              )}
                              {(userRole === 'Production_Staff' || userRole === 'Owner') && (
                                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <Printer size={14} className="text-indigo-600" /> Start Production
                                </button>
                              )}
                              {(userRole === 'Finance_Staff' || userRole === 'Owner') && (
                                <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                  <Banknote size={14} className="text-emerald-600" /> Record Payment
                                </button>
                              )}
                              {(userRole === 'Owner' || userRole === 'Manager') && (
                                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <X size={14} /> Cancel Order
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <span className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">1</span> to <span className="font-medium text-slate-900">{orders.length}</span> of <span className="font-medium text-slate-900">{orders.length}</span> results</span>
        <div className="flex gap-1">
          <button className="p-1 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors" disabled>
            <ChevronLeft size={20} />
          </button>
          <button className="w-8 h-8 rounded-md bg-indigo-600 text-white font-medium text-sm flex items-center justify-center">1</button>
          <button className="p-1 rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
