import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Copy, 
  CloudArrowUp, 
  CheckCircle, 
  WarningCircle, 
  Clock, 
  Buildings, 
  CreditCard,
  ArrowLeft,
  DownloadSimple,
  Package,
  ArrowsClockwise
} from '@phosphor-icons/react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../api/axios';

export const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [showReupload, setShowReupload] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const amount = orderDetails?.totalAmount ? Number(orderDetails.totalAmount) : 0;
  const orderNumber = orderDetails?.orderNumber || orderId;
  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/api/v1/my-orders/${orderId}`);
        setOrderDetails(res.data);
      } catch (err: any) {
        console.error(err);
        error('Gagal Memuat Pesanan', err.response?.data?.message || 'Pesanan tidak ditemukan');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId, error]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    success('Berhasil Disalin!', `${type} telah disalin ke clipboard.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleDownloadInvoice = async () => {
    if (!orderId) return;
    setDownloadingInvoice(true);
    try {
      const res = await api.get(`/api/v1/my-orders/${orderId}/invoice`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${orderNumber}.txt`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      success('Invoice Berhasil Diunduh', `Invoice #${orderNumber} tersimpan.`);
    } catch (err: any) {
      error('Gagal Mengunduh', err.response?.data?.message || 'Invoice belum tersedia.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const submitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      error('Unggah Bukti Diperlukan', 'Silakan lampirkan foto struk atau bukti transfer bank Anda.');
      return;
    }
    
    setUploading(true);
    
    try {
      await api.post(`/api/v1/my-orders/${orderId}/payment-proof`, {});

      setUploading(false);
      success('Bukti Berhasil Dikirim!', 'Tim finance kami akan memverifikasi pembayaran Anda.');
      navigate('/dashboard/my-orders');
    } catch (err: any) {
      setUploading(false);
      console.error(err);
      error('Gagal Mengunggah', err.response?.data?.message || 'Terjadi kesalahan saat mengunggah bukti');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="text-sm text-slate-500">Memuat rincian instruksi pembayaran...</p>
      </div>
    );
  }

  const isPending = orderDetails?.status === 'Pending' || orderDetails?.status === 'Pending_Approval';
  const isPaid = orderDetails?.paymentStatus === 'Paid' || ['Approved', 'In_Production', 'Quality_Check', 'Completed', 'Delivered'].includes(orderDetails?.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* Back button & Title */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/my-orders')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-3 transition-colors"
        >
          <ArrowLeft size={16} weight="bold" /> Kembali ke Pesanan Saya
        </button>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Instruksi Pembayaran</h1>
          <p className="text-slate-500 text-sm font-medium">
            Ref. Pesanan: <span className="font-bold text-slate-900 font-mono">{orderNumber}</span>
          </p>
        </div>
      </div>

      {/* STATUS BANNER */}
      {isPaid ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 mb-8 flex items-start gap-4">
          <div className="bg-emerald-100 p-2.5 rounded-full text-emerald-600 shrink-0">
            <CheckCircle size={28} weight="fill" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-emerald-900 mb-1">Pembayaran Terverifikasi & Lunas!</h3>
            <p className="text-emerald-800 text-sm mb-4">
              Terima kasih! Pembayaran untuk pesanan ini telah diterima dan disetujui. Pesanan Anda kini sedang masuk ke proses antrian produksi cetak.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard/my-orders')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
              >
                Lihat Status Pesanan
              </button>
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <DownloadSimple size={16} weight="bold" />
                {downloadingInvoice ? 'Mengunduh...' : 'Unduh Faktur'}
              </button>
            </div>
          </div>
        </div>
      ) : isPending ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 mb-8 flex items-start gap-4">
          <div className="bg-amber-100 p-2.5 rounded-full text-amber-600 shrink-0">
            <Clock size={28} weight="fill" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-amber-900 mb-1">Bukti Pembayaran Sedang Diverifikasi</h3>
            <p className="text-amber-800 text-sm mb-4">
              Bukti transfer telah kami terima dan sedang dicocokkan dengan mutasi rekening oleh tim finance. Verifikasi umumnya memakan waktu 10-30 menit di hari kerja.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/dashboard/my-orders')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
              >
                Kembali ke Pesanan Saya
              </button>
              <button
                onClick={() => setShowReupload(!showReupload)}
                className="px-4 py-2 bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <ArrowsClockwise size={16} weight="bold" />
                {showReupload ? 'Tutup Form Upload' : 'Kirim Ulang Bukti (Opsional)'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 mb-8 flex items-start gap-4">
          <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
            <Clock size={24} weight="regular" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-1">Menunggu Pembayaran</h3>
            <p className="text-amber-800 text-sm mb-3">
              Silakan selesaikan transfer sebelum batas waktu berakhir agar antrian cetak dapat segera dijadwalkan.
            </p>
            <div className="text-2xl font-mono font-bold text-amber-700 bg-amber-100/60 inline-block px-4 py-1.5 rounded-xl">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Bank Transfer & Upload Proof */}
      {(!isPending && !isPaid) || showReupload ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LEFT: Bank Info & Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Buildings size={20} className="text-slate-900" weight="bold" /> Rekening Bank Tujuan
                </h2>
              </div>
              
              <div className="p-4 sm:p-6 space-y-6">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Tagihan</span>
                  <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatIDR(amount)}</span>
                    <button 
                      onClick={() => copyToClipboard(amount.toString(), 'Nominal')}
                      className="p-2 text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Salin nominal"
                    >
                      <Copy size={18} weight="bold" />
                    </button>
                  </div>
                  <p className="text-xs text-amber-700 mt-2 flex items-center gap-1.5">
                    <WarningCircle size={14} weight="bold" /> Pastikan nominal transfer sesuai persis hingga angka terakhir
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="border border-slate-200 rounded-xl p-4 hover:border-primary-300 transition-colors bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-slate-900 block text-base">Bank BCA</span>
                        <span className="text-xs text-slate-500">a.n. PT Multi Kreasi Printing</span>
                      </div>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" alt="BCA" className="h-5 object-contain" />
                    </div>
                    <div className="flex items-center justify-between mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-mono text-base font-bold text-slate-800 tracking-wider">123 456 7890</span>
                      <button 
                        onClick={() => copyToClipboard('1234567890', 'Nomor Rekening BCA')}
                        className="text-slate-900 text-xs font-bold hover:underline"
                      >
                        Salin No. Rek
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 hover:border-primary-300 transition-colors bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-slate-900 block text-base">Bank Mandiri</span>
                        <span className="text-xs text-slate-500">a.n. PT Multi Kreasi Printing</span>
                      </div>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Bank_Mandiri_logo.svg" alt="Mandiri" className="h-4 object-contain" />
                    </div>
                    <div className="flex items-center justify-between mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-mono text-base font-bold text-slate-800 tracking-wider">098 765 4321</span>
                      <button 
                        onClick={() => copyToClipboard('0987654321', 'Nomor Rekening Mandiri')}
                        className="text-slate-900 text-xs font-bold hover:underline"
                      >
                        Salin No. Rek
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            {orderDetails?.items && orderDetails.items.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Package size={16} weight="bold" /> Ringkasan Item Pesanan
                </h3>
                <div className="space-y-2 divide-y divide-slate-100">
                  {orderDetails.items.map((item: any, idx: number) => (
                    <div key={idx} className="pt-2 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-semibold text-slate-800">{item.product?.name}</p>
                        <p className="text-xs text-slate-500">{item.quantity} pcs</p>
                      </div>
                      <p className="font-bold text-slate-900 tabular-nums">{formatIDR(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Upload Proof Form */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-slate-900" weight="bold" /> Unggah Bukti Transfer
              </h2>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Lampirkan bukti tangkapan layar (screenshot) m-Banking atau foto resi ATM untuk memvalidasi pembayaran Anda.
              </p>

              <form onSubmit={submitProof}>
                {!uploadedFile ? (
                  <label className="block border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-black hover:bg-slate-50 transition-colors cursor-pointer group mb-5">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileUpload} 
                      accept="image/jpeg,image/png,image/webp,application/pdf" 
                    />
                    <CloudArrowUp size={44} className="mx-auto text-slate-400 group-hover:text-black mb-3 transition-colors" weight="regular" />
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Pilih File Bukti Transfer</h3>
                    <p className="text-xs text-slate-500">Mendukung format JPG, PNG, atau PDF (Maks. 5MB)</p>
                  </label>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Berkas Terpilih</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          setFilePreview(null);
                        }}
                        className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
                      >
                        Ganti File
                      </button>
                    </div>

                    {filePreview && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 max-h-48 flex justify-center bg-white p-2">
                        <img src={filePreview} alt="Bukti Transfer Preview" className="max-h-44 object-contain rounded-lg" />
                      </div>
                    )}

                    <div className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-xl">
                      <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                        <CheckCircle size={20} weight="fill" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{uploadedFile.name}</p>
                        <p className="text-[11px] text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={uploading || !uploadedFile}
                  className="w-full h-12 bg-black text-white font-bold rounded-xl hover:bg-slate-800 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Kirim Bukti Pembayaran</>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Butuh bantuan konfirmasi langsung? Hubungi finance kami di{' '}
                  <a href="mailto:finance@mkprinting.com" className="font-semibold text-slate-900 hover:underline">
                    finance@mkprinting.com
                  </a>
                </p>
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
};

