import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Printer, List } from '@phosphor-icons/react';
import { useRoleContext } from '../../../contexts/RoleContext';

export const PublicLayout: React.FC = () => {
  const { role } = useRoleContext();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      <header
        className="sticky top-0 z-40 w-full border-b transition-all duration-150 ease-out"
        style={{
          backgroundColor: isHome ? 'rgba(15, 20, 25, 0.78)' : 'rgba(255, 255, 255, 0.82)',
          borderColor: isHome ? 'rgba(255,255,255,0.08)' : 'var(--border-default)',
          backdropFilter: 'blur(8px)',
          color: isHome ? 'var(--text-inverse)' : 'var(--text-primary)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex shrink-0 items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150"
                  style={{
                    backgroundColor: isHome ? 'var(--color-primary-500)' : 'var(--color-primary-600)',
                    color: 'white',
                  }}
                >
                  <Printer size={20} weight="regular" />
                </div>
                <span className="text-xl font-extrabold tracking-tight">MK Printing</span>
              </Link>
            </div>

            <nav className="hidden items-center gap-8 md:flex">
              <Link to="/products" className="text-sm font-medium transition-colors duration-150" style={{ color: isHome ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)' }}>
                Products
              </Link>
              <Link to="/about" className="text-sm font-medium transition-colors duration-150" style={{ color: isHome ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)' }}>
                About Us
              </Link>
              <Link to="/custom-order" className="text-sm font-medium transition-colors duration-150" style={{ color: isHome ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)' }}>
                Custom Order
              </Link>
              <Link to="/contact" className="text-sm font-medium transition-colors duration-150" style={{ color: isHome ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)' }}>
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link to="/cart" className="relative rounded-full p-2 transition-colors duration-150" style={{ color: isHome ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)' }}>
                <ShoppingCart size={20} weight="regular" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--color-primary-600)' }}>
                  0
                </span>
              </Link>

              {role ? (
                <Link to="/dashboard" className="hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 sm:flex" style={{ backgroundColor: isHome ? 'rgba(255,255,255,0.08)' : 'var(--color-primary-50)', color: isHome ? 'white' : 'var(--color-primary-700)' }}>
                  <User size={16} weight="regular" />
                  Dashboard
                </Link>
              ) : (
                <div className="hidden items-center gap-2 sm:flex">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium transition-colors duration-150" style={{ color: isHome ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)' }}>
                    Log In
                  </Link>
                  <Link to="/register" className="rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-150" style={{ backgroundColor: 'var(--color-primary-600)', color: 'white' }}>
                    Sign Up
                  </Link>
                </div>
              )}

              <button className="rounded-lg p-2 md:hidden" style={{ color: isHome ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)' }}>
                <List size={24} weight="regular" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="mt-auto border-t py-12" style={{ backgroundColor: 'var(--color-neutral-900)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <Printer size={24} weight="regular" style={{ color: 'var(--color-primary-400)' }} />
                <span className="text-xl font-extrabold tracking-tight text-white">MK Printing</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-neutral-400)' }}>
                Premium enterprise B2B printing solutions for modern businesses. Quality guaranteed.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="transition-colors duration-150 hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="transition-colors duration-150 hover:text-white">Contact</Link></li>
                <li><Link to="/careers" className="transition-colors duration-150 hover:text-white">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Services</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/products" className="transition-colors duration-150 hover:text-white">Product Catalog</Link></li>
                <li><Link to="/custom-order" className="transition-colors duration-150 hover:text-white">Custom Orders</Link></li>
                <li><Link to="/bulk" className="transition-colors duration-150 hover:text-white">Bulk Printing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="transition-colors duration-150 hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="transition-colors duration-150 hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/help" className="transition-colors duration-150 hover:text-white">Help &amp; Support</Link></li>
                <li><Link to="/faq" className="transition-colors duration-150 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between border-t pt-8 text-sm md:flex-row" style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'var(--color-neutral-400)' }}>
            <p>&copy; {new Date().getFullYear()} PT Multi Kreasi Printing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
