import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
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
      // Pass redirect param so login brings them right back to checkout
      navigate('/login?redirect=/dashboard/checkout');
    } else {
      navigate('/dashboard/checkout');
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto mt-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-50 mb-6">
          <ShoppingCart className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Looks like you haven't added anything to your cart yet.</p>
        <Link 
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in mt-4">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.productId} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <span className="text-gray-300 font-bold uppercase text-xs tracking-wider">IMG</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{item.productName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formatCurrency(item.unitPrice)} / unit</p>
                  </div>
                  
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-1">
                      <button 
                        onClick={() => updateCartItem(item.productId, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1 || loading}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all disabled:opacity-50 text-gray-500"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium text-gray-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                        disabled={loading}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-500"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right sm:w-24 font-bold text-gray-900 tabular-nums">
                      {formatCurrency(item.subtotal)}
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      disabled={loading}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-medium text-gray-900 tabular-nums">{formatCurrency(cart?.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (Estimated)</span>
                <span className="font-medium text-gray-900 tabular-nums">{formatCurrency((cart?.totalAmount || 0) * 0.11)}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 mb-8 flex justify-between items-end">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-indigo-600 tabular-nums">
                {formatCurrency((cart?.totalAmount || 0) * 1.11)}
              </span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
            
            {!user && (
              <p className="text-xs text-center text-gray-500 mt-4">
                You will be asked to log in or create an account during checkout.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
