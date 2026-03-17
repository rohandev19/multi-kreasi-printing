import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useRoleAccess } from '../../contexts/RoleContext';

export default function Header() {
  const { totalItems } = useCart();
  const { roleName, user } = useRoleAccess();
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center">
        <span className="text-lg font-medium text-slate-700">Overview</span>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/cart" className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
          <ShoppingCart className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-bold shadow-sm">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </Link>
        <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-700">{user?.fullName || 'Guest'}</p>
            <p className="text-xs text-slate-500 capitalize">{roleName.replace('_', ' ')}</p>
          </div>
          <div className="w-9 h-9 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-bold shadow-inner uppercase">
            {user?.fullName?.charAt(0) || 'G'}
          </div>
        </div>
      </div>
    </header>
  );
}
