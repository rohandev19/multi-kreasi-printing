import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Attempt to merge cart if user is Customer
      if (response.data.user.role === 'Customer') {
        const localCart = localStorage.getItem('mk_cart');
        if (localCart) {
          const parsedCart = JSON.parse(localCart);
          if (parsedCart.length > 0) {
            try {
              // Extract only what's needed for the DTO
              const guestCartItems = parsedCart.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity
              }));
              await api.post('/api/v1/cart/merge', { guestCartItems }, {
                headers: { Authorization: `Bearer ${response.data.accessToken}` }
              });
              // Note: We don't clear localStorage 'mk_cart' here because CartContext 
              // currently syncs to localStorage. A robust approach for 11.3 would be 
              // CartContext detecting logged in user and fetching from server instead.
              // For now, the merge ensures the backend has the cart data.
            } catch (mergeErr) {
              console.error('Failed to merge cart on login', mergeErr);
            }
          }
        }
      }

      // Handle redirect parameter
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect') || '/';
      
      navigate(redirectUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 font-sans">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">MK Printing</h2>
          <p className="text-slate-500">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
              placeholder="admin@mkprinting.com" 
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold shadow-md hover:bg-blue-700 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
