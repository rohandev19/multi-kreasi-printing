import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  categoryName?: string;
  images: { url: string; isPrimary: boolean }[];
}

interface Category {
  id: string;
  name: string;
}

export const CatalogPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and Pagination
  const [search] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [page, categoryId, sortBy, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/public/products', {
        params: { search, categoryId, sortBy, page, limit }
      });
      setProducts(res.data.data);
      setCategories(res.data.categories);
      setTotalPages(res.data.meta.totalPages);
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          <div className="space-y-2">
            <button
              onClick={() => { setCategoryId(''); setPage(1); }}
              className={`block w-full text-left px-3 py-2 rounded-md ${
                categoryId === '' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => { setCategoryId(category.id); setPage(1); }}
                className={`block w-full text-left px-3 py-2 rounded-md ${
                  categoryId === category.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4">Sort By</h3>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="NEWEST">Newest Arrivals</option>
            <option value="PRICE_ASC">Price: Low to High</option>
            <option value="PRICE_DESC">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Search (Desktop search is in Navbar, but we can have one here too if needed, leaving it simple for now) */}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center bg-red-50 rounded-md">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-gray-500 p-8 text-center bg-white rounded-lg shadow-sm border border-gray-100">
            No products found matching your criteria.
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-w-4 aspect-h-3 bg-gray-200">
                      {product.images.length > 0 ? (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name} 
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center text-gray-400 bg-gray-100">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 flex flex-col justify-between" style={{ minHeight: '160px' }}>
                    <div>
                      <p className="text-xs text-indigo-600 font-semibold mb-1">{product.categoryName}</p>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                      </Link>
                      <p className="text-xl font-bold text-gray-900 mt-2">Rp {product.basePrice.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => addToCart({
                        productId: product.id,
                        name: product.name,
                        unitPrice: product.basePrice,
                        quantity: 1,
                        image: product.images[0]?.url
                      })}
                      className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
