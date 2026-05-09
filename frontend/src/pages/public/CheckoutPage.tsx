import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CheckoutPage = () => {
  const { cart, items, loading: cartLoading, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const navigate = useNavigate();
  const { success, error } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const payload = {
        items: orderItems,
        notes,
        priority,
        ...(estimatedDelivery ? { estimatedDeliveryDate: new Date(estimatedDelivery).toISOString() } : {}),
      };

      const response = await api.post('/api/v1/orders', payload);
      
      // Clear the cart
      await clearCart();
      
      success('Order Placed!', 'Your order has been successfully created.');
      
      // Redirect to payment page
      navigate(`/dashboard/payment/${response.data.id}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      error('Checkout Failed', err.response?.data?.message || 'There was a problem processing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">You cannot checkout an empty cart.</p>
        <Link 
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/cart" className="p-2 text-gray-400 hover:text-indigo-600 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Checkout</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Order Details Form */}
        <div className="lg:w-2/3 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">1</span>
              Order Details
            </h2>
            
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 p-3"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Additional fees may apply for high or urgent priority.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requested Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  value={estimatedDelivery}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 p-3"
                  placeholder="Any specific requirements or instructions for production?"
                />
              </div>
            </form>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <ul className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {items.map(item => (
                <li key={item.productId} className="flex justify-between text-sm">
                  <div className="flex-1 truncate pr-4 text-gray-600">
                    {item.quantity}x {item.productName}
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatCurrency(item.subtotal)}
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="border-t border-gray-100 pt-4 space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(cart?.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Tax (11%)</span>
                <span className="font-medium text-gray-900">{formatCurrency((cart?.totalAmount || 0) * 0.11)}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-lg pt-2 border-t border-gray-100">
                <span>Total</span>
                <span className="text-indigo-600">{formatCurrency((cart?.totalAmount || 0) * 1.11)}</span>
              </div>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Place Order
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">
              By placing your order, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
