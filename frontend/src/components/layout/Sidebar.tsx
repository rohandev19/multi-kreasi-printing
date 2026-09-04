import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  SquaresFour, 
  ShoppingCart, 
  Factory, 
  Users, 
  FileText,
  Package,
  Palette,
  ClipboardText,
  Storefront,
  Gear,
  Scroll,
  ChartBar,
  SignOut,
  CaretLeft,
  CaretRight,
  User as UserIcon,
  DotsThreeVertical,
  X
} from '@phosphor-icons/react';
import { useRoleContext } from '../../contexts/RoleContext';

interface MenuItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    path: '/products',
    icon: <Storefront size={20} weight="regular" />,
    label: 'Catalog',
    roles: ['Customer'],
  },
  {
    path: '/dashboard',
    icon: <SquaresFour size={20} weight="regular" />,
    label: 'Dashboard',
    roles: ['Owner', 'Manager', 'Designer', 'Production_Staff', 'Warehouse_Staff', 'Finance_Staff', 'Sales', 'Customer'],
  },
  {
    path: '/dashboard/orders',
    icon: <ShoppingCart size={20} weight="regular" />,
    label: 'Orders',
    roles: ['Owner', 'Manager', 'Designer', 'Production_Staff', 'Finance_Staff', 'Sales'],
  },
  {
    path: '/dashboard/products',
    icon: <Package size={20} weight="regular" />,
    label: 'Products',
    roles: ['Owner', 'Manager'],
  },
  {
    path: '/dashboard/quotations',
    icon: <FileText size={20} weight="regular" />,
    label: 'Quotations',
    roles: ['Owner', 'Manager', 'Sales'],
  },
  {
    path: '/dashboard/production',
    icon: <Factory size={20} weight="regular" />,
    label: 'Production',
    roles: ['Owner', 'Manager', 'Production_Staff'],
  },
  {
    path: '/dashboard/design',
    icon: <Palette size={20} weight="regular" />,
    label: 'Design Files',
    roles: ['Owner', 'Manager', 'Designer', 'Production_Staff'],
  },
  {
    path: '/dashboard/warehouse',
    icon: <Package size={20} weight="regular" />,
    label: 'Warehouse',
    roles: ['Owner', 'Manager', 'Warehouse_Staff', 'Production_Staff'],
  },
  {
    path: '/dashboard/users',
    icon: <Users size={20} weight="regular" />,
    label: 'Staff & Users',
    roles: ['Owner', 'Manager'],
  },
  {
    path: '/dashboard/customers',
    icon: <Users size={20} weight="regular" />,
    label: 'Customers',
    roles: ['Owner', 'Manager', 'Finance_Staff', 'Sales'],
  },
  {
    path: '/dashboard/invoices',
    icon: <FileText size={20} weight="regular" />,
    label: 'Invoices',
    roles: ['Owner', 'Manager', 'Finance_Staff', 'Customer'],
  },
  {
    path: '/dashboard/my-orders',
    icon: <ClipboardText size={20} weight="regular" />,
    label: 'My Orders',
    roles: ['Customer'],
  },
  {
    path: '/dashboard/reports',
    icon: <ChartBar size={20} weight="regular" />,
    label: 'Reports',
    roles: ['Owner', 'Manager', 'Finance_Staff'],
  },
  {
    path: '/dashboard/audit-log',
    icon: <Scroll size={20} weight="regular" />,
    label: 'Audit Log',
    roles: ['Owner', 'Manager'],
  },
  {
    path: '/dashboard/settings',
    icon: <Gear size={20} weight="regular" />,
    label: 'Settings',
    roles: ['Owner'],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const { role: userRole, user, logoutUser } = useRoleContext();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  const handleLogout = () => {
    logoutUser();
  };

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    const base = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative";
    
    if (isActive) {
      // Professional active state: background color with subtle border (no colored stripe)
      // Using design tokens: bg-neutral-100, text-neutral-900, border-primary-600
      return `${base} bg-neutral-100 text-neutral-900 font-semibold border border-neutral-200`;
    }
    // Inactive state with subtle hover
    return `${base} text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900`;
  };

  const sidebarWidth = collapsed ? 'w-20' : 'w-64';
  const mobileTranslate = mobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
          className="fixed inset-0 z-30 md:hidden"
          style={{ backgroundColor: 'rgba(15, 20, 25, 0.5)' }}
        />
      )}

      <aside
        className={`${sidebarWidth} fixed inset-y-0 left-0 z-40 flex h-screen ${mobileTranslate} flex-col border-r transition-transform duration-200 ease-out md:sticky md:z-30 md:translate-x-0 md:flex`}
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-default)',
          boxShadow: mobileOpen ? 'var(--shadow-lg)' : 'none',
        }}
      >
      <div className="relative flex h-16 flex-shrink-0 items-center border-b px-4" style={{ borderColor: 'var(--border-default)' }}>
        <Link to="/" className="flex w-full items-center gap-2 overflow-hidden">
          {collapsed ? (
            <div
              className="mx-auto flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-lg font-black shadow-sm"
              style={{ backgroundColor: 'var(--color-primary-600)', color: 'white' }}
            >
              MK
            </div>
          ) : (
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>MK Printing</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary-600)' }}>Enterprise</span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={onMobileClose}
          aria-label="Close navigation"
          className="absolute -right-3 top-5 rounded-full border p-1 shadow-sm transition-colors duration-150 ease-out md:hidden hover:bg-[var(--color-neutral-100)]"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)',
          }}
        >
          <X size={14} weight="bold" />
        </button>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden absolute -right-3 top-5 rounded-full border p-1 shadow-sm transition-colors duration-150 ease-out md:flex hover:bg-[var(--color-neutral-100)]"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)',
            color: 'var(--text-secondary)',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <CaretRight size={14} weight="bold" /> : <CaretLeft size={14} weight="bold" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin scrollbar-thumb-slate-200">
        {visibleMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => onMobileClose?.()}
            className={getLinkClass(item.path)}
            title={collapsed ? item.label : undefined}
          >
            <div className={`${collapsed ? 'mx-auto' : ''} flex-shrink-0`}>{item.icon}</div>
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}

            {collapsed && (
              <div className="pointer-events-none absolute left-14 z-50 invisible whitespace-nowrap rounded-md px-2 py-1 text-xs text-white opacity-0 transition-all duration-150 ease-out group-hover:visible group-hover:opacity-100" style={{ backgroundColor: 'var(--color-neutral-900)' }}>
                {item.label}
              </div>
            )}
          </Link>
        ))}
      </nav>

      <div className="relative border-t p-3" style={{ borderColor: 'var(--border-default)' }}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors duration-150 ease-out hover:bg-[var(--color-neutral-100)] ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border" style={{ backgroundColor: 'var(--color-neutral-100)', borderColor: 'var(--border-default)' }}>
            <UserIcon size={20} weight="regular" style={{ color: 'var(--text-tertiary)' }} />
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {user?.fullName || user?.name || 'User'}
              </p>
              <p className="truncate text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {userRole?.replace('_', ' ')}
              </p>
            </div>
          )}

          {!collapsed && <DotsThreeVertical size={16} weight="bold" style={{ color: 'var(--text-tertiary)' }} className="flex-shrink-0" />}
        </button>

        {showUserMenu && (
          <div className={`absolute bottom-full z-50 mb-2 overflow-hidden rounded-lg border py-1 ${collapsed ? 'left-14 w-48' : 'left-3 right-3'}`} style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-150 ease-out hover:bg-[var(--color-neutral-50)]"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => setShowUserMenu(false)}
            >
              <UserIcon size={16} weight="regular" style={{ color: 'var(--text-tertiary)' }} />
              Profile
            </Link>
            {userRole === 'Owner' && (
              <Link
                to="/dashboard/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-150 ease-out hover:bg-[var(--color-neutral-50)]"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => setShowUserMenu(false)}
              >
                <Gear size={16} weight="regular" style={{ color: 'var(--text-tertiary)' }} />
                Settings
              </Link>
            )}
            <div className="my-1 h-px" style={{ backgroundColor: 'var(--border-default)' }}></div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors duration-150 ease-out hover:bg-[var(--color-error-50)]"
              style={{ color: 'var(--color-error-600)' }}
            >
              <SignOut size={16} weight="regular" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
