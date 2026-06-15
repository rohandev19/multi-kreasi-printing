import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { useRoleContext } from '../contexts/RoleContext';

export const NotFound = () => {
  const { user } = useRoleContext();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200">
            <FileQuestion size={48} strokeWidth={1.5} />
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
            <ArrowLeft size={18} />
            Go Back
          </button>
          
          <Link 
            to={user ? '/dashboard' : '/'}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20"
          >
            <Home size={18} />
            {user ? 'Dashboard' : 'Homepage'}
          </Link>
        </div>
      </div>
    </div>
  );
};
