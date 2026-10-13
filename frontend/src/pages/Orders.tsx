import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { useToast } from '../contexts/ToastContext';
import { OrdersTable } from '../components/tables/OrdersTable';
import type { Order } from '../components/tables/OrdersTable';
import { exportToCSV } from '../utils/exportUtils';
import { CreateOrderModal } from '../components/modals/CreateOrderModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { Plus, MagnifyingGlass, Funnel, Download } from '@phosphor-icons/react';

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

  // Action Modals State
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [approveTargetOrder, setApproveTargetOrder] = useState<Order | null>(null);
  const [rejectTargetOrder, setRejectTargetOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [startProdTargetOrder, setStartProdTargetOrder] = useState<Order | null>(null);
  const [isStartingProd, setIsStartingProd] = useState(false);

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
        
      const mappedOrders: Order[] = orderData.map((o: any) => ({
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
      setError(err.response?.data?.message || 'Gagal memuat data pesanan');
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
      NoPesanan: o.orderNumber,
      Pelanggan: o.customer?.name || 'Tidak Diketahui',
      Status: o.status,
      Prioritas: o.priority,
      Item: o.items,
      TotalTagihan: o.totalAmount,
      StatusPembayaran: o.paymentStatus,
      TanggalDibuat: o.createdAt
    }));
    exportToCSV(data, filename);
  };

  const ordersToApprove = orders.filter(
    o => selectedIds.includes(o.id) && ['Pending', 'Pending_Approval', 'Draft'].includes(o.status)
  );

  const handleOpenBulkApprove = () => {
    if (!selectedIds.length) return;
    if (!ordersToApprove.length) {
      success('Sudah Disetujui', 'Seluruh pesanan yang dipilih sudah berstatus disetujui.');
      return;
    }
    setIsBulkConfirmOpen(true);
  };

  const handleConfirmBulkApprove = async () => {
    setIsApproving(true);
    try {
      await Promise.all(ordersToApprove.map(async (order) => {
        try {
          return await api.post(`/api/v1/orders/${order.id}/approve`);
        } catch {
          return await api.patch(`/api/v1/orders/${order.id}/status`, { status: 'Approved' });
        }
      }));
      success('Tindakan Massal Selesai', `${ordersToApprove.length} pesanan berhasil disetujui.`);
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      if (role) fetchOrders(role);
    } catch (err: any) {
      showError('Tindakan Gagal', err.response?.data?.message || 'Gagal menyetujui pesanan secara massal.');
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleApproveOrder = (id: string) => {
    const targetOrder = orders.find(o => o.id === id);
    if (targetOrder?.status === 'Approved') {
      success('Sudah Disetujui', 'Pesanan ini sudah berstatus disetujui.');
      return;
    }
    if (targetOrder) {
      setApproveTargetOrder(targetOrder);
    }
  };

  const handleConfirmApproveOrder = async () => {
    if (!approveTargetOrder) return;
    setIsApproving(true);
    try {
      try {
        await api.post(`/api/v1/orders/${approveTargetOrder.id}/approve`);
      } catch {
        await api.patch(`/api/v1/orders/${approveTargetOrder.id}/status`, { status: 'Approved' });
      }
      success('Pesanan Disetujui', `Pesanan ${approveTargetOrder.orderNumber} berhasil disetujui.`);
      setApproveTargetOrder(null);
      if (role) fetchOrders(role);
    } catch (err: any) {
      showError('Persetujuan Gagal', err.response?.data?.message || 'Gagal menyetujui pesanan.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectOrder = (id: string) => {
    const target = orders.find(o => o.id === id);
    if (target) {
      setRejectTargetOrder(target);
      setRejectReason('');
    }
  };

  const handleConfirmRejectOrder = async () => {
    if (!rejectTargetOrder || !rejectReason.trim()) return;
    setIsRejecting(true);
    try {
      await api.post(`/api/v1/orders/${rejectTargetOrder.id}/reject`, { reason: rejectReason.trim() });
      success('Pesanan Ditolak', `Pesanan ${rejectTargetOrder.orderNumber} telah ditolak.`);
      setRejectTargetOrder(null);
      setRejectReason('');
      if (role) fetchOrders(role);
    } catch (err: any) {
      showError('Gagal Menolak', err.response?.data?.message || 'Gagal menolak pesanan.');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleStartProduction = (id: string) => {
    const target = orders.find(o => o.id === id);
    if (target) {
      setStartProdTargetOrder(target);
    }
  };

  const handleConfirmStartProduction = async () => {
    if (!startProdTargetOrder) return;
    setIsStartingProd(true);
    try {
      await api.patch(`/api/v1/orders/${startProdTargetOrder.id}/status`, { status: 'In_Production' });
      success('Produksi Dimulai', `Status pesanan ${startProdTargetOrder.orderNumber} diubah ke Dalam Produksi.`);
      setStartProdTargetOrder(null);
      if (role) fetchOrders(role);
    } catch (err: any) {
      showError('Gagal Memulai Produksi', err.response?.data?.message || 'Gagal mengubah status pesanan ke Dalam Produksi.');
    } finally {
      setIsStartingProd(false);
    }
  };

  const handleCancelOrder = (id: string) => {
    const target = orders.find(o => o.id === id);
    if (target) {
      setCancelTargetOrder(target);
      setCancelReason('');
    }
  };

  const handleConfirmCancelOrder = async () => {
    if (!cancelTargetOrder || !cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      await api.post(`/api/v1/orders/${cancelTargetOrder.id}/cancel`, { reason: cancelReason.trim() });
      success('Pesanan Dibatalkan', `Pesanan ${cancelTargetOrder.orderNumber} berhasil dibatalkan.`);
      setCancelTargetOrder(null);
      setCancelReason('');
      if (role) fetchOrders(role);
    } catch (err: any) {
      showError('Gagal Membatalkan', err.response?.data?.message || 'Gagal membatalkan pesanan.');
    } finally {
      setIsCancelling(false);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative min-h-screen pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pesanan</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola dan pantau seluruh pesanan pelanggan</p>
        </div>
        {(role === 'Owner' || role === 'Manager' || role === 'Sales') && (
          <button 
            onClick={handleOpenCreateNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-bold shadow-sm hover:bg-slate-800 hover:-translate-y-0.5 transition-all w-full md:w-auto"
          >
            <Plus size={18} weight="regular" />
            Buat Pesanan
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
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" weight="regular" />
            <input 
              type="text" 
              placeholder="Cari nomor pesanan atau pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Funnel className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" weight="regular" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="All">Semua Status</option>
                <option value="Pending_Approval">Menunggu Persetujuan</option>
                <option value="Approved">Disetujui</option>
                <option value="In_Production">Dalam Produksi</option>
                <option value="Quality_Check">Pemeriksaan Kualitas</option>
                <option value="Ready">Siap</option>
                <option value="Shipped">Dikirim</option>
                <option value="Delivered">Terkirim</option>
                <option value="Cancelled">Dibatalkan</option>
              </select>
            </div>
            
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="All">Semua Prioritas</option>
              <option value="Normal">Normal</option>
              <option value="High">Tinggi</option>
              <option value="Urgent">Kilat</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-all w-full sm:w-auto"
              title="Tanggal Mulai"
            />
            <span className="text-slate-400 hidden sm:inline">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-50 focus:bg-white transition-all w-full sm:w-auto"
              title="Tanggal Selesai"
            />
          </div>
          <button 
            onClick={() => handleExport(filteredOrders, 'ekspor_pesanan')}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto"
          >
            <Download size={16} weight="regular" />
            <span className="hidden sm:inline">Ekspor CSV</span>
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
        onApprove={handleApproveOrder}
        onReject={handleRejectOrder}
        onStartProduction={handleStartProduction}
        onCancel={handleCancelOrder}
      />

      {/* BULK ACTIONS BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-black text-white rounded-xl shadow-xl p-4 flex items-center justify-between z-50 animate-modal-in">
          <div className="font-semibold px-2">
            {selectedIds.length} pesanan dipilih
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleExport(filteredOrders.filter(o => selectedIds.includes(o.id)), 'ekspor_pesanan_terpilih')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Ekspor Pilihan
            </button>
            <button 
              onClick={handleOpenBulkApprove}
              disabled={isApproving}
              className="px-4 py-2 bg-white text-primary-700 hover:bg-primary-50 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {isApproving ? 'Menyetujui...' : 'Setujui Semua'}
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

      {/* BULK APPROVE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleConfirmBulkApprove}
        title="Setujui Pesanan Terpilih"
        message={`Apakah Anda yakin ingin menyetujui ${ordersToApprove.length} pesanan terpilih? Status akan diperbarui menjadi Disetujui.`}
        confirmLabel="Ya, Setujui Semua"
        cancelLabel="Batal"
        variant="success"
        loading={isApproving}
      />

      {/* SINGLE APPROVE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={!!approveTargetOrder}
        onClose={() => setApproveTargetOrder(null)}
        onConfirm={handleConfirmApproveOrder}
        title="Setujui Pesanan"
        message={`Apakah Anda yakin ingin menyetujui pesanan ${approveTargetOrder?.orderNumber}? Status akan diperbarui menjadi Disetujui.`}
        confirmLabel="Ya, Setujui"
        cancelLabel="Batal"
        variant="success"
        loading={isApproving}
      />

      {/* START PRODUCTION CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={!!startProdTargetOrder}
        onClose={() => setStartProdTargetOrder(null)}
        onConfirm={handleConfirmStartProduction}
        title="Mulai Produksi"
        message={`Mulai proses produksi untuk pesanan ${startProdTargetOrder?.orderNumber}? Status pesanan akan diubah menjadi Dalam Produksi.`}
        confirmLabel="Mulai Produksi"
        cancelLabel="Batal"
        variant="info"
        loading={isStartingProd}
      />

      {/* REJECT ORDER MODAL */}
      <Modal
        isOpen={!!rejectTargetOrder}
        onClose={() => {
          setRejectTargetOrder(null);
          setRejectReason('');
        }}
        title={`Tolak Pesanan ${rejectTargetOrder?.orderNumber || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Silakan masukkan alasan penolakan untuk pesanan ini.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Berkas desain tidak sesuai spesifikasi / kuota bahan baku habis..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setRejectTargetOrder(null);
                setRejectReason('');
              }}
              disabled={isRejecting}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmRejectOrder}
              disabled={isRejecting || !rejectReason.trim()}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isRejecting ? 'Menolak...' : 'Tolak Pesanan'}
            </button>
          </div>
        </div>
      </Modal>

      {/* CANCEL ORDER MODAL */}
      <Modal
        isOpen={!!cancelTargetOrder}
        onClose={() => {
          setCancelTargetOrder(null);
          setCancelReason('');
        }}
        title={`Batalkan Pesanan ${cancelTargetOrder?.orderNumber || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Apakah Anda yakin ingin membatalkan pesanan ini? Masukkan alasan pembatalan resmi.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Alasan Pembatalan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Contoh: Permintaan pembatalan dari pelanggan..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCancelTargetOrder(null);
                setCancelReason('');
              }}
              disabled={isCancelling}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleConfirmCancelOrder}
              disabled={isCancelling || !cancelReason.trim()}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isCancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
