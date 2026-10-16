import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import {
  Truck,
  Hash,
  User,
  Phone,
  IdentificationCard,
  CalendarBlank,
  NotePencil,
  MapPin,
  Check,
} from '@phosphor-icons/react';

interface ShipmentBasicInfo {
  id: string;
  shipmentNumber: string;
  orderId?: string;
  order?: {
    orderNumber?: string;
    customer?: {
      companyName?: string;
      name?: string;
    };
  };
  recipientName?: string;
  recipientPhone?: string | null;
  deliveryAddress?: string;
  carrier?: string;
  trackingNumber?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  vehicleNumber?: string | null;
  notes?: string | null;
  status?: string;
}

interface DispatchShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shipment: ShipmentBasicInfo | null;
  isUpdateOnly?: boolean;
}

const CARRIER_PRESETS = [
  { id: 'internal', name: 'Armada Internal MKP', isInternal: true },
  { id: 'jne', name: 'JNE Express', isInternal: false },
  { id: 'jnt', name: 'J&T Express', isInternal: false },
  { id: 'sicepat', name: 'SiCepat', isInternal: false },
  { id: 'lalamove', name: 'Lalamove', isInternal: false },
  { id: 'gosend', name: 'GoSend / GrabExpress', isInternal: false },
  { id: 'cargo', name: 'Kargo / Ekspedisi Lainnya', isInternal: false },
];

