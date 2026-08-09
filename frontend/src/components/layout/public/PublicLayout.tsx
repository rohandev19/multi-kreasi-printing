import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, Printer } from 'lucide-react';
import { useRoleContext } from '../../../contexts/RoleContext';

export const PublicLayout: React.FC = () => {
  const { role } = useRoleContext();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      {/* Navbar */}
      <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isHome 
          ? 'bg-slate-950/80 backdrop-blur-md border-b border-white/10 text-white' 
          : 'bg-white/80 backdrop-blur-md border-b border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex shrink-0 items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isHome ? 'bg-indigo-500 text-white' : 'bg-indigo-600 text-white group-hover:bg-indigo-700'
                }`}>
                  <Printer size={20} />
                </div>
                <span className="font-extrabold text-xl tracking-tight">MK Printing</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/products" className={`text-sm font-medium transition-colors ${
                isHome ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'
              }`}>
                Products
              </Link>
              <Link to="/about" className={`text-sm font-medium transition-colors ${
                isHome ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'
              }`}>
                About Us
              </Link>
              <Link to="/custom-order" className={`text-sm font-medium transition-colors ${
                isHome ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'
              }`}>
                Custom Order
              </Link>
              <Link to="/contact" className={`text-sm font-medium transition-colors ${
                isHome ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'
              }`}>
                Contact
              </Link>
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-4">
              <Link to="/cart" className={`relative p-2 rounded-full transition-colors ${
                isHome ? 'text-slate-300 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
              }`}>
                <ShoppingCart size={20} />
                <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  0
                </span>
              </Link>

              {role ? (
                <Link
                  to="/dashboard"
                  className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isHome 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  }`}
                >
                  <User size={16} />
                  Dashboard
                </Link>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      isHome ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-indigo-600'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
                      isHome
                        ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button className={`md:hidden p-2 rounded-lg ${
                isHome ? 'text-slate-300' : 'text-slate-600'
              }`}>
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Printer size={24} className="text-indigo-500" />
                <span className="font-extrabold text-xl text-white tracking-tight">MK Printing</span>
              </div>
              <p className="text-sm text-slate-500">
                Premium enterprise B2B printing solutions for modern businesses. Quality guaranteed.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-indigo-400 transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Services</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="hover:text-indigo-400 transition-colors">Product Catalog</Link></li>
                <li><Link to="/custom-order" className="hover:text-indigo-400 transition-colors">Custom Orders</Link></li>
                <li><Link to="/bulk" className="hover:text-indigo-400 transition-colors">Bulk Printing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                <li><Link to="/faq" className="hover:text-indigo-400 transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; {new Date().getFullYear()} PT Multi Kreasi Printing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
