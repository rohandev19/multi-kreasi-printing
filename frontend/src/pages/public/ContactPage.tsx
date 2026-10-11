import { useToast } from '../../contexts/ToastContext';

export const ContactPage = () => {
  const { success } = useToast();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Hubungi Kami</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Konsultasi &amp; Kontak</h2>
          <p className="text-gray-600 mb-8">
            Punya pertanyaan seputar layanan kami atau membutuhkan penawaran harga cetak khusus? 
            Isi formulir berikut dan tim kami akan segera menghubungi Anda dalam waktu 24 jam kerja.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="font-semibold text-gray-900 w-28">Alamat:</span>
              <span className="text-gray-600">Jl. Sudirman No. 123<br/>Jakarta Selatan, 12190<br/>Indonesia</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 w-28">Telepon/WA:</span>
              <span className="text-gray-600">+62 812 3456 7890</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 w-28">Email:</span>
              <span className="text-gray-600">hello@mkprinting.com</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); success('Pesan Terkirim', 'Terima kasih! Tim kami akan segera menghubungi Anda.'); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
              <input type="email" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pesan / Kebutuhan Cetak</label>
              <textarea rows={4} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" required></textarea>
            </div>
            <button type="submit" className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-slate-800 transition-colors font-medium">
              Kirim Pesan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
