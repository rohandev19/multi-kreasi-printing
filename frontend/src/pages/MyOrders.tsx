import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { 
  ShoppingBag, 
  Eye, 
  CreditCard, 
  Clock, 
  MagnifyingGlass, 
  DownloadSimple,
  CalendarBlank,
  Tag,
  Truck,
  CheckCircle,
  ArrowsCounterClockwise,
} from '@phosphor-icons/react';
import { useToast } from '../contexts/ToastContext';
import { OrderDetailsModal } from '../components/OrderDetailsModal';

interface OrderItem {
  product: { name: string };
  quantity: number;
}

export interface ShipmentSummary {
  id: string;
  shipmentNumber: string;
  status: string;
  carrier: string;
  trackingNumber: string | null;
  driverName: string | null;
  deliveredAt: string | null;
  receivedBy: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentStatus?: string;
  estimatedDeliveryDate: string | null;
  createdAt: string;
  items: OrderItem[];
  shipments?: ShipmentSummary[];
}

const statusColors: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Pending_Approval: 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-slate-100 text-slate-900 border-slate-200',
  In_Production: 'bg-slate-200 text-slate-900 border-slate-300',
  Quality_Check: 'bg-purple-100 text-purple-800 border-purple-200',
  Completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
};

type FilterTab = 'ALL' | 'UNPAID' | 'VERIFYING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

const statusLabels: Record<string, string> = {
  Draft: 'Draf',
  Pending: 'Menunggu Pembayaran',
  Pending_Approval: 'Menunggu Persetujuan',
  Approved: 'Disetujui',
  In_Production: 'Dalam Produksi',
  Quality_Check: 'Pemeriksaan Kualitas',
  Completed: 'Selesai',
  Delivered: 'Terkirim',
  Cancelled: 'Dibatalkan',
};

