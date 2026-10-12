import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import {
  CheckCircle,
  XCircle,
  FilePdf,
  WarningCircle,
  Eye,
  DownloadSimple,
  ShieldCheck,
  Scales,
  ArrowsClockwise,
  Info,
} from '@phosphor-icons/react';
import { ColorBar, CropMarks, RegistrationMark } from '../home/PrintMarks';

export interface ProofItem {
  id: string;
  orderId: string;
  version: number;
  fileUrl: string;
  fileName?: string;
  notes?: string | null;
  status: 'Pending_Approval' | 'Approved' | 'Rejected' | string;
  approvedAt?: string | null;
  approvalNotes?: string | null;
  rejectionReason?: string | null;
  signerIp?: string | null;
  createdAt: string;
  createdBy?: {
    fullName?: string;
    email?: string;
  };
  approvedBy?: {
    fullName?: string;
    email?: string;
  };
}

interface ProofReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proof: ProofItem | null;
  orderNumber?: string;
  canSign?: boolean;
  onSuccess?: () => void;
}

export const ProofReviewModal: React.FC<ProofReviewModalProps> = ({
  isOpen,
  onClose,
  proof,
  orderNumber,
  canSign = true,
  onSuccess,
}) => {
  const { success, error: toastError } = useToast();
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionTab, setActionTab] = useState<'view' | 'approve' | 'reject'>('view');
  const [submitting, setSubmitting] = useState(false);

  if (!proof) return null;

  const isPending = proof.status === 'Pending_Approval';
  const isApproved = proof.status === 'Approved';
  const isRejected = proof.status === 'Rejected';

  const handleApprove = async () => {
    if (!agreedToDisclaimer) {
      toastError('Persetujuan Wajib', 'Anda harus mencentang pernyataan disclaimer hukum sebelum menyetujui proof cetak.');
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/api/v1/proofs/${proof.id}/approve`, {
        agreedToDisclaimer: true,
        approvalNotes: approvalNotes.trim() || undefined,
      });
      success('Proof Disetujui (ACC Cetak)', `Bukti cetak versi ${proof.version} telah disetujui. Antrean produksi kini terbuka.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toastError('Gagal Menyetujui Proof', err.response?.data?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      toastError('Catatan Wajib', 'Mohon tuliskan rincian revisi yang diperlukan (minimal 5 karakter).');
      return;
    }

    setSubmitting(true);
    try {
      await api.patch(`/api/v1/proofs/${proof.id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });
      success('Permintaan Revisi Terkirim', `Tim pracetak kami akan segera memproses revisi bukti cetak versi ${proof.version}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toastError('Gagal Mengajukan Revisi', err.response?.data?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  const isImage = proof.fileUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(proof.fileUrl);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bukti Cetak Digital (Proof v${proof.version})`}
      size="2xl"
    >
      <div className="space-y-6 p-1 max-h-[80vh] overflow-y-auto">
        {/* Header Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-200 text-slate-800">
                PROSPECT #{orderNumber || proof.orderId}
              </span>
              <span className="text-xs font-bold text-slate-500">Versi {proof.version}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Diterbitkan: {new Date(proof.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {proof.createdBy?.fullName ? ` oleh ${proof.createdBy.fullName}` : ''}
            </p>
          </div>

          <div>
            {isPending && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <WarningCircle size={14} weight="fill" />
                Menunggu ACC Pelanggan
              </span>
            )}
            {isApproved && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle size={14} weight="fill" />
                ACC Cetak (Disetujui)
              </span>
            )}
            {isRejected && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                <XCircle size={14} weight="fill" />
                Revisi Diminta
              </span>
            )}
          </div>
        </div>

        {/* Prepress Technical Parameters & Calibration Bar */}
        <div className="bg-slate-900 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
              Prepress Calibration
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">CMYK FOGRA39</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">300 DPI</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300">Bleed 3mm</span>
          </div>
          <div className="hidden sm:block">
            <ColorBar />
          </div>
        </div>

        {/* Visual Proof Canvas with Authentic Registration Marks */}
        <div className="relative bg-[#1a1d20] rounded-2xl p-6 sm:p-10 border border-slate-700 overflow-hidden flex flex-col items-center justify-center min-h-[340px]">
          {/* Registration Marks in corners */}
          <div className="absolute top-2 left-2 text-slate-500 scale-75">
            <RegistrationMark />
          </div>
          <div className="absolute top-2 right-2 text-slate-500 scale-75">
            <RegistrationMark />
          </div>
          <div className="absolute bottom-2 left-2 text-slate-500 scale-75">
            <RegistrationMark />
          </div>
          <div className="absolute bottom-2 right-2 text-slate-500 scale-75">
            <RegistrationMark />
          </div>

          {/* Proof Content Sheet */}
          <div className="relative bg-white text-slate-900 rounded-lg shadow-2xl p-4 sm:p-6 max-w-lg w-full border-2 border-slate-200">
            <CropMarks />
            
            {isImage ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 max-h-[300px] flex items-center justify-center">
                  <img
                    src={proof.fileUrl}
                    alt={proof.fileName || `Proof v${proof.version}`}
                    className="object-contain max-h-[300px] w-full"
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-mono font-medium text-slate-600 truncate">{proof.fileName || 'proof_preview.png'}</p>
                </div>
              </div>
            ) : (
              <div className="py-8 px-4 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                  <FilePdf size={36} weight="regular" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{proof.fileName || `Proof_Cetak_v${proof.version}.pdf`}</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Berkas bukti cetak PDF beresolusi tinggi dengan profil warna CMYK dan tanda potong standar industri.
                </p>
                <div className="flex gap-2 mt-4">
                  {proof.fileUrl && (
                    <a
                      href={proof.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                    >
                      <Eye size={14} weight="bold" />
                      Buka PDF Lengkap
                    </a>
                  )}
                  {proof.fileUrl && (
                    <a
                      href={proof.fileUrl}
                      download={proof.fileName || `Proof_v${proof.version}.pdf`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      <DownloadSimple size={14} weight="bold" />
                      Unduh
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Approved Stamp Overlay */}
            {isApproved && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rotate-[-12deg] z-20">
                <div className="border-4 border-emerald-600 text-emerald-700 bg-emerald-50/90 backdrop-blur-sm rounded-xl px-6 py-3 text-center shadow-2xl tracking-wider">
                  <div className="text-xl sm:text-2xl font-black uppercase font-mono">ACC CETAK</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 border-t border-emerald-600/40 mt-1 pt-0.5">
                    SIAP PRODUKSI • SIGNED OFF
                  </div>
                </div>
              </div>
            )}

            {/* Rejected Stamp Overlay */}
            {isRejected && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rotate-[-12deg] z-20">
                <div className="border-4 border-red-600 text-red-700 bg-red-50/90 backdrop-blur-sm rounded-xl px-6 py-3 text-center shadow-2xl tracking-wider">
                  <div className="text-xl sm:text-2xl font-black uppercase font-mono">REVISI DIMINTA</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-red-800 border-t border-red-600/40 mt-1 pt-0.5">
                    PRODUKSI DITUNDA
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Designer / Prepress Notes */}
        {proof.notes && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
              <Info size={14} weight="bold" /> Catatan Pracetak & Penyesuaian Tim
            </h5>
            <p className="text-sm text-slate-800 leading-relaxed">{proof.notes}</p>
          </div>
        )}

        {/* Existing Approval / Rejection Audit Info */}
        {isApproved && (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck size={18} weight="fill" />
              Verifikasi Persetujuan Digital
            </div>
            <div className="text-xs text-emerald-900 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-emerald-200">
              <div>
                <span className="text-emerald-700 font-medium">Disetujui Oleh:</span>{' '}
                <span className="font-bold">{proof.approvedBy?.fullName || proof.approvedBy?.email || 'Pelanggan'}</span>
              </div>
              <div>
                <span className="text-emerald-700 font-medium">Waktu Persetujuan:</span>{' '}
                <span className="font-bold">
                  {proof.approvedAt ? new Date(proof.approvedAt).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              {proof.signerIp && (
                <div className="sm:col-span-2">
                  <span className="text-emerald-700 font-medium">Audit IP Address:</span>{' '}
                  <span className="font-mono">{proof.signerIp}</span> (Kepatuhan persetujuan B2B)
                </div>
              )}
              {proof.approvalNotes && (
                <div className="sm:col-span-2">
                  <span className="text-emerald-700 font-medium">Catatan ACC:</span>{' '}
                  <span className="italic">"{proof.approvalNotes}"</span>
                </div>
              )}
            </div>
          </div>
        )}

        {isRejected && (
          <div className="p-4 bg-red-50 rounded-xl border border-red-200 space-y-2">
            <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
              <XCircle size={18} weight="fill" />
              Alasan Penolakan / Permintaan Revisi
            </div>
            <p className="text-sm text-red-900 bg-white/70 p-3 rounded-lg border border-red-200 italic">
              "{proof.rejectionReason || 'Tidak ada catatan revisi terlampir.'}"
            </p>
          </div>
        )}

        {/* Interactive Action Area for Sign-off (if Pending Approval) */}
        {isPending && canSign && (
          <div className="p-5 bg-white rounded-xl border-2 border-primary-100 shadow-sm space-y-4">
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActionTab('approve')}
                className={`flex-1 py-2.5 text-sm font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
                  actionTab === 'approve' || actionTab === 'view'
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle size={18} weight="bold" />
                Setujui Proof Cetak (ACC)
              </button>
              <button
                type="button"
                onClick={() => setActionTab('reject')}
                className={`flex-1 py-2.5 text-sm font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
                  actionTab === 'reject'
                    ? 'border-red-600 text-red-700 bg-red-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ArrowsClockwise size={18} weight="bold" />
                Minta Revisi Desain
              </button>
            </div>

            {actionTab !== 'reject' ? (
              <div className="space-y-4">
                {/* Legal Disclaimer Box */}
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Scales size={20} className="text-amber-700 shrink-0 mt-0.5" weight="fill" />
                    <div>
                      <h6 className="font-bold text-amber-900 text-xs">Pernyataan Hukum Persetujuan Pracetak (B2B Sign-Off)</h6>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Dengan mencentang pernyataan di bawah ini, Anda menyatakan bahwa seluruh teks, ejaan, tata letak, warna,
                        dan ukuran pada berkas ini telah diteliti dengan seksama dan disetujui. Setelah persetujuan diberikan,
                        jadwal mesin cetak otomatis dibuka dan pelat cetak diproduksi. Kerugian akibat kesalahan yang tertera
                        pada proof yang telah disetujui bukan merupakan tanggung jawab percetakan.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 p-2.5 bg-white rounded-lg border border-amber-300/80 cursor-pointer hover:bg-amber-50/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={agreedToDisclaimer}
                      onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-amber-400 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-900 leading-snug">
                      Saya telah memeriksa bukti cetak ini secara seksama dan menyetujuinya untuk langsung diproduksi massal.
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Khusus Produksi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Contoh: Mohon pastikan hasil lipatan presisi pada garis potong..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={!agreedToDisclaimer || submitting}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={16} weight="bold" />
                    {submitting ? 'Memproses ACC...' : 'Setujui Bukti Cetak (ACC Produksi)'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rincian Revisi yang Diperlukan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Tuliskan secara spesifik bagian yang perlu diperbaiki (misal: Warna logo terlalu gelap, font alamat geser 5mm ke kanan)..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tim desainer pracetak kami akan membuat bukti cetak versi baru (v{proof.version + 1}) berdasarkan catatan ini.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActionTab('approve')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={submitting || rejectionReason.trim().length < 5}
                    className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle size={16} weight="bold" />
                    {submitting ? 'Mengirim...' : 'Kirim Catatan Revisi'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Read-only close footer if not pending or cannot sign */}
        {(!isPending || !canSign) && (
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Tutup Pratinjau
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
