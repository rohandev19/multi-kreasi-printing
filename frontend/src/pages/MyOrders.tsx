import { useEffect, useState } from 'react';
import api from '../api/axios';
import { ShoppingBag, Eye, FileText } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  estimatedDeliveryDate: string | null;
  createdAt: string;
  items: Array<{
    product: { name: string };
    quantity: number;
  }>;
}

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Pending_Approval: 'bg-amber-100 text-amber-700',
  Approved: 'bg-blue-100 text-blue-700',
  In_Production: 'bg-purple-100 text-purple-700',
  Quality_Check: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const response = await api.get('/api/v1/orders/my-orders');
      const orderData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setOrders(orderData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load your orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
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
        <h2 className="text-2xl font-bold text-slate-800">My Orders</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <ShoppingBag size={18} />
          New Order
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <ShoppingBag size={64} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No orders yet</h3>
          <p className="text-slate-500 mb-6">Create your first order to get started with MK Printing</p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Create Order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{order.orderNumber}</h3>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Ordered on {new Date(order.createdAt).toLocaleDateString('id-ID', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  {order.estimatedDeliveryDate && (
                    <p className="text-sm text-slate-600 mt-1">
                      Estimated delivery: {new Date(order.estimatedDeliveryDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Order Items</p>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <p key={idx} className="text-sm text-slate-700">
                        {item.quantity}x {item.product.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <Eye size={16} />
                  View Details
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <FileText size={16} />
                  View Invoice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
