import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Plus, Minus, SearchX } from 'lucide-react';
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
}

export const ProductsCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const { addToCart } = useCart();
  const { success, error } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/v1/products');
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      const activeProducts = data
        .filter((p: any) => p.isActive !== false)
        .map((p: any) => ({
          ...p,
          category: typeof p.category === 'object' && p.category !== null ? p.category.name : p.category
        }));
      setProducts(activeProducts);
      
      const uniqueCategories = Array.from(new Set(activeProducts.map((p: Product) => p.category))) as string[];
      setCategories(['All', ...uniqueCategories]);
    } catch (err) {
      console.error('Failed to fetch products', err);
      // Fallback for demo purposes if backend isn't ready
      const fallbackProducts: Product[] = [
        { id: '1', name: 'Premium Business Cards', description: '300gsm matte finish with double-sided printing.', basePrice: 150000, category: 'Business Cards', isActive: true },
        { id: '2', name: 'Indoor Vinyl Banner', description: 'High-resolution indoor banner. Price per square meter.', basePrice: 85000, category: 'Banners', isActive: true },
        { id: '3', name: 'Corporate Brochure', description: 'A4 tri-fold brochure on glossy paper.', basePrice: 25000, category: 'Marketing', isActive: true },
        { id: '4', name: 'Custom Stickers', description: 'Die-cut vinyl stickers. Minimum order 100.', basePrice: 1500, category: 'Stickers', isActive: true },
      ];
      setProducts(fallbackProducts);
      setCategories(['All', 'Business Cards', 'Banners', 'Marketing', 'Stickers']);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, value: number) => {
    setQuantities(prev => ({ ...prev, [productId]: Math.max(1, value) }));
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const qty = quantities[product.id] || 1;
      await addToCart(product, qty);
      success('Added to Cart', `${qty} ${product.name} added to your cart.`);
      setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    } catch (err) {
      error('Failed to Add', 'Could not add product to cart. Please try again.');
    }
  };

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-48 bg-slate-100 rounded-3xl animate-pulse mb-12"></div>
        <div className="flex gap-4 mb-8 overflow-x-hidden">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-10 w-24 bg-slate-100 rounded-full animate-pulse"></div>)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[400px]">
              <div className="h-48 bg-slate-50 animate-pulse border-b border-slate-100"></div>
              <div className="p-5 flex flex-col flex-1 gap-3">
                <div className="h-6 bg-slate-100 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse"></div>
                <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-50">
                  <div className="h-8 bg-slate-100 rounded w-1/3 animate-pulse"></div>
                  <div className="h-11 bg-slate-100 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white p-8 sm:p-12 mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-slate-900 to-purple-900/40 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
            Enterprise Print Solutions
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-xl font-medium">
            High-quality commercial printing tailored for your business needs. Select from our catalog below to get started.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat 
                  ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium px-2">
          <span className="text-slate-900 font-bold">{filteredProducts.length}</span> products
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col relative">
            
            {/* Image Container */}
            <Link to={`/products/${product.id}`} className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-50">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors duration-300">
                  <Package className="w-12 h-12 mb-3 stroke-1" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 group-hover:text-blue-400">{product.category}</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className="inline-flex px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase rounded-full bg-white/95 backdrop-blur-sm text-slate-800 shadow-sm border border-slate-100/50">
                  {product.category}
                </span>
              </div>
            </Link>
            
            {/* Content Container */}
            <div className="p-6 flex flex-col flex-1">
              <Link to={`/products/${product.id}`}>
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
              </Link>
              <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-1 font-medium leading-relaxed">
                {product.description}
              </p>
              
              <div className="mt-auto space-y-5">
                <div className="flex items-end justify-between">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Starting at</div>
                  <div className="font-extrabold text-slate-900 text-xl tabular-nums tracking-tight">
                    {formatCurrency(product.basePrice)}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50 p-1 flex-1 h-12">
                    <button 
                      onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) - 1)}
                      disabled={(quantities[product.id] || 1) <= 1}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all disabled:opacity-50 text-slate-600 disabled:hover:bg-transparent disabled:hover:shadow-none"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-sm text-slate-900 tabular-nums">
                      {quantities[product.id] || 1}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 1) + 1)}
                      className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="h-12 px-5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-2 hover:bg-blue-600 transition-all flex-shrink-0 shadow-sm hover:shadow-md active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="hidden sm:inline-block">Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50 rounded-3xl border border-slate-200 border-dashed">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-5">
            <SearchX className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 mb-2">No products found</h3>
          <p className="text-slate-500 text-center max-w-md font-medium leading-relaxed mb-6">
            We couldn't find any products in the "{activeCategory}" category. Please try selecting a different category or clear your filters.
          </p>
          <button 
            onClick={() => setActiveCategory('All')}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
