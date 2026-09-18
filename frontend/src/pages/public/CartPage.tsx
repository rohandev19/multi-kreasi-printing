import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash, Minus, Plus, ArrowRight, Lock, CircleNotch } from '@phosphor-icons/react';
import { useCart } from '../../hooks/useCart';

export const CartPage: React.FC = () => {
  const { cart, items, updateCartItem, removeFromCart, loading } = useCart();

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const updateQuantity = async (productId: string, currentQuantity: number, delta: number) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    if (newQuantity !== currentQuantity) {
      await updateCartItem(productId, newQuantity);
    }
  };

  const removeItem = async (productId: string) => {
    await removeFromCart(productId);
  };

  const subtotal = cart?.subtotal || items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = cart?.tax || subtotal * 0.11; // 11% PPN
  const total = cart?.totalAmount || subtotal + tax;

  return (
    <div className="w-full bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Cart Items */}
          <div className="lg:w-2/3">
            {/* Header */}
            <div className="mb-8">
              <Link to="/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 mb-4 transition-colors">
                <ArrowLeft size={16} className="mr-1" weight="regular" /> Back to Catalog
              </Link>
              <div className="flex items-end justify-between">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
                <span className="text-slate-400 text-lg font-medium">{items.length} items</span>
              </div>
            </div>

            {loading && items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center shadow-sm">
                <CircleNotch size={48} className="text-primary-600 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Memuat keranjang...</h2>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <ShoppingCart size={48} className="text-slate-300" weight="regular" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Keranjang Anda masih kosong</h2>
                <p className="text-slate-500 mb-8">Belum ada item yang ditambahkan. Katalog produk akan muncul setelah data tersedia.</p>
                <Link to="/products" className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-sm">
                  Lihat Katalog
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.productId} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="w-24 h-24 shrink-0 rounded-xl bg-slate-100 overflow-hidden">
                      <img src={item.image || 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=300&q=80'} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 mb-1 truncate">{item.productName}</h3>
                      <p className="text-sm text-slate-500 mb-2 truncate">B2B Standard Quality</p>
                      <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded-md">PROD-{item.productId.slice(0,6).toUpperCase()}</span>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                      <div className="flex items-center h-10 border border-slate-200 rounded-lg overflow-hidden bg-white shrink-0">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity, -1)}
                          disabled={loading}
                          className="w-8 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50"
                        >
                          <Minus size={14} weight="regular" />
                        </button>
                        <span className="w-12 h-full flex items-center justify-center border-x border-slate-200 font-bold text-slate-900 text-sm">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity, 1)}
                          disabled={loading}
                          className="w-8 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50"
                        >
                          <Plus size={14} weight="regular" />
                        </button>
                      </div>

                      <div className="flex flex-col items-end shrink-0 min-w-[120px]">
                        <span className="text-xs text-slate-400 mb-0.5">{formatIDR(item.unitPrice)} / unit</span>
                        <span className="text-lg font-extrabold text-slate-900">{formatIDR(item.unitPrice * item.quantity)}</span>
                      </div>

                      <button 
                        onClick={() => removeItem(item.productId)}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 disabled:opacity-50"
                        title="Remove item"
                      >
                        <Trash size={18} weight="regular" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Order Summary</h2>
              
              {items.length > 0 && (
                <div className="max-h-60 overflow-y-auto no-scrollbar mb-6 space-y-3 pr-2">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-slate-600 truncate pr-4 flex-1">{item.quantity}x {item.productName}</span>
                      <span className="text-slate-900 font-medium shrink-0">{formatIDR(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Subtotal</span>
                  <span className="text-slate-900 font-semibold">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Tax (11% PPN)</span>
                  <span className="text-slate-900 font-semibold">{formatIDR(tax)}</span>
                </div>
                <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-end">
                  <span className="text-slate-900 font-bold">Total</span>
                  <span className="text-2xl font-extrabold" style={{ color: '#0284c7' }}>{formatIDR(total)}</span>
                </div>
              </div>

              <div className="mt-8">
                <Link 
                  to="/checkout"
                  className={`w-full h-14 font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all ${
                    items.length === 0 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none' 
                      : ''
                  }`}
                  style={items.length > 0 ? {
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                  } : {}}
                  onMouseEnter={e => {
                    if (items.length > 0) e.currentTarget.style.background = 'linear-gradient(135deg, #0369a1 0%, #075985 100%)';
                  }}
                  onMouseLeave={e => {
                    if (items.length > 0) e.currentTarget.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
                  }}
                >
                  Proceed to Checkout <ArrowRight size={20} weight="regular" />
                </Link>
                
                <div className="text-center mt-4">
                  <Link to="/products" className="text-sm font-semibold transition-colors" style={{ color: '#0284c7' }} onMouseEnter={e => e.currentTarget.style.color = '#0369a1'} onMouseLeave={e => e.currentTarget.style.color = '#0284c7'}>
                    Continue Shopping
                  </Link>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                <Lock size={14} weight="regular" /> Secure B2B Checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
