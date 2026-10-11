import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle, Eye, EyeSlash } from '@phosphor-icons/react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../api/axios';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { error } = useToast();

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++; // Special char

    // Normalize to 1-4 scale
    const normalizedScore = Math.min(Math.ceil((score / 5) * 4), 4);
    
    switch (normalizedScore) {
      case 1: return { score: 1, label: 'Lemah', color: 'bg-red-500' };
      case 2: return { score: 2, label: 'Cukup', color: 'bg-amber-500' };
      case 3: return { score: 3, label: 'Bagus', color: 'bg-blue-500' };
      case 4: return { score: 4, label: 'Kuat', color: 'bg-emerald-500' };
      default: return { score: 0, label: '', color: 'bg-slate-200' };
    }
  };

  const strength = calculateStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      error('Kesalahan', 'Kata sandi tidak cocok');
      return;
    }

    if (password.length < 8) {
      error('Kesalahan', 'Kata sandi minimal harus 8 karakter');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/v1/auth/reset-password', { 
        token,
        password 
      });
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Failed to reset password', err);
      error('Gagal Mengatur Ulang', err.response?.data?.message || 'Gagal mengatur ulang kata sandi. Tautan mungkin telah kedaluwarsa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute bottom-0 right-0 w-full h-96 bg-black rounded-t-[4rem] sm:rounded-t-[8rem] translate-y-20 shadow-lg hidden sm:block"></div>
      <div className="absolute bottom-20 left-20 w-64 h-64 bg-slate-800/20 rounded-full blur-3xl hidden lg:block"></div>

      <div className="max-w-md w-full relative z-10">
        
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
                <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Kata Sandi Berhasil Diperbarui</h2>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                  Kata sandi Anda telah berhasil diperbarui. Anda sekarang dapat menggunakan kata sandi baru untuk masuk.
                </p>
                
                <Link 
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-black hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all active:scale-[0.98]"
                >
                  Lanjut ke Halaman Masuk
                  <ArrowRight size={20} weight="regular" />
                </Link>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Buat Kata Sandi Baru</h2>
                  <p className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
                    Kata sandi baru Anda harus berbeda dari kata sandi yang digunakan sebelumnya.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" weight="regular" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-12 pr-12 py-4 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 font-medium transition-colors"
                        placeholder="Minimal 8 karakter"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-900 focus:outline-none"
                      >
                        {showPassword ? <EyeSlash className="h-5 w-5" weight="regular" /> : <Eye className="h-5 w-5" weight="regular" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-3">
                        <div className="flex gap-1 h-1.5 mb-1.5">
                          {[1, 2, 3, 4].map(idx => (
                            <div 
                              key={idx} 
                              className={`flex-1 rounded-full transition-colors duration-300 ${idx <= strength.score ? strength.color : 'bg-slate-100'}`}
                            ></div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-bold ${strength.score > 0 ? strength.color.replace('bg-', 'text-') : 'text-slate-400'}`}>
                            {strength.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" weight="regular" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`block w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 font-medium transition-colors ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-primary-600 focus:border-primary-600'}`}
                        placeholder="Ulangi kata sandi baru Anda"
                      />
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-2 text-xs font-bold text-red-600">Kata sandi tidak cocok</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !password || password !== confirmPassword}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-black hover:bg-slate-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Memperbarui...</span>
                      </div>
                    ) : (
                      'Perbarui Kata Sandi'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
