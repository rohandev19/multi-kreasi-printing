import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  MagnifyingGlass,
  Bell, 
  CaretDown, 
  User, 
  Gear, 
  Question, 
  SignOut,
  CaretRight,
  List,
  ShoppingCart,
  X
} from '@phosphor-icons/react';
import { useRoleContext } from '../../contexts/RoleContext';
import { useCart } from '../../hooks/useCart';

interface HeaderProps {
  mobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
}

export default function Header({ mobileSidebarOpen, onToggleMobileSidebar }: HeaderProps) {
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
    <header
      className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 border-b"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <button
          type="button"
          aria-label={mobileSidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileSidebarOpen}
          onClick={onToggleMobileSidebar}
          className="md:hidden rounded-lg p-2 transition-all duration-150 ease-out"
          style={{
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <List size={20} weight="regular" />
        </button>

        <div className="hidden items-center gap-2 text-sm sm:flex">
          <Link
            to="/dashboard"
            className="font-medium transition-colors duration-150 ease-out"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary-600)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            Dashboard
          </Link>
          {pathnames.length > 1 && (
            <>
              <CaretRight size={14} weight="regular" style={{ color: 'var(--text-tertiary)' }} />
              <span className="font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                {currentPage}
              </span>
            </>
          )}
        </div>

        <div className="text-lg font-bold capitalize sm:hidden" style={{ color: 'var(--text-primary)' }}>
          {currentPage}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {(!role || role === 'Customer') && (
          <Link
            to="/cart"
            className="relative rounded-full p-2 transition-all duration-150 ease-out"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
              e.currentTarget.style.color = 'var(--color-primary-600)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <ShoppingCart size={20} weight="regular" />
            {totalItems > 0 && (
              <span
                className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                style={{ backgroundColor: 'var(--color-error-500)' }}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        )}

        <div className="relative" ref={searchRef}>
          {showSearch ? (
            <div
              className="absolute right-0 top-1/2 flex w-[280px] -translate-y-1/2 items-center overflow-hidden rounded-lg sm:w-[320px]"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-focus)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <MagnifyingGlass size={18} weight="regular" className="ml-3 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Search orders, customers..."
                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                onClick={() => setShowSearch(false)}
                className="p-2 transition-colors duration-150 ease-out"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <X size={16} weight="regular" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="group flex items-center gap-2 rounded-full p-2 transition-all duration-150 ease-out"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
                e.currentTarget.style.color = 'var(--color-primary-600)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <MagnifyingGlass size={20} weight="regular" />
              <div
                className="hidden items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] lg:flex"
                style={{
                  backgroundColor: 'var(--color-neutral-100)',
                  borderColor: 'var(--border-default)',
                  color: 'var(--text-tertiary)',
                }}
              >
                <span>⌘</span>K
              </div>
            </button>
          )}
        </div>

        <div className="relative" ref={notifMenuRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 transition-all duration-150 ease-out"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
              e.currentTarget.style.color = 'var(--color-primary-600)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <Bell size={20} weight="regular" />
            {hasUnread && (
              <span
                className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white"
                style={{ backgroundColor: 'var(--color-error-500)' }}
              ></span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 max-h-[400px] w-80 overflow-hidden rounded-xl sm:w-96"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--color-neutral-50)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                <button className="text-xs font-medium hover:underline" style={{ color: 'var(--color-primary-600)' }}>
                  Mark all as read
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <div className="cursor-pointer border-b p-4 transition-colors duration-150 ease-out hover:bg-[var(--color-neutral-50)]" style={{ borderColor: 'var(--border-default)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Order #ORD-2023-001 completed</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>2 hours ago</p>
                </div>
                <div className="cursor-pointer p-4 transition-colors duration-150 ease-out hover:bg-[var(--color-neutral-50)]">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>New design uploaded for Review</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>5 hours ago</p>
                </div>
              </div>
              <div className="border-t p-3 text-center" style={{ borderColor: 'var(--border-default)' }}>
                <Link to="/dashboard/notifications" onClick={() => setShowNotifications(false)} className="text-sm font-medium hover:underline" style={{ color: 'var(--color-primary-600)' }}>
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-6 w-px md:mx-2" style={{ backgroundColor: 'var(--border-default)' }}></div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-full p-1 pr-2 transition-all duration-150 ease-out"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: 'var(--color-primary-100)',
                border: '1px solid var(--color-primary-200)',
                color: 'var(--color-primary-700)',
              }}
            >
              {(user?.fullName || user?.name || 'G').charAt(0).toUpperCase()}
            </div>
            <div className="mr-1 hidden text-left sm:block">
              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName || user?.name || 'Guest'}
              </p>
            </div>
            <CaretDown size={14} weight="regular" style={{ color: 'var(--text-tertiary)' }} />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl py-2"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div className="mb-2 border-b px-4 py-2" style={{ borderColor: 'var(--border-default)' }}>
                <p className="truncate text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.fullName || user?.name}</p>
                <p className="mb-1 truncate text-xs" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                <span
                  className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: 'var(--color-primary-50)',
                    color: 'var(--color-primary-700)',
                  }}
                >
                  {role?.replace('_', ' ')}
                </span>
              </div>

              <Link
                to="/dashboard/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ease-out hover:bg-[var(--color-neutral-50)]"
                style={{ color: 'var(--text-primary)' }}
              >
                <User size={16} weight="regular" style={{ color: 'var(--text-tertiary)' }} />
                My Profile
              </Link>

              {role === 'Owner' && (
                <Link
                  to="/dashboard/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ease-out hover:bg-[var(--color-neutral-50)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Gear size={16} weight="regular" style={{ color: 'var(--text-tertiary)' }} />
                  Settings
                </Link>
              )}

              <Link
                to="/faq"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ease-out hover:bg-[var(--color-neutral-50)]"
                style={{ color: 'var(--text-primary)' }}
              >
                <Question size={16} weight="regular" style={{ color: 'var(--text-tertiary)' }} />
                Help & Support
              </Link>

              <div className="my-1 h-px" style={{ backgroundColor: 'var(--border-default)' }}></div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ease-out hover:bg-[var(--color-error-50)]"
                style={{ color: 'var(--color-error-600)' }}
              >
                <SignOut size={16} weight="regular" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
