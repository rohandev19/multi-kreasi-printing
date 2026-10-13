import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { Printer, CheckCircle, WarningOctagon } from '@phosphor-icons/react';

interface SuratJalanModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string | null;
}

export const SuratJalanModal: React.FC<SuratJalanModalProps> = ({
  isOpen,
  onClose,
  shipmentId,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && shipmentId) {
      fetchShipmentDetails();
    } else {
      setData(null);
    }
  }, [isOpen, shipmentId]);

  const fetchShipmentDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/v1/shipments/${shipmentId}`);
      setData(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Gagal memuat dokumen Surat Jalan.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
    }).format(new Date(dateStr));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dokumen Resmi Surat Jalan" size="3xl">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-red-600 flex items-center gap-2">
          <WarningOctagon size={18} />
          <span>{error}</span>
        </div>
      ) : data ? (
        <div className="p-4 sm:p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Printable Document Sheet Container */}
          <div
            id="printable-surat-jalan"
            className="bg-white p-6 sm:p-8 border border-slate-300 rounded-xl shadow-xs text-slate-800 text-xs font-sans space-y-5 w-full"
          >
            {/* Header: Company & Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-4 gap-4">
              <div>
                <h1 className="text-lg font-black tracking-wider uppercase text-slate-900">
                  {data.company.name}
                </h1>
                <p className="text-[11px] text-slate-600 font-medium">
                  {data.company.tagline}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {data.company.address}
                </p>
                <p className="text-[11px] text-slate-500">
                  Telp: {data.company.phone} | Email: {data.company.email}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="inline-block bg-slate-900 text-white font-bold text-sm px-3 py-1 rounded">
                  SURAT JALAN
                </span>
                <p className="font-mono font-bold text-xs mt-1 text-slate-900">
                  {data.shipment.shipmentNumber}
                </p>
                <p className="text-[11px] text-slate-500">
                  Tanggal: {formatDate(data.shipment.createdAt)}
                </p>
              </div>
            </div>

            {/* Document Meta Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="space-y-1">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                  Tujuan Pengiriman (Kepada):
                </p>
                <p className="font-bold text-xs text-slate-900">
                  {data.shipment.recipientName}
                </p>
                {data.shipment.recipientPhone && (
                  <p className="text-[11px] text-slate-600">
                    Telp: {data.shipment.recipientPhone}
                  </p>
                )}
                <p className="text-[11px] text-slate-700 whitespace-pre-line">
                  {data.shipment.deliveryAddress}
                </p>
              </div>

              <div className="space-y-1 sm:text-right">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                  Referensi & Ekspedisi:
                </p>
                <p className="text-[11px]">
                  <span className="text-slate-500">No. Order: </span>
                  <span className="font-bold font-mono">{data.order.orderNumber}</span>
                </p>
                {data.order.customerPoNumber && (
                  <p className="text-[11px]">
                    <span className="text-slate-500">No. PO Klien: </span>
                    <span className="font-bold font-mono text-slate-900">
                      {data.order.customerPoNumber}
                    </span>
                  </p>
                )}
                <p className="text-[11px]">
                  <span className="text-slate-500">Armada / Kurir: </span>
                  <span className="font-semibold">{data.shipment.carrier}</span>
                </p>
                {(data.shipment.driverName || data.shipment.vehicleNumber) && (
                  <p className="text-[11px] text-slate-600">
                    Driver: {data.shipment.driverName || '-'} ({data.shipment.vehicleNumber || '-'})
                  </p>
                )}
                {data.shipment.trackingNumber && (
                  <p className="text-[11px]">
                    <span className="text-slate-500">Resi / AWB: </span>
                    <span className="font-mono">{data.shipment.trackingNumber}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-300 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center border-r border-slate-300">No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 min-w-[160px]">Nama Barang / Deskripsi</th>
                    <th className="py-2.5 px-3 w-28 text-center border-r border-slate-300">
                      Kuantitas
                    </th>
                    <th className="py-2.5 px-3 w-20 text-center border-r border-slate-300">Satuan</th>
                    <th className="py-2.5 px-3 min-w-[100px]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.items.map((item: any, idx: number) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-center border-r border-slate-200 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-900">
                        {item.productName}
                        {item.sku && (
                          <span className="block text-[10px] text-slate-500 font-mono">
                            SKU: {item.sku}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 font-bold text-slate-900">
                        {item.quantity.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 text-slate-600">
                        {item.unitOfMeasure}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                  <tr>
                    <td colSpan={2} className="py-2 px-3 text-right border-r border-slate-300">
                      Total Barang Dikirim:
                    </td>
                    <td className="py-2 px-3 text-center border-r border-slate-300 text-slate-900">
                      {data.totalQuantity.toLocaleString('id-ID')}
                    </td>
                    <td colSpan={2} className="py-2 px-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Delivery Notes */}
            {data.shipment.notes && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
                <span className="font-bold text-slate-800">Catatan Khusus: </span>
                {data.shipment.notes}
              </div>
            )}

            {/* Proof of Delivery Info if already received */}
            {data.shipment.status === 'Delivered' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} weight="fill" className="text-emerald-600" />
                  <span>
                    Barang telah diterima oleh <strong className="font-bold">{data.shipment.receivedBy}</strong> pada{' '}
                    {formatDate(data.shipment.deliveredAt)}
                  </span>
                </div>
                {data.shipment.podNotes && (
                  <span className="text-[11px] text-emerald-700 italic">
                    "{data.shipment.podNotes}"
                  </span>
                )}
              </div>
            )}

            {/* Signature Columns (3 Columns: Gudang, Driver, Penerima) */}
            <div className="pt-4 border-t border-slate-200">
              <div className="grid grid-cols-3 gap-6 text-center text-[11px]">
                <div className="space-y-14">
                  <p className="font-bold text-slate-700">Diserahkan Oleh (Gudang):</p>
                  <div>
                    <div className="w-3/4 mx-auto border-b border-slate-400"></div>
                    <p className="text-[10px] text-slate-500 mt-1">Multi Kreasi Printing</p>
                  </div>
                </div>

                <div className="space-y-14">
                  <p className="font-bold text-slate-700">Dibawa Oleh (Driver/Kurir):</p>
                  <div>
                    <div className="w-3/4 mx-auto border-b border-slate-400"></div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {data.shipment.driverName || 'Petugas Pengiriman'}
                    </p>
                  </div>
                </div>

                <div className="space-y-14">
                  <p className="font-bold text-slate-700">Diterima Oleh (Customer):</p>
                  <div>
                    <div className="w-3/4 mx-auto border-b border-slate-400"></div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {data.shipment.receivedBy || 'Tanda Tangan & Cap'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <p className="text-[10px] text-slate-400 text-center italic border-t border-slate-100 pt-2">
              Barang yang telah diterima dan ditandatangani dianggap telah sesuai dengan spesifikasi dan dalam kondisi baik.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Printer size={16} />
              Cetak Dokumen Surat Jalan
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
