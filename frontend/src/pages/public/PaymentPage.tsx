import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { CheckCircle2, Copy, FileText, ArrowRight } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const PaymentPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
        <Link to="/" className="text-indigo-600 hover:underline mt-4 inline-block">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 animate-fade-in py-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-2">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Received!</h1>
        <p className="text-gray-500 text-lg">Thank you for your order. Please complete your payment.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">Order Number</p>
              <p className="text-xl font-bold text-gray-900">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Total Payment</p>
              <p className="text-2xl font-extrabold text-indigo-600">{formatCurrency(order.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              Payment Instructions (Bank Transfer)
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <span className="text-gray-600">Bank Name</span>
                <span className="font-bold text-gray-900 text-lg">Bank Central Asia (BCA)</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <span className="text-gray-600">Account Name</span>
                <span className="font-bold text-gray-900">PT Multi Kreasi Printing</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Number</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-bold text-gray-900 tracking-wider">123 456 7890</span>
                  <button 
                    onClick={() => handleCopy('1234567890')}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
            <div className="mt-0.5">ℹ️</div>
            <div>
              Please transfer the exact amount of <strong>{formatCurrency(order.totalAmount)}</strong>. Your order will be processed as soon as we receive your payment. 
            </div>
          </div>

          <div className="pt-6">
            <Link 
              to="/dashboard/my-orders"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-sm"
            >
              View My Orders
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
