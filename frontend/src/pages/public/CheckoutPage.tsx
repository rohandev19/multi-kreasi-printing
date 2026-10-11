import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Buildings, Truck, Lightning, CheckCircle } from '@phosphor-icons/react';
import { useToast } from '../../contexts/ToastContext';
import { useCart } from '../../hooks/useCart';
import api from '../../api/axios';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  
  const [loading, setLoading] = useState(false);
  const { items, fetchCart } = useCart();
  const [priority, setPriority] = useState('Normal');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = subtotal * 0.11;
  const deliveryFee = deliveryMethod === 'standard' ? 25000 : deliveryMethod === 'express' ? 75000 : 0;
  const total = subtotal + tax + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toastError('Keranjang kosong', 'Tambahkan produk ke keranjang terlebih dahulu.');
      return;
    }
    setLoading(true);
    
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes || '',
      }));

      const res = await api.post('/api/v1/orders', {
        items: orderItems,
        priority,
        estimatedDeliveryDate: estimatedDeliveryDate || undefined,
        notes,
      });
      
      // Refresh local cart context to clear it
      await fetchCart();

      setLoading(false);
      success('Pesanan Berhasil Dibuat!', 'Pesanan Anda telah tercatat dalam sistem.');
      navigate(`/payment/${res.data.id}`);
    } catch (error: any) {
      setLoading(false);
      console.error(error);
      toastError('Gagal membuat pesanan', error.response?.data?.message || 'Terjadi kesalahan sistem');
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link to="/cart" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-black mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" weight="regular" /> Kembali ke Keranjang
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Checkout Forms */}
          <div className="lg:w-2/3 space-y-6">
            
            {/* Step 1: Order Details */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm font-bold flex items-center justify-center shrink-0">1</div>
                <h2 className="text-xl font-bold text-slate-900">Detail Pesanan</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Prioritas Pesanan</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={loading}
                    className="w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 hover:bg-white p-3 text-slate-700 outline-none transition-colors"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">Prioritas Tinggi</option>
                    <option value="Urgent">Mendesak / Kilat</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1.5 ml-1">Biaya tambahan dapat berlaku untuk prioritas tinggi atau mendesak.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Target Tanggal Selesai / Kirim</label>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    disabled={loading}
                    className="w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 hover:bg-white p-3 text-slate-700 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Catatan Pesanan</label>
                  <textarea 
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={loading}
                    placeholder="Ada instruksi khusus untuk spesifikasi atau proses produksi?"
                    className="w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 hover:bg-white p-3 text-slate-700 outline-none transition-colors resize-y"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 text-sm font-bold flex items-center justify-center shrink-0">2</div>
                <h2 className="text-xl font-bold text-slate-900">Informasi Pengiriman</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                {/* Method Options */}
                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${deliveryMethod === 'pickup' ? 'border-black bg-slate-50 ring-1 ring-black' : 'border-slate-200 hover:border-slate-400'}`}>
                  <input type="radio" name="delivery" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} disabled={loading} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-2"><Buildings size={16} className="text-slate-900" weight="regular" /> Ambil Sendiri di Workshop</span>
                      <span className="font-bold text-emerald-600">Gratis</span>
                    </div>
                    <p className="text-sm text-slate-500">Ambil langsung di workshop percetakan kami</p>
                  </div>
                </label>
                
                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${deliveryMethod === 'standard' ? 'border-black bg-slate-50 ring-1 ring-black' : 'border-slate-200 hover:border-slate-400'}`}>
                  <input type="radio" name="delivery" value="standard" checked={deliveryMethod === 'standard'} onChange={() => setDeliveryMethod('standard')} disabled={loading} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-2"><Truck size={16} className="text-slate-900" weight="regular" /> Pengiriman Standar</span>
                      <span className="font-bold text-slate-900">Rp 25.000</span>
                    </div>
                    <p className="text-sm text-slate-500">Estimasi 3-5 hari kerja</p>
                  </div>
                </label>

                <label className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${deliveryMethod === 'express' ? 'border-black bg-slate-50 ring-1 ring-black' : 'border-slate-200 hover:border-slate-400'}`}>
                  <input type="radio" name="delivery" value="express" checked={deliveryMethod === 'express'} onChange={() => setDeliveryMethod('express')} disabled={loading} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-2"><Lightning size={16} className="text-amber-500" weight="regular" /> Pengiriman Kilat / Instan</span>
                      <span className="font-bold text-slate-900">Rp 75.000</span>
                    </div>
                    <p className="text-sm text-slate-500">Estimasi 1-2 hari kerja</p>
                  </div>
                </label>
              </div>

              {deliveryMethod !== 'pickup' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Pengiriman Lengkap</label>
                  <textarea 
                    rows={3}
                    disabled={loading}
                    required
                    placeholder="Masukkan alamat pengiriman lengkap beserta kode pos..."
                    className="w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-slate-50 hover:bg-white p-3 text-slate-700 outline-none transition-colors resize-y"
                  ></textarea>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary (Sticky) */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Ringkasan Pesanan</h2>
              
              <div className="max-h-60 overflow-y-auto no-scrollbar mb-6 space-y-3 pr-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate pr-4 flex-1">5x Kartu Nama Premium</span>
                  <span className="text-slate-900 font-medium shrink-0">{formatIDR(250000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate pr-4 flex-1">10x Brosur / Flyer A5</span>
                  <span className="text-slate-900 font-medium shrink-0">{formatIDR(1500000)}</span>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Subtotal</span>
                  <span className="text-slate-900 font-semibold">{formatIDR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Biaya Pengiriman</span>
                  <span className="text-slate-900 font-semibold">{deliveryMethod === 'pickup' ? 'Gratis' : formatIDR(deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium text-sm">Pajak (PPN 11%)</span>
                  <span className="text-slate-900 font-semibold">{formatIDR(tax)}</span>
                </div>
                <div className="border-t border-slate-100 pt-4 mt-2 flex justify-between items-end">
                  <span className="text-slate-900 font-bold">Total</span>
                  <span className="text-2xl font-extrabold text-black">{formatIDR(total)}</span>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed bg-black hover:bg-slate-900"
                  style={{ backgroundColor: '#000000', color: '#ffffff' }}
                  onMouseEnter={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#1e293b'; }}
                  onMouseLeave={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#000000'; }}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>Buat Pesanan Sekarang <CheckCircle size={20} weight="regular" /></>
                  )}
                </button>
                
                <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed">
                  Dengan membuat pesanan, Anda menyetujui <Link to="/terms" className="text-black font-semibold hover:underline">Syarat &amp; Ketentuan</Link> dan <Link to="/privacy" className="text-black font-semibold hover:underline">Kebijakan Privasi</Link> kami.
                </p>
              </div>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

