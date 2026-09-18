import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart } from '@phosphor-icons/react';
import api from '../../api/axios';
import { useRoleContext } from '../../contexts/RoleContext';
import { useToast } from '../../contexts/ToastContext';
import { useCart } from '../../hooks/useCart';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  }
}

interface PricingTier {
  minQuantity: number;
  pricePerUnit: number;
}

interface Product {
  id: string;
  sku?: string;
  name: string;
  description: string;
  basePrice: number;
  unitOfMeasure?: string;
  categoryName: string;
  images: { url: string; isPrimary: boolean }[];
}

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useRoleContext();
  const { addToast, success } = useToast();
  const { addToCart, loading: cartLoading } = useCart();
  
  // Product State
  const [product, setProduct] = useState<Product | null>(null);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Mock State for other product aspects
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  
  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product, quantity);
      success('Berhasil', `${quantity} ${product.unitOfMeasure || 'unit'} ${product.name} ditambahkan ke keranjang.`);
    } catch (error) {
      addToast('error', 'Gagal menambahkan produk ke keranjang.');
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/v1/public/products/${id}`);
      setProduct(response.data.product);
      setPricingTiers(response.data.pricingTiers || []);
    } catch (error) {
      console.error('Error fetching product details:', error);
      addToast('error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/products/${id}/reviews`);
      setReviews(response.data.reviews || []);
      setReviewsTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('info', 'Please login to submit a review');
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: newRating,
        comment: newComment,
      });
      addToast('success', 'Review submitted successfully!');
      setNewComment('');
      setNewRating(5);
      fetchReviews(); // Refresh the list
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"></div>
          </div>
        ) : !product ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Product not found</h2>
            <Link to="/products" className="text-primary-600 hover:underline">Return to catalog</Link>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className="text-sm text-slate-500 font-medium mb-8">
              <Link to="/" className="hover:text-primary-600">Beranda</Link> <span className="mx-2">&gt;</span> 
              <Link to="/products" className="hover:text-primary-600">Produk</Link> <span className="mx-2">&gt;</span> 
              <span className="text-slate-900">{product.categoryName || 'Uncategorized'}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
              
              {/* LEFT COLUMN: Images */}
              <div className="lg:w-1/2 flex flex-col gap-4">
                <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden group cursor-zoom-in relative border border-slate-200 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[activeImageIndex].url} 
                      alt={product.name} 
                      className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-slate-400">No Image</span>
                  )}
                </div>
                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                          activeImageIndex === idx ? 'border-primary-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Configuration */}
              <div className="lg:w-1/2">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">{product.categoryName || 'Uncategorized'}</span>
                    {product.sku && <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">SKU: {product.sku}</span>}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{product.name}</h1>
                  
                  <div className="flex items-end gap-2 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="block text-sm text-slate-500 font-medium mb-1">Harga Mulai Dari</span>
                      <span className="text-4xl font-extrabold text-slate-900">{formatIDR(product.basePrice)}</span>
                      {product.unitOfMeasure && <span className="text-slate-500 font-medium ml-2">/ {product.unitOfMeasure}</span>}
                    </div>
                  </div>
                  
                  <p className="text-slate-600 mb-8 leading-relaxed">{product.description || 'Tidak ada deskripsi untuk produk ini.'}</p>

                  {pricingTiers.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Harga Grosir (Volume Discount)</h3>
                      <div className="overflow-hidden border border-slate-200 rounded-xl">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3 font-bold">Minimum Qty</th>
                              <th className="px-4 py-3 font-bold">Harga per {product.unitOfMeasure || 'unit'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {pricingTiers.map((tier, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-900">≥ {tier.minQuantity} {product.unitOfMeasure || ''}</td>
                                <td className="px-4 py-3 font-bold text-primary-700">{formatIDR(tier.pricePerUnit)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 space-y-4">
                    {/* Quantity + Add to Cart */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center h-12 rounded-xl overflow-hidden shrink-0" style={{ border: '2px solid #e2e8f0' }}>
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-11 h-full flex items-center justify-center transition-colors font-bold text-lg"
                          style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                        >
                          −
                        </button>
                        <span className="w-14 h-full flex items-center justify-center font-bold text-base" style={{ borderLeft: '2px solid #e2e8f0', borderRight: '2px solid #e2e8f0', color: '#0f172a' }}>
                          {quantity}
                        </span>
                        <button 
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-11 h-full flex items-center justify-center transition-colors font-bold text-lg"
                          style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={handleAddToCart}
                        disabled={cartLoading}
                        className="flex-1 h-12 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{ 
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', 
                          color: '#ffffff',
                          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #0369a1 0%, #075985 100%)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)')}
                      >
                        <ShoppingCart size={20} weight="bold" />
                        {cartLoading ? 'Menambahkan...' : 'Tambahkan ke Keranjang'}
                      </button>
                    </div>

                    {/* B2B CTA Row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link 
                        to={`/contact?product=${product.id}`}
                        className="flex-1 py-3 font-bold rounded-xl transition-all flex items-center justify-center text-sm"
                        style={{ 
                          backgroundColor: '#f0f9ff', 
                          color: '#0369a1', 
                          border: '2px solid #bae6fd',
                        }}
                      >
                        Minta Penawaran B2B
                      </Link>
                      <Link 
                        to="/contact"
                        className="flex-1 py-3 font-bold rounded-xl transition-all flex items-center justify-center text-sm"
                        style={{ 
                          backgroundColor: '#ffffff', 
                          color: '#475569', 
                          border: '2px solid #e2e8f0',
                        }}
                      >
                        Hubungi Sales
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

        {/* BELOW FOLD: Tabs */}
        <div className="mt-24 border-t border-slate-200 pt-16">
          <div className="flex gap-8 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('description')}
              className={`pb-4 text-base font-bold whitespace-nowrap transition-colors ${activeTab === 'description' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Deskripsi
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-base font-bold whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Ulasan ({reviewsTotal})
            </button>
          </div>

          <div className="max-w-3xl">
            {activeTab === 'description' && (
              <div className="prose prose-slate prose-indigo max-w-none">
                <p>{product.description || 'Belum ada deskripsi.'}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Review Form */}
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">Write a Review</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className={`text-2xl focus:outline-none ${newRating >= star ? 'text-amber-400' : 'text-slate-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-3 border"
                        rows={3}
                        placeholder="What do you think about this product?"
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                    <p className="text-slate-600 mb-2">Please log in to write a review for this product.</p>
                    <Link to="/login" className="text-primary-600 font-medium hover:underline">Log in now</Link>
                  </div>
                )}

                {/* Review List */}
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="pb-6 border-b border-slate-100 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 uppercase overflow-hidden">
                              {review.user.avatarUrl ? (
                                <img src={review.user.avatarUrl} alt={review.user.fullName} className="w-full h-full object-cover" />
                              ) : (
                                review.user.fullName.substring(0, 2)
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{review.user.fullName}</p>
                              <div className="flex text-amber-400 gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} size={12} fill={review.rating >= star ? 'currentColor' : 'none'} className={review.rating < star ? 'text-slate-200' : ''} weight="regular" />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mt-2">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};
