import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { 
  Truck, 
  User, 
  Package, 
  CheckCircle, 
  FileText, 
  ArrowSquareOut
} from '@phosphor-icons/react';
import { SuratJalanModal } from './SuratJalanModal';

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string;
}

interface ItemDispatchSummary {
  orderItemId: string;
  productId: string;
  productName: string;
  orderedQuantity: number;
  shippedQuantity: number;
  remainingQuantity: number;
  unitOfMeasure: string;
}

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  orderId,
}) => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [orderNumber, setOrderNumber] = useState('');
  const [existingShipments, setExistingShipments] = useState<any[]>([]);
  const [activeSuratJalanId, setActiveSuratJalanId] = useState<string | null>(null);

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [carrier, setCarrier] = useState('Armada Sendiri MKP');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<ItemDispatchSummary[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    Record<string, { selected: boolean; quantity: number }>
  >({});

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDispatchData();
    }
  }, [isOpen, orderId]);

  const fetchOrderDispatchData = async () => {
    setFetching(true);
    try {
      const response = await api.get(`/api/v1/orders/${orderId}/shipments`);
      const data = response.data;

      setOrderNumber(data.orderNumber || '');
      setExistingShipments(data.shipments || []);

      setRecipientName(data.customer?.companyName || '');
      setRecipientPhone(data.customer?.phone || '');
      setDeliveryAddress(data.customer?.address || '');

      setItems(data.itemDispatchSummary || []);

      const initialSelected: Record<string, { selected: boolean; quantity: number }> = {};
      for (const item of data.itemDispatchSummary || []) {
        if (item.remainingQuantity > 0) {
          initialSelected[item.orderItemId] = {
            selected: true,
            quantity: item.remainingQuantity,
          };
        } else {
          initialSelected[item.orderItemId] = {
            selected: false,
            quantity: 0,
          };
        }
      }
      setSelectedItems(initialSelected);
    } catch (err: any) {
      toastError(
        'Gagal Memuat Data Pengiriman',
        err.response?.data?.message || 'Tidak dapat memuat detail item pesanan.',
      );
      onClose();
    } finally {
      setFetching(false);
    }
  };

  const handleToggleSelect = (orderItemId: string) => {
    setSelectedItems((prev) => {
      const current = prev[orderItemId];
      const item = items.find((i) => i.orderItemId === orderItemId);
      if (!item || item.remainingQuantity <= 0) return prev;
      return {
        ...prev,
        [orderItemId]: {
          selected: !current?.selected,
          quantity: !current?.selected ? item.remainingQuantity : 0,
        },
      };
    });
  };

  const handleQuantityChange = (orderItemId: string, val: number) => {
    const item = items.find((i) => i.orderItemId === orderItemId);
    const maxQty = item?.remainingQuantity || 0;
    const clampedQty = Math.max(1, Math.min(val, maxQty));

    setSelectedItems((prev) => ({
      ...prev,
      [orderItemId]: {
        selected: true,
        quantity: clampedQty,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dispatchItems = Object.entries(selectedItems)
      .filter(([_, val]) => val.selected && val.quantity > 0)
      .map(([orderItemId, val]) => ({
        orderItemId,
        quantity: val.quantity,
      }));

    if (dispatchItems.length === 0) {
      toastError('Item Kosong', 'Pilih minimal 1 item barang yang akan dikirim.');
      return;
    }

    if (!recipientName.trim() || !deliveryAddress.trim()) {
      toastError('Form Belum Lengkap', 'Nama penerima dan alamat pengiriman wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orderId,
        recipientName,
        recipientPhone: recipientPhone || undefined,
        deliveryAddress,
        carrier,
        driverName: driverName || undefined,
        driverPhone: driverPhone || undefined,
        vehicleNumber: vehicleNumber || undefined,
        trackingNumber: trackingNumber || undefined,
        notes: notes || undefined,
        items: dispatchItems,
      };

      const response = await api.post('/api/v1/shipments', payload);
      success(
        'Surat Jalan Diterbitkan',
        `Surat Jalan ${response.data.shipmentNumber} berhasil dibuat untuk pengiriman ini.`,
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      toastError(
        'Gagal Menerbitkan Surat Jalan',
        err.response?.data?.message || 'Terjadi kesalahan saat memproses pengiriman.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isOrderFullyShipped = items.length > 0 && items.every((i) => i.remainingQuantity <= 0);
  const selectedCount = Object.values(selectedItems).filter((v) => v.selected && v.quantity > 0).length;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isOrderFullyShipped ? `Detail Pengiriman & Surat Jalan - ${orderNumber}` : `Buat Surat Jalan & Pengiriman Parsial - ${orderNumber}`}
        size="3xl"
      >
        {fetching ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              
              {/* Order Full Shipped Banner */}
              {isOrderFullyShipped && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3.5">
                  <CheckCircle size={24} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-emerald-900">
                      Seluruh Item Pesanan Sudah Diterbitkan Surat Jalan & Dikirim
                    </h4>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      Kuantitas seluruh item pesanan ini ({items.map(i => `${i.productName}: ${i.shippedQuantity}/${i.orderedQuantity} ${i.unitOfMeasure}`).join(', ')}) telah terkirim penuh. Tidak ada sisa item yang perlu diterbitkan Surat Jalan baru lagi. Anda dapat melihat atau mencetak dokumen Surat Jalan yang telah diterbitkan di bawah ini.
                    </p>
                  </div>
                </div>
              )}

              {/* Partial Dispatch Notice if there are existing shipments AND still items remaining */}
              {!isOrderFullyShipped && existingShipments.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3">
                  <Truck size={20} weight="fill" className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs text-blue-900">
                    <span className="font-bold">Pengiriman Bertahap (Termin): </span>
                    Pesanan ini telah memiliki {existingShipments.length} Surat Jalan sebelumnya. Formulir di bawah ini adalah untuk menerbitkan Surat Jalan untuk termin sisa kuantitas.
                  </div>
                </div>
              )}

              {/* Items Table Section */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Package size={16} />
                    Status Kuantitas & Termin Kirim Item
                  </label>
                  <span className="text-xs text-slate-500">
                    {isOrderFullyShipped ? 'Semua kuantitas telah terkirim 100%' : 'Mendukung pengiriman bertahap (partial dispatch)'}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
                  <table className="w-full min-w-[620px] text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase">
                      <tr>
                        <th className="py-2.5 px-3 w-14 text-center">Status</th>
                        <th className="py-2.5 px-3 min-w-[160px]">Nama Produk</th>
                        <th className="py-2.5 px-3 text-center w-24">Total Pesan</th>
                        <th className="py-2.5 px-3 text-center w-24">Sudah Kirim</th>
                        <th className="py-2.5 px-3 text-center w-28">Sisa Kirim</th>
                        <th className="py-2.5 px-3 text-right w-36">Kirim Termin Ini</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => {
                        const isSelected = selectedItems[item.orderItemId]?.selected || false;
                        const sendQty = selectedItems[item.orderItemId]?.quantity || 0;
                        const isFullyShipped = item.remainingQuantity <= 0;

                        return (
                          <tr
                            key={item.orderItemId}
                            className={`${
                              isFullyShipped
                                ? 'bg-slate-50/70'
                                : isSelected
                                ? 'bg-blue-50/30'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              {isFullyShipped ? (
                                <span
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold shadow-2xs"
                                  title="Item ini sudah terkirim penuh"
                                >
                                  ✓
                                </span>
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelect(item.orderItemId)}
                                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                />
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              <div>{item.productName}</div>
                              {isFullyShipped && (
                                <span className="text-[10px] text-emerald-700 font-medium">
                                  ✓ Kuota pengiriman selesai
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-medium text-slate-700">
                              {item.orderedQuantity.toLocaleString('id-ID')} {item.unitOfMeasure}
                            </td>
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                              {item.shippedQuantity.toLocaleString('id-ID')} {item.unitOfMeasure}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isFullyShipped ? (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  0 (Lunas)
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                                  {item.remainingQuantity.toLocaleString('id-ID')} {item.unitOfMeasure}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {isFullyShipped ? (
                                <span className="text-[11px] text-slate-400 font-medium italic">
                                  Sudah Terkirim
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  <input
                                    type="number"
                                    disabled={!isSelected}
                                    min={1}
                                    max={item.remainingQuantity}
                                    value={isSelected ? sendQty : ''}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        item.orderItemId,
                                        parseInt(e.target.value, 10) || 0,
                                      )
                                    }
                                    className="w-20 text-right py-1 px-2 text-xs rounded-md border border-slate-300 focus:border-slate-900 focus:ring-slate-900 disabled:bg-slate-100"
                                  />
                                  <span className="text-[11px] text-slate-500">{item.unitOfMeasure}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Existing Shipments List */}
              {existingShipments.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Truck size={15} />
                      Riwayat Surat Jalan Terbit ({existingShipments.length})
                    </h4>
                    <span className="text-[11px] text-slate-500">Klik untuk melihat atau mencetak dokumen</span>
                  </div>

                  <div className="space-y-2.5">
                    {existingShipments.map((shipment) => (
                      <div
                        key={shipment.id}
                        className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              {shipment.shipmentNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                shipment.status === 'Delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : shipment.status === 'Shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {shipment.status === 'Delivered'
                                ? 'Diterima Customer (POD)'
                                : shipment.status === 'Shipped'
                                ? 'Dalam Pengiriman'
                                : shipment.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Armada: <span className="font-semibold text-slate-800">{shipment.carrier}</span>
                            {shipment.driverName ? ` • Driver: ${shipment.driverName}` : ''}
                            {shipment.vehicleNumber ? ` (${shipment.vehicleNumber})` : ''}
                          </p>
                          {shipment.deliveredAt && (
                            <p className="text-[10px] text-emerald-700 font-medium">
                              ✓ Diterima oleh: {shipment.receivedBy || shipment.recipientName} pada{' '}
                              {new Date(shipment.deliveredAt).toLocaleString('id-ID', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveSuratJalanId(shipment.id)}
                            className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <FileText size={14} weight="bold" />
                            Lihat / Cetak Dokumen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Input Section for New Dispatch (Only when not fully shipped) */}
              {!isOrderFullyShipped && (
                <>
                  {/* Recipient Information */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <User size={15} />
                      Informasi Penerima / Alamat Kirim
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-1">
                          Nama Penerima / Perusahaan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full text-xs rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                          placeholder="Nama penerima / PT tujuan"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">No. Telepon Penerima</label>
                        <input
                          type="text"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          className="w-full text-xs rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                          placeholder="+62 812-xxxx-xxxx"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-slate-600 mb-1">
                          Alamat Lengkap Pengiriman <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full text-xs rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                          placeholder="Gedung, Jalan, Nomor, Kelurahan, Kecamatan, Kota, Kode Pos"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logistic & Courier Information */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Truck size={15} />
                      Ekspedisi & Armada Pengiriman
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 mb-1">Kurir / Metode</label>
                        <select
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="w-full text-xs rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                        >
                          <option value="Armada Sendiri MKP">Armada Sendiri MKP</option>
                          <option value="Lalamove">Lalamove</option>
                          <option value="Deliveree">Deliveree</option>
                          <option value="JNE Trucking / Cargo">JNE Trucking / Cargo</option>
                          <option value="SiCepat Cargo">SiCepat Cargo</option>
                          <option value="Ambil Sendiri di Gudang">Ambil Sendiri di Gudang</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">Nama Supir / Driver</label>
                        <input
                          type="text"
                          value={driverName}
                          onChange={(e) => setDriverName(e.target.value)}
                          className="w-full text-xs rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                          placeholder="Contoh: Pak Supri"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">No. HP Driver (Opsional)</label>
                        <input
                          type="tel"
                          value={driverPhone}
                          onChange={(e) => setDriverPhone(e.target.value)}
                          className="w-full text-xs rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                          placeholder="0812xxxx"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">Plat Nomor / No. Polisi</label>
                        <input
                          type="text"
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                          className="w-full text-xs rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                          placeholder="B 1234 MKP"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">No. Resi / AWB (Opsional)</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full text-xs rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                          placeholder="Nomor resi kurir"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-3">
                        <label className="block text-slate-600 mb-1">Catatan Pengiriman</label>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full text-xs rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900"
                          placeholder="Instruksi penanganan, nomor pintu bongkar muat, dsb."
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              {isOrderFullyShipped ? (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                    <CheckCircle size={16} weight="fill" className="text-emerald-600" />
                    <span>Seluruh pengiriman telah selesai</span>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(`/dashboard/orders/${orderId}`);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowSquareOut size={14} weight="bold" />
                      Detail Pesanan
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      Tutup
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || selectedCount === 0}
                    className="px-6 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
                  >
                    <Truck size={16} />
                    {loading ? 'Menerbitkan...' : `Terbitkan Surat Jalan (${selectedCount} Item)`}
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </Modal>

      {/* Embedded Surat Jalan Preview Modal */}
      {activeSuratJalanId && (
        <SuratJalanModal
          isOpen={!!activeSuratJalanId}
          shipmentId={activeSuratJalanId}
          onClose={() => setActiveSuratJalanId(null)}
        />
      )}
    </>
  );
};
