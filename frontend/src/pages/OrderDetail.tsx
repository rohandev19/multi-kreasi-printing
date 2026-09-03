// @ts-nocheck
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Package, CreditCard, FileText } from '@phosphor-icons/react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { role } = useRoleContext();

  const fetchOrderDetails = useCallback(async () => {
    try {
      // Use the generic orders endpoint for now and find the order
      // In a real app this would be a specific GET /api/v1/orders/:id
      const response = await api.get('/api/v1/orders', { params: { role } });
      const ordersData = Array.isArray(response.data) ? response.data : response.data.data || [];
      const foundOrder = ordersData.find((o: any) => o.id === id);
      setOrder(foundOrder || null);
    } catch (err: any) {
      console.error('Failed to load order details', err);
    } finally {
      setLoading(false);
    }
  }, [id, role]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Approved': return 'bg-primary-100 text-primary-700';
      case 'In_Production': return 'bg-primary-100 text-primary-700';
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(dateStr));
  };

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-8"></div>
        <div className="h-10 w-64 bg-slate-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="col-span-2 h-96 bg-slate-200 rounded-xl"></div>
          <div className="h-96 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Order not found</h2>
        <Link to="/dashboard/orders" className="text-primary-600 hover:underline mt-4 inline-block">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/orders" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <ArrowLeft size={20} weight="regular" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            {order.orderNumber}
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
              {order.status.replace(/_/g, ' ')}
            </span>
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline / Progress */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="text-slate-400" size={20} weight="regular" /> Order Progress
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
              <div className="space-y-6 relative">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 z-10 border-4 border-white text-emerald-600">
                    <CheckCircle size={16} weight="regular" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Order Placed</h4>
                    <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${['Approved', 'In_Production', 'Completed'].includes(order.status) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <CheckCircle size={16} weight="regular" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${['Approved', 'In_Production', 'Completed'].includes(order.status) ? 'text-slate-900' : 'text-slate-500'}`}>Order Approved</h4>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${['In_Production', 'Completed'].includes(order.status) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <CheckCircle size={16} weight="regular" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${['In_Production', 'Completed'].includes(order.status) ? 'text-slate-900' : 'text-slate-500'}`}>In Production</h4>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${['Completed'].includes(order.status) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <CheckCircle size={16} weight="regular" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${['Completed'].includes(order.status) ? 'text-slate-900' : 'text-slate-500'}`}>Completed & Delivered</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="text-slate-400" size={20} weight="regular" /> Order Items
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item: { id: string; product: { name: string }; quantity: number; unitPrice: number; notes: string }) => (
                <div key={item.id} className="p-6 flex items-start gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-400">
                    <Package size={24} weight="regular" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{item.product?.name || 'Custom Product'}</h4>
                    <p className="text-sm text-slate-500 mt-1">{(item as any).specifications ? JSON.stringify((item as any).specifications) : 'Standard spec'}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm font-medium text-slate-600">Qty: {item.quantity}</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!order.items || order.items.length === 0) && (
                <div className="p-6 text-center text-slate-500 font-medium">No items detailed in this order.</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Customer Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">Name</p>
                <p className="font-bold text-slate-900">{order.customer?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">Email</p>
                <p className="font-medium text-slate-900">{order.customer?.email || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">Phone</p>
                <p className="font-medium text-slate-900">{order.customer?.phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard size={16} weight="regular" /> Payment Summary
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax</span>
                <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(0)}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-black text-primary-600 tabular-nums text-lg">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl flex justify-between items-center ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
              <span className="text-sm font-bold">Status</span>
              <span className="font-bold uppercase tracking-wide text-xs">{order.paymentStatus}</span>
            </div>
          </div>
          
          {/* Connected Documents */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={16} weight="regular" /> Connected Documents
            </h3>
            <div className="space-y-3">
              <Link to="/dashboard/design" className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary-600">Design File</span>
                <ArrowLeft size={16} className="rotate-135 text-slate-400" weight="regular" />
              </Link>
              <Link to="/dashboard/invoices" className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary-600">Invoice</span>
                <ArrowLeft size={16} className="rotate-135 text-slate-400" weight="regular" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
