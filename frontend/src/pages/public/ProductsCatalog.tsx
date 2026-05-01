import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Filter } from 'lucide-react';
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
}

export const ProductsCatalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const { addToCart } = useCart();
  const { success, error } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/api/v1/products');
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      const activeProducts = data.filter((p: Product) => p.isActive !== false);
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

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      success('Added to Cart', 'Product has been added to your cart.');
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
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Product Catalog</h1>
          <p className="mt-2 text-gray-500">Professional printing solutions tailored for your business needs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="text-gray-300 font-medium text-lg uppercase tracking-widest">{product.category}</div>
              )}
              <div className="absolute top-3 left-3">
                <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-white/90 backdrop-blur text-gray-700 shadow-sm">
                  {product.category}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                {product.description}
              </p>
              
              <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="font-bold text-gray-900 tabular-nums">
                  {formatCurrency(product.basePrice)}
                </div>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors"
                  title="Add to Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 border-dashed">
          <p className="text-gray-500 text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  );
};
