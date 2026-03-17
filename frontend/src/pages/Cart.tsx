import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalItems, totalPrice } = useCart();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-slate-100 p-6 rounded-full mb-6">
          <ShoppingBag className="w-16 h-16 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Keranjang Belanja Kosong</h2>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Sepertinya Anda belum menambahkan produk apapun ke keranjang belanja Anda.
        </p>
        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Keranjang Belanja</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-6"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">{item.name}</h3>
                <p className="text-slate-500 font-medium mb-4">{formatCurrency(item.unitPrice)}</p>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 rounded-md border border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-slate-700">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 rounded-md border border-slate-300 text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end justify-between h-full min-h-[6rem]">
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2"
                  title="Hapus"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="text-lg font-bold text-blue-600 mt-auto">
                  {formatCurrency(item.subtotal)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Ringkasan Belanja</h2>
            
            <div className="flex justify-between mb-4 text-slate-600">
              <span>Total Item</span>
              <span className="font-medium">{totalItems} barang</span>
            </div>
            
            <div className="flex justify-between mb-6 pb-6 border-b border-slate-100">
              <span className="text-slate-600">Total Harga</span>
              <span className="font-bold text-slate-800">{formatCurrency(totalPrice)}</span>
            </div>
            
            <div className="flex justify-between mb-8 items-end">
              <span className="text-slate-800 font-bold">Total Tagihan</span>
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
            </div>
            
            <Link
              to="/checkout"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-4 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
