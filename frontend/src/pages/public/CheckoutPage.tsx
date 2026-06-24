import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Building2, Truck, Zap } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

export const CheckoutPage = () => {
  const { cart, items, loading: cartLoading, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  
  // New State for Delivery
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'standard' | 'express'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const navigate = useNavigate();
  const { success, error } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const deliveryFee = useMemo(() => {
    if (deliveryMethod === 'express') return 75000;
    if (deliveryMethod === 'standard') return 25000;
    return 0; // pickup
  }, [deliveryMethod]);

  const subtotal = cart?.totalAmount || 0;
  const tax = subtotal * 0.11;
  const total = subtotal + tax + deliveryFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (deliveryMethod !== 'pickup' && !deliveryAddress.trim()) {
      error('Missing Information', 'Please provide a delivery address.');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      let combinedNotes = notes;
      if (deliveryMethod !== 'pickup') {
        combinedNotes = `[Delivery Method: ${deliveryMethod}]\n[Delivery Address: ${deliveryAddress}]\n\n${notes}`;
      } else {
        combinedNotes = `[Delivery Method: Pickup]\n\n${notes}`;
      }

      const payload = {
        items: orderItems,
        notes: combinedNotes,
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
      <div className="flex justify-center items-center py-24 min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-6 text-center animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
        <p className="text-slate-500 mb-8 font-medium">You cannot checkout an empty cart.</p>
        <Link 
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
        
        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart" className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column: Forms */}
          <div className="lg:w-2/3 space-y-8">
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
              
              {/* STEP 1: Order Details */}
              <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">1</span>
                  Order Details
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Order Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none appearance-none"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                    <p className="mt-2 text-xs text-slate-500 font-medium">Additional fees may apply for high or urgent priority.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Requested Delivery Date <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={estimatedDelivery}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Order Notes <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none resize-none"
                      placeholder="Any specific requirements or instructions for production?"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 2: Delivery Information */}
              <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">2</span>
                  Delivery Information
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    <div 
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`border rounded-xl p-4 cursor-pointer transition-colors relative ${deliveryMethod === 'pickup' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-offset-1' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                      <Building2 className={`w-6 h-6 mb-3 ${deliveryMethod === 'pickup' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <h4 className={`text-sm font-bold mb-1 ${deliveryMethod === 'pickup' ? 'text-indigo-900' : 'text-slate-900'}`}>Self Pickup</h4>
                      <p className="text-xs text-slate-500 font-medium mb-3">Pick up at our workshop</p>
                      <div className="text-sm font-extrabold text-slate-900">Free</div>
                    </div>

                    <div 
                      onClick={() => setDeliveryMethod('standard')}
                      className={`border rounded-xl p-4 cursor-pointer transition-colors relative ${deliveryMethod === 'standard' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-offset-1' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                      <Truck className={`w-6 h-6 mb-3 ${deliveryMethod === 'standard' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <h4 className={`text-sm font-bold mb-1 ${deliveryMethod === 'standard' ? 'text-indigo-900' : 'text-slate-900'}`}>Standard Delivery</h4>
                      <p className="text-xs text-slate-500 font-medium mb-3">3-5 business days</p>
                      <div className="text-sm font-extrabold text-slate-900">Rp 25.000</div>
                    </div>

                    <div 
                      onClick={() => setDeliveryMethod('express')}
                      className={`border rounded-xl p-4 cursor-pointer transition-colors relative ${deliveryMethod === 'express' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-offset-1' : 'border-slate-200 hover:border-indigo-300'}`}
                    >
                      <Zap className={`w-6 h-6 mb-3 ${deliveryMethod === 'express' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <h4 className={`text-sm font-bold mb-1 ${deliveryMethod === 'express' ? 'text-indigo-900' : 'text-slate-900'}`}>Express Delivery</h4>
                      <p className="text-xs text-slate-500 font-medium mb-3">1-2 business days</p>
                      <div className="text-sm font-extrabold text-slate-900">Rp 75.000</div>
                    </div>
                  </div>

                  {deliveryMethod !== 'pickup' && (
                    <div className="pt-4 border-t border-slate-100 animate-fade-in">
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Delivery Address
                      </label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                        rows={3}
                        className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none resize-none"
                        placeholder="Enter your full delivery address including postal code"
                      />
                    </div>
                  )}
                </div>
              </div>

            </form>
          </div>
          
          {/* Right Column: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sticky top-24">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Order Summary</h2>
              
              <ul className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {items.map(item => (
                  <li key={item.productId} className="flex justify-between text-sm">
                    <div className="flex-1 truncate pr-4 text-slate-600 font-medium">
                      {item.quantity}x {item.productName}
                    </div>
                    <div className="font-bold text-slate-900 tabular-nums">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="border-t border-slate-100 pt-6 space-y-4 mb-8">
                <div className="flex justify-between text-slate-500 text-sm font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-slate-500 text-sm font-medium">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-sm font-medium">
                  <span>Tax (11%)</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-lg pt-4 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-2xl font-black text-indigo-600 tabular-nums tracking-tight">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
              
              <button 
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 h-14 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Place Order
                  </>
                )}
              </button>
              <p className="text-xs text-center text-slate-400 font-medium mt-4">
                By placing your order, you agree to our Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
