import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { useToast } from '../contexts/ToastContext';
import {
  Truck,
  Package,
  MapPin,
  Phone,
  WhatsappLogo,
  CheckCircle,
  Clock,
  MagnifyingGlass,
  FileText,
  User,
  ArrowClockwise,
  Check,
  NavigationArrow,
  ShieldCheck,
} from '@phosphor-icons/react';
import { ConfirmDeliveryModal } from '../components/modals/ConfirmDeliveryModal';
import { SuratJalanModal } from '../components/modals/SuratJalanModal';

export interface ShipmentListItem {
  id: string;
  shipmentNumber: string;
  orderId: string;
  recipientName: string;
  recipientPhone?: string | null;
  deliveryAddress: string;
  driverName?: string | null;
  driverPhone?: string | null;
  vehicleNumber?: string | null;
  carrier: string;
  trackingNumber?: string | null;
  status: 'Preparing' | 'In_Transit' | 'Delivered' | 'Cancelled' | string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  receivedBy?: string | null;
  notes?: string | null;
  podSignature?: string | null;
  podNotes?: string | null;
  createdAt: string;
  order?: {
    id: string;
    orderNumber: string;
    customer?: {
      id: string;
      fullName: string;
      companyName?: string | null;
      phone?: string | null;
      email?: string | null;
    };
  };
  items?: Array<{
    id: string;
    quantity: number;
    notes?: string | null;
    orderItem?: {
      product?: {
        name: string;
      };
    };
  }>;
}

type TabFilter = 'ALL' | 'IN_TRANSIT' | 'PREPARING' | 'DELIVERED';

