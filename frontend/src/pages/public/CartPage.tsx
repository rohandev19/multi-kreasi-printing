import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, Lock, Package } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useRoleContext } from '../../contexts/RoleContext';

export const CartPage = () => {
  const { cart, items, updateCartItem, removeFromCart, loading } = useCart();
  const { user } = useRoleContext();
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/dashboard/checkout');
    } else {
      navigate('/dashboard/checkout');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-slate-50 min-h-screen">
        <div className="text-center py-16 px-8 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-2xl w-full mx-auto animate-fade-in">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-slate-50 mb-8 shadow-inner">
            <ShoppingCart className="w-16 h-16 text-slate-300" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Your cart is empty</h2>
          <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg font-medium leading-relaxed">
            Looks like you haven't added anything to your cart yet. Browse our catalog to find what you need.
          </p>
          <Link 
            to="/products"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart?.totalAmount || 0;
  const tax = subtotal * 0.11;
  const total = subtotal + tax;
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
        
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/products" className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">Shopping Cart</h1>
            <span className="text-slate-400 font-medium">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</span>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Cart Items List */}
          <div className="lg:w-2/3 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6">
                
                {/* Image */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-50">
                  <Package className="w-12 h-12 text-slate-300 stroke-1" />
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 truncate">{item.productName}</h3>
                      <p className="text-sm text-slate-500 font-medium">Standard Options</p>
                      <p className="text-xs text-slate-400 font-mono mt-2">SKU: {item.productId.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      disabled={loading}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <div className="mt-auto flex flex-row items-center justify-between gap-4 pt-4 border-t border-slate-50">
                    
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-10 w-28 bg-white">
                      <button 
                        onClick={() => updateCartItem(item.productId, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1 || loading}
                        className="w-10 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-50 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="flex-1 h-full text-center border-x border-slate-200 flex items-center justify-center font-bold text-slate-900 tabular-nums text-sm">
                        {item.quantity}
                      </div>
                      <button 
                        onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                        disabled={loading}
                        className="w-10 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    {/* Price */}
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 mb-0.5">{formatCurrency(item.unitPrice)} / unit</div>
                      <div className="text-lg font-extrabold text-slate-900 tabular-nums tracking-tight">{formatCurrency(item.subtotal)}</div>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary (Sticky) */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sticky top-24">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Subtotal ({totalItems} items)</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Tax (11% PPN)</span>
                  <span className="font-bold text-slate-900 tabular-nums">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Shipping</span>
                  <span className="font-bold text-indigo-600">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-6 mb-8 flex justify-between items-end">
                <span className="font-bold text-slate-900 text-lg">Total</span>
                <span className="text-3xl font-black text-indigo-600 tabular-nums tracking-tight">
                  {formatCurrency(total)}
                </span>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={loading || items.length === 0}
                className="w-full h-14 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4 disabled:opacity-50 disabled:active:scale-100"
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </button>
              
              <div className="text-center mb-6">
                <Link to="/products" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                  Continue Shopping
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-6">
                <Lock size={14} className="text-slate-300" />
                Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
