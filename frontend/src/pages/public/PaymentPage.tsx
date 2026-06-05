import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { CheckCircle2, Copy, FileText, ArrowRight, Clock, Info, UploadCloud, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const PaymentPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [timeLeft, setTimeLeft] = useState('23:59:42'); // Mock countdown
  
  const { success } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/api/v1/orders/${orderId}`);
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to fetch order', error);
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();

    // Mock countdown timer logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let [hours, minutes, seconds] = prev.split(':').map(Number);
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    success('Copied!', 'Text copied to clipboard.');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmitProof = () => {
    if (uploadedFile) {
      success('Proof Uploaded!', 'Payment proof submitted successfully. We will verify it shortly.');
      setUploadedFile(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Order not found</h2>
        <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        
        {/* 1. SUCCESS HEADER */}
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order Received!</h1>
          <p className="text-slate-500 text-lg font-medium max-w-md">Thank you for your order. Please complete your payment to begin processing.</p>
        </div>

        {/* 2. ORDER SUMMARY CARD */}
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-8">
          <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Order Number</p>
              <p className="text-xl font-bold text-slate-900">{order.orderNumber || order.id.substring(0,8).toUpperCase()}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-slate-500 font-medium mb-1">Total Payment</p>
              <p className="text-2xl font-extrabold text-indigo-600 tabular-nums">{formatCurrency(order.totalAmount)}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            
            {/* 4. PAYMENT DEADLINE */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4">
              <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium leading-relaxed">
                  Please complete payment within 24 hours. Your order will be automatically cancelled after the deadline.
                </p>
                <p className="font-mono font-bold text-amber-700 mt-2 text-lg">{timeLeft} remaining</p>
              </div>
            </div>

            {/* 3. PAYMENT INSTRUCTIONS */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-slate-400" />
                Payment Instructions (Bank Transfer)
              </h3>
              
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200 pb-4 gap-2">
                  <span className="text-slate-600 font-medium">Bank Name</span>
                  <span className="font-bold text-slate-900 text-lg">Bank Central Asia (BCA)</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200 pb-4 gap-2">
                  <span className="text-slate-600 font-medium">Account Name</span>
                  <span className="font-bold text-slate-900 text-lg">PT Multi Kreasi Printing</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-slate-600 font-medium">Account Number</span>
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm w-max">
                    <span className="font-mono text-xl font-extrabold text-slate-900 tracking-wider">123 456 7890</span>
                    <button 
                      onClick={() => handleCopy('1234567890')}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      title="Copy account number"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. INFO ALERT */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 text-sm text-blue-800">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">
                Please transfer the exact amount of <strong className="font-bold">{formatCurrency(order.totalAmount)}</strong>. Your order will be processed as soon as we receive your payment.
              </div>
            </div>

            {/* 6. UPLOAD PROOF OF PAYMENT */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 text-lg">Upload Payment Proof</h3>
              
              {!uploadedFile ? (
                <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3 group block">
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".jpg,.png,.pdf" />
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-700 block mb-1">Drag & drop or click to upload</span>
                    <span className="text-xs text-slate-500 font-medium">JPG, PNG, PDF (Max 5MB)</span>
                  </div>
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-indigo-200 bg-indigo-50 rounded-xl">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <FileText size={24} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-indigo-900 truncate mb-0.5">{uploadedFile.name}</p>
                        <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Ready to submit
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setUploadedFile(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleSubmitProof}
                    className="w-full h-12 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all active:scale-[0.98]"
                  >
                    Submit Payment Proof
                  </button>
                </div>
              )}
            </div>

            {/* 7. ALTERNATIVE PAYMENT METHODS */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button 
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="w-full p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors font-bold text-slate-900 text-left"
              >
                Other Payment Methods
                {showAlternatives ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>
              
              {showAlternatives && (
                <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-4">
                  
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-3">Bank Mandiri</h4>
                    <div className="space-y-2 text-sm font-medium">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account Name</span>
                        <span className="text-slate-900">PT Multi Kreasi Printing</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Account Number</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">098 765 4321</span>
                          <button onClick={() => handleCopy('0987654321')} className="text-slate-400 hover:text-indigo-600">
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-3">Bank BNI</h4>
                    <div className="space-y-2 text-sm font-medium">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account Name</span>
                        <span className="text-slate-900">PT Multi Kreasi Printing</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Account Number</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">112 233 4455</span>
                          <button onClick={() => handleCopy('1122334455')} className="text-slate-400 hover:text-indigo-600">
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* 8. BOTTOM CTA */}
            <div className="pt-6 border-t border-slate-100">
              <Link 
                to="/dashboard/my-orders"
                className="w-full h-14 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]"
              >
                View My Orders
                <ArrowRight size={20} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
