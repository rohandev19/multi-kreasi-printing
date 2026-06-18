import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, LayoutGrid, List, SearchX, ChevronLeft, ChevronRight, Package } from 'lucide-react';
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
  isNew?: boolean;
}

export const ProductsCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
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
        .map((p: any, index: number) => ({
          ...p,
          category: typeof p.category === 'object' && p.category !== null ? p.category.name : p.category,
          isNew: index < 2 // Mock new badge for first two products
        }));
      setProducts(activeProducts);
      
      const uniqueCategories = Array.from(new Set(activeProducts.map((p: Product) => p.category))) as string[];
      setCategories(['All', ...uniqueCategories]);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setProducts([]);
      setCategories(['All']);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
      success('Added to Cart', `1x ${product.name} added to your cart.`);
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

  // Filter and Sort logic
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.basePrice - b.basePrice;
    if (sortBy === 'price-high') return b.basePrice - a.basePrice;
    if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return 0; // Popular default
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* 1. PAGE HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-sm text-slate-500 font-medium mb-4 flex items-center gap-2">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-900">Products</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Our Products</h1>
          <p className="text-slate-500 font-medium">Browse our catalog of premium printing services.</p>
        </div>
      </div>

      {/* 2. FILTER BAR (sticky top) */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 sticky top-[72px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex-1 w-full overflow-x-auto scrollbar-hide py-1">
            <div className="flex items-center gap-2 min-w-max px-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    activeCategory === cat 
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 text-slate-600 font-medium hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="popular">Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProducts.length === 0 ? (
          /* 6. EMPTY/NO RESULTS STATE */
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200 border-dashed text-center">
            <SearchX className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* 3. PRODUCT GRID / 4. PRODUCT LIST */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Package className="w-16 h-16 text-slate-300 stroke-1" />
                      )}
                      
                      {product.isNew && (
                        <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                          NEW
                        </span>
                      )}
                      
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                        <Link to={`/products/${product.id}`} className="px-6 py-2 bg-white text-slate-900 font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
                          Quick View
                        </Link>
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                        {product.category}
                      </span>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                        {product.description}
                      </p>
                      
                      <div className="mt-auto">
                        <div className="mb-4">
                          <span className="text-xs text-slate-400 block mb-0.5">Starts from</span>
                          <span className="text-lg font-extrabold text-slate-900">{formatCurrency(product.basePrice)}</span>
                        </div>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="w-full h-10 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
                        >
                          <ShoppingCart size={16} /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all flex flex-col sm:flex-row gap-6 group">
                    <div className="w-full sm:w-48 h-48 sm:h-32 bg-slate-100 rounded-lg flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Package className="w-12 h-12 text-slate-300 stroke-1" />
                      )}
                      {product.isNew && (
                        <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          NEW
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                        {product.category}
                      </span>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-slate-500 max-w-2xl">
                        {product.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6 min-w-[200px]">
                      <div className="text-left sm:text-right mb-0 sm:mb-4">
                        <span className="text-xs text-slate-400 block mb-0.5">Starts from</span>
                        <span className="text-xl font-extrabold text-slate-900">{formatCurrency(product.basePrice)}</span>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="px-6 h-10 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
                      >
                        <ShoppingCart size={16} /> Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-medium text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-medium text-slate-900">{filteredProducts.length}</span> results
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
