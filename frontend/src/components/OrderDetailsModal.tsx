import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { useToast } from '../contexts/ToastContext';
import { 
  X, 
  Package, 
  Clock, 
  CheckCircle, 
  CreditCard, 
  DownloadSimple,
  WarningCircle,
  Palette,
  FilePdf,
  CalendarBlank,
  FileText,
  Eye,
  ShieldCheck,
  XCircle,
  Truck,
  Copy,
  Check,
  MapPin,
  User,
  Phone,
} from '@phosphor-icons/react';
import { ProofReviewModal, type ProofItem } from './modals/ProofReviewModal';
import { SuratJalanModal } from './modals/SuratJalanModal';

export interface ShipmentItemDetail {
  id: string;
  quantity: number;
  notes?: string | null;
  orderItem?: {
    product?: { name: string };
  };
}

export interface ShipmentDetail {
  id: string;
  shipmentNumber: string;
  recipientName: string;
  recipientPhone?: string | null;
  deliveryAddress: string;
  driverName?: string | null;
  driverPhone?: string | null;
  vehicleNumber?: string | null;
  carrier: string;
  trackingNumber?: string | null;
  status: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  receivedBy?: string | null;
  notes?: string | null;
  podSignature?: string | null;
  podNotes?: string | null;
  items?: ShipmentItemDetail[];
}

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
    id?: string;
    status: string;
    fileUrl: string;
    fileName?: string;
  }>;
  proofs?: ProofItem[];
  shipments?: ShipmentDetail[];
  customer?: {
    companyName?: string;
    fullName?: string;
    email?: string;
  };
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  orderId: string | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Pending_Approval: 'bg-amber-100 text-amber-800 border-amber-200',
  Proof_Pending_Approval: 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-100',
  Proof_Rejected: 'bg-red-100 text-red-800 border-red-200',
  Proof_Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Approved: 'bg-slate-100 text-slate-900 border-slate-200',
  In_Production: 'bg-cyan-100 text-cyan-900 border-cyan-200',
  Quality_Check: 'bg-purple-100 text-purple-800 border-purple-200',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const orderStatusMap: Record<string, string> = {
  Draft: 'Draf',
  Pending: 'Menunggu',
  Pending_Approval: 'Menunggu Persetujuan Order',
  Proof_Pending_Approval: 'Menunggu ACC Bukti Cetak',
  Proof_Rejected: 'Revisi Bukti Cetak Diminta',
  Proof_Approved: 'Bukti Cetak Disetujui (ACC)',
  Approved: 'Disetujui',
  In_Production: 'Dalam Produksi',
  Quality_Check: 'Pengecekan Kualitas',
  Completed: 'Selesai',
  Delivered: 'Terkirim',
  Cancelled: 'Dibatalkan',
};

const paymentStatusMap: Record<string, string> = {
  Paid: 'Lunas',
  Unpaid: 'Belum Lunas',
  Partial: 'Sebagian',
  Pending: 'Menunggu',
  Failed: 'Gagal',
};