export default function DriverPortal() {
  const { user } = useRoleContext();
  const { success, error: toastError } = useToast();

  const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');
  const [onlyMyDeliveries, setOnlyMyDeliveries] = useState(false);

  // Modal states
  const [selectedPODShipment, setSelectedPODShipment] = useState<ShipmentListItem | null>(null);
  const [isPODModalOpen, setIsPODModalOpen] = useState(false);
  const [selectedSuratJalanId, setSelectedSuratJalanId] = useState<string | null>(null);
  const [updatingShipmentId, setUpdatingShipmentId] = useState<string | null>(null);

  const fetchShipments = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get('/api/v1/shipments');
      const data = Array.isArray(response.data) ? response.data : [];
      setShipments(data);
    } catch (err: any) {
      toastError('Gagal Memuat Pengiriman', err.response?.data?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // Quick Action: Start Delivery (Mark as In_Transit)
  const handleStartDelivery = async (shipment: ShipmentListItem) => {
    setUpdatingShipmentId(shipment.id);
    try {
      await api.patch(`/api/v1/shipments/${shipment.id}/status`, {
        status: 'In_Transit',
        shippedAt: new Date().toISOString(),
      });
      success(
        'Pengiriman Dimulai',
        `Surat Jalan ${shipment.shipmentNumber} kini dalam status Dalam Perjalanan.`,
      );
      fetchShipments(true);
    } catch (err: any) {
      toastError(
        'Gagal Memperbarui Status',
        err.response?.data?.message || 'Gagal mengubah status pengiriman.',
      );
    } finally {
      setUpdatingShipmentId(null);
    }
  };

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((item) => {
      // Tab filter
      if (activeTab === 'IN_TRANSIT' && item.status !== 'In_Transit') return false;
      if (activeTab === 'PREPARING' && item.status !== 'Preparing') return false;
      if (activeTab === 'DELIVERED' && item.status !== 'Delivered') return false;

      // Only my deliveries
      if (onlyMyDeliveries && user?.fullName) {
        const matchesDriver =
          item.driverName &&
          item.driverName.toLowerCase().includes(user.fullName.toLowerCase());
        if (!matchesDriver) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = item.shipmentNumber?.toLowerCase().includes(q);
        const matchOrder = item.order?.orderNumber?.toLowerCase().includes(q);
        const matchRecipient = item.recipientName?.toLowerCase().includes(q);
        const matchCompany = item.order?.customer?.companyName?.toLowerCase().includes(q);
        const matchAddress = item.deliveryAddress?.toLowerCase().includes(q);
        const matchDriver = item.driverName?.toLowerCase().includes(q);

        return (
          matchNumber ||
          matchOrder ||
          matchRecipient ||
          matchCompany ||
          matchAddress ||
          matchDriver
        );
      }

      return true;
    });
  }, [shipments, activeTab, onlyMyDeliveries, searchQuery, user?.fullName]);

  // Statistics
  const stats = useMemo(() => {
    const total = shipments.length;
    const inTransit = shipments.filter((s) => s.status === 'In_Transit').length;
    const preparing = shipments.filter((s) => s.status === 'Preparing').length;
    const delivered = shipments.filter((s) => s.status === 'Delivered').length;
    return { total, inTransit, preparing, delivered };
  }, [shipments]);

  const cleanPhoneForWA = (phoneStr?: string | null) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Mobile-Friendly Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-sm">
              <Truck size={22} weight="bold" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                Portal Driver & POD Mobile
              </h1>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span>Multi Kreasi Printing Express</span>
                <span>•</span>
                <span className="text-primary-700 font-semibold">{user?.fullName || 'Pengemudi'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchShipments(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Muat ulang data"
          >
            <ArrowClockwise
              size={18}
              weight="bold"
              className={refreshing ? 'animate-spin text-primary-600' : ''}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => setActiveTab('IN_TRANSIT')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeTab === 'IN_TRANSIT'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-200'
                : 'bg-white border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'IN_TRANSIT' ? 'text-blue-100' : 'text-slate-500'}`}>
                Dalam Perjalanan
              </span>
              <Truck size={20} weight={activeTab === 'IN_TRANSIT' ? 'fill' : 'bold'} className={activeTab === 'IN_TRANSIT' ? 'text-white' : 'text-blue-600'} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black">{stats.inTransit}</span>
              <span className={`text-xs ${activeTab === 'IN_TRANSIT' ? 'text-blue-100' : 'text-slate-400'}`}>Tugas</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('PREPARING')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeTab === 'PREPARING'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-200'
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'PREPARING' ? 'text-amber-100' : 'text-slate-500'}`}>
                Siap Berangkat
              </span>
              <Clock size={20} weight={activeTab === 'PREPARING' ? 'fill' : 'bold'} className={activeTab === 'PREPARING' ? 'text-white' : 'text-amber-600'} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black">{stats.preparing}</span>
              <span className={`text-xs ${activeTab === 'PREPARING' ? 'text-amber-100' : 'text-slate-400'}`}>Di Gudang</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('DELIVERED')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeTab === 'DELIVERED'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-200'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'DELIVERED' ? 'text-emerald-100' : 'text-slate-500'}`}>
                Terkirim (POD)
              </span>
              <CheckCircle size={20} weight={activeTab === 'DELIVERED' ? 'fill' : 'bold'} className={activeTab === 'DELIVERED' ? 'text-white' : 'text-emerald-600'} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black">{stats.delivered}</span>
              <span className={`text-xs ${activeTab === 'DELIVERED' ? 'text-emerald-100' : 'text-slate-400'}`}>Selesai</span>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('ALL')}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              activeTab === 'ALL'
                ? 'bg-black text-white border-black shadow-md ring-2 ring-slate-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${activeTab === 'ALL' ? 'text-slate-200' : 'text-slate-500'}`}>
                Total Surat Jalan
              </span>
              <Package size={20} weight={activeTab === 'ALL' ? 'fill' : 'bold'} className={activeTab === 'ALL' ? 'text-white' : 'text-slate-700'} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black">{stats.total}</span>
              <span className={`text-xs ${activeTab === 'ALL' ? 'text-slate-300' : 'text-slate-400'}`}>Semua</span>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <MagnifyingGlass
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari no. Surat Jalan, penerima, alamat, atau no. pesanan..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
            </div>

            {/* Quick Driver Toggle */}
            <button
              onClick={() => setOnlyMyDeliveries(!onlyMyDeliveries)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shrink-0 ${
                onlyMyDeliveries
                  ? 'bg-primary-600 text-white border-primary-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <User size={15} weight="bold" />
              <span>Tugas Saya Sahaja</span>
            </button>
          </div>

          {/* Tab Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: `Semua (${stats.total})` },
              { id: 'IN_TRANSIT', label: `Dalam Perjalanan (${stats.inTransit})` },
              { id: 'PREPARING', label: `Siap Berangkat (${stats.preparing})` },
              { id: 'DELIVERED', label: `Terkirim & POD (${stats.delivered})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Deliveries List */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-sm font-semibold text-slate-600 mt-4">Memuat data pengiriman driver...</p>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Truck size={30} weight="regular" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Tidak Ada Pengiriman yang Sesuai
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || onlyMyDeliveries
                ? 'Coba sesuaikan kata kunci pencarian atau matikan filter "Tugas Saya".'
                : 'Belum ada surat jalan yang terdaftar dalam kategori ini.'}
            </p>
            {(searchQuery || onlyMyDeliveries || activeTab !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setOnlyMyDeliveries(false);
                  setActiveTab('ALL');
                }}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShipments.map((shipment) => {
              const isDelivered = shipment.status === 'Delivered';
              const isInTransit = shipment.status === 'In_Transit';
              const isPreparing = shipment.status === 'Preparing';
              const isUpdatingThis = updatingShipmentId === shipment.id;

              const cleanWA = cleanPhoneForWA(
                shipment.recipientPhone || shipment.order?.customer?.phone,
              );
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                shipment.deliveryAddress,
              )}`;

              return (
                <div
                  key={shipment.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden shadow-2xs hover:shadow-md ${
                    isInTransit
                      ? 'border-blue-200 ring-2 ring-blue-50'
                      : isDelivered
                      ? 'border-emerald-200'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900 tracking-tight">
                          {shipment.shipmentNumber}
                        </span>
                        {shipment.order?.orderNumber && (
                          <span className="text-xs font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {shipment.order.orderNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dibuat: {new Date(shipment.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                          isInTransit
                            ? 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse'
                            : isDelivered
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {isInTransit && <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />}
                        {isDelivered && <CheckCircle size={15} weight="fill" />}
                        {isPreparing && <Clock size={15} weight="bold" />}
                        {isInTransit
                          ? 'Dalam Perjalanan'
                          : isDelivered
                          ? 'Terkirim (POD Selesai)'
                          : 'Siap Berangkat'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Recipient & Location Card */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Penerima & Perusahaan
                          </span>
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                            {shipment.recipientName}
                            {shipment.order?.customer?.companyName && (
                              <span className="font-semibold text-slate-600 text-xs ml-1.5">
                                ({shipment.order.customer.companyName})
                              </span>
                            )}
                          </h4>
                        </div>

                        {/* Direct Communication Buttons */}
                        <div className="flex items-center gap-2 pt-1 sm:pt-0">
                          {shipment.recipientPhone && (
                            <a
                              href={`tel:${shipment.recipientPhone}`}
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 shadow-2xs"
                              title="Panggil Telepon"
                            >
                              <Phone size={14} weight="bold" className="text-slate-600" />
                              <span>Telepon</span>
                            </a>
                          )}

                          {cleanWA && (
                            <a
                              href={`https://wa.me/${cleanWA}?text=Halo%20${encodeURIComponent(
                                shipment.recipientName,
                              )},%20saya%20pengemudi%20dari%20Multi%20Kreasi%20Printing%20sedang%20mengantarkan%20pesanan%20Surat%20Jalan%20${shipment.shipmentNumber}.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                              title="Kirim Pesan WhatsApp"
                            >
                              <WhatsappLogo size={15} weight="bold" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Delivery Address with 1-Click Maps Navigation */}
                      <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-start gap-2 min-w-0">
                          <MapPin size={18} className="text-red-500 shrink-0 mt-0.5" weight="fill" />
                          <p className="text-xs sm:text-sm text-slate-700 font-medium">
                            {shipment.deliveryAddress}
                          </p>
                        </div>

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                          title="Navigasi ke lokasi pengiriman"
                        >
                          <NavigationArrow size={14} weight="bold" />
                          <span>Buka Google Maps</span>
                        </a>
                      </div>
                    </div>

                    {/* Cargo / Items Breakdown */}
                    {shipment.items && shipment.items.length > 0 && (
                      <div className="border border-slate-100 rounded-xl p-3 bg-white">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Barang Muatan ({shipment.items.length} Macam):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {shipment.items.map((it) => (
                            <span
                              key={it.id}
                              className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium flex items-center gap-1.5"
                            >
                              <span className="font-extrabold text-slate-900 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                {it.quantity}x
                              </span>
                              <span>{it.orderItem?.product?.name || 'Item Cetak'}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Driver & Vehicle Metadata */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">PENGEMUDI</span>
                        <span className="font-bold text-slate-800">
                          {shipment.driverName || 'Belum ditugaskan'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">PLAT NOMOR</span>
                        <span className="font-mono font-bold text-slate-800">
                          {shipment.vehicleNumber || '-'}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-400 block font-semibold">ARMADA / KURIR</span>
                        <span className="font-semibold text-slate-800">
                          {shipment.carrier || 'Armada Internal MKP'}
                        </span>
                      </div>
                    </div>

                    {/* Proof of Delivery (POD) Snapshot if Delivered */}
                    {isDelivered && (
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-900">
                            <ShieldCheck size={18} weight="fill" className="text-emerald-600" />
                            <span>Tanda Terima Resmi (Digital Proof of Delivery)</span>
                          </div>
                          {shipment.deliveredAt && (
                            <span className="text-[11px] text-emerald-700 font-semibold">
                              {new Date(shipment.deliveredAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-emerald-900">
                          Penerima di Lokasi: <strong className="font-bold">{shipment.receivedBy || shipment.recipientName}</strong>
                        </p>

                        {shipment.podNotes && (
                          <p className="text-xs text-emerald-800 italic bg-white/60 p-2 rounded border border-emerald-100">
                            Catatan: "{shipment.podNotes}"
                          </p>
                        )}

                        {shipment.podSignature && (
                          <div className="pt-1 flex items-center gap-3">
                            {shipment.podSignature.startsWith('data:image') || shipment.podSignature.startsWith('http') ? (
                              <div className="bg-white p-1.5 rounded-lg border border-emerald-200 inline-block">
                                <img
                                  src={shipment.podSignature}
                                  alt="Tanda tangan / Foto POD"
                                  className="h-16 max-w-xs object-contain"
                                />
                              </div>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-200">
                                {shipment.podSignature}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedSuratJalanId(shipment.id)}
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <FileText size={16} weight="bold" />
                      <span>Lihat Surat Jalan (DO)</span>
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {isPreparing && (
                        <button
                          type="button"
                          onClick={() => handleStartDelivery(shipment)}
                          disabled={isUpdatingThis}
                          className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Truck size={16} weight="bold" />
                          <span>{isUpdatingThis ? 'Memproses...' : 'Mulai Antar (Berangkat)'}</span>
                        </button>
                      )}

                      {isInTransit && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPODShipment(shipment);
                            setIsPODModalOpen(true);
                          }}
                          className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ring-2 ring-emerald-200 animate-bounce-slow"
                        >
                          <ShieldCheck size={18} weight="fill" />
                          <span>Tiba & Selesaikan POD</span>
                        </button>
                      )}

                      {isDelivered && (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          <Check size={16} weight="bold" /> Selesai Diantar
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* POD Confirmation Modal (Signature canvas & Camera) */}
      {selectedPODShipment && (
        <ConfirmDeliveryModal
          isOpen={isPODModalOpen}
          onClose={() => {
            setIsPODModalOpen(false);
            setSelectedPODShipment(null);
          }}
          onSuccess={() => {
            setIsPODModalOpen(false);
            setSelectedPODShipment(null);
            fetchShipments(true);
          }}
          shipmentId={selectedPODShipment.id}
          shipmentNumber={selectedPODShipment.shipmentNumber}
        />
      )}

      {/* Surat Jalan Document Modal */}
      {selectedSuratJalanId && (
        <SuratJalanModal
          isOpen={!!selectedSuratJalanId}
          onClose={() => setSelectedSuratJalanId(null)}
          shipmentId={selectedSuratJalanId}
        />
      )}
    </div>
  );
}
