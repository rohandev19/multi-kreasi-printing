import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Factory } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const base = "flex items-center space-x-3 p-3 rounded transition-colors";
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
        <Link to="/" className={getLinkClass('/')}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <Link to="/orders" className={getLinkClass('/orders')}>
          <ShoppingCart size={20} />
          <span>Orders</span>
        </Link>
        <Link to="/production" className={getLinkClass('/production')}>
          <Factory size={20} />
          <span>Production</span>
        </Link>
      </nav>
    </aside>
  );
}
