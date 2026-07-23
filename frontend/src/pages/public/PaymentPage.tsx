import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Copy, UploadCloud, CheckCircle2, AlertCircle, Clock, Building, CreditCard } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const amount = 1964500; // Mock total amount from previous page
  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

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
    success('Copied!', `${type} copied to clipboard.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const submitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      error('Upload Required', 'Please upload your transfer receipt first.');
      return;
    }
    
    setUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUploading(false);
      success('Proof Uploaded!', 'We will verify your payment shortly.');
      navigate('/dashboard/my-orders');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payment Instructions</h1>
        <p className="text-slate-500 mt-1 font-medium">Order Reference: <span className="font-bold text-slate-900">{orderId}</span></p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 mb-8 flex items-start gap-4">
        <div className="mt-0.5 bg-amber-100 p-2 rounded-full text-amber-600 shrink-0">
          <Clock size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-amber-900 mb-1">Awaiting Payment</h3>
          <p className="text-amber-800 text-sm mb-3">Please complete your payment before the timer expires to avoid automatic cancellation.</p>
          <div className="text-2xl font-mono font-bold text-amber-700 bg-amber-100/50 inline-block px-4 py-1.5 rounded-lg">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT: Bank Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building size={20} className="text-indigo-600" /> Bank Transfer
              </h2>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              <div>
                <span className="block text-sm text-slate-500 mb-1">Amount to Pay</span>
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-2xl font-extrabold text-slate-900">{formatIDR(amount)}</span>
                  <button 
                    onClick={() => copyToClipboard(amount.toString(), 'Amount')}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle size={14} /> Please transfer the exact amount
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-slate-900 block text-lg">Bank BCA</span>
                      <span className="text-sm text-slate-500">PT Multi Kreasi Printing</span>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" alt="BCA" className="h-6 object-contain" />
                  </div>
                  <div className="flex items-center justify-between mt-3 bg-slate-50 p-2 rounded-lg">
                    <span className="font-mono text-lg font-bold text-slate-700 tracking-wider">123 456 7890</span>
                    <button 
                      onClick={() => copyToClipboard('1234567890', 'Account Number')}
                      className="text-indigo-600 text-sm font-semibold hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-slate-900 block text-lg">Bank Mandiri</span>
                      <span className="text-sm text-slate-500">PT Multi Kreasi Printing</span>
                    </div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Bank_Mandiri_logo.svg" alt="Mandiri" className="h-5 object-contain" />
                  </div>
                  <div className="flex items-center justify-between mt-3 bg-slate-50 p-2 rounded-lg">
                    <span className="font-mono text-lg font-bold text-slate-700 tracking-wider">098 765 4321</span>
                    <button 
                      onClick={() => copyToClipboard('0987654321', 'Account Number')}
                      className="text-indigo-600 text-sm font-semibold hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Upload Proof */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-indigo-600" /> Upload Transfer Proof
            </h2>

            <form onSubmit={submitProof}>
              {!uploadedFile ? (
                <label className="block border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer group mb-6">
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/jpeg,image/png,application/pdf" />
                  <UploadCloud size={48} className="mx-auto text-slate-300 group-hover:text-indigo-500 mb-4 transition-colors" />
                  <h3 className="text-base font-bold text-slate-900 mb-1">Click to upload proof</h3>
                  <p className="text-sm text-slate-500">JPG, PNG or PDF (Max 5MB)</p>
                </label>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-700">Selected File</span>
                    <button 
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-3 border border-slate-100 rounded-lg">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={uploading || !uploadedFile}
                className="w-full h-14 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Submit Payment Proof</>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500 leading-relaxed text-center">
                Need help? Contact our finance team at <br/>
                <a href="mailto:finance@mkprinting.com" className="font-semibold text-indigo-600">finance@mkprinting.com</a>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
