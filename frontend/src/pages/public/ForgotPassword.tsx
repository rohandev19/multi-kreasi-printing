import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Envelope, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../api/axios';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/api/v1/auth/forgot-password', { email });
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Failed to send reset link', err);
      // In a real app, you often pretend it succeeded anyway for security (email enumeration prevention)
      // But for this project, we'll show the error if the backend returns one.
      error('Permintaan Gagal', err.response?.data?.message || 'Gagal mengirim tautan atur ulang kata sandi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-black rounded-b-[4rem] sm:rounded-b-[8rem] -translate-y-20 shadow-lg hidden sm:block"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-slate-800/20 rounded-full blur-3xl hidden lg:block"></div>
      <div className="absolute top-40 left-20 w-48 h-48 bg-slate-700/10 rounded-full blur-2xl hidden lg:block"></div>

      <div className="max-w-md w-full relative z-10">
        
        {/* Logo/Brand placeholder */}
        <div className="text-center mb-8 sm:mb-10">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <span className="text-2xl font-black text-slate-900 tracking-tighter">MK</span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          
          <div className="p-8 sm:p-10">
            {isSuccess ? (
              <div className="text-center animate-fade-in">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle className="w-10 h-10 text-emerald-600" weight="regular" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Periksa email Anda</h2>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                  Kami telah mengirim tautan atur ulang kata sandi ke <strong className="text-slate-900">{email}</strong>.
                </p>
                
                <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 text-left">
                  <div className="flex gap-3 text-sm text-slate-600 font-medium">
                    <WarningCircle className="w-5 h-5 text-slate-900 shrink-0 mt-0.5" weight="regular" />
                    <p>Tidak menerima email? Periksa folder spam Anda, atau coba kirim ulang.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      setIsSuccess(false);
                      setLoading(false);
                    }}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all active:scale-[0.98]"
                  >
                    Kirim Ulang Email
                  </button>
                  <Link 
                    to="/login"
                    className="w-full flex justify-center py-4 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
                  >
                    Kembali ke Halaman Masuk
                  </Link>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Lupa Kata Sandi?</h2>
                  <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
                    Jangan khawatir, masukkan email Anda dan kami akan mengirimkan petunjuk atur ulang.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                      Alamat Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Envelope className="h-5 w-5 text-slate-400" weight="regular" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium transition-colors"
                        placeholder="Masukkan alamat email Anda"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-black hover:bg-slate-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Mengirimkan...</span>
                      </div>
                    ) : (
                      'Atur Ulang Kata Sandi'
                    )}
                  </button>
                </form>
                
                <div className="mt-10 text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 font-bold text-slate-600 hover:text-slate-900 transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" weight="regular" />
                    Kembali ke halaman masuk
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
