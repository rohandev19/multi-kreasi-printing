import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Warning, House, ArrowClockwise } from '@phosphor-icons/react';

export function GlobalErrorBoundary() {
  const error = useRouteError();
  
  let title = 'Something went wrong';
  let message = 'An unexpected error occurred while processing your request.';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Page Not Found';
      message = 'The page you are looking for does not exist or has been moved.';
    } else if (error.status === 401) {
      title = 'Unauthorized';
      message = 'You do not have permission to access this page. Please log in.';
    } else if (error.status === 403) {
      title = 'Forbidden';
      message = 'You are not authorized to view this content with your current role.';
    } else {
      title = `${error.status} ${error.statusText}`;
      message = error.data?.message || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-red-50 p-6 flex justify-center border-b border-red-100">
          <div className="bg-red-100 p-4 rounded-full text-red-600">
            <Warning className="w-12 h-12" weight="regular" />
          </div>
        </div>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-3">{title}</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {message}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              <ArrowClockwise className="w-4 h-4" weight="regular" />
              Try Again
            </button>
            <Link 
              to="/"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
            >
              <House className="w-4 h-4" weight="regular" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
