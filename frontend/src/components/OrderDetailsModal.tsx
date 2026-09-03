import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Package, Clock, CheckCircle, FileText } from '@phosphor-icons/react';

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  estimatedDeliveryDate: string | null;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: { name: string; description?: string };
  }>;
  designFiles?: Array<{
    status: string;
    fileUrl: string;
  }>;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  orderId: string | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Pending_Approval: 'bg-amber-100 text-amber-700',
  Approved: 'bg-blue-100 text-blue-700',
  In_Production: 'bg-primary-100 text-primary-700',
  Quality_Check: 'bg-primary-100 text-primary-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  orderId,
  onClose,
}) => {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/api/v1/orders/${orderId}`);
        setOrder(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && orderId) {
      fetchOrderDetails();
    } else {
      setOrder(null);
      setError('');
    }
  }, [isOpen, orderId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden my-8 flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0">
          <h2 className="text-xl font-bold text-slate-800">Order Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200"
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
              {error}
            </div>
          ) : order ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{order.orderNumber}</h3>
                  <p className="text-slate-500">
                    Placed on {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex flex-col gap-2 md:items-end">
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    Payment: {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Clock size={18} weight="regular" />
                  Order Status Tracking
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5"><CheckCircle size={16} className="text-emerald-500" weight="regular" /></div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Order Placed</p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {order.designFiles && order.designFiles.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <CheckCircle size={16} className={order.designFiles[0].status === 'Design_Approved' ? 'text-emerald-500' : 'text-blue-500'} weight="regular" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Design: {order.designFiles[0].status.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Package size={18} weight="regular" />
                  Order Items
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase text-center">Qty</th>
                        <th className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase text-right">Price</th>
                        <th className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800">{item.product?.name}</p>
                            {item.product?.description && (
                              <p className="text-xs text-slate-500 line-clamp-1">{item.product.description}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-medium text-slate-900 tabular-nums">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-800">Total Amount</td>
                        <td className="px-4 py-3 text-right font-bold text-blue-600 text-lg tabular-nums">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">Order not found</div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          {order && order.paymentStatus === 'Paid' && (
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
              <FileText size={16} weight="regular" />
              Download Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
