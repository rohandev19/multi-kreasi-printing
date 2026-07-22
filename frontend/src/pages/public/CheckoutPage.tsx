import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building, Truck, Zap, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState('Normal');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const subtotal = 1750000;
  const tax = subtotal * 0.11;
  const deliveryFee = deliveryMethod === 'standard' ? 25000 : deliveryMethod === 'express' ? 75000 : 0;
  const total = subtotal + tax + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      success('Order Placed Successfully!', 'Your order has been recorded.');
      // Redirect to payment instructions page with a mock order ID
      navigate('/payment/ORD-2023-8899');
    }, 1500);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link to="/cart" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Cart
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Checkout Forms */}
          <div className="lg:w-2/3 space-y-6">
            
            {/* Step 1: Order Details */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">1</div>
                <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Order Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={loading}
                    className="w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 hover:bg-white p-3 text-slate-700 outline-none transition-colors"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent (Rush Order)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1.5 ml-1">Additional fees may apply for high or urgent priority.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Requested Delivery Date</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    disabled={loading}
                    required
                    className="w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 hover:bg-white p-3 text-slate-700 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Order Notes</label>
                  <textarea 
                    rows={4}
                    disabled={loading}
                    placeholder="Any specific requirements or instructions for production?"
                    className="w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 hover:bg-white p-3 text-slate-700 outline-none transition-colors resize-y"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">2</div>
                <h2 className="text-xl font-bold text-slate-900">Delivery Information</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                {/* Method Options */}
                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${deliveryMethod === 'pickup' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <input type="radio" name="delivery" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} disabled={loading} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-2"><Building size={16} className="text-indigo-600" /> Self Pickup</span>
                      <span className="font-bold text-emerald-600">Free</span>
                    </div>
                    <p className="text-sm text-slate-500">Pick up at our workshop</p>
                  </div>
                </label>
                
                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${deliveryMethod === 'standard' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <input type="radio" name="delivery" value="standard" checked={deliveryMethod === 'standard'} onChange={() => setDeliveryMethod('standard')} disabled={loading} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-2"><Truck size={16} className="text-indigo-600" /> Standard Delivery</span>
                      <span className="font-bold text-slate-900">Rp 25.000</span>
                    </div>
                    <p className="text-sm text-slate-500">3-5 business days</p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${deliveryMethod === 'express' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <input type="radio" name="delivery" value="express" checked={deliveryMethod === 'express'} onChange={() => setDeliveryMethod('express')} disabled={loading} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Express Delivery</span>
                      <span className="font-bold text-slate-900">Rp 75.000</span>
                    </div>
                    <p className="text-sm text-slate-500">1-2 business days</p>
                  </div>
                </label>
              </div>

              {deliveryMethod !== 'pickup' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Shipping Address</label>
                  <textarea 
                    rows={3}
                    disabled={loading}
                    required
                    placeholder="Enter complete delivery address..."
                    className="w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 hover:bg-white p-3 text-slate-700 outline-none transition-colors resize-y"
                  ></textarea>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary (Sticky) */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
              
              <div className="max-h-60 overflow-y-auto no-scrollbar mb-6 space-y-3 pr-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate pr-4 flex-1">5x Premium Business Cards</span>
                  <span className="text-slate-900 font-medium shrink-0">{formatIDR(250000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate pr-4 flex-1">10x A5 Flyers / Leaflets</span>
                  <span className="text-slate-900 font-medium shrink-0">{formatIDR(1500000)}</span>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Subtotal</span>
                  <span className="text-slate-900 font-semibold">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Delivery Fee</span>
                  <span className="text-slate-900 font-semibold">{deliveryMethod === 'pickup' ? 'Free' : formatIDR(deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Tax (11% PPN)</span>
                  <span className="text-slate-900 font-semibold">{formatIDR(tax)}</span>
                </div>
                <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-end">
                  <span className="text-slate-900 font-bold">Total</span>
                  <span className="text-2xl font-extrabold text-indigo-600">{formatIDR(total)}</span>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Place Order <CheckCircle2 size={20} /></>
                  )}
                </button>
                
                <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed">
                  By placing your order, you agree to our <Link to="/terms" className="text-indigo-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
