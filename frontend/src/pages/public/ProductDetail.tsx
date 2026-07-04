// @ts-nocheck
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Package, ShieldCheck, Truck, RefreshCw, UploadCloud, X, Star, ArrowRight } from 'lucide-react';
import api from '../../api/axios';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../contexts/ToastContext';

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  imageUrl?: string;
  isActive: boolean;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
}

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Configuration State
  const [quantity, setQuantity] = useState<number>(1);
  const [paperType, setPaperType] = useState('Art Paper 150gsm');
  const [finishing, setFinishing] = useState<string[]>([]);
  const [size, setSize] = useState('A4');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('description');

  const { addToCart } = useCart();
  const { success, error } = useToast();

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await api.get(`/api/v1/products/${id}`);
      const data = response.data.data || response.data;
      
      const p = {
        ...data,
        category: typeof data.category === 'object' && data.category !== null ? data.category.name : data.category
      };
      
      setProduct(p);
      setQuantity(p.minOrderQuantity || 1);
    } catch (err: any) {
      console.error('Failed to fetch product details', err);
      // Fallback for demo
      const fallbackProducts: Product[] = [
        { id: '1', name: 'Premium Business Cards', description: '300gsm matte finish with double-sided printing. Perfect for leaving a lasting impression on your clients.', basePrice: 150000, category: 'Business Cards', isActive: true, minOrderQuantity: 1 },
        { id: '2', name: 'Indoor Vinyl Banner', description: 'High-resolution indoor banner. Price per square meter. Vibrant colors and durable material suitable for any indoor event.', basePrice: 85000, category: 'Banners', isActive: true, minOrderQuantity: 1 },
        { id: '3', name: 'Corporate Brochure', description: 'A4 tri-fold brochure on glossy paper. Excellent for marketing materials and product showcases.', basePrice: 25000, category: 'Marketing', isActive: true, minOrderQuantity: 50 },
        { id: '4', name: 'Custom Stickers', description: 'Die-cut vinyl stickers. Minimum order 100. Weather resistant and highly customizable.', basePrice: 1500, category: 'Stickers', isActive: true, minOrderQuantity: 100 },
      ];
      const p = fallbackProducts.find(p => p.id === id);
      if (p) {
        setProduct(p);
        setQuantity(p.minOrderQuantity || 1);
      } else {
        navigate('/404');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const handleQuantityChange = (newQty: number) => {
    const min = product?.minOrderQuantity || 1;
    const max = product?.maxOrderQuantity || 99999;
    
    if (newQty >= min && newQty <= max) {
      setQuantity(newQty);
    }
  };

  const toggleFinishing = (f: string) => {
    setFinishing(prev => prev.includes(f) ? prev.filter(item => item !== f) : [...prev, f]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product, quantity);
      success('Added to Cart', `${quantity} ${product.name} added to your cart.`);
      navigate('/cart');
    } catch {
      error('Failed to Add', 'Could not add product to cart. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const finishingSurcharge = finishing.length * 5000;
  const totalPrice = (product ? product.basePrice + finishingSurcharge : 0) * quantity;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 animate-fade-in">
        
        {/* TOP SECTION: 2-column layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* LEFT COLUMN: Images */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden relative group">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-32 h-32 text-slate-300 stroke-1" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-20 h-20 rounded-xl border-2 cursor-pointer flex-shrink-0 flex items-center justify-center bg-slate-50 transition-colors ${i === 1 ? 'border-indigo-600' : 'border-slate-200 hover:border-slate-300'}`}>
                   {product.imageUrl ? (
                     <img src={product.imageUrl} alt="Thumbnail" className="w-full h-full object-cover rounded-lg" />
                   ) : (
                     <Package className="w-8 h-8 text-slate-300" />
                   )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Info & Config */}
          <div className="w-full lg:w-1/2 flex flex-col">
            
            {/* 1. Breadcrumb */}
            <nav className="flex items-center text-sm font-medium text-slate-500 mb-6">
              <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
              <span className="mx-2 text-slate-300">/</span>
              <Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
              <span className="mx-2 text-slate-300">/</span>
              <Link to={`/products?category=${product.category}`} className="hover:text-indigo-600 transition-colors">{product.category}</Link>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-900 line-clamp-1">{product.name}</span>
            </nav>

            {/* 2. Category badge & 3. Title */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-2">{product.category}</span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">{product.name}</h1>
            </div>

            {/* 4. Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex text-amber-400">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-current" />)}
              </div>
              <span className="text-sm font-medium text-slate-600">12 Reviews</span>
              <span className="text-slate-300">|</span>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline">Write a review</button>
            </div>

            {/* 5. Price */}
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {formatCurrency(product.basePrice)}
              </span>
              <span className="text-sm font-medium text-slate-400">/ unit</span>
            </div>

            {/* 6. Short description */}
            <p className="text-slate-600 leading-relaxed font-medium">
              {product.description}
            </p>

            {/* 7. Divider */}
            <hr className="border-slate-200 my-8" />

            {/* 8. CONFIGURATION FORM */}
            <div className="space-y-8">
              
              {/* Paper Type */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Paper Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Art Paper 150gsm', 'Art Carton 260gsm', 'HVS 80gsm', 'Linen 220gsm'].map(type => (
                    <div 
                      key={type}
                      onClick={() => setPaperType(type)}
                      className={`border rounded-xl p-3 cursor-pointer transition-colors ${paperType === type ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-offset-1' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}
                    >
                      <span className={`text-sm font-semibold ${paperType === type ? 'text-indigo-900' : 'text-slate-700'}`}>{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Finishing */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Finishing Options <span className="text-xs font-normal text-slate-500">(Optional)</span></h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Glossy Lam', 'Matte Lam', 'Spot UV', 'Emboss'].map(opt => {
                    const isSelected = finishing.includes(opt);
                    return (
                      <div 
                        key={opt}
                        onClick={() => toggleFinishing(opt)}
                        className={`border rounded-xl p-3 cursor-pointer text-center transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-offset-1' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}
                      >
                        <span className={`text-sm font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Size & Quantity */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Size</h3>
                  <select 
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-white text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none appearance-none"
                  >
                    <option value="A4">A4 (210 x 297 mm)</option>
                    <option value="A5">A5 (148 x 210 mm)</option>
                    <option value="A3">A3 (297 x 420 mm)</option>
                    <option value="Custom">Custom Size</option>
                  </select>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Quantity</h3>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden h-12">
                    <button 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= (product.minOrderQuantity || 1)}
                      className="w-12 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-colors disabled:opacity-50 disabled:hover:bg-slate-50"
                    >
                      <Minus size={18} />
                    </button>
                    <input 
                      type="text" 
                      value={quantity}
                      readOnly
                      className="w-16 h-full text-center border-x border-slate-200 font-bold text-slate-900 outline-none"
                    />
                    <button 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-12 h-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Design */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Design File <span className="text-xs font-normal text-slate-500">(Optional - can provide later)</span></h3>
                {!uploadedFile ? (
                  <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 group">
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.ai,.psd,.zip" />
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Drag & drop or click to upload</span>
                    <span className="text-xs text-slate-500">PDF, AI, PSD (Max 50MB)</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 border border-indigo-200 bg-indigo-50 rounded-xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                        <UploadCloud size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-indigo-900 truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-indigo-600/70">Ready for print</p>
                      </div>
                    </div>
                    <button onClick={() => setUploadedFile(null)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* 9. PRICE SUMMARY */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mt-8">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Base Price ({quantity}x)</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(product.basePrice * quantity)}</span>
                  </div>
                  {finishing.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Finishing ({finishing.join(', ')})</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(finishingSurcharge * quantity)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                  <span className="text-sm font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-extrabold text-indigo-600 tracking-tight tabular-nums">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* 10. ACTION BUTTONS */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full h-14 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button
                  className="w-full h-14 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  Buy Now
                  <ArrowRight size={20} />
                </button>
              </div>

              {/* 11. TRUST INDICATORS */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  Quality Guaranteed
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-blue-500" />
                  Free Delivery &gt;Rp 500K
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw size={18} className="text-indigo-500" />
                  Easy Revision
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* BELOW FOLD: TABS & RELATED */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* 12. PRODUCT TABS */}
          <div className="mb-16">
            <div className="flex border-b border-slate-200 gap-8 mb-8 overflow-x-auto scrollbar-hide">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: 'Reviews (12)' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 text-base font-bold transition-colors whitespace-nowrap border-b-2 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="prose prose-slate max-w-none">
              {activeTab === 'description' && (
                <div className="text-slate-600 leading-relaxed max-w-3xl font-medium space-y-4">
                  <p>Our {product.name.toLowerCase()} are printed using state-of-the-art commercial offset presses and the highest quality materials to ensure vibrant colors and crisp details.</p>
                  <p>Ideal for corporate networking, marketing campaigns, and brand building. We offer a wide range of paper types and finishing options to match your exact brand requirements.</p>
                  <ul className="list-disc pl-5 space-y-2 mt-4 text-slate-700">
                    <li>Full color CMYK printing</li>
                    <li>High quality commercial grade materials</li>
                    <li>Precision trimming and finishing</li>
                    <li>Fast turnaround times</li>
                  </ul>
                </div>
              )}
              {activeTab === 'specifications' && (
                <div className="max-w-3xl">
                  <table className="w-full text-sm text-left text-slate-600 font-medium">
                    <tbody className="divide-y divide-slate-200">
                      <tr><th className="py-4 pr-6 text-slate-900 w-1/3">Standard Material</th><td className="py-4">Art Carton 260gsm</td></tr>
                      <tr><th className="py-4 pr-6 text-slate-900">Print Method</th><td className="py-4">Offset Printing</td></tr>
                      <tr><th className="py-4 pr-6 text-slate-900">Color Mode</th><td className="py-4">CMYK (Full Color)</td></tr>
                      <tr><th className="py-4 pr-6 text-slate-900">Resolution</th><td className="py-4">300 DPI minimum required</td></tr>
                      <tr><th className="py-4 pr-6 text-slate-900">Bleed Size</th><td className="py-4">2mm on all sides</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-6 max-w-3xl">
                  {[1,2,3].map(i => (
                    <div key={i} className="border-b border-slate-100 pb-6 mb-6 last:border-0">
                      <div className="flex items-center gap-1 text-amber-400 mb-2">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Excellent Quality</h4>
                      <p className="text-slate-600 text-sm font-medium mb-3">"The print quality is exactly what we needed for our corporate event. Highly recommended!"</p>
                      <div className="text-xs text-slate-400 font-medium">By John Doe on Oct 12, 2023</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 13. RELATED PRODUCTS */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 cursor-pointer">
                  <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center">
                    <Package className="w-12 h-12 text-slate-300 stroke-1" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">Related Product {i}</h3>
                    <p className="text-xs text-slate-500 mb-3">Premium quality printing</p>
                    <div className="font-extrabold text-slate-900">Rp 50.000</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
};
