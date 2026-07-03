import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { useToast } from '../contexts/ToastContext';
import { OrdersTable } from '../components/tables/OrdersTable';
import type { Order } from '../components/tables/OrdersTable';
import { exportToCSV } from '../utils/exportUtils';
import { CreateOrderModal } from '../components/modals/CreateOrderModal';
import { Plus, Search, Filter, Download, Calendar } from 'lucide-react';

export default function Orders() {
  const { role, loading: roleLoading } = useRoleContext();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  // Table State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!roleLoading) {
      if (role === 'Customer') {
        navigate('/my-orders');
      } else if (role) {
        fetchOrders(role);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, roleLoading, navigate]);

  const fetchOrders = async (currentRole: string) => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/orders', {
        params: { 
          role: currentRole,
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {})
        }
      });
      // Map API data to our new table interface
      const orderData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
        
      const mappedOrders: Order[] = orderData.map((o: unknown) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        customer: o.customer,
        items: o.items?.length || 0,
        priority: o.priority || 'Normal',
        totalAmount: o.totalAmount,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      }));
      setOrders(mappedOrders);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role && !roleLoading) {
      fetchOrders(role);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

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

  const handleExport = (exportOrders: Order[], filename: string) => {
    if (!exportOrders.length) return;
    const data = exportOrders.map(o => ({
      OrderNumber: o.orderNumber,
      Customer: o.customer?.name || 'Unknown',
      Status: o.status,
      Priority: o.priority,
      Items: o.items,
      TotalAmount: o.totalAmount,
      PaymentStatus: o.paymentStatus,
      CreatedAt: o.createdAt
    }));
    exportToCSV(data, filename);
  };

  const handleBulkApprove = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Are you sure you want to approve ${selectedIds.length} orders?`)) return;
    
    setIsApproving(true);
    try {
      await Promise.all(selectedIds.map(id => 
        api.patch(`/api/v1/orders/${id}/status`, { status: 'Approved' })
      ));
      success('Bulk Action Complete', `${selectedIds.length} orders have been approved.`);
      setSelectedIds([]);
      if (role) fetchOrders(role);
    } catch (err: any) {
      showError('Action Failed', 'Failed to bulk approve orders.');
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };



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
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all w-full sm:w-auto"
              title="Start Date"
            />
            <span className="text-slate-400 hidden sm:inline">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all w-full sm:w-auto"
              title="End Date"
            />
          </div>
          <button 
            onClick={() => handleExport(filteredOrders, 'orders_export')}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto"
          >
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
            <button 
              onClick={() => handleExport(filteredOrders.filter(o => selectedIds.includes(o.id)), 'orders_selected_export')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Export Selected
            </button>
            <button 
              onClick={handleBulkApprove}
              disabled={isApproving}
              className="px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {isApproving ? 'Approving...' : 'Approve All'}
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
