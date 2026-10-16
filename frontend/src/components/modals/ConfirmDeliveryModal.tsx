import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import {
  CheckCircle,
  UserCheck,
  CalendarBlank,
  NotePencil,
  ShieldCheck,
  Eraser,
  PenNib,
  Camera,
  Image as ImageIcon,
} from '@phosphor-icons/react';

interface ConfirmDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shipmentId: string | null;
  shipmentNumber?: string;
}

export const ConfirmDeliveryModal: React.FC<ConfirmDeliveryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  shipmentId,
  shipmentNumber,
}) => {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  // Form states
  const [receivedBy, setReceivedBy] = useState('');
  const [deliveredAt, setDeliveredAt] = useState(() => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [podNotes, setPodNotes] = useState('');
  const [confirmedByPIC, setConfirmedByPIC] = useState(false);

  // Signature states
  const [signatureMode, setSignatureMode] = useState<'canvas' | 'upload'>('canvas');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  // Reset states when modal opens
  useEffect(() => {
    if (isOpen) {
      setReceivedBy('');
      setPodNotes('');
      setConfirmedByPIC(false);
      setHasDrawn(false);
      setUploadedPhotoUrl(null);
      setSignatureMode('canvas');

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      setDeliveredAt(
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`,
      );

      // Clean canvas if present
      setTimeout(() => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      }, 50);
    }
  }, [isOpen]);

  const getCanvasPos = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX =
      'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // slate-900
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getCanvasPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastError('Format Tidak Didukung', 'Harap unggah berkas foto berupa JPG, PNG, atau WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastError('Ukuran Terlalu Besar', 'Maksimal ukuran foto adalah 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedPhotoUrl(dataUrl);
      setHasDrawn(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shipmentId) return;

    if (!receivedBy.trim()) {
      toastError('Data Tidak Lengkap', 'Nama penerima / PIC di lokasi wajib diisi.');
      return;
    }

    if (!confirmedByPIC) {
      toastError('Konfirmasi Dibutuhkan', 'Harap centang verifikasi fisik serah terima barang.');
      return;
    }

    let finalSignature: string | undefined = undefined;
    if (signatureMode === 'canvas' && hasDrawn && canvasRef.current) {
      finalSignature = canvasRef.current.toDataURL('image/png');
    } else if (signatureMode === 'upload' && uploadedPhotoUrl) {
      finalSignature = uploadedPhotoUrl;
    } else {
      finalSignature = `Confirmed by PIC: ${receivedBy.trim()} at ${new Date().toISOString()}`;
    }

    setLoading(true);
    try {
      await api.patch(`/api/v1/shipments/${shipmentId}/confirm-delivery`, {
        receivedBy: receivedBy.trim(),
        deliveredAt: deliveredAt ? new Date(deliveredAt).toISOString() : new Date().toISOString(),
        podNotes: podNotes.trim() || undefined,
        podSignature: finalSignature,
      });

      success(
        'Pengiriman Diterima (POD)',
        `Surat Jalan ${shipmentNumber || ''} berhasil dikonfirmasi serah terimanya.`,
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal mengonfirmasi serah terima pengiriman.';
      toastError('Gagal Konfirmasi', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Konfirmasi Penerimaan (POD) - ${shipmentNumber || 'Surat Jalan'}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner Informational */}
        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/90 flex items-start gap-3">
          <ShieldCheck size={22} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-950 leading-relaxed">
            <p className="font-bold">Proof of Delivery (POD) & Tanda Tangan Digital</p>
            <p className="mt-0.5 text-emerald-800">
              Konfirmasi ini memverifikasi bahwa pesanan fisik telah sampai dan diterima dengan baik oleh pihak klien.
              Bila seluruh item pesanan telah terpenuhi, status order otomatis menjadi <strong>Delivered</strong>.
            </p>
          </div>
        </div>

        {/* Receiver Name & Timestamp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <UserCheck size={16} className="text-slate-500" />
              Nama Penerima / PIC Klien <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bpk. Bambang Sutrisno (Head of Warehouse)"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CalendarBlank size={16} className="text-slate-500" />
              Waktu Serah Terima
            </label>
            <input
              type="datetime-local"
              value={deliveredAt}
              onChange={(e) => setDeliveredAt(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Digital Signature Pad / Photo Upload Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <PenNib size={16} className="text-slate-500" />
              Tanda Tangan / Bukti Fisik Penerimaan
            </label>

            {/* Toggle Switch: Draw vs Upload */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setSignatureMode('canvas')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  signatureMode === 'canvas'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <PenNib size={12} weight="bold" />
                Tanda Tangan Digital
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('upload')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  signatureMode === 'upload'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Camera size={12} weight="bold" />
                Unggah Foto / Berita Acara
              </button>
            </div>
          </div>

          {signatureMode === 'canvas' ? (
            <div className="space-y-1.5">
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                <canvas
                  ref={canvasRef}
                  width={560}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 cursor-crosshair touch-none bg-white block"
                />

                {!hasDrawn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 select-none">
                    <PenNib size={24} className="mb-1 opacity-40" />
                    <p className="text-xs font-medium">Beri tanda tangan di area ini</p>
                    <p className="text-[10px] text-slate-400">Gunakan mouse, stylus, atau sentuhan jari</p>
                  </div>
                )}

                {hasDrawn && (
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="absolute top-2 right-2 px-2 py-1 bg-slate-800/80 hover:bg-slate-900 text-white text-[10px] font-semibold rounded-lg flex items-center gap-1 shadow-xs transition-colors backdrop-blur-xs"
                  >
                    <Eraser size={12} />
                    Ulang
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                Tanda tangan digital ini akan otomatis diabadikan pada lembar Surat Jalan resmi.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {uploadedPhotoUrl ? (
                <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-50 p-2 text-center">
                  <img
                    src={uploadedPhotoUrl}
                    alt="Bukti Serah Terima"
                    className="max-h-40 mx-auto rounded-lg object-contain shadow-xs border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setUploadedPhotoUrl(null)}
                    className="mt-2 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 font-semibold rounded-lg border border-red-200 transition-colors inline-flex items-center gap-1"
                  >
                    <Eraser size={12} />
                    Hapus & Ganti Foto
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-emerald-50/20 cursor-pointer transition-all">
                  <ImageIcon size={28} className="text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700">
                    Klik untuk memilih foto bukti penerimaan
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Format JPG, PNG, atau WEBP (Maksimal 5 MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Delivery Condition Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <NotePencil size={16} className="text-slate-500" />
            Catatan Kondisi Barang / Keterangan Tambahan
          </label>
          <textarea
            rows={2}
            placeholder="Contoh: Barang diterima 10 box dalam kondisi tersegel baik, packaging rapi, kuantitas lengkap."
            value={podNotes}
            onChange={(e) => setPodNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Verification Checkbox */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedByPIC}
              onChange={(e) => setConfirmedByPIC(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-700 font-medium leading-relaxed">
              Saya menyatakan bahwa barang cetakan fisik pada Surat Jalan ini telah diverifikasi, dicek kuantitasnya, dan resmi diserahterimakan kepada pihak penerima.
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
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
            disabled={loading || !receivedBy.trim() || !confirmedByPIC}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-2 shadow-xs transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </span>
            ) : (
              <>
                <CheckCircle size={16} weight="bold" />
                Konfirmasi Serah Terima (POD)
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
