import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Factory, 
  Users, 
  FileText,
  Package,
  Palette,
  ClipboardList,
  Store,
  Settings,
  ScrollText,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  MoreVertical
} from 'lucide-react';
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
    icon: <Store size={20} />,
    label: 'Catalog',
    roles: ['Customer'],
  },
  {
    path: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
    roles: ['Owner', 'Manager', 'Designer', 'Production_Staff', 'Warehouse_Staff', 'Finance_Staff', 'Sales', 'Customer'],
  },
  {
    path: '/dashboard/orders',
    icon: <ShoppingCart size={20} />,
    label: 'Orders',
    roles: ['Owner', 'Manager', 'Designer', 'Production_Staff', 'Finance_Staff', 'Sales'],
  },
  {
    path: '/dashboard/quotations',
    icon: <FileText size={20} />,
    label: 'Quotations',
    roles: ['Owner', 'Manager', 'Sales'],
  },
  {
    path: '/dashboard/production',
    icon: <Factory size={20} />,
    label: 'Production',
    roles: ['Owner', 'Manager', 'Production_Staff'],
  },
  {
    path: '/dashboard/design',
    icon: <Palette size={20} />,
    label: 'Design Files',
    roles: ['Owner', 'Manager', 'Designer'],
  },
  {
    path: '/dashboard/warehouse',
    icon: <Package size={20} />,
    label: 'Warehouse',
    roles: ['Owner', 'Manager', 'Warehouse_Staff'],
  },
  {
    path: '/dashboard/users',
    icon: <Users size={20} />,
    label: 'Staff & Users',
    roles: ['Owner', 'Manager'],
  },
  {
    path: '/dashboard/customers',
    icon: <Users size={20} />,
    label: 'Customers',
    roles: ['Owner', 'Manager', 'Finance_Staff', 'Sales'],
  },
  {
    path: '/dashboard/invoices',
    icon: <FileText size={20} />,
    label: 'Invoices',
    roles: ['Owner', 'Manager', 'Finance_Staff', 'Customer'],
  },
  {
    path: '/dashboard/my-orders',
    icon: <ClipboardList size={20} />,
    label: 'My Orders',
    roles: ['Customer'],
  },
  {
    path: '/dashboard/reports',
    icon: <BarChart3 size={20} />,
    label: 'Reports',
    roles: ['Owner', 'Manager', 'Finance_Staff'],
  },
  {
    path: '/dashboard/audit-log',
    icon: <ScrollText size={20} />,
    label: 'Audit Log',
    roles: ['Owner', 'Manager'],
  },
  {
    path: '/dashboard/settings',
    icon: <Settings size={20} />,
    label: 'Settings',
    roles: ['Owner'],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role: userRole, user } = useRoleContext();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => 
    userRole && item.roles.includes(userRole)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    navigate('/login');
  };

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
    const base = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative";
    
    if (isActive) {
      return `${base} bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600`;
    }
    return `${base} text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent`;
  };

  return (
    <aside 
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } hidden md:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 transition-all duration-300 z-30`}
    >
      {/* LOGO AREA */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 flex-shrink-0 relative">
        <Link to="/" className="flex items-center gap-2 overflow-hidden w-full">
          {collapsed ? (
            <div className="w-10 h-10 mx-auto bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-sm flex-shrink-0">
              MK
            </div>
          ) : (
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight leading-tight">MK Printing</h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600">Enterprise</span>
            </div>
          )}
        </Link>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-5 bg-white border border-slate-200 text-slate-500 rounded-full p-1 hover:bg-slate-50 hover:text-slate-700 shadow-sm transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* NAVIGATION MENU */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        {visibleMenuItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={getLinkClass(item.path)}
            title={collapsed ? item.label : undefined}
          >
            <div className={`${collapsed ? 'mx-auto' : ''} flex-shrink-0`}>
              {item.icon}
            </div>
            {!collapsed && (
              <span className="truncate flex-1">{item.label}</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {collapsed && (
              <div className="absolute left-14 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap z-50 pointer-events-none transition-all">
                {item.label}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* USER SECTION */}
      <div className="p-3 border-t border-slate-100 relative">
        <button 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 transition-colors text-left ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <UserIcon size={20} className="text-slate-400" />
          </div>
          
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {user?.fullName || user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500 font-medium truncate">
                {userRole?.replace('_', ' ')}
              </p>
            </div>
          )}
          
          {!collapsed && (
            <MoreVertical size={16} className="text-slate-400 flex-shrink-0" />
          )}
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <div className={`absolute bottom-full mb-2 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden z-50 ${collapsed ? 'left-14 w-48' : 'left-3 right-3'}`}>
            <Link 
              to="/dashboard/profile" 
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              onClick={() => setShowUserMenu(false)}
            >
              <UserIcon size={16} />
              Profile
            </Link>
            {userRole === 'Owner' && (
              <Link 
                to="/dashboard/settings" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                onClick={() => setShowUserMenu(false)}
              >
                <Settings size={16} />
                Settings
              </Link>
            )}
            <div className="h-px bg-slate-100 my-1"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