const shipmentStatusMap: Record<string, { label: string; color: string }> = {
  Preparing: { label: 'Disiapkan di Gudang', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  In_Transit: { label: 'Dalam Pengiriman', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  Delivered: { label: 'Terkirim & Diterima', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  Cancelled: { label: 'Batal Kirim', color: 'bg-red-100 text-red-800 border-red-200' },
};

const steps = [
  { label: 'Pesanan Dibuat', desc: 'Tercatat di sistem' },
  { label: 'Pembayaran', desc: 'Verifikasi transfer' },
  { label: 'ACC Proofing', desc: 'Validasi bukti cetak' },
  { label: 'Produksi & QC', desc: 'Proses cetak massal' },
  { label: 'Selesai', desc: 'Pesanan rampung' },
];

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  orderId,
  onClose,
}) => {
  const { user } = useRoleContext();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [selectedProof, setSelectedProof] = useState<ProofItem | null>(null);
  const [isProofReviewOpen, setIsProofReviewOpen] = useState(false);
  const [selectedSuratJalanId, setSelectedSuratJalanId] = useState<string | null>(null);
  const [copiedResi, setCopiedResi] = useState<string | null>(null);

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(resi);
    success('Nomor Resi Disalin', `Resi ${resi} berhasil disalin ke papan klip.`);
    setTimeout(() => {
      setCopiedResi((prev) => (prev === resi ? null : prev));
    }, 2500);
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const isCustomer = user?.role === 'Customer';
      const url = isCustomer ? `/api/v1/my-orders/${orderId}` : `/api/v1/orders/${orderId}`;
      const response = await api.get(url);
      setOrder(response.data);
    } catch (err: any) {
      // Fallback attempt to my-orders
      try {
        const fallback = await api.get(`/api/v1/my-orders/${orderId}`);
        setOrder(fallback.data);
      } catch {
        setError(err.response?.data?.message || 'Gagal memuat detail pesanan');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    } else {
      setOrder(null);
      setError('');
    }
  }, [isOpen, orderId, user?.role]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStepIndex = (status: string): number => {
    switch (status) {
      case 'Draft': return 0;
      case 'Pending':
      case 'Pending_Approval': return 1;
      case 'Approved':
      case 'Proof_Pending_Approval':
      case 'Proof_Rejected':
      case 'Proof_Approved': return 2;
      case 'In_Production':
      case 'Quality_Check': return 3;
      case 'Completed':
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const response = await api.get(`/api/v1/my-orders/${order.id}/invoice`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${order.orderNumber}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Invoice Berhasil Diunduh', `Invoice #${order.orderNumber} telah tersimpan.`);
    } catch (err: any) {
      toastError('Gagal Mengunduh Invoice', err.response?.data?.message || 'Invoice belum tersedia.');
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  const currentStepIdx = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === 'Cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8 flex flex-col border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Detail Pesanan</h2>
            {order && <p className="text-xs text-slate-500 font-mono mt-0.5">{order.orderNumber}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-200"
            aria-label="Tutup modal"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(85vh-140px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
              <p className="text-sm text-slate-500">Memuat detail pesanan...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-start gap-3">
              <WarningCircle size={20} className="shrink-0 mt-0.5" weight="fill" />
              <div>
                <h4 className="font-semibold text-sm">Gagal memuat pesanan</h4>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          ) : order ? (
            <>
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{order.orderNumber}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Clock size={14} weight="regular" />
                    Dibuat pada {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    Status: {orderStatusMap[order.status] || order.status.replace(/_/g, ' ')}
                  </span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                    Bayar: {paymentStatusMap[order.paymentStatus] || order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Status Timeline Stepper */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-primary-600" weight="bold" />
                  Alur Progres Pesanan
                </h4>

                {isCancelled ? (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                    <WarningCircle size={24} weight="fill" className="shrink-0 text-red-600" />
                    <div>
                      <h5 className="font-bold text-sm text-red-800">Pesanan Dibatalkan</h5>
                      <p className="text-xs text-red-600 mt-0.5">Pesanan ini telah dibatalkan dan proses produksi dihentikan.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center">
                      {steps.map((step, idx) => {
                        const isDone = idx < currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        return (
                          <div key={idx} className="flex flex-col items-center relative">
                            {/* Connector Line */}
                            {idx < steps.length - 1 && (
                              <div 
                                className={`hidden sm:block absolute top-4 left-1/2 w-full h-0.5 z-0 ${
                                  idx < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-200'
                                }`} 
                              />
                            )}

                            {/* Node Circle */}
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${
                                isDone 
                                  ? 'bg-emerald-600 text-white' 
                                  : isCurrent 
                                  ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-sm' 
                                  : 'bg-white text-slate-400 border-2 border-slate-200'
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle size={16} weight="fill" />
                              ) : (
                                idx + 1
                              )}
                            </div>

                            <p className={`mt-2 text-[11px] sm:text-xs font-semibold leading-tight ${
                              isCurrent ? 'text-primary-700 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                              {step.label}
                            </p>
                            <p className="hidden sm:block text-[10px] text-slate-400 mt-0.5">{step.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Estimation if available */}
              {order.estimatedDeliveryDate && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
                  <CalendarBlank size={20} className="text-slate-900 shrink-0" weight="bold" />
                  <p className="text-xs text-slate-900 font-medium">
                    Estimasi Selesai / Kirim:{' '}
                    <span className="font-bold">
                      {new Date(order.estimatedDeliveryDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </p>
                </div>
              )}

              {/* Design Files preview if available */}
              {order.designFiles && order.designFiles.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <Palette size={18} className="text-primary-600" weight="bold" />
                    Berkas Desain / Artwork
                  </h4>
                  <div className="space-y-2">
                    {order.designFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3 min-w-0">
                          <FilePdf size={24} className="text-red-500 shrink-0" weight="regular" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                              {file.fileName || `Berkas Desain Cetak #${idx + 1}`}
                            </p>
                            <span className="text-[11px] text-slate-500">
                              Status: {file.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        {file.fileUrl && (
                          <a 
                            href={file.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                          >
                            Buka Berkas
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Digital Proofing / Proof Cetak Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileText size={18} className="text-primary-600" weight="bold" />
                      Bukti Cetak Digital (Digital Proofing B2B)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Persetujuan pracetak resmi sebelum mesin cetak dijalankan untuk menjamin akurasi hasil cetak.
                    </p>
                  </div>
                  {order.proofs && order.proofs.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {order.proofs.length} Versi
                    </span>
                  )}
                </div>

                {/* Callout if proof pending customer approval */}
                {order.status === 'Proof_Pending_Approval' && order.proofs && order.proofs.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse-slow">
                    <div className="flex items-start gap-3">
                      <WarningCircle size={22} weight="fill" className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-bold text-xs sm:text-sm text-amber-900">
                          Persetujuan Diperlukan Segera (ACC Cetak)
                        </h5>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Bukti cetak versi terbaru ({order.proofs[0].version}) siap ditinjau. Mohon periksa teks, ejaan, dan tata letak sebelum kami memulai produksi massal.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProof(order.proofs![0]);
                        setIsProofReviewOpen(true);
                      }}
                      className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Eye size={16} weight="bold" />
                      Periksa & ACC Sekarang
                    </button>
                  </div>
                )}

                {/* List of proofs if available */}
                {order.proofs && order.proofs.length > 0 ? (
                  <div className="space-y-2.5">
                    {order.proofs.map((proof) => {
                      const isProofPending = proof.status === 'Pending_Approval';
                      const isProofApproved = proof.status === 'Approved';
                      const isProofRejected = proof.status === 'Rejected';

                      return (
                        <div
                          key={proof.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                                <span className="font-bold text-sm text-slate-900">
                                  Proof v{proof.version}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isProofApproved
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isProofRejected
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {isProofApproved
                                    ? 'ACC (Disetujui)'
                                    : isProofRejected
                                    ? 'Revisi Diminta'
                                    : 'Menunggu ACC'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {proof.notes || 'Proof kalibrasi pracetak siap ditinjau'}
                              </p>
                              {proof.approvedAt && (
                                <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                                  Disetujui pada {new Date(proof.approvedAt).toLocaleDateString('id-ID')}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedProof(proof);
                              setIsProofReviewOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs"
                          >
                            <Eye size={14} weight="bold" />
                            {isProofPending ? 'Tinjau & Setujui' : 'Lihat Detail Proof'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                    <p className="text-xs text-slate-500">
                      Belum ada bukti cetak digital yang diterbitkan untuk pesanan ini.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tim pracetak kami akan membuat bukti cetak (proof) sebelum jadwal mesin cetak dimulai.
                    </p>
                  </div>
                )}
              </div>

              {/* Shipping & Delivery (Surat Jalan / DO) Tracking */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Truck size={18} className="text-primary-600" weight="bold" />
                      Pelacakan Pengiriman & Surat Jalan (DO)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pantau pergerakan ekspedisi/armada logistik, nomor resi pengiriman, dan dokumen serah terima.
                    </p>
                  </div>
                  {order.shipments && order.shipments.length > 0 && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {order.shipments.length} Pengiriman
                    </span>
                  )}
                </div>

                {order.shipments && order.shipments.length > 0 ? (
                  <div className="space-y-4">
                    {order.shipments.map((shipment) => {
                      const statusConfig = shipmentStatusMap[shipment.status] || {
                        label: shipment.status.replace(/_/g, ' '),
                        color: 'bg-slate-100 text-slate-800 border-slate-200',
                      };
                      const isDelivered = shipment.status === 'Delivered';
                      const isInTransit = shipment.status === 'In_Transit';

                      return (
                        <div
                          key={shipment.id}
                          className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-3.5"
                        >
                          {/* Header row: Number + Status */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">
                                {shipment.shipmentNumber}
                              </span>
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.color} flex items-center gap-1.5`}
                              >
                                {isInTransit && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />}
                                {statusConfig.label}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedSuratJalanId(shipment.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shadow-2xs"
                            >
                              <FileText size={15} weight="bold" />
                              Lihat Surat Jalan (DO)
                            </button>
                          </div>

                          {/* Carrier & Tracking details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {/* Kurir & Resi */}
                            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Ekspedisi & Resi
                              </span>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-800">
                                  {shipment.carrier || 'Armada Internal MKP'}
                                </span>
                              </div>

                              {shipment.trackingNumber ? (
                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                                  <div className="min-w-0">
                                    <span className="text-[10px] text-slate-500 block">No. Resi / AWB:</span>
                                    <span className="font-mono text-xs font-bold text-slate-900 truncate block">
                                      {shipment.trackingNumber}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyResi(shipment.trackingNumber!)}
                                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                    title="Salin nomor resi"
                                  >
                                    {copiedResi === shipment.trackingNumber ? (
                                      <>
                                        <Check size={14} className="text-emerald-600" weight="bold" />
                                        <span className="text-emerald-700 font-semibold text-[11px]">Tersalin</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={14} weight="bold" />
                                        <span className="text-[11px]">Salin</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">
                                  {shipment.carrier?.includes('Internal')
                                    ? 'Diantar langsung oleh Armada MKP'
                                    : 'Resi menunggu update ekspedisi'}
                                </p>
                              )}
                            </div>

                            {/* Driver info if assigned */}
                            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                Info Pengemudi / Kendaraan
                              </span>
                              {shipment.driverName ? (
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                                    <User size={14} className="text-slate-500" />
                                    <span>{shipment.driverName}</span>
                                    {shipment.vehicleNumber && (
                                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">
                                        {shipment.vehicleNumber}
                                      </span>
                                    )}
                                  </div>
                                  {shipment.driverPhone && (
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                      <Phone size={13} className="text-emerald-600" />
                                      <a
                                        href={`https://wa.me/${shipment.driverPhone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-600 hover:text-primary-700 hover:underline font-medium text-[11px]"
                                      >
                                        Hubungi Driver ({shipment.driverPhone})
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">
                                  Driver/kurir akan ditugaskan saat keberangkatan.
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Destination Address */}
                          <div className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-lg border border-slate-200/80 flex items-start gap-2">
                            <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800">
                                {shipment.recipientName}
                                {shipment.recipientPhone ? ` (${shipment.recipientPhone})` : ''}:
                              </span>{' '}
                              <span className="text-slate-600">{shipment.deliveryAddress}</span>
                            </div>
                          </div>

                          {/* Proof of Delivery (POD) info if Delivered */}
                          {isDelivered && (
                            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                                  <ShieldCheck size={16} weight="fill" className="text-emerald-600" />
                                  <span>Tanda Terima Resmi (Digital POD)</span>
                                </div>
                                {shipment.deliveredAt && (
                                  <span className="text-[11px] text-emerald-700 font-medium">
                                    {new Date(shipment.deliveredAt).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-emerald-800">
                                Diterima oleh: <strong className="font-bold">{shipment.receivedBy || shipment.recipientName}</strong>
                              </p>
                              {shipment.podNotes && (
                                <p className="text-[11px] text-emerald-700 italic">
                                  Catatan: "{shipment.podNotes}"
                                </p>
                              )}
                              {shipment.podSignature && (
                                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 mt-1">
                                  Tanda Tangan Digital Tersimpan
                                </span>
                              )}
                            </div>
                          )}

                          {/* Shipped item breakdown for this surat jalan */}
                          {shipment.items && shipment.items.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/60">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Barang dalam Surat Jalan ini:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {shipment.items.map((item) => (
                                  <span
                                    key={item.id}
                                    className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700"
                                  >
                                    <strong className="text-slate-900">{item.quantity}x</strong>{' '}
                                    {item.orderItem?.product?.name || 'Item Cetak'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                    <p className="text-xs text-slate-500">
                      Belum ada Surat Jalan (DO) yang diterbitkan untuk pesanan ini.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Surat Jalan dan nomor pelacakan akan otomatis muncul ketika proses produksi dan kontrol kualitas selesai.
                    </p>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <Package size={18} className="text-primary-600" weight="bold" />
                  Rincian Item Percetakan
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Produk</th>
                        <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-center">Qty</th>
                        <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-right">Harga</th>
                        <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {order.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-800">{item.product?.name}</p>
                            {item.product?.description && (
                              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.product.description}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700 font-medium">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/80 border-t border-slate-200">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-700">Total Pembayaran</td>
                        <td className="px-4 py-3 text-right font-extrabold text-primary-600 text-lg tabular-nums">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </>
          ) : (
            <div className="text-center py-12 text-slate-500">Pesanan tidak ditemukan</div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
          
          <div className="flex items-center gap-2">
            {order && (order.status === 'Draft' || order.status === 'Pending') && (
              <button
                onClick={() => {
                  onClose();
                  navigate(`/payment/${order.id}`);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <CreditCard size={18} weight="bold" />
                {order.status === 'Draft' ? 'Bayar Sekarang' : 'Cek Status Pembayaran'}
              </button>
            )}

            {order && order.status !== 'Draft' && order.status !== 'Cancelled' && (
              <button
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <DownloadSimple size={18} weight="bold" />
                {downloading ? 'Mengunduh...' : 'Unduh Faktur'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Proof Review Modal */}
      {selectedProof && (
        <ProofReviewModal
          isOpen={isProofReviewOpen}
          onClose={() => setIsProofReviewOpen(false)}
          proof={selectedProof}
          orderNumber={order?.orderNumber}
          onSuccess={fetchOrderDetails}
        />
      )}

      {/* Surat Jalan Modal */}
      {selectedSuratJalanId && (
        <SuratJalanModal
          isOpen={!!selectedSuratJalanId}
          onClose={() => setSelectedSuratJalanId(null)}
          shipmentId={selectedSuratJalanId}
        />
      )}
    </div>
  );
};

