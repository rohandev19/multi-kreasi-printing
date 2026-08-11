import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

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

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  // Mock State for other product aspects
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [quantity, setQuantity] = useState(1);
  const [paperType, setPaperType] = useState('Art Paper 150gsm');
  const [finishing, setFinishing] = useState<string[]>([]);
  const [size, setSize] = useState('A4');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsAverage, setReviewsAverage] = useState(0);
  
  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const basePrice = 150000;
  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/products/${id}/reviews`);
      setReviews(response.data.reviews || []);
      setReviewsTotal(response.data.total || 0);
      setReviewsAverage(response.data.averageRating || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('warning', 'Please login to submit a review');
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
            </div>
          </div>

          {/* RIGHT COLUMN: Configuration */}
          <div className="lg:w-1/2">
            <div className="mb-6">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">Flyers & Leaflets</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Premium A5 Flyers</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={18} fill={reviewsAverage >= 1 ? "currentColor" : "none"} />
                  <Star size={18} fill={reviewsAverage >= 2 ? "currentColor" : "none"} />
                  <Star size={18} fill={reviewsAverage >= 3 ? "currentColor" : "none"} />
                  <Star size={18} fill={reviewsAverage >= 4 ? "currentColor" : "none"} />
                  <Star size={18} fill={reviewsAverage >= 5 ? "currentColor" : "none"} className={reviewsAverage < 5 ? "text-slate-200" : ""} />
                </div>
                <span className="text-sm font-medium text-slate-600">{reviewsAverage} ({reviewsTotal} reviews)</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <button onClick={() => setActiveTab('reviews')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Write a review</button>
              </div>

              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-extrabold text-slate-900">{formatIDR(basePrice)}</span>
                <span className="text-slate-500 font-medium mb-1">/ 100 pcs (1 box)</span>
              </div>
              <p className="text-slate-600">High-quality printed flyers for your marketing needs. Choose your preferred paper, size, and finishing options below.</p>
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
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-base font-bold whitespace-nowrap transition-colors ${activeTab === 'reviews' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Reviews ({reviewsTotal})
            </button>
          </div>

          <div className="max-w-3xl">
            {activeTab === 'description' && (
              <div className="prose prose-slate prose-indigo max-w-none">
                <p>Maximize your marketing reach with our premium full-color flyers and leaflets.</p>
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
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                        rows={3}
                        placeholder="What do you think about this product?"
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                    <p className="text-slate-600 mb-2">Please log in to write a review for this product.</p>
                    <Link to="/login" className="text-indigo-600 font-medium hover:underline">Log in now</Link>
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
                                  <Star key={star} size={12} fill={review.rating >= star ? 'currentColor' : 'none'} className={review.rating < star ? 'text-slate-200' : ''} />
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

      </div>
    </div>
  );
};
