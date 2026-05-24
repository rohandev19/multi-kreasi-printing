import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Plus, Minus, Package, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../contexts/ToastContext';

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: any;
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
  const [quantity, setQuantity] = useState<number>(1);
  const { addToCart } = useCart();
  const { success, error } = useToast();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/v1/products/${id}`);
      const data = response.data.data || response.data;
      
      const p = {
        ...data,
        category: typeof data.category === 'object' && data.category !== null ? data.category.name : data.category
      };
      
      setProduct(p);
      setQuantity(p.minOrderQuantity || 1);
    } catch (err) {
      console.error('Failed to fetch product details', err);
      // Fallback for demo if backend isn't ready
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
  };

  const handleQuantityChange = (newQty: number) => {
    const min = product?.minOrderQuantity || 1;
    const max = product?.maxOrderQuantity || 99999;
    
    if (newQty >= min && newQty <= max) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product, quantity);
      success('Added to Cart', `${quantity} ${product.name} added to your cart.`);
      navigate('/cart');
    } catch (err) {
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-6 w-24 bg-slate-100 rounded animate-pulse"></div>
          <div className="h-6 w-4 bg-slate-100 rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-slate-100 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/3] bg-slate-100 rounded-3xl animate-pulse"></div>
          <div className="flex flex-col gap-6">
            <div className="h-10 w-3/4 bg-slate-100 rounded animate-pulse"></div>
            <div className="h-6 w-1/4 bg-slate-100 rounded animate-pulse"></div>
            <div className="h-24 w-full bg-slate-100 rounded animate-pulse mt-4"></div>
            <div className="h-12 w-1/3 bg-slate-100 rounded animate-pulse mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-slate-500 mb-8 sm:mb-12">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
        <span className="mx-2 text-slate-300">/</span>
        <Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Product Image Section */}
        <div className="flex flex-col gap-6">
          <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2rem] overflow-hidden flex items-center justify-center border border-slate-200/60 shadow-sm relative group">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300">
                <Package className="w-24 h-24 mb-4 stroke-1" />
                <span className="text-sm font-bold tracking-widest uppercase text-slate-400">{product.category}</span>
              </div>
            )}
            <div className="absolute top-6 left-6">
              <span className="inline-flex px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-full bg-white/95 backdrop-blur-sm text-indigo-700 shadow-sm border border-indigo-100">
                {product.category}
              </span>
            </div>
          </div>
          
          {/* Value Propositions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 text-indigo-600">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Premium Quality</h4>
                <p className="text-xs text-slate-500 mt-0.5">Commercial grade materials</p>
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 text-indigo-600">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Fast Turnaround</h4>
                <p className="text-xs text-slate-500 mt-0.5">Express delivery available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors mb-6 self-start bg-indigo-50 px-3 py-1.5 rounded-full">
            <ArrowLeft size={16} />
            Back to Catalog
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-sm font-bold">
              <CheckCircle2 size={16} />
              <span>In Stock</span>
            </div>
          </div>

          <p className="text-lg text-slate-600 leading-relaxed font-medium mb-10">
            {product.description}
          </p>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 pb-8 border-b border-slate-100">
              <div>
                <span className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Base Price</span>
                <span className="text-4xl font-black text-slate-900 tracking-tight tabular-nums">
                  {formatCurrency(product.basePrice)}
                </span>
                <span className="text-slate-500 font-medium ml-2">/ unit</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-sm font-bold text-slate-900">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-between border-2 border-slate-100 rounded-2xl bg-white p-1 w-40 h-14">
                  <button 
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= (product.minOrderQuantity || 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50 text-slate-700 disabled:hover:bg-transparent"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="font-black text-lg text-slate-900 tabular-nums">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-all text-slate-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-sm font-medium text-slate-500">
                  Min order: {product.minOrderQuantity || 1}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <span className="text-slate-500 font-medium text-lg">Total</span>
                <span className="text-2xl font-black text-indigo-600 tabular-nums">
                  {formatCurrency(product.basePrice * quantity)}
                </span>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-[0.98]"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
