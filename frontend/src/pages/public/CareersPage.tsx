import { Briefcase, MapPin, Clock } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export const CareersPage = () => {
  const jobs = [
    {
      id: 1,
      title: 'Senior Graphic Designer',
      department: 'Desain & Kreatif',
      location: 'Jakarta Selatan',
      type: 'Purna Waktu',
      description: 'Membutuhkan desainer grafis berpengalaman dengan portofolio kuat di media cetak komersial dan desain kemasan packaging.'
    },
    {
      id: 2,
      title: 'Operator Mesin Produksi',
      department: 'Produksi',
      location: 'Jakarta Selatan',
      type: 'Purna Waktu',
      description: 'Mengoperasikan dan merawat mesin cetak offset dan digital modern. Memastikan standar kualitas warna tinggi dan target waktu tercapai.'
    },
    {
      id: 3,
      title: 'Sales Eksekutif B2B',
      department: 'Penjualan',
      location: 'Hybrid / Jakarta',
      type: 'Purna Waktu',
      description: 'Mendorong ekspansi bisnis dengan mengakuisisi klien korporat baru serta membina hubungan kemitraan jangka panjang di sektor enterprise.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Bergabung Bersama Kami</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Bantu kami membentuk masa depan industri percetakan modern. Kami senantiasa membuka pintu bagi talenta berdedikasi untuk bertumbuh bersama.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mengapa Berkarir di MK Printing?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Berorientasi Inovasi</h3>
            <p className="text-gray-600">Menggunakan teknologi percetakan mutakhir dan sistem digital terintegrasi.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Budaya Positif</h3>
            <p className="text-gray-600">Lingkungan kerja yang kolaboratif, profesional, dan saling mendukung ide-ide kreatif.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pengembangan Diri</h3>
            <p className="text-gray-600">Peluang pelatihan intensif dan jenjang karir yang terstruktur dengan jelas.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Lowongan Tersedia</h2>
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Briefcase size={16} weight="regular" /> {job.department}</span>
                  <span className="flex items-center gap-1"><MapPin size={16} weight="regular" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock size={16} weight="regular" /> {job.type}</span>
                </div>
                <p className="text-gray-600 mt-4 max-w-3xl">{job.description}</p>
              </div>
              <div className="shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                <Link to="/contact" className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-slate-800 transition-colors w-full md:w-auto">
                  Lamar Sekarang
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Belum menemukan posisi yang cocok?</h2>
        <p className="text-gray-600 mb-6">Kami selalu terbuka untuk talenta potensial. Kirimkan resume/portofolio Anda ke careers@mkprinting.com dan tim HR kami akan menghubungi Anda saat ada peluang yang relevan.</p>
      </div>
    </div>
  );
};