export const DispatchShipmentModal: React.FC<DispatchShipmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  shipment,
  isUpdateOnly = false,
}) => {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedCarrier, setSelectedCarrier] = useState<string>('Armada Internal MKP');
  const [customCarrier, setCustomCarrier] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [shippedAt, setShippedAt] = useState<string>(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });

  const isInternalArmada = selectedCarrier === 'Armada Internal MKP';

  useEffect(() => {
    if (shipment) {
      const existingCarrier = shipment.carrier || 'Armada Internal MKP';
      const matchedPreset = CARRIER_PRESETS.find(
        (p) => p.name.toLowerCase() === existingCarrier.toLowerCase(),
      );

      if (matchedPreset) {
        setSelectedCarrier(matchedPreset.name);
        setCustomCarrier('');
      } else {
        setSelectedCarrier('Kargo / Ekspedisi Lainnya');
        setCustomCarrier(existingCarrier);
      }

      setTrackingNumber(shipment.trackingNumber || '');
      setDriverName(shipment.driverName || '');
      setDriverPhone(shipment.driverPhone || '');
      setVehicleNumber(shipment.vehicleNumber || '');
      setNotes(shipment.notes || '');
    }
  }, [shipment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment?.id) return;

    const finalCarrier =
      selectedCarrier === 'Kargo / Ekspedisi Lainnya' && customCarrier.trim()
        ? customCarrier.trim()
        : selectedCarrier;

    if (!finalCarrier) {
      toastError('Kurir Belum Dipilih', 'Silakan tentukan ekspedisi atau kurir pengiriman.');
      return;
    }

    setLoading(true);
    try {
      if (isUpdateOnly) {
        // Update tracking endpoint
        await api.patch(`/api/v1/shipments/${shipment.id}/tracking`, {
          carrier: finalCarrier,
          trackingNumber: trackingNumber.trim() || undefined,
          driverName: driverName.trim() || undefined,
          driverPhone: driverPhone.trim() || undefined,
          vehicleNumber: vehicleNumber.trim() || undefined,
          notes: notes.trim() || undefined,
        });

        success(
          'Informasi Diperbarui',
          `Informasi kurir/resi untuk Surat Jalan ${shipment.shipmentNumber} berhasil diperbarui.`,
        );
      } else {
        // Dispatch shipment to In_Transit
        await api.patch(`/api/v1/shipments/${shipment.id}/status`, {
          status: 'In_Transit',
          carrier: finalCarrier,
          trackingNumber: trackingNumber.trim() || undefined,
          driverName: driverName.trim() || undefined,
          driverPhone: driverPhone.trim() || undefined,
          vehicleNumber: vehicleNumber.trim() || undefined,
          notes: notes.trim() || undefined,
          shippedAt: shippedAt ? new Date(shippedAt).toISOString() : new Date().toISOString(),
        });

        success(
          'Pengiriman Diberangkatkan',
          `Surat Jalan ${shipment.shipmentNumber} kini dalam status Dalam Pengiriman (In_Transit).`,
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal memproses informasi pengiriman.';
      toastError('Gagal Menyimpan', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isUpdateOnly
          ? `Perbarui Informasi Resi & Kurir - ${shipment?.shipmentNumber || ''}`
          : `Berangkatkan Pengiriman - ${shipment?.shipmentNumber || ''}`
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Destination & Order Summary Card */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-500 font-medium">No. Surat Jalan: </span>
              <span className="font-mono font-bold text-slate-900">
                {shipment?.shipmentNumber}
              </span>
            </div>
            {shipment?.order?.orderNumber && (
              <div>
                <span className="text-slate-500 font-medium">No. Order: </span>
                <span className="font-mono font-bold text-primary-700">
                  {shipment.order.orderNumber}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 pt-1.5 border-t border-slate-200/60 text-xs text-slate-700">
            <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">
                {shipment?.recipientName || 'Klien'}
              </span>
              {shipment?.recipientPhone && (
                <span className="text-slate-500 font-mono ml-1.5">
                  ({shipment.recipientPhone})
                </span>
              )}
              <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                {shipment?.deliveryAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Carrier Presets Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Truck size={16} className="text-slate-500" />
            Pilih Armada / Ekspedisi Pengiriman <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CARRIER_PRESETS.map((preset) => {
              const isSelected = selectedCarrier === preset.name;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedCarrier(preset.name)}
                  className={`p-2.5 text-xs font-semibold rounded-xl border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary-50/80 border-primary-500 text-primary-900 ring-2 ring-primary-500/20'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{preset.name}</span>
                  {isSelected && <Check size={14} weight="bold" className="text-primary-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {selectedCarrier === 'Kargo / Ekspedisi Lainnya' && (
            <div className="mt-2.5">
              <input
                type="text"
                placeholder="Ketik nama ekspedisi / armada khusus (contoh: Dakota Cargo, Wahana, Baraka)"
                value={customCarrier}
                onChange={(e) => setCustomCarrier(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none"
                required
              />
            </div>
          )}
        </div>

        {/* Dynamic Fields: Internal vs 3PL */}
        {isInternalArmada ? (
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/70 space-y-3.5">
            <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Truck size={16} className="text-blue-700" />
              Detail Driver & Armada Internal Percetakan
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User size={14} className="text-slate-400" />
                  Nama Pengemudi / Driver
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pak Joko / Mas Ilham"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone size={14} className="text-slate-400" />
                  No. HP / WhatsApp Driver
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 0812-3456-7890"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <IdentificationCard size={14} className="text-slate-400" />
                  Plat Nomor Kendaraan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: B 1234 MKP (Blind Van / Box)"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Hash size={14} className="text-slate-400" />
                  No. Referensi / Surat Tugas (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: ST-04/MKP/LOG"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-3.5">
            <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Hash size={16} className="text-amber-700" />
              Detail Resi & Tracking Kurir Pihak Ketiga (3PL)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <Hash size={14} className="text-amber-700" />
                  Nomor Resi / AWB / No. Tracking <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: JNE0192830192 / JP18274928"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono font-bold text-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <User size={14} className="text-slate-400" />
                  Nama Petugas / Driver Penjemput (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kurir Pick-Up Gerai Tomang"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Date & Additional Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <CalendarBlank size={16} className="text-slate-500" />
              Waktu Keberangkatan
            </label>
            <input
              type="datetime-local"
              value={shippedAt}
              onChange={(e) => setShippedAt(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <NotePencil size={16} className="text-slate-500" />
              Catatan Pengiriman / Instruksi
            </label>
            <input
              type="text"
              placeholder="Contoh: Barang dalam 8 kardus, jangan ditumpuk lebih dari 3 lapis."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl flex items-center gap-2 shadow-xs transition-colors ${
              isUpdateOnly
                ? 'bg-slate-900 hover:bg-slate-800'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </span>
            ) : (
              <>
                <Truck size={16} weight="bold" />
                {isUpdateOnly ? 'Simpan Perubahan Informasi Kurir/Resi' : 'Berangkatkan Pengiriman (In Transit)'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
