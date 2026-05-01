import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { ShoppingCart, Search, Printer, LogIn, Menu } from 'lucide-react';
import { useRoleContext } from '../../../contexts/RoleContext';

export const PublicLayout = () => {
  const { items } = useCart();
  const { user } = useRoleContext();
  const navigate = useNavigate();

  const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/products');
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top bar */}
      <div className="bg-indigo-900 text-indigo-100 py-1.5 text-xs font-medium text-center px-4 tracking-wide">
        Enterprise-grade printing solutions for businesses of all sizes.
      </div>
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                  <Printer size={22} />
                </div>
                <div>
                  <span className="text-xl font-black text-slate-900 tracking-tight block leading-none">Multi Kreasi</span>
                  <span className="text-sm font-bold text-indigo-600 tracking-wider uppercase">Printing</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/products" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Products</Link>
              <Link to="/about" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">About Us</Link>
              <Link to="/contact" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Contact</Link>
            </nav>

            {/* Search & Actions */}
            <div className="flex items-center space-x-5">
              <div className="hidden md:block">
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-64 pl-10 pr-3 py-2 border border-slate-300 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                    placeholder="Search products..."
                  />
                </form>
              </div>

              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <Link to="/cart" className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors">
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </Link>
                
                {user ? (
                  <Link
                    to="/dashboard"
                    className="hidden md:inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-full shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
                
                {/* Mobile menu button */}
                <button className="md:hidden p-2 text-slate-500">
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                  <Printer size={18} />
                </div>
                <div>
                  <span className="text-lg font-black text-white tracking-tight block leading-none">Multi Kreasi</span>
                </div>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your trusted partner for all professional printing needs. Delivering quality, speed, and reliability.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Services</h3>
              <ul className="space-y-3">
                <li><Link to="/products" className="text-slate-400 hover:text-white transition-colors text-sm">Business Cards</Link></li>
                <li><Link to="/products" className="text-slate-400 hover:text-white transition-colors text-sm">Corporate Materials</Link></li>
                <li><Link to="/products" className="text-slate-400 hover:text-white transition-colors text-sm">Large Format Banners</Link></li>
                <li><Link to="/products" className="text-slate-400 hover:text-white transition-colors text-sm">Custom Packaging</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-slate-400 hover:text-white transition-colors text-sm">About Us</Link></li>
                <li><Link to="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">Contact</Link></li>
                <li><Link to="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">Terms & Conditions</Link></li>
                <li><Link to="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-4">Contact</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li>Jl. Sudirman No. 123</li>
                <li>Jakarta Selatan, 12190</li>
                <li className="pt-2">hello@mkprinting.com</li>
                <li>+62 812 3456 7890</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Multi Kreasi Printing. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
