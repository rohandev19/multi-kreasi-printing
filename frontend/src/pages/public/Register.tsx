import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from '@phosphor-icons/react';
import api from '../../api/axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Minimal 8 karakter dengan huruf besar, huruf kecil, dan angka.')
    .regex(/[A-Z]/, 'Harus mengandung minimal satu huruf besar')
    .regex(/[a-z]/, 'Harus mengandung minimal satu huruf kecil')
    .regex(/[0-9]/, 'Harus mengandung minimal satu angka'),
  confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Kata sandi tidak cocok",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    }
  });

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 0) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(passwordValue);
  
  const strengthLabels = ['Lemah', 'Cukup', 'Bagus', 'Kuat'];
  const strengthColors = [
    'bg-red-500', 
    'bg-amber-500', 
    'bg-blue-500', 
    'bg-emerald-500'
  ];
  
  const getStrengthLabel = () => strength > 0 ? strengthLabels[strength - 1] : '';
  const getStrengthColor = () => strength > 0 ? strengthColors[strength - 1] : 'bg-slate-200';

  const onSubmit = async (data: RegisterFormValues) => {
    setError('');
    setLoading(true);

    try {
      await api.post('/api/v1/auth/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pendaftaran gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 font-sans py-12 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        
        {success ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" weight="regular" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
            <p className="text-gray-600 mb-8">Silakan periksa email Anda untuk memverifikasi akun.</p>
            <Link 
              to="/login"
              className="inline-block px-8 py-3 bg-black text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Masuk ke Akun
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Daftar Akun Baru</h2>
              <p className="text-sm text-gray-600 mt-1">Bergabung dengan Multi Kreasi Printing sekarang</p>
            </div>
            
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input 
                  type="text" 
                  {...register('fullName')}
                  className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 text-sm ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`} 
                  placeholder="Nama Lengkap Anda" 
                  disabled={loading}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Alamat Email</label>
                <input 
                  type="email" 
                  {...register('email')}
                  autoComplete="email"
                  className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
                  placeholder="anda@perusahaan.com" 
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nomor Telepon / WhatsApp <span className="text-gray-400 font-normal">(Opsional)</span></label>
                <input 
                  type="tel" 
                  {...register('phone')}
                  className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 text-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} 
                  placeholder="0812 3456 7890" 
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Kata Sandi</label>
                <input 
                  type="password" 
                  {...register('password', {
                    onChange: (e) => setPasswordValue(e.target.value)
                  })}
                  className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 text-sm ${errors.password ? 'border-red-500' : 'border-gray-300'}`} 
                  disabled={loading}
                />
                
                {/* Password Strength Indicator */}
                <div className="mt-2 flex gap-1 h-1 w-full rounded-full overflow-hidden bg-slate-100">
                  <div className={`h-full transition-all duration-300 w-1/4 ${strength >= 1 ? getStrengthColor() : 'bg-transparent'}`}></div>
                  <div className={`h-full transition-all duration-300 w-1/4 ${strength >= 2 ? getStrengthColor() : 'bg-transparent'}`}></div>
                  <div className={`h-full transition-all duration-300 w-1/4 ${strength >= 3 ? getStrengthColor() : 'bg-transparent'}`}></div>
                  <div className={`h-full transition-all duration-300 w-1/4 ${strength >= 4 ? getStrengthColor() : 'bg-transparent'}`}></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">Minimal 8 karakter dengan huruf besar, kecil, & angka.</p>
                  {strength > 0 && <span className={`text-xs font-semibold ${strengthColors[strength - 1].replace('bg-', 'text-')}`}>{getStrengthLabel()}</span>}
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Konfirmasi Kata Sandi</label>
                <input 
                  type="password" 
                  {...register('confirmPassword')}
                  className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 text-sm ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} 
                  disabled={loading}
                />
                {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-black text-white text-sm font-medium rounded-md shadow-sm hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors"
              >
                {loading ? 'Mendaftarkan akun...' : 'Daftar Sekarang'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-gray-500">Sudah memiliki akun? </span>
              <Link to="/login" className="text-sm font-bold text-slate-900 hover:underline transition-colors">
                Masuk
              </Link>
            </div>
          </>
        )}
          </>
        )}
      </div>
    </div>
  );
};
