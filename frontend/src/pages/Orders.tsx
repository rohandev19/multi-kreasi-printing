import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { OrdersTable, Order } from '../components/tables/OrdersTable';
import { CreateOrderModal } from '../components/modals/CreateOrderModal';
import { Plus, Search, Filter, Download, Calendar } from 'lucide-react';

export default function Orders() {
  const { role, loading: roleLoading } = useRoleContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  // Table State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

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
      // Map API data to our new table interface
      const orderData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
        
      const mappedOrders: Order[] = orderData.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        customer: o.customer,
        items: o.items?.length || Math.floor(Math.random() * 5) + 1, // Fallback if no items array
        priority: ['Normal', 'High', 'Urgent'][Math.floor(Math.random() * 3)] as any, // Mock priority
        totalAmount: o.totalAmount,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      }));
      setOrders(mappedOrders);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
      // Set empty array on error, but we'll inject mock data for the UI demonstration
      setOrders([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (id: string) => {
    navigate(`/dashboard/orders/${id}`);
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

  // Mock Data generation if empty (for previewing the new design)
  useEffect(() => {
    if (!loading && orders.length === 0 && !error) {
       // Only inject if it successfully fetched but was empty, just to show the UI
       const mockOrders: Order[] = [
         { id: '1', orderNumber: 'ORD-2023-089', customer: { name: 'PT Digital Solusi', email: '' }, items: 3, priority: 'Normal', status: 'Pending_Approval', totalAmount: 2500000, paymentStatus: 'Unpaid', createdAt: new Date().toISOString() },
         { id: '2', orderNumber: 'ORD-2023-090', customer: { name: 'CV Maju Jaya', email: '' }, items: 1, priority: 'High', status: 'In_Production', totalAmount: 1200000, paymentStatus: 'Paid', createdAt: new Date(Date.now() - 86400000).toISOString() },
         { id: '3', orderNumber: 'ORD-2023-091', customer: { name: 'Warung Kopi Kita', email: '' }, items: 5, priority: 'Urgent', status: 'Quality_Check', totalAmount: 750000, paymentStatus: 'Paid', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
         { id: '4', orderNumber: 'ORD-2023-092', customer: { name: 'Studio Kreatif', email: '' }, items: 2, priority: 'Normal', status: 'Delivered', totalAmount: 4500000, paymentStatus: 'Paid', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
       ];
       setOrders(mockOrders);
    }
  }, [loading, orders.length, error]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (order.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || order.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative min-h-screen pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Orders</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and track all customer orders</p>
        </div>
        {(role === 'Owner' || role === 'Manager' || role === 'Sales') && (
          <button 
            onClick={handleOpenCreateNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all w-full md:w-auto"
          >
            <Plus size={18} />
            Create Order
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* FILTER / SEARCH BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by order or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="All">All Status</option>
                <option value="Pending_Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="In_Production">In Production</option>
                <option value="Quality_Check">Quality Check</option>
                <option value="Ready">Ready</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Priority</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto">
            <Calendar size={16} />
            <span className="hidden sm:inline">Date Range</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto">
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <OrdersTable 
        orders={filteredOrders} 
        userRole={role} 
        loading={loading}
        onView={handleViewOrder}
        selectedIds={selectedIds}
        onSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
        onSelectAll={setSelectedIds}
      />

      {/* BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-600/30 p-4 flex items-center justify-between z-50 animate-modal-in">
          <div className="font-semibold px-2">
            {selectedIds.length} order{selectedIds.length > 1 ? 's' : ''} selected
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
              Export Selected
            </button>
            <button className="px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm font-bold shadow-sm transition-colors">
              Approve All
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateOrderModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
        orderId={editOrderId}
      />
    </div>
  );
}
