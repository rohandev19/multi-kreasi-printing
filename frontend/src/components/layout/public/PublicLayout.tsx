import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Printer, List, X, Package, Phone, WhatsappLogo, MapPin, CheckCircle, Clock, Truck } from '@phosphor-icons/react';
import { useRoleContext } from '../../../contexts/RoleContext';
import { Footer } from './Footer';
import { useCart } from '../../../hooks/useCart';

const navLinks = [
  { to: '/products', label: 'Produk' },
  { to: '/about', label: 'Tentang Kami' },
  { to: '/custom-order', label: 'Pesanan Kustom' },
  { to: '/contact', label: 'Kontak' },
  { to: '/faq', label: 'FAQ' },
  { to: '/careers', label: 'Karir' },
];

export const PublicLayout: React.FC = () => {
  const { role } = useRoleContext();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();



  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(15, 20, 25, 0.5)' }}
        />
      )}

      {/* Mobile sidebar drawer (slides from right) */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 lg:hidden`}
        style={{
          backgroundColor: 'var(--bg-elevated)',
          boxShadow: mobileMenuOpen ? '-4px 0 24px rgba(0,0,0,0.15)' : 'none',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
        }}
      >
        <div className="flex h-16 items-center justify-between border-b px-4" style={{ borderColor: 'var(--border-default)' }}>
          <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobileMenu}
            className="rounded-lg p-2 transition-colors duration-150 ease-out"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <X size={22} weight="regular" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeMobileMenu}
              className="rounded-lg px-4 py-3 text-sm font-medium transition-colors duration-150 ease-out"
              style={{
                color: location.pathname === link.to ? 'var(--color-primary-600)' : 'var(--text-primary)',
                backgroundColor: location.pathname === link.to ? 'rgba(15, 23, 42, 0.06)' : 'transparent',
              }}
              onMouseEnter={(e) => { if (location.pathname !== link.to) e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)'; }}
              onMouseLeave={(e) => { if (location.pathname !== link.to) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mx-3 my-2 h-px" style={{ backgroundColor: 'var(--border-default)' }} />

        <div className="flex flex-col gap-2 p-3">
          {role ? (
            <>
              {role === 'Customer' && (
                <Link
                  to="/dashboard/my-orders"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ease-out border border-slate-200 active:scale-[0.98]"
                >
                  <Package size={18} weight="regular" />
                  Pesanan Saya
                </Link>
              )}
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ease-out active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-neutral-100)', color: 'var(--color-neutral-900)' }}
              >
                <User size={18} weight="regular" />
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="text-center rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.98]"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Masuk
              </Link>
              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="text-center rounded-xl px-4 py-3 text-sm font-semibold shadow-xs transition-all duration-150 ease-out active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-primary-600)', color: '#ffffff' }}
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* B2B Industrial Utility Top Bar */}
      <div className="hidden lg:block bg-slate-100/90 text-slate-700 text-xs border-b border-slate-200/90 py-1.5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 whitespace-nowrap">
          {/* Left: Identity & Location */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="font-bold text-slate-900 tracking-tight">PT MULTI KREASI PRINTING</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <MapPin size={13} weight="bold" className="text-slate-400" />
              Jakarta Barat
            </span>
          </div>

          {/* Center: Live Workshop & SLA Status */}
          <div className="flex items-center gap-2 text-slate-600 text-[11px] font-medium bg-white/80 px-3 py-0.5 rounded-full border border-slate-200/80 shadow-2xs shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} weight="bold" className="text-slate-500" />
              <span>Workshop: <strong className="text-slate-800 font-semibold">Senin – Sabtu 08.00 – 21.00 WIB</strong></span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <Truck size={13} weight="bold" className="text-slate-500" />
              <span>Kirim Seluruh Indonesia</span>
            </span>
          </div>

          {/* Right: Direct B2B Contact & Tax Terms */}
          <div className="flex items-center gap-3 text-xs shrink-0">
            <a 
              href="tel:0215558899" 
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-950 transition-colors"
            >
              <Phone size={13} weight="bold" className="text-slate-500" />
              <span className="text-slate-500">Hotline:</span>
              <span className="font-bold text-slate-900 font-mono tracking-tight">(021) 555-8899</span>
            </a>

            <span className="text-slate-300">|</span>

            <a
              href="https://wa.me/6281299887766"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 transition-colors"
            >
              <WhatsappLogo size={14} weight="bold" className="text-emerald-600" />
              <span className="text-slate-500">WA B2B:</span>
              <span className="font-bold text-emerald-700 font-mono tracking-tight">+62 812-9988-7766</span>
            </a>

            <span className="text-slate-300">|</span>

            <div className="inline-flex items-center gap-1.5 rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200 shadow-2xs">
              <CheckCircle size={13} weight="bold" className="text-emerald-600" />
              <span>e-Faktur PPN 11% &amp; TOP 30 Hari</span>
            </div>
          </div>
        </div>
      </div>

      <header
        className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md transition-all duration-150"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex shrink-0 items-center">
              <Link 
                to="/" 
                className="flex items-center gap-2.5 group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-2xs group-hover:bg-slate-950 transition-colors">
                  <Printer size={20} weight="bold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight text-slate-950 leading-tight">
                    MK PRINTING
                  </span>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase -mt-0.5">
                    COMMERCIAL PLATFORM
                  </span>
                </div>
              </Link>
            </div>

            <nav className="hidden items-center gap-7 lg:flex">
              <Link
                to="/products"
                className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-slate-900 ${
                  location.pathname === '/products' ? 'text-slate-950' : 'text-slate-600'
                }`}
              >
                Katalog Produk
              </Link>
              <Link
                to="/#estimator"
                onClick={() => {
                  if (location.pathname === '/') {
                    document.getElementById('estimator')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors"
              >
                Kalkulator Job Ticket
              </Link>
              <Link
                to="/#workflow"
                onClick={() => {
                  if (location.pathname === '/') {
                    document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors"
              >
                Alur Kerja B2B
              </Link>
              <Link
                to="/#workshop"
                onClick={() => {
                  if (location.pathname === '/') {
                    document.getElementById('workshop')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors"
              >
                Armada Mesin
              </Link>
              <Link
                to="/custom-order"
                className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-slate-900 ${
                  location.pathname === '/custom-order' ? 'text-slate-950' : 'text-slate-600'
                }`}
              >
                Minta RFQ
              </Link>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/cart"
                aria-label="Keranjang Belanja"
                className="relative rounded-lg p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors active:scale-[0.98]"
              >
                <ShoppingCart size={20} weight="bold" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white bg-slate-900">
                    {totalItems}
                  </span>
                )}
              </Link>

              {role ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors active:scale-[0.98]"
                >
                  <User size={15} weight="bold" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden sm:inline-flex rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors active:scale-[0.98]"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/custom-order"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors active:scale-[0.98]"
                  >
                    <span>Minta Penawaran</span>
                  </Link>
                </div>
              )}

              <button
                type="button"
                aria-label="Toggle mobile menu"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
              >
                <List size={22} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </header>


      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

