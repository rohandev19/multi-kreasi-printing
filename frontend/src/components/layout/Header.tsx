import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { useRoleContext } from '../../contexts/RoleContext';

export default function Header() {
  const { totalItems } = useCart();
  const { roleName, user } = useRoleAccess();
  const { refreshRole } = useRoleContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    refreshRole();
    navigate('/login');
  };

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
        <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-700">{user?.fullName || user?.name || 'Guest'}</p>
            <p className="text-xs text-slate-500 capitalize">{roleName.replace('_', ' ')}</p>
          </div>
          <div className="w-9 h-9 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-bold shadow-inner uppercase">
            {(user?.fullName || user?.name || 'G').charAt(0)}
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 ml-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
