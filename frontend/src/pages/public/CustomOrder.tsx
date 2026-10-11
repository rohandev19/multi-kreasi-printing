import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CloudArrowUp, CheckCircle } from '@phosphor-icons/react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../api/axios';

const customOrderSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(8, 'Nomor telepon wajib diisi'),
  companyName: z.string().optional(),
  productCategory: z.string().min(1, 'Silakan pilih kategori produk'),
  specifications: z.string().min(10, 'Mohon sertakan spesifikasi detail (minimal 10 karakter)'),
  estimatedQuantity: z.number().min(1, 'Jumlah estimasi minimal 1'),
  notes: z.string().optional(),
});

type CustomOrderFormValues = z.infer<typeof customOrderSchema>;

export const CustomOrderPage = () => {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CustomOrderFormValues>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      estimatedQuantity: 1,
    }
  });

  const onSubmit = async (data: CustomOrderFormValues) => {
    setIsSubmitting(true);
    try {
      // Create quotation request in backend
      await api.post('/api/v1/quotations/custom-request', data);
      
      setIsSuccess(true);
      success('Permintaan Terkirim', 'Permintaan pesanan kustom Anda telah kami terima!');
      reset();
    } catch (err: any) {
      error('Gagal Mengirim', err.response?.data?.message || 'Silakan coba beberapa saat lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
          <CheckCircle className="w-12 h-12 text-green-600" weight="regular" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Permintaan Berhasil Dikirim!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Terima kasih telah memilih Multi Kreasi Printing. Tim teknis dan sales kami akan segera meninjau spesifikasi pesanan Anda dan mengirimkan surat penawaran harga resmi (Quotation) ke email Anda dalam 1-2 hari kerja.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="bg-black text-white py-3 px-8 rounded-lg hover:bg-slate-800 font-medium transition-colors"
        >
          Kirim Permintaan Lainnya
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Permintaan Pesanan Kustom</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Membutuhkan produk cetak unik dengan spesifikasi dan bahan khusus di luar katalog standar? Deskripsikan kebutuhan proyek cetak Anda di bawah ini dan kami akan menyusun penawaran harga terbaik.
        </p>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Informasi Kontak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input 
                  type="text" 
                  {...register('fullName')}
                  className={`w-full border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 ${errors.fullName ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email *</label>
                <input 
                  type="email" 
                  {...register('email')}
                  className={`w-full border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon / WhatsApp *</label>
                <input 
                  type="tel" 
                  {...register('phone')}
                  className={`w-full border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan / Institusi (Opsional)</label>
                <input 
                  type="text" 
                  {...register('companyName')}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2"
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Detail Proyek Cetak</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Produk *</label>
                <select 
                  {...register('productCategory')}
                  className={`w-full border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 ${errors.productCategory ? 'border-red-300' : 'border-gray-300'}`}
                >
                  <option value="">Pilih kategori...</option>
                  <option value="Packaging">Kemasan, Box &amp; Packaging</option>
                  <option value="Marketing">Materi Pemasaran (Brosur, Flyer, Poster)</option>
                  <option value="LargeFormat">Large Format (Banner, Spanduk, Roll Up)</option>
                  <option value="Merchandise">Merchandise &amp; Souvenir Korporat</option>
                  <option value="Books">Buku Profil, Majalah &amp; Kalender</option>
                  <option value="Other">Lainnya / Konsultasi Khusus</option>
                </select>
                {errors.productCategory && <p className="mt-1 text-sm text-red-600">{errors.productCategory.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Kuantitas (Qty) *</label>
                <input 
                  type="number" 
                  min="1"
                  {...register('estimatedQuantity', { valueAsNumber: true })}
                  className={`w-full border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 ${errors.estimatedQuantity ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.estimatedQuantity && <p className="mt-1 text-sm text-red-600">{errors.estimatedQuantity.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Spesifikasi Detail Cetak *</label>
                <p className="text-xs text-gray-500 mb-2">Mohon cantumkan estimasi ukuran (P x L x T), jenis bahan/kertas, finishing, warna, dll.</p>
                <textarea 
                  rows={4}
                  {...register('specifications')}
                  placeholder="Contoh: Ukuran box 20x10x5 cm, bahan Ivory 300gsm, laminasi doff, hot print poly emas pada logo, kuantiti 2.000 pcs..."
                  className={`w-full border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 ${errors.specifications ? 'border-red-300' : 'border-gray-300'}`}
                ></textarea>
                {errors.specifications && <p className="mt-1 text-sm text-red-600">{errors.specifications.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Referensi Desain / Mockup (Opsional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="space-y-1 text-center">
                    <CloudArrowUp className="mx-auto h-12 w-12 text-gray-400" weight="regular" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="relative cursor-pointer bg-transparent rounded-md font-bold text-slate-900 hover:underline">
                        Pilih berkas
                      </span>
                      <p className="pl-1">atau tarik dan lepas di sini</p>
                    </div>
                    <p className="text-xs text-gray-500">Format PNG, JPG, PDF (Maks. 10MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto md:min-w-[200px] flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-black hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Mengirim Permintaan...' : 'Kirim Permintaan Penawaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
