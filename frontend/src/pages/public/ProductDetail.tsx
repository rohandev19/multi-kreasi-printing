import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, UploadCloud, ShoppingCart, ArrowRight, ShieldCheck, Truck, RefreshCw, X, Minus, Plus, CheckCircle2 } from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock State
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [quantity, setQuantity] = useState(1);
  const [paperType, setPaperType] = useState('Art Paper 150gsm');
  const [finishing, setFinishing] = useState<string[]>([]);
  const [size, setSize] = useState('A4');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const basePrice = 150000;
  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const toggleFinishing = (item: string) => {
    setFinishing(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const calculateTotal = () => {
    let total = basePrice;
    if (finishing.includes('Glossy Lamination')) total += 50000;
    if (finishing.includes('Matte Lamination')) total += 50000;
    return total * quantity;
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <div className="text-sm text-slate-500 font-medium mb-8">
          <Link to="/" className="hover:text-indigo-600">Home</Link> <span className="mx-2">&gt;</span> 
          <Link to="/products" className="hover:text-indigo-600">Products</Link> <span className="mx-2">&gt;</span> 
          <span className="text-slate-900">Flyers</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT COLUMN: Images */}
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden group cursor-zoom-in relative border border-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1563209259-ea16b9b3cc03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Product" 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                Hover to zoom
              </span>
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              <div className="w-20 h-20 shrink-0 rounded-xl border-2 border-indigo-600 overflow-hidden cursor-pointer">
                <img src="https://images.unsplash.com/photo-1563209259-ea16b9b3cc03?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
              </div>
              <div className="w-20 h-20 shrink-0 rounded-xl border-2 border-slate-200 hover:border-slate-300 overflow-hidden cursor-pointer transition-colors">
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">IMG 2</div>
              </div>
              <div className="w-20 h-20 shrink-0 rounded-xl border-2 border-slate-200 hover:border-slate-300 overflow-hidden cursor-pointer transition-colors">
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">IMG 3</div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Configuration */}
          <div className="lg:w-1/2">
            <div className="mb-6">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">Flyers & Leaflets</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Premium A5 Flyers</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" className="text-slate-200" />
                </div>
                <span className="text-sm font-medium text-slate-600">4.8 (124 reviews)</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Write a review</button>
              </div>

              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">{formatIDR(basePrice)}</span>
                <span className="text-slate-500 font-medium mb-1">/ 100 pcs (1 box)</span>
              </div>
              
              <p className="text-slate-600 leading-relaxed">
                High-quality custom printed flyers perfect for marketing campaigns, event promotions, and product catalogs. Available in multiple paper types and premium finishes.
              </p>
            </div>

            <div className="border-t border-slate-200 my-8"></div>

            {/* Configuration Form */}
            <div className="space-y-8">
              
              {/* Paper Type */}
              <div>
                <label className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-900">Paper Material</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Art Paper 120gsm', 'Art Paper 150gsm', 'Art Carton 210gsm', 'Art Carton 260gsm'].map(type => (
                    <button
                      key={type}
                      onClick={() => setPaperType(type)}
                      className={`p-3 text-left border rounded-xl transition-all ${
                        paperType === type 
                          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/20' 
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`block text-sm font-semibold ${paperType === type ? 'text-indigo-900' : 'text-slate-700'}`}>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Finishing Options */}
              <div>
                <label className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-900">Finishing Options (Optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Glossy Lamination', 'Matte Lamination', 'Spot UV', 'Fold Creasing'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => toggleFinishing(opt)}
                      className={`p-3 text-left border rounded-xl transition-all flex items-center justify-between ${
                        finishing.includes(opt)
                          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/20' 
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`block text-sm font-semibold ${finishing.includes(opt) ? 'text-indigo-900' : 'text-slate-700'}`}>{opt}</span>
                      {finishing.includes(opt) && <CheckCircle2 size={16} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size & Quantity Row */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Size</label>
                  <select 
                    value={size}
                    onChange={e => setSize(e.target.value)}
                    className="w-full px-4 h-12 border border-slate-200 rounded-xl bg-white text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="A4">A4 (21 x 29.7 cm)</option>
                    <option value="A5">A5 (14.8 x 21 cm)</option>
                    <option value="A6">A6 (10.5 x 14.8 cm)</option>
                    <option value="DL">DL (9.9 x 21 cm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">Quantity (Boxes of 100)</label>
                  <div className="flex items-center h-12 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 h-full text-center border-x border-slate-200 font-bold text-slate-900 outline-none"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Design */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">Upload Design File</label>
                {!uploadedFile ? (
                  <label className="block border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer group">
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.ai,.psd,.zip" />
                    <UploadCloud size={36} className="mx-auto text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors" />
                    <p className="text-sm font-bold text-slate-700 mb-1">Drag & drop or click to upload</p>
                    <p className="text-xs text-slate-500">PDF, AI, PSD, or ZIP (Max 50MB)</p>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <UploadCloud size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{uploadedFile.name}</p>
                        <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setUploadedFile(null)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Price Summary & Actions */}
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-600 font-medium">Estimated Total:</span>
                <span className="text-3xl font-extrabold text-indigo-600">{formatIDR(calculateTotal())}</span>
              </div>
              
              <div className="flex flex-col gap-3">
                <button className="w-full h-14 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                  <ShoppingCart size={20} /> Add to Cart
                </button>
                <button className="w-full h-14 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  Buy Now <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <ShieldCheck size={18} className="text-emerald-500" /> Quality Guaranteed
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <Truck size={18} className="text-blue-500" /> Free Delivery &gt;Rp 500K
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <RefreshCw size={18} className="text-indigo-500" /> Easy Revision
              </div>
            </div>

          </div>
        </div>

        {/* BELOW FOLD: Tabs */}
        <div className="mt-24 border-t border-slate-200 pt-16">
          <div className="flex gap-8 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('description')}
              className={`pb-4 text-base font-bold whitespace-nowrap transition-colors ${activeTab === 'description' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('specs')}
              className={`pb-4 text-base font-bold whitespace-nowrap transition-colors ${activeTab === 'specs' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Specifications
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-base font-bold whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Reviews (124)
            </button>
          </div>

          <div className="max-w-3xl">
            {activeTab === 'description' && (
              <div className="prose prose-slate prose-indigo max-w-none">
                <p>Maximize your marketing reach with our premium full-color flyers and leaflets. Printed on state-of-the-art offset presses, we ensure vibrant colors and crisp texts that command attention.</p>
                <ul>
                  <li>Available in various standard sizes (A4, A5, A6, DL).</li>
                  <li>Choice of matte or glossy paper finishes.</li>
                  <li>Fast turnaround times for urgent campaigns.</li>
                  <li>Environmentally friendly inks and sustainably sourced paper options.</li>
                </ul>
              </div>
            )}
            
            {activeTab === 'specs' && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-slate-100">
                    <tr><th className="py-3 px-4 bg-slate-50 text-slate-700 w-1/3">Print Method</th><td className="py-3 px-4 text-slate-600">Offset Printing / Digital Press (varies by quantity)</td></tr>
                    <tr><th className="py-3 px-4 bg-slate-50 text-slate-700">Resolution</th><td className="py-3 px-4 text-slate-600">2400 x 2400 dpi</td></tr>
                    <tr><th className="py-3 px-4 bg-slate-50 text-slate-700">Color Mode</th><td className="py-3 px-4 text-slate-600">CMYK Full Color (4/0 or 4/4)</td></tr>
                    <tr><th className="py-3 px-4 bg-slate-50 text-slate-700">Production Time</th><td className="py-3 px-4 text-slate-600">2-3 Business Days (Standard)</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {[1,2,3].map(i => (
                  <div key={i} className="pb-6 border-b border-slate-100 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">JD</div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">John Doe {i}</p>
                          <div className="flex text-amber-400 gap-0.5"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">2 days ago</span>
                    </div>
                    <p className="text-slate-600 text-sm">The print quality is fantastic and the colors are exactly as they appeared in my design file. Will definitely order again!</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
