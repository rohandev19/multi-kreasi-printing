import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import api from '../../api/axios';

export const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Token verifikasi tidak valid.');
        return;
      }
      
      try {
        await api.get(`/api/v1/auth/verify-email/${token}`);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.response?.data?.message || 'Tautan ini mungkin sudah kedaluwarsa atau pernah digunakan sebelumnya.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 font-sans p-4">
      <div className="w-full max-w-md bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
        
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <div className="animate-spin h-16 w-16 border-4 border-primary-200 border-t-primary-600 rounded-full mb-6"></div>
            <h2 className="text-xl font-bold text-slate-900">Memverifikasi email Anda...</h2>
            <p className="text-slate-500 mt-2 text-sm">Mohon tunggu selagi kami mengonfirmasi alamat email Anda.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={48} className="text-emerald-600" weight="regular" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Email Berhasil Diverifikasi!</h2>
            <p className="text-slate-500 text-sm mb-8">
              Akun Anda sekarang telah aktif. Silakan masuk untuk mulai membuat dan memantau pesanan percetakan.
            </p>
            <Link 
              to="/login"
              className="w-full h-12 bg-black text-white rounded-xl font-semibold flex items-center justify-center hover:bg-slate-800 transition-colors"
            >
              Masuk ke Akun
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle size={48} className="text-red-600" weight="regular" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Verifikasi Gagal</h2>
            <p className="text-slate-500 text-sm mb-8">
              {errorMessage}
            </p>
            <div className="flex flex-col w-full gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="w-full h-12 bg-black text-white rounded-xl font-semibold flex items-center justify-center hover:bg-slate-800 transition-colors"
              >
                Coba Lagi
              </button>
              <Link 
                to="/"
                className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
