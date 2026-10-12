import { useState, useEffect } from 'react';
import {
  Printer,
  ShoppingBag,
  CheckCircle,
  WarningCircle,
  XCircle,
  ArrowsClockwise,
  Check,
  Buildings,
  FileText,
  ShieldCheck,
} from '@phosphor-icons/react';
import { Modal } from '../ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import { useRoleContext } from '../../contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quotationId?: string | null;
  onRefresh?: () => void;
}

export default function QuotationDetailModal({ isOpen, onClose, quotationId, onRefresh }: Props) {
  const { success, error: showError } = useToast();
  const { role } = useRoleContext();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Sub-dialogs state
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [poNumberInput, setPoNumberInput] = useState('');
  const [poFileUrlInput, setPoFileUrlInput] = useState('');
  const [customerNotesInput, setCustomerNotesInput] = useState('');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionDiscount, setRevisionDiscount] = useState<number>(0);
  const [revisionNotes, setRevisionNotes] = useState('');

  const [isManagerApprovalModalOpen, setIsManagerApprovalModalOpen] = useState(false);
  const [managerApprovalNotes, setManagerApprovalNotes] = useState('');

  useEffect(() => {
    if (isOpen && quotationId) {
      fetchQuotation();
    } else {
      setQuotation(null);
    }
  }, [isOpen, quotationId]);

  const fetchQuotation = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/quotations/${quotationId}`);
      setQuotation(res.data);
      setRevisionDiscount(Number(res.data.discountPercent || 0));
    } catch (err: any) {
      showError('Gagal memuat', err.response?.data?.message || 'Tidak dapat memuat detail penawaran.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  // Convert to Order (1-Click)
  const handleConvert = async () => {
    if (!window.confirm(`Konversi penawaran ${quotation?.quotationNumber} menjadi pesanan produksi resmi?`)) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/api/v1/quotations/${quotationId}/convert`);
      success('Pesanan Dibuat', `Penawaran berhasil dikonversi menjadi Pesanan #${res.data.orderNumber}.`);
      onRefresh?.();
      onClose();
      navigate(`/dashboard/orders/${res.data.id}`);
    } catch (err: any) {
      showError('Konversi Gagal', err.response?.data?.message || 'Gagal mengubah penawaran menjadi pesanan.');
    } finally {
      setActionLoading(false);
    }
  };

  // Manager Approve Discount
  const handleApproveDiscount = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/quotations/${quotationId}/approve-discount`, {
        notes: managerApprovalNotes,
      });
      success('Diskon Disetujui', `Diskon penawaran telah disetujui Sales Manager dan status menjadi Terkirim.`);
      setIsManagerApprovalModalOpen(false);
      fetchQuotation();
      onRefresh?.();
    } catch (err: any) {
      showError('Gagal Menyetujui', err.response?.data?.message || 'Gagal menyetujui diskon.');
    } finally {
      setActionLoading(false);
    }
  };

  // Manager Reject Discount
  const handleRejectDiscount = async () => {
    if (!rejectReasonInput.trim()) {
      showError('Alasan Diperlukan', 'Harap masukkan alasan penolakan diskon.');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/quotations/${quotationId}/reject-discount`, {
        reason: rejectReasonInput,
      });
      success('Diskon Ditolak', `Diskon penawaran telah ditolak.`);
      setIsRejectModalOpen(false);
      setRejectReasonInput('');
      fetchQuotation();
      onRefresh?.();
    } catch (err: any) {
      showError('Gagal Menolak', err.response?.data?.message || 'Gagal menolak diskon.');
    } finally {
      setActionLoading(false);
    }
  };

  // Customer Accept with PO
  const handleAcceptWithPo = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/quotations/${quotationId}/accept`, {
        poNumber: poNumberInput,
        poFileUrl: poFileUrlInput || undefined,
        notes: customerNotesInput,
      });
      success('Penawaran Disetujui', `Penawaran telah diterima dengan nomor PO ${poNumberInput || '-'}.`);
      setIsAcceptModalOpen(false);
      setPoNumberInput('');
      setPoFileUrlInput('');
      setCustomerNotesInput('');
      fetchQuotation();
      onRefresh?.();
    } catch (err: any) {
      showError('Gagal Memproses PO', err.response?.data?.message || 'Gagal menyetujui penawaran.');
    } finally {
      setActionLoading(false);
    }
  };

  // Customer / Sales Reject
  const handleRejectQuotation = async () => {
    if (!rejectReasonInput.trim()) {
      showError('Alasan Diperlukan', 'Harap masukkan alasan penolakan.');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/quotations/${quotationId}/reject`, {
        reason: rejectReasonInput,
      });
      success('Penawaran Ditolak', 'Penawaran telah ditolak.');
      setIsRejectModalOpen(false);
      setRejectReasonInput('');
      fetchQuotation();
      onRefresh?.();
    } catch (err: any) {
      showError('Gagal Menolak', err.response?.data?.message || 'Gagal menolak penawaran.');
    } finally {
      setActionLoading(false);
    }
  };

  // Create Revision
  const handleCreateRevision = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/api/v1/quotations/${quotationId}/revisions`, {
        discountPercent: Number(revisionDiscount),
        notes: revisionNotes,
      });
      success('Revisi Dibuat', `Revisi penawaran ${res.data.quotationNumber} telah diterbitkan.`);
      setIsRevisionModalOpen(false);
      setRevisionNotes('');
      onRefresh?.();
      onClose();
    } catch (err: any) {
      showError('Gagal Membuat Revisi', err.response?.data?.message || 'Gagal membuat revisi penawaran.');
    } finally {
      setActionLoading(false);
    }
  };

  const isStaffOrManager = role !== 'Customer' && role !== null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Penawaran Harga Resmi" size="2xl">
      {loading || !quotation ? (
        <div className="p-16 flex flex-col justify-center items-center h-64 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <p className="text-xs font-medium text-slate-500">Memuat rincian penawaran & verifikasi PO...</p>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-180px)]">
          
          {/* SCROLLABLE CONTENT */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* STATUS ALERT BANNERS */}
            {quotation.status === 'Pending_Manager_Approval' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <WarningCircle size={22} className="text-amber-600 shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Menunggu Otorisasi Diskon Sales Manager</h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Penawaran mencantumkan diskon <span className="font-bold">{quotation.discountPercent}%</span> ({formatCurrency(quotation.discountAmount)}). Perlu disetujui sebelum penawaran sah dikirim ke pelanggan.
                    </p>
                  </div>
                </div>
                {isStaffOrManager && (
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsManagerApprovalModalOpen(true)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} weight="bold" />
                      ACC Diskon
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRejectModalOpen(true)}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            )}

            {quotation.status === 'Accepted' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <CheckCircle size={22} className="text-emerald-600 shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Penawaran Telah Disetujui Pelanggan (PO Valid)</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Nomor PO Pelanggan: <span className="font-mono font-bold">{quotation.poNumber || 'PO Terverifikasi'}</span>
                      {quotation.customerAcceptedAt && (
                        <> • Disetujui pada {new Date(quotation.customerAcceptedAt).toLocaleString('id-ID')}</>
                      )}
                    </p>
                  </div>
                </div>
                {quotation.poFileUrl && (
                  <a
                    href={quotation.poFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-lg transition-colors"
                  >
                    <FileText size={14} weight="bold" />
                    Unduh Berkas PO
                  </a>
                )}
              </div>
            )}

            {quotation.status === 'Converted' && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={22} className="text-purple-600 shrink-0" weight="fill" />
                  <div>
                    <h4 className="text-sm font-bold text-purple-900">Telah Dikonversi Menjadi Pesanan Produksi</h4>
                    <p className="text-xs text-purple-800 mt-0.5">
                      Penawaran ini telah dikonversi ke pesanan resmi #{quotation.order?.orderNumber || quotation.orderId}.
                    </p>
                  </div>
                </div>
                {quotation.orderId && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/dashboard/orders/${quotation.orderId}`);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shrink-0"
                  >
                    Lihat Pesanan
                  </button>
                )}
              </div>
            )}

            {quotation.status === 'Rejected' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fade-in">
                <div className="flex items-start gap-3">
                  <XCircle size={22} className="text-rose-600 shrink-0 mt-0.5" weight="fill" />
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">Penawaran Ditolak</h4>
                    <p className="text-xs text-rose-800 mt-0.5">
                      Alasan: <span className="italic font-medium">{quotation.rejectionReason || 'Tidak ada alasan spesifik.'}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Buat Revisi (v{(quotation.version || 1) + 1})
                </button>
              </div>
            )}

            {/* PREPRESS & COMPANY FORMAL LETTERHEAD */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-sm print:p-0 print:border-none print:shadow-none">
              
              {/* Header MK & Nomor Quotation */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-black text-lg">
                    MK
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 leading-tight">PT Multi Kreasi Printing</h2>
                    <p className="text-xs text-slate-500 font-mono">B2B Commercial Printing & Packaging Solutions</p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end gap-2 mb-1">
                    <span className="text-lg font-mono font-extrabold text-slate-900">{quotation.quotationNumber}</span>
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      v{quotation.version || 1}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    Tanggal: {new Date(quotation.createdAt).toLocaleDateString('id-ID')} • Berlaku s.d.: {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('id-ID') : '14 Hari'}
                  </p>
                </div>
              </div>

              {/* Customer Info Box */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                    <Buildings size={14} />
                    Kepada Yth. Pelanggan
                  </h4>
                  <p className="text-sm font-bold text-slate-900">{quotation.customer?.companyName || quotation.customer?.name}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{quotation.customer?.email} • {quotation.customer?.phone || '-'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{quotation.customer?.address || 'Alamat kantor terdaftar'}</p>
                </div>

                {quotation.poNumber && (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Customer PO Ref</span>
                    <span className="text-sm font-mono font-bold text-emerald-700 block mt-0.5">{quotation.poNumber}</span>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Rincian Spesifikasi & Harga</h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 uppercase">#</th>
                        <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 uppercase">Produk & Spesifikasi</th>
                        <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-600 uppercase">Jumlah</th>
                        <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-600 uppercase">Harga Satuan</th>
                        <th className="px-4 py-2.5 text-right text-xs font-bold text-slate-600 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {quotation.items?.map((item: any, idx: number) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-xs font-mono text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{item.product?.name || 'Item Percetakan'}</div>
                            {item.notes && <div className="text-xs text-slate-500 mt-0.5">{item.notes}</div>}
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-semibold text-slate-800">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-700">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(Number(item.subtotal || item.quantity * item.unitPrice))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing Calculation Summary */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
                <div className="sm:max-w-xs space-y-2">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Catatan & Ketentuan</h5>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {quotation.notes || 'Pembayaran DP 50%, pelunasan sebelum pengiriman. Produksi dihitung sejak approval digital proof.'}
                  </p>
                </div>

                <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-900">{formatCurrency(quotation.subtotal)}</span>
                  </div>
                  {Number(quotation.discountPercent || 0) > 0 && (
                    <div className="flex justify-between items-center text-rose-600 font-medium">
                      <span>Diskon ({quotation.discountPercent}%)</span>
                      <span className="font-mono">-{formatCurrency(quotation.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-600">
                    <span>PPN (11%)</span>
                    <span className="font-mono text-slate-900">{formatCurrency(quotation.tax)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Tagihan</span>
                    <span className="text-lg font-mono font-black text-slate-900">{formatCurrency(quotation.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Manager Approval Stamp */}
              {quotation.managerApprovedAt && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-3 text-xs text-blue-900">
                  <ShieldCheck size={20} className="text-blue-600 shrink-0" weight="fill" />
                  <div>
                    <span className="font-bold">Otorisasi Diskon Manager Sah:</span> Disetujui oleh{' '}
                    <span className="font-semibold">{quotation.managerApprover?.fullName || 'Sales Manager'}</span> pada{' '}
                    {new Date(quotation.managerApprovedAt).toLocaleString('id-ID')}.
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ACTION TOOLBAR FOOTER */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Printer size={15} />
                Cetak
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Revision Option (available on Sent or Rejected) */}
              {(quotation.status === 'Sent' || quotation.status === 'Rejected') && (
                <button
                  type="button"
                  onClick={() => setIsRevisionModalOpen(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <ArrowsClockwise size={14} weight="bold" />
                  + Buat Revisi (v{(quotation.version || 1) + 1})
                </button>
              )}

              {/* Customer Actions on Sent */}
              {quotation.status === 'Sent' && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-colors"
                  >
                    Tolak Penawaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAcceptModalOpen(true)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle size={15} weight="bold" />
                    Terima & Input Customer PO
                  </button>
                </>
              )}

              {/* 1-Click Convert when Accepted */}
              {quotation.status === 'Accepted' && (
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <ShoppingBag size={16} weight="bold" />
                  {actionLoading ? 'Memproses Pesanan...' : 'Konversi ke Pesanan Produksi (1-Click)'}
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* SUB-MODAL: Accept with PO */}
      {isAcceptModalOpen && (
        <Modal isOpen={isAcceptModalOpen} onClose={() => setIsAcceptModalOpen(false)} title="Konfirmasi Penerimaan & Input PO" size="md">
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Silakan masukkan nomor Purchase Order (PO) resmi perusahaan pelanggan untuk validasi kontrak pesanan.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Purchase Order (PO) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Misal: PO/MKP/2026/0441"
                value={poNumberInput}
                onChange={(e) => setPoNumberInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL / Dokumen PO (Opsional)</label>
              <input
                type="text"
                placeholder="https://... berkas PO PDF"
                value={poFileUrlInput}
                onChange={(e) => setPoFileUrlInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan Pelanggan</label>
              <textarea
                rows={2}
                placeholder="Instruksi pengiriman atau PIC..."
                value={customerNotesInput}
                onChange={(e) => setCustomerNotesInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAcceptWithPo}
                disabled={actionLoading || !poNumberInput.trim()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Konfirmasi Penerimaan
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* SUB-MODAL: Reject / Tolak */}
      {isRejectModalOpen && (
        <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Penolakan Penawaran / Diskon" size="md">
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600">
              Harap berikan alasan penolakan untuk catatan transparansi workflow B2B.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Penolakan <span className="text-rose-500">*</span></label>
              <textarea
                rows={3}
                placeholder="Contoh: Margin di bawah batas toleransi atau penyesuaian harga pasar..."
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={quotation?.status === 'Pending_Manager_Approval' ? handleRejectDiscount : handleRejectQuotation}
                disabled={actionLoading || !rejectReasonInput.trim()}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Tolak Penawaran
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* SUB-MODAL: Manager Approval Notes */}
      {isManagerApprovalModalOpen && (
        <Modal isOpen={isManagerApprovalModalOpen} onClose={() => setIsManagerApprovalModalOpen(false)} title="Otorisasi Diskon Sales Manager" size="md">
          <div className="p-6 space-y-4">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              Anda menyetujui diskon sebesar <span className="font-bold">{quotation?.discountPercent}%</span> ({formatCurrency(quotation?.discountAmount)}). Status penawaran akan diubah menjadi <span className="font-bold">Terkirim</span>.
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Persetujuan Manager (Opsional)</label>
              <textarea
                rows={2}
                placeholder="Disetujui untuk kontrak volume tahunan..."
                value={managerApprovalNotes}
                onChange={(e) => setManagerApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsManagerApprovalModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApproveDiscount}
                disabled={actionLoading}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Setujui Diskon
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* SUB-MODAL: Create Revision */}
      {isRevisionModalOpen && (
        <Modal isOpen={isRevisionModalOpen} onClose={() => setIsRevisionModalOpen(false)} title={`Buat Revisi Penawaran (v${(quotation?.version || 1) + 1})`} size="md">
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan meng-clone rincian item ke versi baru ({quotation?.quotationNumber.replace(/-R\d+$/, '')}-R{(quotation?.version || 1) + 1}) dengan penyesuaian diskon dan ketentuan.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Persentase Diskon Baru (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={revisionDiscount}
                onChange={(e) => setRevisionDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-slate-900"
              />
              {revisionDiscount > 10 && (
                <p className="text-[11px] text-amber-700 mt-1 font-medium">
                  ⚠️ Diskon &gt; 10% akan memerlukan persetujuan Manager kembali pada draf revisi ini.
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Revisi</label>
              <textarea
                rows={2}
                placeholder="Penyesuaian kuantiti dan kesepakatan harga..."
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRevisionModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateRevision}
                disabled={actionLoading}
                className="px-5 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Terbitkan Revisi v{(quotation?.version || 1) + 1}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </Modal>
  );
}
