import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { OrdersTable } from '../components/tables/OrdersTable';
import { CreateOrderModal } from '../components/modals/CreateOrderModal';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
export default function Orders() {
  const { role, loading: roleLoading } = useRoleContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!roleLoading) {
      if (role === 'Customer') {
        navigate('/my-orders');
      } else if (role) {
        fetchOrders(role);
      }
    }
  }, [role, roleLoading, navigate]);

  const fetchOrders = async (currentRole: string) => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/orders', {
        params: { role: currentRole }
      });
      // Handle if response is wrapped in a data property or is directly an array
      const orderData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setOrders(orderData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (id: string) => {
    setSelectedOrderId(id);
    setIsDetailModalOpen(true);
  };

  const handleEditOrder = (id: string) => {
    setEditOrderId(id);
    setIsCreateModalOpen(true);
  };

  const handleModalSuccess = () => {
    if (role) {
      fetchOrders(role);
    }
  };

  const handleOpenCreateNew = () => {
    setEditOrderId(null);
    setIsCreateModalOpen(true);
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Orders</h2>
        {(role === 'Owner' || role === 'Manager') && (
          <button 
            onClick={handleOpenCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            New Order
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <OrdersTable 
        orders={orders} 
        userRole={role} 
        loading={loading}
        onView={handleViewOrder}
        onEdit={handleEditOrder}
      />

      {/* Modals */}
      <CreateOrderModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
        orderId={editOrderId}
      />

      <OrderDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        orderId={selectedOrderId}
      />
    </div>
  );
}
