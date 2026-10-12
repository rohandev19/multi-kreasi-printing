import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Printer,
  CheckCircle,
  MagnifyingGlass,
  Funnel,
  ArrowSquareOut,
} from '@phosphor-icons/react';

interface OutgoingShipmentsTableProps {
  shipments: any[];
  loading: boolean;
  onViewSuratJalan: (shipmentId: string) => void;
  onConfirmDelivery: (shipment: { id: string; shipmentNumber: string }) => void;
  onUpdateStatus: (shipmentId: string, status: string) => void;
  userRole: string;
}

export const OutgoingShipmentsTable: React.FC<OutgoingShipmentsTableProps> = ({
  shipments,
  loading,
  onViewSuratJalan,
  onConfirmDelivery,
  onUpdateStatus,
  userRole,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredShipments = shipments.filter((s) => {
    const matchesStatus =
      statusFilter === 'ALL' || s.status === statusFilter;

    const term = search.toLowerCase();
    const matchesSearch =
      !term ||
      s.shipmentNumber?.toLowerCase().includes(term) ||
      s.order?.orderNumber?.toLowerCase().includes(term) ||
      s.recipientName?.toLowerCase().includes(term) ||
      s.order?.customer?.name?.toLowerCase().includes(term) ||
      s.carrier?.toLowerCase().includes(term);

    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(dateStr));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Preparing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Menyiapkan
          </span>
        );
      case 'In_Transit':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            Dalam Pengiriman
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Diterima (POD)
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12 bg-white rounded-2xl border border-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const canManage = ['Owner', 'Manager', 'Warehouse', 'Admin', 'Production', 'Sales'].includes(userRole);

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari No. SJ, No. Order, Penerima..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Funnel size={16} className="text-slate-400 shrink-0" />
          {[
            { id: 'ALL', label: 'Semua Status' },
            { id: 'Preparing', label: 'Menyiapkan' },
            { id: 'In_Transit', label: 'Dalam Pengiriman' },
            { id: 'Delivered', label: 'Diterima (POD)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">No. Surat Jalan</th>
              <th className="px-5 py-3.5">Pesanan & Klien</th>
              <th className="px-5 py-3.5">Tujuan & Penerima</th>
              <th className="px-5 py-3.5">Armada / Driver</th>
              <th className="px-5 py-3.5">Muatan Item</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredShipments.length > 0 ? (
              filteredShipments.map((shipment) => {
                const isDelivered = shipment.status === 'Delivered';
                const isPreparing = shipment.status === 'Preparing';

                const totalItems = shipment.items?.reduce(
                  (sum: number, it: any) => sum + (it.quantity || 0),
                  0,
                );

                return (
                  <tr key={shipment.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-slate-900">
                        {shipment.shipmentNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(shipment.createdAt)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/dashboard/orders/${shipment.orderId}`}
                        className="font-semibold text-primary-600 hover:underline flex items-center gap-1"
                      >
                        {shipment.order?.orderNumber || 'Lihat Order'}
                        <ArrowSquareOut size={13} />
                      </Link>
                      <div className="text-xs text-slate-700 font-medium mt-0.5">
                        {shipment.order?.customer?.company ||
                          shipment.order?.customer?.name ||
                          '-'}
                      </div>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900">
                        {shipment.recipientName}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5" title={shipment.deliveryAddress}>
                        {shipment.deliveryAddress}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-xs font-semibold text-slate-800">
                        {shipment.carrier || 'Armada MKP'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {shipment.driverName ? `Driver: ${shipment.driverName}` : ''}
                        {shipment.vehicleNumber ? ` (${shipment.vehicleNumber})` : ''}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-xs font-bold text-slate-900 tabular-nums">
                        {totalItems?.toLocaleString('id-ID')} unit
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {shipment.items?.length || 0} jenis item
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {getStatusBadge(shipment.status)}
                      {isDelivered && shipment.receivedBy && (
                        <div className="text-[10px] text-emerald-700 font-medium mt-1">
                          PIC: {shipment.receivedBy}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewSuratJalan(shipment.id)}
                          title="Cetak Surat Jalan"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                        >
                          <Printer size={16} weight="bold" />
                        </button>

                        {canManage && isPreparing && (
                          <button
                            onClick={() => onUpdateStatus(shipment.id, 'In_Transit')}
                            title="Kirim Armada"
                            className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors border border-blue-200"
                          >
                            <Truck size={16} weight="bold" />
                          </button>
                        )}

                        {canManage && !isDelivered && (
                          <button
                            onClick={() =>
                              onConfirmDelivery({
                                id: shipment.id,
                                shipmentNumber: shipment.shipmentNumber,
                              })
                            }
                            title="Konfirmasi Serah Terima (POD)"
                            className="p-1.5 text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-lg transition-colors border border-emerald-200"
                          >
                            <CheckCircle size={16} weight="bold" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                  <Truck size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-sm">Tidak ada Surat Jalan yang ditemukan</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Surat Jalan diterbitkan dari halaman rincian pesanan pelanggan.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredShipments.map((shipment) => {
          const isDelivered = shipment.status === 'Delivered';
          const isPreparing = shipment.status === 'Preparing';

          return (
            <div
              key={shipment.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {shipment.shipmentNumber}
                  </span>
                  <div className="text-[11px] text-slate-400">
                    {formatDate(shipment.createdAt)}
                  </div>
                </div>
                {getStatusBadge(shipment.status)}
              </div>

              <div className="text-xs space-y-1">
                <p className="text-slate-700">
                  Pesanan:{' '}
                  <Link
                    to={`/dashboard/orders/${shipment.orderId}`}
                    className="font-bold text-primary-600"
                  >
                    {shipment.order?.orderNumber}
                  </Link>
                </p>
                <p className="text-slate-700">
                  Penerima: <strong>{shipment.recipientName}</strong>
                </p>
                <p className="text-slate-500 text-[11px] truncate">
                  Alamat: {shipment.deliveryAddress}
                </p>
                <p className="text-slate-500 text-[11px]">
                  Armada: {shipment.carrier} {shipment.driverName ? `• ${shipment.driverName}` : ''}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onViewSuratJalan(shipment.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                >
                  <Printer size={14} /> Surat Jalan
                </button>

                {canManage && isPreparing && (
                  <button
                    onClick={() => onUpdateStatus(shipment.id, 'In_Transit')}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1"
                  >
                    <Truck size={14} /> Kirim
                  </button>
                )}

                {canManage && !isDelivered && (
                  <button
                    onClick={() =>
                      onConfirmDelivery({
                        id: shipment.id,
                        shipmentNumber: shipment.shipmentNumber,
                      })
                    }
                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle size={14} /> Konfirmasi POD
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
