import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Truck, User, Package } from '@phosphor-icons/react';

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
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

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
      return {
        ...prev,
        [orderItemId]: {
          selected: !current?.selected,
          quantity: !current?.selected ? item?.remainingQuantity || 1 : 0,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Surat Jalan & Pengiriman Parsial"
      size="lg"
    >
      {fetching ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Items Dispatch Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Package size={16} />
                  Pilih Item & Kuantitas Termin Kirim
                </label>
                <span className="text-xs text-slate-500">
                  Mendukung pengiriman bertahap (partial dispatch)
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">Pilih</th>
                      <th className="py-2.5 px-3">Nama Produk</th>
                      <th className="py-2.5 px-3 text-center">Total Pesan</th>
                      <th className="py-2.5 px-3 text-center">Sudah Kirim</th>
                      <th className="py-2.5 px-3 text-center">Sisa Kirim</th>
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
                              ? 'bg-slate-50/50 opacity-60'
                              : isSelected
                              ? 'bg-blue-50/30'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              disabled={isFullyShipped}
                              checked={isSelected}
                              onChange={() => handleToggleSelect(item.orderItemId)}
                              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {item.productName}
                          </td>
                          <td className="py-2.5 px-3 text-center font-medium">
                            {item.orderedQuantity.toLocaleString('id-ID')} {item.unitOfMeasure}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600">
                            {item.shippedQuantity.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-amber-700">
                            {item.remainingQuantity.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              disabled={!isSelected || isFullyShipped}
                              min={1}
                              max={item.remainingQuantity}
                              value={isSelected ? sendQty : ''}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.orderItemId,
                                  parseInt(e.target.value, 10) || 0,
                                )
                              }
                              className="w-24 text-right py-1 px-2 text-xs rounded-md border-slate-300 focus:border-slate-900 focus:ring-slate-900 disabled:bg-slate-100"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

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

                <div className="col-span-2">
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

                <div className="col-span-2">
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
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
            >
              <Truck size={16} />
              {loading ? 'Menerbitkan...' : 'Terbitkan Surat Jalan'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
