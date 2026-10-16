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
    <Modal isOpen={isOpen} onClose={onClose} title="Dokumen Resmi Surat Jalan" size="4xl">
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : error ? (
        <div className="p-4 text-red-600 flex items-center gap-2">
          <WarningOctagon size={18} />
          <span>{error}</span>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Printable Document Sheet Container */}
          <div
            id="printable-surat-jalan"
            className="bg-white p-6 sm:p-8 border border-slate-300 rounded-xl shadow-xs text-slate-800 text-xs font-sans space-y-6 w-full"
          >
            {/* Header: Company & Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-4 gap-4">
              <div>
                <h1 className="text-xl font-black tracking-wider uppercase text-slate-900">
                  {data.company.name}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
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
                <span className="inline-block bg-slate-900 text-white font-bold text-sm px-3.5 py-1 rounded">
                  SURAT JALAN
                </span>
                <p className="font-mono font-bold text-sm mt-1.5 text-slate-900">
                  {data.shipment.shipmentNumber}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tanggal: {formatDate(data.shipment.createdAt)}
                </p>
              </div>
            </div>

            {/* Document Meta Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="space-y-1">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                  Tujuan Pengiriman (Kepada):
                </p>
                <p className="font-bold text-sm text-slate-900">
                  {data.shipment.recipientName}
                </p>
                {data.shipment.recipientPhone && (
                  <p className="text-[11px] text-slate-600">
                    Telp: {data.shipment.recipientPhone}
                  </p>
                )}
                <p className="text-xs text-slate-700 whitespace-pre-line mt-1">
                  {data.shipment.deliveryAddress}
                </p>
              </div>

              <div className="space-y-1 sm:text-right">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                  Referensi & Ekspedisi:
                </p>
                <p className="text-xs">
                  <span className="text-slate-500">No. Order: </span>
                  <span className="font-bold font-mono text-slate-900">{data.order.orderNumber}</span>
                </p>
                {data.order.customerPoNumber && (
                  <p className="text-xs">
                    <span className="text-slate-500">No. PO Klien: </span>
                    <span className="font-bold font-mono text-slate-900">
                      {data.order.customerPoNumber}
                    </span>
                  </p>
                )}
                <p className="text-xs">
                  <span className="text-slate-500">Armada / Kurir: </span>
                  <span className="font-semibold text-slate-900">{data.shipment.carrier}</span>
                </p>
                {(data.shipment.driverName || data.shipment.vehicleNumber) && (
                  <p className="text-[11px] text-slate-600">
                    Driver: {data.shipment.driverName || '-'} ({data.shipment.vehicleNumber || '-'})
                  </p>
                )}
                {data.shipment.trackingNumber && (
                  <p className="text-xs">
                    <span className="text-slate-500">Resi / AWB: </span>
                    <span className="font-mono font-semibold">{data.shipment.trackingNumber}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-slate-300 rounded-lg overflow-x-auto bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center border-r border-slate-300">No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Nama Barang / Deskripsi</th>
                    <th className="py-2.5 px-3 w-28 text-center border-r border-slate-300">Kuantitas</th>
                    <th className="py-2.5 px-3 w-20 text-center border-r border-slate-300">Satuan</th>
                    <th className="py-2.5 px-3 w-40 text-center">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.items.map((item: any, idx: number) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-center border-r border-slate-200 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200 font-semibold text-slate-900">
                        {item.productName}
                        {item.sku && (
                          <span className="block text-[10px] text-slate-500 font-mono">
                            SKU: {item.sku}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-200 font-bold text-slate-900">
                        {item.quantity.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-200 text-slate-600">
                        {item.unitOfMeasure}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 text-[11px]">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-right border-r border-slate-300">
                      Total Barang Dikirim:
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-300 text-slate-900">
                      {data.totalQuantity.toLocaleString('id-ID')}
                    </td>
                    <td colSpan={2} className="py-2.5 px-3"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Delivery Notes */}
            {data.shipment.notes && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                <span className="font-bold text-slate-800">Catatan Khusus: </span>
                {data.shipment.notes}
              </div>
            )}

            {/* Proof of Delivery Info if already received */}
            {data.shipment.status === 'Delivered' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} weight="fill" className="text-emerald-600" />
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
            <div className="pt-6 border-t border-slate-200">
              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                <div className="flex flex-col justify-between h-36">
                  <p className="font-bold text-slate-700">Diserahkan Oleh (Gudang):</p>
                  <div className="flex-1 flex items-center justify-center my-1">
                    <span className="text-[10px] text-slate-400 font-mono italic">
                      [ Logistik Multi Kreasi ]
                    </span>
                  </div>
                  <div>
                    <div className="w-4/5 mx-auto border-b border-slate-400"></div>
                    <p className="text-[11px] text-slate-500 mt-1">Multi Kreasi Printing</p>
                  </div>
                </div>

                <div className="flex flex-col justify-between h-36">
                  <p className="font-bold text-slate-700">Dibawa Oleh (Driver/Kurir):</p>
                  <div className="flex-1 flex items-center justify-center my-1">
                    {data.shipment.driverName ? (
                      <span className="text-[10px] text-slate-600 font-medium">
                        {data.shipment.driverPhone ? `WA: ${data.shipment.driverPhone}` : ''}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        {data.shipment.carrier || 'Kurir Ekspedisi'}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="w-4/5 mx-auto border-b border-slate-400"></div>
                    <p className="text-[11px] text-slate-600 font-semibold mt-1">
                      {data.shipment.driverName || data.shipment.carrier || 'Petugas Pengiriman'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between h-36">
                  <p className="font-bold text-slate-700">Diterima Oleh (Customer):</p>
                  <div className="flex-1 flex items-center justify-center my-1">
                    {data.shipment.podSignature?.startsWith('data:image/') ? (
                      <img
                        src={data.shipment.podSignature}
                        alt="Tanda Tangan Penerima"
                        className="max-h-16 max-w-full object-contain filter contrast-125"
                      />
                    ) : data.shipment.status === 'Delivered' ? (
                      <span className="text-[10px] text-emerald-800 font-semibold px-2 py-0.5 bg-emerald-50 rounded border border-emerald-300">
                        ✓ Terverifikasi Digital
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300 italic">
                        [ Tanda tangan / Cap ]
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="w-4/5 mx-auto border-b border-slate-400"></div>
                    <p className="text-[11px] text-slate-800 font-bold mt-1">
                      {data.shipment.receivedBy || 'Nama Terang & Cap'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <p className="text-[11px] text-slate-400 text-center italic border-t border-slate-100 pt-3">
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
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
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
