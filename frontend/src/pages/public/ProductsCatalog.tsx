import React, { useState, useEffect } from 'react';
import { MagnifyingGlass, GridFour, List, ShoppingCart } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  categoryName: string;
  imageUrl: string | null;
  isNew?: boolean;
}

export const ProductsCatalog: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          api.get('/api/v1/public/products/categories'),
          api.get('/api/v1/public/products')
        ]);
        setCategories(categoriesRes.data.data || []);
        setProducts(productsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch catalog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategoryId === 'all' || p.categoryId === activeCategoryId;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.basePrice - b.basePrice;
    if (sortBy === 'price-high') return b.basePrice - a.basePrice;
    return 0; // newest/default - this is a simplification since we don't have createdAt yet
  });

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      {/* 1. PAGE HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="text-sm text-slate-500 font-medium mb-4">
          <Link to="/" className="hover:text-primary-600">Home</Link> <span className="mx-2">&gt;</span> Products
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
        <p className="text-slate-500 font-medium mt-2">Browse our high-quality printing services</p>
      </div>

      {/* 2. FILTER BAR (Sticky) */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-4 justify-between">
          
          <div className="relative w-full md:w-80 shrink-0">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} weight="regular" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm placeholder:text-slate-400 outline-none transition-all"
            />
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar w-full flex items-center gap-2 pb-1 md:pb-0">
            <button
              onClick={() => setActiveCategoryId('all')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategoryId === 'all'
                  ? 'bg-primary-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeCategoryId === cat.id
                    ? 'bg-primary-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                aria-label="Grid View"
              >
                <GridFour size={18} weight="regular" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                aria-label="List View"
              >
                <List size={18} weight="regular" />
              </button>
            </div>
            
            <select 
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-slate-600 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT GRID/LIST */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
             <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"></div>
                <p className="text-sm font-medium text-slate-500">Loading catalog...</p>
             </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <MagnifyingGlass size={48} className="mb-4 text-slate-300" weight="regular" />
            <h3 className="mb-2 text-xl font-bold text-slate-900">Produk belum tersedia</h3>
            <p className="mb-6 max-w-md text-slate-500">Tidak ada produk yang cocok dengan pencarian Anda.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategoryId('all'); }}
                className="px-6 py-2.5 bg-primary-50 text-primary-700 font-bold rounded-xl hover:bg-primary-100 transition-colors"
              >
                Reset Filter
              </button>
              <Link to="/contact" className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">
                Hubungi Sales
              </Link>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col overflow-hidden">
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden shrink-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-slate-400">No Image</div>
                  )}
                  {product.isNew && (
                    <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm z-10">NEW</span>
                  )}
                  <Link to={`/products/${product.id}`} className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 backdrop-blur-[2px]">
                    <span className="bg-white text-slate-900 font-bold text-sm px-6 py-2.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Quick View</span>
                  </Link>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">{product.categoryName || 'Uncategorized'}</span>
                  <Link to={`/products/${product.id}`} className="text-base font-bold text-slate-900 mb-1 line-clamp-2 hover:text-primary-600 transition-colors">{product.name}</Link>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                  <div className="flex flex-col gap-1 mb-4">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Starts From</span>
                    <span className="text-xl font-extrabold text-slate-900">{formatIDR(product.basePrice)}</span>
                  </div>
                  <Link 
                    to={`/products/${product.id}`}
                    className="w-full h-11 bg-slate-50 text-primary-700 text-sm font-bold rounded-xl hover:bg-primary-600 hover:text-white transition-all flex items-center justify-center gap-2 mt-auto border border-primary-100 hover:border-primary-600"
                  >
                    <ShoppingCart size={16} weight="regular" /> Configure
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-full sm:w-48 h-32 shrink-0 bg-slate-100 rounded-lg overflow-hidden relative flex items-center justify-center">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400">No Image</span>
                  )}
                  {product.isNew && (
                    <span className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">NEW</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1 block">{product.categoryName || 'Uncategorized'}</span>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{product.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">{product.description}</p>
                </div>
                <div className="flex flex-col sm:items-end w-full sm:w-auto shrink-0 gap-3 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                  <div className="flex flex-col sm:items-end">
                    <span className="text-xs text-slate-400">Starts From</span>
                    <span className="text-2xl font-extrabold text-slate-900">{formatIDR(product.basePrice)}</span>
                  </div>
                  <Link 
                    to={`/products/${product.id}`}
                    className="w-full sm:w-auto px-6 h-10 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} weight="regular" /> Configure
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. PAGINATION (Static Mock) */}
        {filteredProducts.length > 0 && (
          <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
            <div className="text-sm text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">1-{filteredProducts.length}</span> of <span className="font-bold text-slate-900">{filteredProducts.length}</span> results
            </div>
            <div className="flex gap-1">
              <button disabled className="px-3 py-1.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg text-sm font-medium cursor-not-allowed">Previous</button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium bg-primary-600 text-white border-primary-600 border shadow-sm">1</button>
              <button disabled className="px-3 py-1.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg text-sm font-medium cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
