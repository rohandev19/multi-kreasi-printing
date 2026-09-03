import { useState, useEffect } from 'react';
import { X, Search, Plus, Send, Save } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useToast } from '../../contexts/ToastContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  quotationId?: string | null;
}

export default function CreateQuotationModal({ isOpen, onClose, quotationId }: Props) {
  const [customer, setCustomer] = useState('');
  const [items, setItems] = useState([
    { id: 1, product: '', description: '', specifications: '', qty: 1, price: 0, discount: 0 }
  ]);
  const [terms, setTerms] = useState("1. Prices valid for 30 days\n2. 50% downpayment required\n3. Balance due before delivery\n4. Production starts after design approval");
  const [notes, setNotes] = useState('');
  const [validDays, setValidDays] = useState(30);
  const [totalDiscount, setTotalDiscount] = useState(0);
  
  const { success } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (quotationId) {
        // Load mock data
        setCustomer('PT Sukses Makmur');
        setItems([
          { id: 1, product: 'Business Cards', description: 'Premium Business Cards', specifications: 'Art Carton 260gsm, Matte Lamination, 2 Sided', qty: 5000, price: 500, discount: 0 }
        ]);
      } else {
        // Reset form
        setCustomer('');
        setItems([{ id: 1, product: '', description: '', specifications: '', qty: 1, price: 0, discount: 0 }]);
        setTerms("1. Prices valid for 30 days\n2. 50% downpayment required\n3. Balance due before delivery\n4. Production starts after design approval");
        setNotes('');
        setValidDays(30);
        setTotalDiscount(0);
      }
    }
  }, [isOpen, quotationId]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), product: '', description: '', specifications: '', qty: 1, price: 0, discount: 0 }]);
  };

  const handleRemoveItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.qty * item.price * (1 - item.discount / 100)), 0);
  };

  const subtotal = calculateSubtotal();
  const tax = (subtotal - (subtotal * totalDiscount / 100)) * 0.11;
  const grandTotal = subtotal - (subtotal * totalDiscount / 100) + tax;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSaveDraft = () => {
    success('Saved as Draft', 'Quotation has been saved successfully.');
    onClose();
  };

  const handleSaveAndSend = () => {
    success('Quotation Sent', 'Quotation has been saved and sent to customer.');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={quotationId ? `Edit Quotation ${quotationId}` : "Create New Quotation"} size="xl">
      <div className="p-6 space-y-8 h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
        
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Customer</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Search customer by name or company..."
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-colors"
            />
          </div>
          <div className="mt-2 text-right">
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
              + Add New Customer
            </button>
          </div>
        </div>

        {/* Quotation Items */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-sm font-bold text-slate-900">Quotation Items</h3>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative group">
                <button 
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute -top-3 -right-3 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 shadow-sm"
                  title="Remove Item"
                >
                  <X size={12} strokeWidth={3} />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Product/Service</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-600">
                      <option value="">Select Product...</option>
                      <option value="business_cards">Business Cards</option>
                      <option value="flyers">Flyers & Brochures</option>
                      <option value="banners">Banners</option>
                    </select>
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Specifications</label>
                    <input type="text" placeholder="e.g., A4, Art Paper 260gsm" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-600" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Qty</label>
                    <input 
                      type="number" 
                      value={item.qty} 
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].qty = parseInt(e.target.value) || 0;
                        setItems(newItems);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-600" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Unit Price</label>
                    <input 
                      type="number" 
                      value={item.price}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].price = parseInt(e.target.value) || 0;
                        setItems(newItems);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-600 font-mono" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Line Total</label>
                    <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-600 font-mono text-right overflow-hidden text-ellipsis whitespace-nowrap">
                      {formatCurrency(item.qty * item.price * (1 - item.discount / 100))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={handleAddItem}
            className="mt-4 flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Additional Sections */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Terms & Conditions</label>
              <textarea 
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-600 resize-none text-slate-600"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Internal Notes <span className="text-slate-400 font-normal">(not visible to customer)</span></label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-amber-50 focus:ring-2 focus:ring-amber-500 resize-none text-amber-900 border-amber-200 placeholder-amber-300"
                placeholder="Add private notes here..."
              ></textarea>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Valid For (Days)</label>
                <input 
                  type="number" 
                  value={validDays}
                  onChange={(e) => setValidDays(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-600" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Overall Discount (%)</label>
                <input 
                  type="number" 
                  value={totalDiscount}
                  onChange={(e) => setTotalDiscount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-600" 
                  max="100"
                  min="0"
                />
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Pricing Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-mono text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">Discount ({totalDiscount}%)</span>
                    <span className="font-mono text-red-600">-{formatCurrency(subtotal * totalDiscount / 100)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Tax (11%)</span>
                  <span className="font-mono text-slate-900">{formatCurrency(tax)}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-900">Grand Total</span>
                  <span className="text-2xl font-extrabold text-indigo-600 tracking-tight">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Footer */}
      <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center rounded-b-2xl">
        <button 
          onClick={onClose}
          className="px-6 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleSaveDraft}
            className="flex items-center gap-2 px-6 py-2.5 border-2 border-indigo-600 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors bg-white shadow-sm"
          >
            <Save size={18} />
            Save as Draft
          </button>
          <button 
            onClick={handleSaveAndSend}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Send size={18} />
            Save & Send
          </button>
        </div>
      </div>
    </Modal>
  );
}
