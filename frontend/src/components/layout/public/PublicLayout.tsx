import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { ShoppingCartIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const PublicNavbar = () => {
  const { items } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/products')}>
            <span className="text-2xl font-bold text-indigo-600">MK Printing</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search products..."
              />
            </div>
          </div>

          {/* Right Nav */}
          <div className="flex items-center space-x-6">
            <Link to="/cart" className="text-gray-500 hover:text-gray-900 relative">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-red-600 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                Dashboard
              </Link>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-indigo-600">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const PublicFooter = () => (
  <footer className="bg-gray-800">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <span className="text-2xl font-bold text-white">MK Printing</span>
          <p className="mt-4 text-gray-400 text-sm">
            Professional printing solutions for businesses of all sizes. 
            High-quality materials, fast turnaround times, and exceptional customer service.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Products</h3>
          <ul className="mt-4 space-y-4">
            <li><Link to="/products" className="text-base text-gray-400 hover:text-white">Business Cards</Link></li>
            <li><Link to="/products" className="text-base text-gray-400 hover:text-white">Banners</Link></li>
            <li><Link to="/products" className="text-base text-gray-400 hover:text-white">Marketing Materials</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
          <ul className="mt-4 space-y-4">
            <li><Link to="/about" className="text-base text-gray-400 hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="text-base text-gray-400 hover:text-white">Contact</Link></li>
            <li><Link to="/terms" className="text-base text-gray-400 hover:text-white">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-700 pt-8 flex justify-center">
        <p className="text-base text-gray-400">
          &copy; {new Date().getFullYear()} Multi Kreasi Printing. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};
