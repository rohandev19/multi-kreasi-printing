import { Link } from 'react-router-dom';
import { FileX, ArrowLeft, House } from '@phosphor-icons/react';
import { useRoleContext } from '../contexts/RoleContext';

export const NotFound = () => {
  const { user } = useRoleContext();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 shadow-sm border border-primary-200">
            <FileX size={48} strokeWidth={1.5} weight="regular" />
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Page Not Found</h1>
        <p className="text-lg text-slate-500 font-medium mb-10">
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <ArrowLeft size={18} weight="regular" />
            Go Back
          </button>
          
          <Link 
            to={user ? '/dashboard' : '/'}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20"
          >
            <House size={18} weight="regular" />
            {user ? 'Dashboard' : 'Homepage'}
          </Link>
        </div>
      </div>
    </div>
  );
};
