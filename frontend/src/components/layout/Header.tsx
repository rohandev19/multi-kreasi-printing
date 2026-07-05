import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  User as UserIcon, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Menu,
  ShoppingCart,
  X
} from 'lucide-react';
import { useRoleContext } from '../../contexts/RoleContext';
import { useCart } from '../../hooks/useCart';

export default function Header() {
  const { totalItems } = useCart();
  const { role, user, logoutUser } = useRoleContext();
  const location = useLocation();
  
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Ref for clicking outside
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
  };

  // Generate breadcrumb from pathname
  const pathnames = location.pathname.split('/').filter((x) => x);
  const currentPage = pathnames[pathnames.length - 1]?.replace('-', ' ') || 'Dashboard';

  // Mock unread notification
  const hasUnread = true;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shadow-sm">
      
      {/* LEFT: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-3 md:gap-4">
        <button className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
          <Menu size={20} />
        </button>
        
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <Link to="/dashboard" className="text-slate-500 hover:text-indigo-600 font-medium">
            Dashboard
          </Link>
          {pathnames.length > 1 && (
            <>
              <ChevronRight size={14} className="text-slate-300" />
              <span className="text-slate-800 font-semibold capitalize">
                {currentPage}
              </span>
            </>
          )}
        </div>
        {/* Mobile Page Title */}
        <div className="sm:hidden text-lg font-bold text-slate-800 capitalize">
          {currentPage}
        </div>
      </div>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Customer Cart */}
        {(!role || role === 'Customer') && (
          <Link to="/cart" className="relative p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-full transition-colors">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold shadow-sm">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        )}

        {/* Search */}
        <div className="relative" ref={searchRef}>
          {showSearch ? (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center bg-white border border-indigo-500 rounded-lg shadow-lg w-[280px] sm:w-[320px] overflow-hidden transition-all z-50 animate-fade-in">
              <Search size={18} className="text-slate-400 ml-3 shrink-0" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search orders, customers..." 
                className="w-full py-2 px-3 outline-none text-sm text-slate-700 bg-transparent"
              />
              <button 
                onClick={() => setShowSearch(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-full transition-colors group"
            >
              <Search size={20} />
              <div className="hidden lg:flex items-center gap-1 bg-slate-100 text-slate-400 text-xs px-1.5 py-0.5 rounded border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:border-indigo-100 transition-colors">
                <span className="text-[10px]">⌘</span>K
              </div>
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifMenuRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-full transition-colors"
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 max-h-[400px] overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                <button className="text-xs text-indigo-600 font-medium hover:underline">Mark all as read</button>
              </div>
              <div className="overflow-y-auto max-h-[300px]">
                <div className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <p className="text-sm text-slate-800 font-medium">Order #ORD-2023-001 completed</p>
                  <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                </div>
                <div className="p-4 hover:bg-slate-50 cursor-pointer">
                  <p className="text-sm text-slate-800 font-medium">New design uploaded for Review</p>
                  <p className="text-xs text-slate-500 mt-1">5 hours ago</p>
                </div>
              </div>
              <div className="p-3 border-t border-slate-100 text-center">
                <Link to="/dashboard/notifications" onClick={() => setShowNotifications(false)} className="text-sm text-indigo-600 font-medium hover:underline">
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1 md:mx-2"></div>

        {/* User Avatar & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center border border-indigo-200">
              {(user?.fullName || user?.name || 'G').charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left mr-1">
              <p className="text-sm font-bold text-slate-700 leading-tight">
                {user?.fullName || user?.name || 'Guest'}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
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
                to="/dashboard/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <UserIcon size={16} className="text-slate-400" />
                My Profile
              </Link>
              
              {role === 'Owner' && (
                <Link 
                  to="/dashboard/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings size={16} className="text-slate-400" />
                  Settings
                </Link>
              )}
              
              <Link 
                to="/faq"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <HelpCircle size={16} className="text-slate-400" />
                Help & Support
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
      </div>
    </header>
  );
}