const filterTabs: Array<{ id: FilterTab; label: string }> = [
  { id: 'ALL', label: 'Semua Pesanan' },
  { id: 'UNPAID', label: 'Menunggu Bayar' },
  { id: 'VERIFYING', label: 'Verifikasi' },
  { id: 'PROCESSING', label: 'Diproses' },
  { id: 'COMPLETED', label: 'Selesai' },
  { id: 'CANCELLED', label: 'Dibatalkan' },
];

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  useEffect(() => {
    const s = searchParams.get('search');
    if (s !== null) {
      setSearchQuery(s);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const response = await api.get('/api/v1/my-orders');
      const orderData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setOrders(orderData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat daftar pesanan Anda');
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
    return statusLabels[status] || status.replace(/_/g, ' ');
  };

  const handleDownloadInvoice = async (order: Order) => {
    setDownloadingId(order.id);
    try {
      const res = await api.get(`/api/v1/my-orders/${order.id}/invoice`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Faktur-${order.orderNumber}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Faktur Berhasil Diunduh', `Faktur #${order.orderNumber} telah tersimpan.`);
    } catch (err: any) {
      toastError('Gagal Mengunduh', err.response?.data?.message || 'Faktur belum tersedia.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReorder = async (order: Order) => {
    setReorderingId(order.id);
    try {
      const response = await api.post(`/api/v1/my-orders/${order.id}/reorder`);
      window.dispatchEvent(new Event('cart_updated'));
      success(
        'Pesan Ulang Berhasil',
        `${response.data.reorderedCount} item dari pesanan #${order.orderNumber} berhasil ditambahkan ke keranjang belanja Anda.`,
      );
      navigate('/cart');
    } catch (err: any) {
      toastError(
        'Gagal Pesan Ulang',
        err.response?.data?.message || 'Gagal menambahkan pesanan ke keranjang.',
      );
    } finally {
      setReorderingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = 
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.items?.some((item) => item.product?.name.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (activeTab === 'ALL') return true;
      if (activeTab === 'UNPAID') return order.status === 'Draft';
      if (activeTab === 'VERIFYING') return order.status === 'Pending' || order.status === 'Pending_Approval';
      if (activeTab === 'PROCESSING') return ['Approved', 'In_Production', 'Quality_Check'].includes(order.status);
      if (activeTab === 'COMPLETED') return ['Completed', 'Delivered'].includes(order.status);
      if (activeTab === 'CANCELLED') return order.status === 'Cancelled';

      return true;
    });
  }, [orders, searchQuery, activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="text-sm text-slate-500">Memuat pesanan Anda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
        <span>{error}</span>
        <button 
          onClick={fetchMyOrders}
          className="text-sm font-semibold underline hover:no-underline"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Pesanan Saya</h2>
          <p className="text-sm text-slate-500 mt-1">Pantau status, instruksi pembayaran, dan riwayat berkas cetak Anda.</p>
        </div>
        <button 
          onClick={() => navigate('/products')}
          className="px-5 py-2.5 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <ShoppingBag size={18} weight="bold" />
          Pesan Baru
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              {tab.id === 'ALL' ? ` (${orders.length})` : ''}
            </button>
          ))}
        </div>

        <div className="relative">
          <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nomor pesanan (ORD-...) atau nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <ShoppingBag size={64} className="mx-auto mb-4 text-slate-300" weight="regular" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            {orders.length === 0 ? 'Belum Ada Pesanan' : 'Tidak Ada Pesanan yang Cocok'}
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            {orders.length === 0
              ? 'Mulai pesanan cetak pertama Anda dari katalog produk kami.'
              : 'Tidak ditemukan pesanan dengan filter atau pencarian saat ini.'}
          </p>
          {orders.length === 0 ? (
            <button 
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm"
            >
              Lihat Katalog Produk
            </button>
          ) : (
            <button 
              onClick={() => { setActiveTab('ALL'); setSearchQuery(''); }}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors text-sm"
            >
              Reset Filter Pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const isDraft = order.status === 'Draft';
            const isVerifying = order.status === 'Pending' || order.status === 'Pending_Approval';
            const isReadyForInvoice = !isDraft && order.status !== 'Cancelled';

            return (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{order.orderNumber}</h3>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="text-slate-500 text-xs sm:text-right">
                      Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID', { 
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    {/* Items preview */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Tag size={14} weight="bold" /> Item Cetak
                      </p>
                      {order.items && order.items.length > 0 ? (
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <p key={idx} className="text-sm font-semibold text-slate-800 truncate">
                              <span className="text-slate-900 font-bold">{item.quantity}x</span> {item.product?.name}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Tidak ada rincian item</p>
                      )}
                    </div>

                    {/* Delivery & Pricing Info */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <CalendarBlank size={14} weight="bold" /> Pengiriman & Estimasi
                          </p>
                          {order.shipments && order.shipments.length > 0 && (
                            <span className="text-[10px] font-bold text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Truck size={12} weight="bold" />
                              {order.shipments.length} Surat Jalan
                            </span>
                          )}
                        </div>

                        {order.shipments && order.shipments.length > 0 ? (
                          <div className="mt-1 space-y-1">
                            {order.shipments.slice(0, 1).map((s) => (
                              <div key={s.id} className="text-xs">
                                <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                  {s.status === 'Delivered' ? (
                                    <CheckCircle size={14} className="text-emerald-600 shrink-0" weight="fill" />
                                  ) : (
                                    <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${s.status === 'In_Transit' ? 'bg-blue-500 animate-ping' : 'bg-amber-500'}`} />
                                  )}
                                  <span className="font-semibold truncate">{s.carrier}</span>
                                  {s.trackingNumber && (
                                    <span className="font-mono text-[11px] text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200 truncate">
                                      Resi: {s.trackingNumber}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {s.status === 'Delivered'
                                    ? `Terkirim (Penerima: ${s.receivedBy || 'Customer'})`
                                    : s.status === 'In_Transit'
                                    ? 'Sedang dalam pengiriman kurir'
                                    : 'Sedang disiapkan di gudang'}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-700 font-medium">
                            {order.estimatedDeliveryDate 
                              ? new Date(order.estimatedDeliveryDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })
                              : 'Mengikuti antrian produksi'}
                          </p>
                        )}
                      </div>
                      <div className="pt-2 border-t border-slate-200/60 mt-2 flex items-baseline justify-between">
                        <span className="text-xs text-slate-500 font-semibold">Total Tagihan:</span>
                        <span className="text-lg font-extrabold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap sm:flex-nowrap gap-3 pt-2">
                  <button 
                    onClick={() => setSelectedOrderId(order.id)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={18} weight="bold" />
                    Lihat Detail
                  </button>

                  {isDraft && (
                    <button 
                      onClick={() => navigate(`/payment/${order.id}`)}
                      className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <CreditCard size={18} weight="bold" />
                      Bayar Sekarang
                    </button>
                  )}

                  {isVerifying && (
                    <button 
                      onClick={() => navigate(`/payment/${order.id}`)}
                      className="flex-1 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Clock size={18} weight="bold" />
                      Cek Bukti Transfer
                    </button>
                  )}

                  {isReadyForInvoice && (
                    <button 
                      onClick={() => handleDownloadInvoice(order)}
                      disabled={downloadingId === order.id}
                      className="flex-1 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <DownloadSimple size={18} weight="bold" />
                      {downloadingId === order.id ? 'Mengunduh...' : 'Unduh Faktur'}
                    </button>
                  )}

                  {(order.status === 'Completed' || order.status === 'Delivered') && (
                    <button 
                      onClick={() => handleReorder(order)}
                      disabled={reorderingId === order.id}
                      className="flex-1 px-4 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-800 border border-primary-200 rounded-xl text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                      title="Masukkan kembali item pesanan ini ke keranjang belanja"
                    >
                      <ArrowsCounterClockwise size={18} weight="bold" className={reorderingId === order.id ? 'animate-spin' : ''} />
                      {reorderingId === order.id ? 'Memproses...' : 'Pesan Ulang'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail */}
      <OrderDetailsModal 
        isOpen={!!selectedOrderId}
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
}

