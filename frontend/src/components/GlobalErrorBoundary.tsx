import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Warning, House, ArrowClockwise } from '@phosphor-icons/react';

export function GlobalErrorBoundary() {
  const error = useRouteError();
  
  let title = 'Terjadi Kesalahan';
  let message = 'Terjadi kesalahan yang tidak terduga saat memproses permintaan Anda.';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = 'Halaman Tidak Ditemukan';
      message = 'Halaman yang Anda cari tidak ada atau telah dipindahkan.';
    } else if (error.status === 401) {
      title = 'Akses Tidak Sah';
      message = 'Anda tidak memiliki izin untuk mengakses halaman ini. Silakan masuk terlebih dahulu.';
    } else if (error.status === 403) {
      title = 'Akses Ditolak';
      message = 'Peran akun Anda saat ini tidak memiliki izin untuk melihat konten ini.';
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
              Coba Lagi
            </button>
            <Link 
              to="/"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
            >
              <House className="w-4 h-4" weight="regular" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
