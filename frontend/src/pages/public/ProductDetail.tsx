import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../hooks/useCart';

interface ProductDetail {
  product: {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    categoryId: string;
    categoryName?: string;
    images: { url: string; isPrimary: boolean }[];
  };
  pricingTiers: {
    minQuantity: number;
    pricePerUnit: number;
  }[];
}

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/v1/public/products/${id}`);
        setData(res.data);
        const primaryImage = res.data.product.images.find((img: any) => img.isPrimary)?.url;
        if (primaryImage) setActiveImage(primaryImage);
        else if (res.data.product.images.length > 0) setActiveImage(res.data.product.images[0].url);
      } catch (err) {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <p className="mt-2 text-gray-500">{error}</p>
        <Link to="/products" className="mt-6 inline-block text-indigo-600 hover:text-indigo-500">
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  const { product, pricingTiers } = data;

  const currentPrice = pricingTiers.slice().reverse().find(tier => quantity >= tier.minQuantity)?.pricePerUnit || product.basePrice;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 md:p-10">
      <Link to="/products" className="text-sm text-gray-500 hover:text-indigo-600 mb-8 inline-block">
        &larr; Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-lg overflow-hidden mb-4">
            {activeImage ? (
              <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img.url)}
                className={`aspect-w-1 aspect-h-1 rounded-md overflow-hidden border-2 ${
                  activeImage === img.url ? 'border-indigo-600' : 'border-transparent'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">
            {product.categoryName}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {product.name}
          </h1>
          
          <div className="mt-6">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl text-gray-900">
              Rp {currentPrice.toLocaleString()} <span className="text-base text-gray-500">/ unit</span>
            </p>
          </div>

          <div className="mt-6 border-t border-b border-gray-200 py-6 text-gray-700 whitespace-pre-wrap">
            {product.description}
          </div>

          {/* Pricing Tiers Table */}
          {pricingTiers.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900">Bulk Pricing</h3>
              <div className="mt-2 bg-gray-50 rounded-lg p-4">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="text-right text-xs font-medium text-gray-500 uppercase">Price per unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pricingTiers.map((tier, idx) => (
                      <tr key={idx}>
                        <td className="py-2 text-sm text-gray-900">{tier.minQuantity}+</td>
                        <td className="py-2 text-sm text-right text-gray-900">Rp {tier.pricePerUnit.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-10 flex">
            <div className="mr-4">
              <label htmlFor="quantity" className="sr-only">Quantity</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 text-center rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3"
              />
            </div>
            <button
              type="button"
              onClick={() => addToCart({
                productId: product.id,
                name: product.name,
                unitPrice: currentPrice,
                quantity: quantity,
                image: activeImage || undefined
              })}
              className="flex-1 max-w-xs bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 sm:w-full"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
