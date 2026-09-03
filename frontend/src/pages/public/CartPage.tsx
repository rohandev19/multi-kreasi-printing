import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2, Minus, Plus, ArrowRight, Lock } from 'lucide-react';

const mockCartItems = [
  {
    id: '1',
    name: 'Premium Business Cards',
    specs: 'Standard 9x5cm · Art Carton 260gsm · Matte Lamination',
    sku: 'BC-PRM-260-MT',
    price: 50000,
    quantity: 5, // 5 boxes
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '2',
    name: 'A5 Flyers / Leaflets',
    specs: 'A5 · Art Paper 150gsm · No Finishing',
    sku: 'FL-A5-150-NO',
    price: 150000,
    quantity: 10, // 1000 pcs
    image: 'https://images.unsplash.com/photo-1563209259-ea16b9b3cc03?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
  }
];

export const CartPage: React.FC = () => {
  const [items, setItems] = useState(mockCartItems);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.11; // 11% PPN
  const total = subtotal + tax;

  return (
    <div className="w-full bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Cart Items */}
          <div className="lg:w-2/3">
            {/* Header */}
            <div className="mb-8">
              <Link to="/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Catalog
              </Link>
              <div className="flex items-end justify-between">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
                <span className="text-slate-400 text-lg font-medium">{items.length} items</span>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <ShoppingCart size={48} className="text-slate-300" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
                <p className="text-slate-500 mb-8">Browse our catalog to find what you need</p>
                <Link to="/products" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                  Browse Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="w-24 h-24 shrink-0 rounded-xl bg-slate-100 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 mb-1 truncate">{item.name}</h3>
                      <p className="text-sm text-slate-500 mb-2 truncate">{item.specs}</p>
                      <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded-md">{item.sku}</span>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                      <div className="flex items-center h-10 border border-slate-200 rounded-lg overflow-hidden bg-white shrink-0">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-12 h-full flex items-center justify-center border-x border-slate-200 font-bold text-slate-900 text-sm">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex flex-col items-end shrink-0 min-w-[120px]">
                        <span className="text-xs text-slate-400 mb-0.5">{formatIDR(item.price)} / unit</span>
                        <span className="text-lg font-extrabold text-slate-900">{formatIDR(item.price * item.quantity)}</span>
                      </div>

                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
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
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-600 truncate pr-4 flex-1">{item.quantity}x {item.name}</span>
                      <span className="text-slate-900 font-medium shrink-0">{formatIDR(item.price * item.quantity)}</span>
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
                  <span className="text-2xl font-extrabold text-indigo-600">{formatIDR(total)}</span>
                </div>
              </div>

              <div className="mt-8">
                <Link 
                  to="/checkout"
                  className={`w-full h-14 font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all ${
                    items.length === 0 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
                  }`}
                >
                  Proceed to Checkout <ArrowRight size={20} />
                </Link>
                
                <div className="text-center mt-4">
                  <Link to="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    Continue Shopping
                  </Link>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                <Lock size={14} /> Secure B2B Checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
