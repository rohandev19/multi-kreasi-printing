import { useState, useEffect } from 'react';
import { X, Plus, PaperPlaneTilt, FloppyDisk, WarningCircle, Buildings, Package } from '@phosphor-icons/react';
import { Modal } from '../ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import api from '../../api/axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quotationId?: string | null;
  onSuccess?: () => void;
}

interface FormItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export default function CreateQuotationModal({ isOpen, onClose, quotationId, onSuccess }: Props) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<FormItem[]>([
    { id: '1', productId: '', quantity: 100, unitPrice: 0, notes: '' },
  ]);
  const [notes, setNotes] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [validDays, setValidDays] = useState(14);
  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  const { success, error: showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
      if (!quotationId) {
        setCustomerId('');
        setItems([{ id: String(Date.now()), productId: '', quantity: 100, unitPrice: 0, notes: '' }]);
        setNotes('');
        setDiscountPercent(0);
        setValidDays(14);
      }
    }
  }, [isOpen, quotationId]);

  const loadDropdownData = async () => {
    setLoadingInitial(true);
    try {
      const [customersRes, productsRes] = await Promise.all([
        api.get('/api/v1/customers'),
        api.get('/api/v1/products'),
      ]);
      setCustomers(Array.isArray(customersRes.data) ? customersRes.data : customersRes.data.data || []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dropdown data', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: String(Date.now()), productId: '', quantity: 100, unitPrice: 0, notes: '' },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleProductChange = (index: number, pId: string) => {
    const selectedProd = products.find((p) => p.id === pId);
    setItems((prev) => {
      const updated = [...prev];
      updated[index].productId = pId;
      if (selectedProd) {
        // Base price if available
        updated[index].unitPrice = Number(selectedProd.basePrice || selectedProd.price || 0);
      }
      return updated;
    });
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = Math.round((subtotal * Math.min(100, Math.max(0, discountPercent))) / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(afterDiscount * 0.11);
  const grandTotal = afterDiscount + tax;

  const requiresManagerApproval = discountPercent > 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (!customerId) {
      showError('Validasi Gagal', 'Harap pilih pelanggan terlebih dahulu.');
      return;
    }

    const invalidItem = items.find((i) => !i.productId || i.quantity <= 0);
    if (invalidItem) {
      showError('Validasi Gagal', 'Setiap item harus memilih produk dan memiliki jumlah minimal 1.');
      return;
    }

    setSubmitting(true);
    try {
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + validDays);

      const payload = {
        customerId,
        discountPercent: Number(discountPercent),
        notes,
        validUntil: validUntilDate.toISOString().split('T')[0],
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          subtotal: Number(i.quantity) * Number(i.unitPrice),
          notes: i.notes,
        })),
      };

      const res = await api.post('/api/v1/quotations', payload);
      const isPending = res.data.status === 'Pending_Manager_Approval';

      if (isPending) {
        success(
          'Diajukan untuk ACC Manager',
          `Penawaran ${res.data.quotationNumber} disimpan dengan status Menunggu Persetujuan Manager karena diskon > 10%.`,
        );
      } else {
        success(
          'Penawaran Berhasil Dibuat',
          `Penawaran ${res.data.quotationNumber} telah berhasil dibuat dan siap dikirim ke klien.`,
        );
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      showError(
        'Gagal Menyimpan',
        err.response?.data?.message || 'Terjadi kesalahan saat membuat penawaran.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={quotationId ? `Ubah Penawaran` : 'Buat Penawaran Harga Baru'} size="xl">
      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
        
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <Buildings size={16} className="text-slate-500" />
            Pilih Pelanggan B2B <span className="text-rose-500">*</span>
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            disabled={loadingInitial}
            className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
          >
            <option value="">-- Pilih Perusahaan / Kontak Pelanggan --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName || c.name} {c.email ? `(${c.email})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Quotation Items */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Package size={16} className="text-slate-500" />
              Daftar Item Cetak & Spesifikasi
            </h3>
            <button 
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={14} weight="bold" />
              Tambah Baris
            </button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative group space-y-3">
                <button 
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length <= 1}
                  className={`absolute -top-2.5 -right-2.5 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center transition-opacity hover:bg-red-200 shadow-sm ${
                    items.length > 1 ? 'opacity-80 group-hover:opacity-100' : 'hidden'
                  }`}
                  title="Hapus Baris"
                >
                  <X size={12} weight="bold" />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Produk Cetak</label>
                    <select 
                      value={item.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-900 font-medium"
                    >
                      <option value="">Pilih Produk...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.sku ? `(${p.sku})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Jumlah</label>
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setItems((prev) => {
                          const updated = [...prev];
                          updated[index].quantity = val;
                          return updated;
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-900 font-mono text-center font-bold" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Harga Satuan (Rp)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setItems((prev) => {
                          const updated = [...prev];
                          updated[index].unitPrice = val;
                          return updated;
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-900 font-mono text-right font-medium" 
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Subtotal Baris</label>
                    <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-800 font-mono text-right font-bold">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={item.notes || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setItems((prev) => {
                        const updated = [...prev];
                        updated[index].notes = val;
                        return updated;
                      });
                    }}
                    placeholder="Catatan spesifikasi kustom (misal: Art Carton 260gsm, Doff 2 Sisi, Pond Die-cut)..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-slate-900 text-slate-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount & Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Catatan / Ketentuan Penawaran</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Misal: Termasuk ongkir Jabodetabek, DP 50%, estimasi produksi 4 hari kerja..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-slate-900 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Masa Berlaku Penawaran (Hari)</label>
              <input 
                type="number"
                min="1"
                max="90"
                value={validDays}
                onChange={(e) => setValidDays(parseInt(e.target.value) || 14)}
                className="w-32 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Pricing Breakdown & Approval Threshold Alert */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Diskon Khusus Pelanggan (%)</span>
                <span className="text-xs font-mono font-bold text-slate-500">Max 10% tanpa ACC</span>
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-slate-900 font-mono font-bold" 
                />
                <span className="font-bold text-slate-600 text-sm">%</span>
              </div>
            </div>

            {requiresManagerApproval && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs leading-relaxed animate-fade-in">
                <WarningCircle size={18} className="text-amber-600 shrink-0 mt-0.5" weight="fill" />
                <div>
                  <span className="font-bold">Otorisasi Diskon Diperlukan:</span> Diskon di atas 10% ({discountPercent}%) otomatis menetapkan status penawaran menjadi <span className="font-bold text-amber-950">Menunggu ACC Sales Manager</span>. Penawaran tidak langsung dikirim ke pelanggan.
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Subtotal ({items.length} item)</span>
                <span className="font-mono text-slate-900 font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between items-center text-rose-600 font-medium">
                  <span>Potongan Diskon ({discountPercent}%)</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-600">
                <span>PPN (11%)</span>
                <span className="font-mono text-slate-900">{formatCurrency(tax)}</span>
              </div>
              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Akhir Penawaran</span>
                <span className="text-xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center rounded-b-2xl">
        <button 
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors text-sm"
        >
          Batal
        </button>

        <button 
          type="button"
          onClick={handleSubmit}
          disabled={submitting || items.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
        >
          {requiresManagerApproval ? (
            <>
              <FloppyDisk size={18} weight="bold" />
              {submitting ? 'Menyimpan...' : 'Ajukan ACC Manager'}
            </>
          ) : (
            <>
              <PaperPlaneTilt size={18} weight="bold" />
              {submitting ? 'Memproses...' : 'Simpan & Terbitkan'}
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
