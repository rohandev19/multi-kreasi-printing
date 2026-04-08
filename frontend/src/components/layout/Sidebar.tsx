import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Factory, 
  Users, 
  FileText,
  Package,
  Palette,
  ClipboardList
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MenuItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  roles: string[]; // roles that can see this menu
}

const menuItems: MenuItem[] = [
  {
    path: '/',
    icon: <LayoutDashboard size={20} />,
    label: 'Dashboard',
    roles: ['Owner', 'Manager', 'Designer', 'Production_Staff', 'Warehouse_Staff', 'Finance_Staff', 'Customer'],
  },
  {
    path: '/orders',
    icon: <ShoppingCart size={20} />,
    label: 'Orders',
    roles: ['Owner', 'Manager', 'Designer', 'Production_Staff', 'Finance_Staff', 'Customer'],
  },
  {
    path: '/production',
    icon: <Factory size={20} />,
    label: 'Production',
    roles: ['Owner', 'Manager', 'Production_Staff'],
  },
  {
    path: '/design',
    icon: <Palette size={20} />,
    label: 'Design Files',
    roles: ['Owner', 'Manager', 'Designer'],
  },
  {
    path: '/warehouse',
    icon: <Package size={20} />,
    label: 'Warehouse',
    roles: ['Owner', 'Manager', 'Warehouse_Staff'],
  },
  {
    path: '/customers',
    icon: <Users size={20} />,
    label: 'Customers',
    roles: ['Owner', 'Manager', 'Finance_Staff'],
  },
  {
    path: '/invoices',
    icon: <FileText size={20} />,
    label: 'Invoices',
    roles: ['Owner', 'Manager', 'Finance_Staff', 'Customer'],
  },
  {
    path: '/my-orders',
    icon: <ClipboardList size={20} />,
    label: 'My Orders',
    roles: ['Customer'],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserRole(user.role || '');
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    }
  }, []);

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const getLinkClass = (path: string) => {
    const base = "flex items-center space-x-3 p-3 rounded-lg transition-colors";
    return location.pathname === path 
      ? `${base} bg-blue-600 text-white` 
      : `${base} text-slate-300 hover:bg-slate-800 hover:text-white`;
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 shadow-xl">
      <div className="p-5 flex items-center justify-center border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wider text-blue-400">MK Printing</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {visibleMenuItems.map((item) => (
          <Link key={item.path} to={item.path} className={getLinkClass(item.path)}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <div className="text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-200">Role: {userRole || 'Unknown'}</p>
          <p>© 2026 MK Printing</p>
        </div>
      </div>
    </aside>
  );
}
