// @ts-nocheck
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  CreditCard,
  FileText,
  Eye,
  Plus,
  ShieldCheck,
  XCircle,
  WarningCircle,
  Truck,
  Printer,
  UserCheck,
  MapPin,
} from '@phosphor-icons/react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { useToast } from '../contexts/ToastContext';
import { ProofReviewModal, type ProofItem } from '../components/modals/ProofReviewModal';
import { CreateProofModal } from '../components/modals/CreateProofModal';
import { CreateShipmentModal } from '../components/modals/CreateShipmentModal';
import { SuratJalanModal } from '../components/modals/SuratJalanModal';
import { ConfirmDeliveryModal } from '../components/modals/ConfirmDeliveryModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { role } = useRoleContext();
  const { success, error: toastError } = useToast();

  const [selectedProof, setSelectedProof] = useState<ProofItem | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Multi-delivery & Partial dispatch states
  const [dispatchData, setDispatchData] = useState<any>(null);
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false);
  const [selectedSuratJalanId, setSelectedSuratJalanId] = useState<string | null>(null);
  const [confirmDeliveryShipment, setConfirmDeliveryShipment] = useState<{ id: string; shipmentNumber: string } | null>(null);
  const [updatingShipmentStatusId, setUpdatingShipmentStatusId] = useState<string | null>(null);
  const [isApprovingOrder, setIsApprovingOrder] = useState(false);
  const [isConfirmApproveOpen, setIsConfirmApproveOpen] = useState(false);

  const handleConfirmApproveCurrentOrder = async () => {
    setIsApprovingOrder(true);
    try {
      try {
        await api.post(`/api/v1/orders/${order.id}/approve`);
      } catch {
        await api.patch(`/api/v1/orders/${order.id}/status`, { status: 'Approved' });
      }
      success('Pesanan Disetujui', `Pesanan ${order.orderNumber} berhasil disetujui.`);
      setIsConfirmApproveOpen(false);
      fetchOrderDetails();
    } catch (err: any) {
      toastError('Gagal Menyetujui', err.response?.data?.message || 'Terjadi kesalahan saat menyetujui pesanan.');
    } finally {
      setIsApprovingOrder(false);
    }
  };

  const fetchOrderDetails = useCallback(async () => {
    try {
      try {
        const response = await api.get(`/api/v1/orders/${id}`);
        setOrder(response.data);
      } catch {
        const response = await api.get('/api/v1/orders', { params: { role } });
        const ordersData = Array.isArray(response.data) ? response.data : response.data.data || [];
        const foundOrder = ordersData.find((o: any) => o.id === id);
        setOrder(foundOrder || null);
      }

      // Fetch dispatch & shipment data
      try {
        const shipRes = await api.get(`/api/v1/orders/${id}/shipments`);
        setDispatchData(shipRes.data);
      } catch (shipErr) {
        console.warn('No shipment data yet or not found', shipErr);
      }
    } catch (err: any) {
      console.error('Failed to load order details', err);
    } finally {
      setLoading(false);
    }
  }, [id, role]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleUpdateShipmentStatus = async (shipmentId: string, newStatus: string) => {
    setUpdatingShipmentStatusId(shipmentId);
    try {
      await api.patch(`/api/v1/shipments/${shipmentId}/status`, { status: newStatus });
      success('Status Pengiriman Diperbarui', `Surat jalan berhasil diubah ke ${newStatus}.`);
      fetchOrderDetails();
    } catch (err: any) {
      toastError('Gagal Memperbarui', err.response?.data?.message || 'Gagal mengubah status pengiriman.');
    } finally {
      setUpdatingShipmentStatusId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Proof_Pending_Approval': return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'Proof_Approved': return 'bg-emerald-100 text-emerald-800';
      case 'Proof_Rejected': return 'bg-red-100 text-red-800';
      case 'Approved': return 'bg-primary-100 text-primary-700';
      case 'In_Production': return 'bg-cyan-100 text-cyan-800';
      case 'Quality_Check': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Completed': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Ready': return 'bg-teal-100 text-teal-800';
      case 'Partially_Shipped': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'Shipped': return 'bg-sky-100 text-sky-800 border border-sky-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-700';
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
        <h2 className="text-2xl font-bold text-slate-800">Pesanan tidak ditemukan</h2>
        <Link to="/dashboard/orders" className="text-primary-600 hover:underline mt-4 inline-block">Kembali ke Pesanan</Link>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      Pending: 'Menunggu',
      Pending_Approval: 'Menunggu Persetujuan Order',
      Proof_Pending_Approval: 'Menunggu ACC Bukti Cetak',
      Proof_Approved: 'Bukti Cetak Disetujui (ACC)',
      Proof_Rejected: 'Revisi Bukti Cetak Diminta',
      Approved: 'Disetujui',
      In_Production: 'Dalam Produksi',
      Quality_Check: 'Pemeriksaan Kualitas (QC)',
      Completed: 'Selesai Diproduksi',
      Ready: 'Siap Kirim',
      Partially_Shipped: 'Terkirim Sebagian (Partial)',
      Shipped: 'Telah Dikirim (In Transit)',
      Delivered: 'Selesai Diterima (Delivered)',
      Cancelled: 'Dibatalkan',
    };
    return map[status] || status.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/orders" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft size={20} weight="regular" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              {order.orderNumber}
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Dibuat pada {formatDate(order.createdAt)}</p>
          </div>
        </div>

        {['Owner', 'Manager'].includes(role) && ['Pending', 'Pending_Approval', 'Draft'].includes(order.status) && (
          <button
            onClick={() => setIsConfirmApproveOpen(true)}
            disabled={isApprovingOrder}
            className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 self-start sm:self-auto"
          >
            <CheckCircle size={18} weight="bold" />
            {isApprovingOrder ? 'Memproses...' : 'Setujui Pesanan'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline / Progress */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="text-slate-400" size={20} weight="regular" /> Progres Pesanan
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
              <div className="space-y-6 relative">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 z-10 border-4 border-white text-emerald-600">
                    <CheckCircle size={16} weight="regular" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Pesanan Dibuat</h4>
                    <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${['Approved', 'Proof_Pending_Approval', 'Proof_Approved', 'In_Production', 'Quality_Check', 'Completed', 'Ready', 'Partially_Shipped', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <CheckCircle size={16} weight="regular" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${['Approved', 'Proof_Pending_Approval', 'Proof_Approved', 'In_Production', 'Quality_Check', 'Completed', 'Ready', 'Partially_Shipped', 'Shipped', 'Delivered'].includes(order.status) ? 'text-slate-900' : 'text-slate-500'}`}>Pesanan Disetujui</h4>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${['Proof_Approved', 'In_Production', 'Quality_Check', 'Completed', 'Ready', 'Partially_Shipped', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <CheckCircle size={16} weight="regular" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${['Proof_Approved', 'In_Production', 'Quality_Check', 'Completed', 'Ready', 'Partially_Shipped', 'Shipped', 'Delivered'].includes(order.status) ? 'text-slate-900' : 'text-slate-500'}`}>Bukti Cetak Disetujui (ACC Proof)</h4>
                    {order.status === 'Proof_Pending_Approval' && (
                      <p className="text-xs text-amber-700 font-semibold mt-0.5">Menunggu konfirmasi klien</p>
                    )}
                    {order.status === 'Proof_Rejected' && (
                      <p className="text-xs text-red-600 font-semibold mt-0.5">Revisi diminta oleh klien</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${['In_Production', 'Quality_Check', 'Completed', 'Ready', 'Partially_Shipped', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <CheckCircle size={16} weight="regular" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${['In_Production', 'Quality_Check', 'Completed', 'Ready', 'Partially_Shipped', 'Shipped', 'Delivered'].includes(order.status) ? 'text-slate-900' : 'text-slate-500'}`}>Dalam Produksi & QC</h4>
                    {order.status === 'Quality_Check' && (
                      <p className="text-xs text-purple-700 font-semibold mt-0.5">Sedang dalam pemeriksaan mutu (Quality Check)</p>
                    )}
                    {order.status === 'Completed' && (
                      <p className="text-xs text-blue-700 font-semibold mt-0.5">Produksi selesai & lolos QC</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${['Partially_Shipped', 'Shipped', 'Delivered'].includes(order.status) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <CheckCircle size={16} weight="regular" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${['Partially_Shipped', 'Shipped', 'Delivered'].includes(order.status) ? 'text-slate-900' : 'text-slate-500'}`}>Pengiriman & Serah Terima</h4>
                    {order.status === 'Partially_Shipped' && (
                      <p className="text-xs text-indigo-700 font-semibold mt-0.5">Dikirim sebagian</p>
                    )}
                    {order.status === 'Shipped' && (
                      <p className="text-xs text-blue-700 font-semibold mt-0.5">Dalam pengiriman (In Transit)</p>
                    )}
                    {order.status === 'Delivered' && (
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5">Seluruh barang telah diterima (POD)</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Proofing Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="text-primary-600" size={22} weight="bold" /> Bukti Cetak Digital (Digital Proofs)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Kontrol persetujuan pracetak resmi B2B & penguncian lini mesin produksi (Production Lock).
                </p>
              </div>
              {['Admin', 'Designer', 'Sales'].includes(role) && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  <Plus size={14} weight="bold" />
                  Terbitkan Proof Baru
                </button>
              )}
            </div>

            {order.proofs && order.proofs.length > 0 ? (
              <div className="space-y-3">
                {order.proofs.map((proof: any) => {
                  const isProofPending = proof.status === 'Pending_Approval';
                  const isProofApproved = proof.status === 'Approved';
                  const isProofRejected = proof.status === 'Rejected';

                  return (
                    <div
                      key={proof.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isProofApproved
                              ? 'bg-emerald-100 text-emerald-700'
                              : isProofRejected
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {isProofApproved ? (
                            <ShieldCheck size={22} weight="fill" />
                          ) : isProofRejected ? (
                            <XCircle size={22} weight="fill" />
                          ) : (
                            <WarningCircle size={22} weight="fill" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">Proof Versi {proof.version}</span>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                isProofApproved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isProofRejected
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isProofApproved
                                ? 'ACC Cetak (Disetujui)'
                                : isProofRejected
                                ? 'Revisi Diminta'
                                : 'Menunggu ACC'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{proof.notes || 'Proof kalibrasi siap diperiksa.'}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Diterbitkan: {formatDate(proof.createdAt)}
                            {proof.approvedAt && ` • Disetujui: ${formatDate(proof.approvedAt)}`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedProof(proof);
                          setIsReviewOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs"
                      >
                        <Eye size={14} weight="bold" />
                        Tinjau & Validasi Proof
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                <FileText size={32} className="mx-auto text-slate-400 mb-2" weight="regular" />
                <p className="text-xs font-semibold text-slate-700">Belum ada bukti cetak digital yang diterbitkan</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tim desainer pracetak dapat menerbitkan bukti cetak digital sebelum jadwal produksi dimulai.
                </p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="text-slate-400" size={20} weight="regular" /> Item Pesanan
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item: { id: string; product: { name: string }; quantity: number; unitPrice: number; notes: string }) => (
                <div key={item.id} className="p-6 flex items-start gap-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-400">
                    <Package size={24} weight="regular" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{item.product?.name || 'Produk Kustom'}</h4>
                    <p className="text-sm text-slate-500 mt-1">{(item as any).specifications ? JSON.stringify((item as any).specifications) : 'Spesifikasi standar'}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm font-medium text-slate-600">Jumlah: {item.quantity}</span>
                      <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!order.items || order.items.length === 0) && (
                <div className="p-6 text-center text-slate-500 font-medium">Tidak ada rincian item dalam pesanan ini.</div>
              )}
            </div>
          </div>

          {/* Multi-Delivery & Partial Dispatch Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="text-primary-600" size={22} weight="bold" /> Pengiriman & Surat Jalan (Delivery Orders)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Penerbitan surat jalan bertahap (partial dispatch), cetak dokumen fisik, dan konfirmasi serah terima klien (POD).
                </p>
              </div>
              {['Admin', 'Manager', 'Production', 'Warehouse', 'Sales', 'Owner'].includes(role) && order.status !== 'Cancelled' && (
                <button
                  onClick={() => setIsCreateShipmentOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  <Plus size={14} weight="bold" />
                  Buat Surat Jalan
                </button>
              )}
            </div>

            {/* Fulfillment Progress Bar */}
            {dispatchData?.fulfillment && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    Progres Pemenuhan Pengiriman:
                    <span className="text-primary-700 font-extrabold">{dispatchData.fulfillment.percentage}%</span>
                  </span>
                  <span className="text-slate-500">
                    {dispatchData.fulfillment.totalShipped.toLocaleString('id-ID')} / {dispatchData.fulfillment.totalOrdered.toLocaleString('id-ID')} unit terkirim
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      dispatchData.fulfillment.isFullyFulfilled
                        ? 'bg-emerald-500'
                        : 'bg-primary-600'
                    }`}
                    style={{ width: `${Math.min(dispatchData.fulfillment.percentage, 100)}%` }}
                  />
                </div>
                {dispatchData.fulfillment.isFullyFulfilled && (
                  <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle size={14} weight="bold" /> Seluruh kuantitas pesanan (100%) telah diproses pengirimannya.
                  </p>
                )}
              </div>
            )}

            {/* Shipment Items List */}
            {dispatchData?.shipments && dispatchData.shipments.length > 0 ? (
              <div className="space-y-3.5">
                {dispatchData.shipments.map((shipment: any) => {
                  const isDelivered = shipment.status === 'Delivered';
                  const isInTransit = shipment.status === 'In_Transit';
                  const isPreparing = shipment.status === 'Preparing';

                  const badgeStyles = isDelivered
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : isInTransit
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300';

                  const badgeLabel = isDelivered
                    ? 'Diterima (POD Verified)'
                    : isInTransit
                    ? 'Dalam Pengiriman'
                    : 'Menyiapkan Pengiriman';

                  return (
                    <div
                      key={shipment.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                            {shipment.shipmentNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeStyles}`}>
                            {badgeLabel}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Diterbitkan: {formatDate(shipment.createdAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <p className="text-slate-500 flex items-center gap-1 font-medium">
                            <UserCheck size={14} className="text-slate-400" /> Penerima:
                            <strong className="text-slate-800 ml-1">{shipment.recipientName}</strong>
                            {shipment.recipientPhone && <span className="text-slate-500">({shipment.recipientPhone})</span>}
                          </p>
                          <p className="text-slate-500 flex items-start gap-1 font-medium">
                            <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <span className="text-slate-700">{shipment.deliveryAddress}</span>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-500 flex items-center gap-1 font-medium">
                            <Truck size={14} className="text-slate-400" /> Ekspedisi/Armada:
                            <span className="text-slate-800 font-semibold ml-1">{shipment.carrier || 'Armada Sendiri'}</span>
                          </p>
                          {(shipment.driverName || shipment.vehicleNumber) && (
                            <p className="text-slate-500">
                              Driver: <strong className="text-slate-700">{shipment.driverName || '-'}</strong>
                              {shipment.vehicleNumber && ` (${shipment.vehicleNumber})`}
                            </p>
                          )}
                          {shipment.trackingNumber && (
                            <p className="text-slate-500">
                              Resi: <strong className="text-slate-700">{shipment.trackingNumber}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Items table in this shipment */}
                      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100/70 text-slate-600 font-semibold">
                            <tr>
                              <th className="px-3 py-1.5">Nama Produk</th>
                              <th className="px-3 py-1.5 text-right">Qty Terkirim</th>
                              <th className="px-3 py-1.5">Keterangan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {shipment.items?.map((it: any) => (
                              <tr key={it.id}>
                                <td className="px-3 py-1.5 font-medium text-slate-800">
                                  {it.orderItem?.product?.name || 'Produk Cetak'}
                                </td>
                                <td className="px-3 py-1.5 text-right font-bold text-slate-900 tabular-nums">
                                  {it.quantity?.toLocaleString('id-ID')} {it.orderItem?.product?.unitOfMeasure || 'pcs'}
                                </td>
                                <td className="px-3 py-1.5 text-slate-500">
                                  {it.notes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* POD Summary if delivered */}
                      {isDelivered && (
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 space-y-1">
                          <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                            <CheckCircle size={15} weight="fill" className="text-emerald-600" />
                            Bukti Serah Terima (POD) Terverifikasi
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            Diterima oleh: <strong>{shipment.receivedBy || '-'}</strong> pada {formatDate(shipment.deliveredAt)}
                          </p>
                          {shipment.podNotes && (
                            <p className="text-[11px] text-emerald-700 italic">
                              "{shipment.podNotes}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                        <button
                          onClick={() => setSelectedSuratJalanId(shipment.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs"
                        >
                          <Printer size={14} weight="bold" />
                          Lihat / Cetak Surat Jalan
                        </button>

                        {['Admin', 'Manager', 'Warehouse', 'Sales', 'Owner'].includes(role) && isPreparing && (
                          <button
                            disabled={updatingShipmentStatusId === shipment.id}
                            onClick={() => handleUpdateShipmentStatus(shipment.id, 'In_Transit')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
                          >
                            <Truck size={14} weight="bold" />
                            Kirim Barang
                          </button>
                        )}

                        {['Admin', 'Manager', 'Warehouse', 'Sales', 'Owner'].includes(role) && !isDelivered && (
                          <button
                            onClick={() => setConfirmDeliveryShipment({ id: shipment.id, shipmentNumber: shipment.shipmentNumber })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                          >
                            <CheckCircle size={14} weight="bold" />
                            Konfirmasi Diterima (POD)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                <Truck size={32} className="mx-auto text-slate-400 mb-2" weight="regular" />
                <p className="text-xs font-semibold text-slate-700">Belum ada Surat Jalan yang diterbitkan</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pesanan dapat dipecah ke beberapa pengiriman bertahap (partial dispatch) atau dikirim sekaligus ke alamat tujuan klien.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detail Pelanggan</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">Nama</p>
                <p className="font-bold text-slate-900">{order.customer?.name || 'Tidak Diketahui'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">Email</p>
                <p className="font-medium text-slate-900">{order.customer?.email || 'Tidak Diketahui'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium mb-0.5">Telepon</p>
                <p className="font-medium text-slate-900">{order.customer?.phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard size={16} weight="regular" /> Ringkasan Pembayaran
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Pajak (PPN)</span>
                <span className="font-medium text-slate-900 tabular-nums">{formatCurrency(0)}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-black text-slate-900 tabular-nums text-lg">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl flex justify-between items-center ${order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
              <span className="text-sm font-bold">Status Pembayaran</span>
              <span className="font-bold uppercase tracking-wide text-xs">{order.paymentStatus === 'Paid' ? 'Lunas' : order.paymentStatus || 'Menunggu'}</span>
            </div>
          </div>
          
          {/* Connected Documents */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={16} weight="regular" /> Dokumen Terkait
            </h3>
            <div className="space-y-3">
              <Link to="/dashboard/design" className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary-600">Berkas Desain</span>
                <ArrowLeft size={16} className="rotate-135 text-slate-400" weight="regular" />
              </Link>
              <Link to="/dashboard/invoices" className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary-600">Faktur / Tagihan</span>
                <ArrowLeft size={16} className="rotate-135 text-slate-400" weight="regular" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  const firstShipment = dispatchData?.shipments?.[0];
                  if (firstShipment) {
                    setSelectedSuratJalanId(firstShipment.id);
                  } else {
                    setIsCreateShipmentOpen(true);
                  }
                }}
                className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group text-left"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 group-hover:text-primary-600">Surat Jalan (DO)</span>
                  <span className="text-[11px] text-slate-400">
                    {dispatchData?.shipments?.length || 0} Dokumen Diterbitkan
                  </span>
                </div>
                <Truck size={16} className="text-slate-400 group-hover:text-primary-600" weight="regular" />
              </button>
            </div>
          </div>

        </div>
      </div>
      {/* Modals */}
      {selectedProof && (
        <ProofReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          proof={selectedProof}
          orderNumber={order?.orderNumber}
          onSuccess={fetchOrderDetails}
        />
      )}

      <CreateProofModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        orderId={order.id}
        orderNumber={order.orderNumber}
        currentLatestVersion={order.proofs?.[0]?.version || 0}
        onSuccess={fetchOrderDetails}
      />

      <CreateShipmentModal
        isOpen={isCreateShipmentOpen}
        onClose={() => setIsCreateShipmentOpen(false)}
        orderId={order.id}
        onSuccess={fetchOrderDetails}
      />

      <SuratJalanModal
        isOpen={!!selectedSuratJalanId}
        onClose={() => setSelectedSuratJalanId(null)}
        shipmentId={selectedSuratJalanId}
      />

      <ConfirmDeliveryModal
        isOpen={!!confirmDeliveryShipment}
        onClose={() => setConfirmDeliveryShipment(null)}
        shipmentId={confirmDeliveryShipment?.id || null}
        shipmentNumber={confirmDeliveryShipment?.shipmentNumber}
        onSuccess={fetchOrderDetails}
      />

      <ConfirmDialog
        isOpen={isConfirmApproveOpen}
        onClose={() => setIsConfirmApproveOpen(false)}
        onConfirm={handleConfirmApproveCurrentOrder}
        title="Setujui Pesanan"
        message={`Apakah Anda yakin ingin menyetujui pesanan ${order?.orderNumber}? Status akan diperbarui ke Disetujui.`}
        confirmLabel="Setujui Pesanan"
        variant="success"
        loading={isApprovingOrder}
      />
    </div>
  );
};
