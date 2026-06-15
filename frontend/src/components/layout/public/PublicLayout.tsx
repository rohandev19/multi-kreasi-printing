import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { ShoppingCart, Menu, X, Facebook, Instagram, Linkedin, User as UserIcon, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useRoleContext } from '../../../contexts/RoleContext';

export const PublicLayout = () => {
  const { totalItems } = useCart();
  const { user, role } = useRoleContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Products', path: '/products' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    return isActive 
      ? "text-indigo-600 font-semibold" 
      : "text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      
      {/* NAVBAR */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                  <span className="font-bold font-serif italic text-lg leading-none mt-0.5">M</span>
                </div>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">MK Printing</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className={getNavLinkClass(link.path)}>
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3 md:space-x-5">
              
              <Link to="/cart" className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-sm border border-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
              
              <div className="w-px h-6 bg-slate-200 hidden md:block"></div>

              {user ? (
                <div className="hidden md:block relative" ref={userMenuRef}>
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center border border-indigo-200">
                      {(user?.fullName || user?.name || 'G').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 hidden lg:block">
                      {user?.fullName || user?.name || 'User'}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-slate-100 mb-2">
                        <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName || user?.name}</p>
                        <p className="text-xs text-slate-500 truncate mb-1">{user?.email}</p>
                        <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded uppercase tracking-wider">
                          {role?.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <Link 
                        to="/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard size={16} className="text-slate-400" />
                        Dashboard
                      </Link>
                      
                      {role === 'Customer' && (
                        <Link 
                          to="/dashboard/my-orders"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Package size={16} className="text-slate-400" />
                          My Orders
                        </Link>
                      )}
                      
                      <Link 
                        to="/dashboard/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon size={16} className="text-slate-400" />
                        My Profile
                      </Link>
                      
                      <div className="h-px bg-slate-100 my-1"></div>
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 rounded-full text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 absolute top-16 left-0 right-0 shadow-lg z-40 animate-fade-in">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`block px-4 py-3 rounded-lg ${getNavLinkClass(link.path)}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="h-px bg-slate-100 my-2"></div>
              
              {user ? (
                <>
                  <Link 
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} className="text-slate-400" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg text-left"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col justify-start">
        <div className="w-full">
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12 mb-12">
            
            {/* Column 1 */}
            <div className="col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <span className="font-bold font-serif italic text-lg leading-none mt-0.5">M</span>
                </div>
                <span className="font-extrabold text-xl text-white tracking-tight">MK Printing</span>
              </Link>
              <p className="text-sm leading-relaxed mb-6">
                Enterprise-grade printing solutions for businesses of all sizes. 
                Quality, speed, and reliability.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            
            {/* Column 2 */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Products</h3>
              <ul className="space-y-3">
                <li><Link to="/products" className="hover:text-indigo-400 transition-colors text-sm">Business Cards</Link></li>
                <li><Link to="/products" className="hover:text-indigo-400 transition-colors text-sm">Flyers & Brochures</Link></li>
                <li><Link to="/products" className="hover:text-indigo-400 transition-colors text-sm">Large Format Banners</Link></li>
                <li><Link to="/products" className="hover:text-indigo-400 transition-colors text-sm">Custom Packaging</Link></li>
              </ul>
            </div>
            
            {/* Column 3 */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="hover:text-indigo-400 transition-colors text-sm">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors text-sm">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-indigo-400 transition-colors text-sm">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-indigo-400 transition-colors text-sm">Blog</Link></li>
              </ul>
            </div>
            
            {/* Column 4 */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Support</h3>
              <ul className="space-y-3">
                <li><Link to="/faq" className="hover:text-indigo-400 transition-colors text-sm">Help Center</Link></li>
                <li><Link to="/terms" className="hover:text-indigo-400 transition-colors text-sm">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link to="/contact" className="hover:text-indigo-400 transition-colors text-sm">FAQ</Link></li>
              </ul>
            </div>

          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-center md:text-left">
              &copy; 2026 PT Multi Kreasi Printing. All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              {/* Trust badges placeholders */}
              <div className="h-8 w-12 bg-slate-800 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">VISA</div>
              <div className="h-8 w-12 bg-slate-800 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">MC</div>
              <div className="h-8 w-16 bg-slate-800 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">QRIS</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
