import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Printer, List, X } from '@phosphor-icons/react';
import { useRoleContext } from '../../../contexts/RoleContext';
import { Footer } from './Footer';

const navLinks = [
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About Us' },
  { to: '/custom-order', label: 'Custom Order' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
  { to: '/careers', label: 'Careers' },
];

export const PublicLayout: React.FC = () => {
  const { role } = useRoleContext();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHome = location.pathname === '/';

  const headerBg = isHome ? 'rgba(15, 20, 25, 0.72)' : 'rgba(250, 251, 252, 0.88)';
  const headerBorder = isHome ? 'rgba(255,255,255,0.08)' : 'var(--border-default)';
  const headerTextInverse = isHome ? 'var(--text-inverse)' : 'var(--text-primary)';
  const navTextColor = isHome ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)';

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: 'rgba(15, 20, 25, 0.5)' }}
        />
      )}

      {/* Mobile sidebar drawer (slides from right) */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 md:hidden`}
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
                color: location.pathname === link.to ? 'var(--color-primary-700)' : 'var(--text-primary)',
                backgroundColor: location.pathname === link.to ? 'var(--color-primary-50)' : 'transparent',
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
            <Link
              to="/dashboard"
              onClick={closeMobileMenu}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ease-out"
              style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}
            >
              <User size={18} weight="regular" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="text-center rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-150 ease-out"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="text-center rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition-all duration-150 ease-out"
                style={{ backgroundColor: 'var(--color-primary-600)', color: 'white' }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </aside>

      <header
        className="sticky top-0 z-30 w-full border-b transition-all duration-150 ease-out"
        style={{
          backgroundColor: headerBg,
          borderColor: headerBorder,
          backdropFilter: 'blur(8px)',
          color: headerTextInverse,
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
              {navLinks.slice(0, 4).map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium transition-colors duration-150 ease-out"
                  style={{ color: navTextColor }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = isHome ? 'white' : 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = navTextColor; }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-4">
              <Link
                to="/cart"
                className="relative rounded-full p-2 transition-colors duration-150 ease-out"
                style={{ color: navTextColor }}
                onMouseEnter={(e) => { e.currentTarget.style.color = isHome ? 'white' : 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = navTextColor; }}
              >
                <ShoppingCart size={20} weight="regular" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: 'var(--color-primary-600)' }}>
                  0
                </span>
              </Link>

              {role ? (
                <>
                  <Link
                    to="/dashboard"
                    aria-label="Go to Dashboard"
                    className="flex items-center justify-center rounded-full p-2 transition-all duration-150 ease-out sm:hidden"
                    style={{
                      backgroundColor: isHome ? 'rgba(255,255,255,0.08)' : 'var(--color-primary-50)',
                      color: isHome ? 'white' : 'var(--color-primary-700)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isHome) { e.currentTarget.style.backgroundColor = 'var(--color-primary-100)'; }
                    }}
                    onMouseLeave={(e) => {
                      if (!isHome) { e.currentTarget.style.backgroundColor = 'var(--color-primary-50)'; }
                    }}
                  >
                    <User size={20} weight="regular" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ease-out sm:flex"
                    style={{ backgroundColor: isHome ? 'rgba(255,255,255,0.08)' : 'var(--color-primary-50)', color: isHome ? 'white' : 'var(--color-primary-700)' }}
                    onMouseEnter={(e) => {
                      if (!isHome) { e.currentTarget.style.backgroundColor = 'var(--color-primary-100)'; }
                    }}
                    onMouseLeave={(e) => {
                      if (!isHome) { e.currentTarget.style.backgroundColor = 'var(--color-primary-50)'; }
                    }}
                  >
                    <User size={16} weight="regular" />
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    aria-label="Log in to your account"
                    className="flex items-center justify-center rounded-full p-2 transition-colors duration-150 ease-out sm:hidden"
                    style={{ color: navTextColor }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isHome ? 'rgba(255,255,255,0.08)' : 'var(--color-neutral-100)'; e.currentTarget.style.color = isHome ? 'white' : 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = navTextColor; }}
                  >
                    <User size={20} weight="regular" />
                  </Link>
                  <div className="hidden items-center gap-2 sm:flex">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out"
                      style={{ color: navTextColor }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = isHome ? 'white' : 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = navTextColor; }}
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-150 ease-out"
                      style={{ backgroundColor: 'var(--color-primary-600)', color: 'white' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-700)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'; }}
                    >
                      Sign Up
                    </Link>
                  </div>
                </>
              )}

              <button
                type="button"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="rounded-lg p-2 transition-all duration-150 ease-out md:hidden"
                style={{ color: navTextColor }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isHome ? 'rgba(255,255,255,0.08)' : 'var(--color-neutral-100)'; e.currentTarget.style.color = isHome ? 'white' : 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = navTextColor; }}
              >
                {mobileMenuOpen ? (
                  <X size={24} weight="regular" />
                ) : (
                  <List size={24} weight="regular" />
                )}
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
