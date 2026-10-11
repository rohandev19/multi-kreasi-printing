import { Link } from 'react-router-dom';
import { Package, TrendDown, Clock, ShieldCheck, ArrowRight, Truck } from '@phosphor-icons/react';

export const BulkPrintingPage = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-black text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-400 via-slate-900 to-black"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Solusi Cetak Partai Besar Enterprise</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Tingkatkan efisiensi bisnis Anda dengan layanan cetak kuantitas besar. Dapatkan efisiensi biaya signifikan, prioritas antrian produksi, dan dukungan B2B profesional untuk seluruh kebutuhan cetak korporasi Anda.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/custom-order" className="bg-black hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2">
              Minta Penawaran Partai Besar
              <ArrowRight size={18} weight="regular" />
            </Link>
            <Link to="/contact" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-lg border border-slate-700 transition-all">
              Konsultasi dengan Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Memilih Kami untuk Pesanan Partai Besar?</h2>
          <p className="text-lg text-gray-600">Kami memahami standar pengadaan material cetak korporasi dan kampanye pemasaran berskala besar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center mb-6">
              <TrendDown size={28} weight="regular" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Diskon Bertingkat Berdasarkan Volume</h3>
            <p className="text-gray-600 leading-relaxed">
              Semakin banyak Anda mencetak, semakin hemat harga per unit yang Anda dapatkan. Struktur harga transparan kami menjamin efisiensi anggaran terbaik untuk bisnis Anda.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center mb-6">
              <Clock size={28} weight="regular" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Jalur Produksi Prioritas</h3>
            <p className="text-gray-600 leading-relaxed">
              Pesanan partai besar dari mitra B2B dialokasikan ke jalur lini mesin berkecepatan tinggi khusus, memastikan tenggat waktu operasional korporasi Anda selalu terpenuhi.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck size={28} weight="regular" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Kontrol Kualitas Warna Presisi</h3>
            <p className="text-gray-600 leading-relaxed">
              Baik Anda memesan 1.000 maupun 100.000 unit, kalibrasi warna CMYK otomatis dan proses QC ketat kami menjamin hasil cetak seragam di setiap batch produksi.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center mb-6">
              <Package size={28} weight="regular" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Pengemasan &amp; Kitting Kustom</h3>
            <p className="text-gray-600 leading-relaxed">
              Butuh brosur dikemas rapi per 50 lembar, atau pengiriman terpisah untuk berbagai cabang kantor? Tim kami menangani kebutuhan pengemasan kompleks dengan rapi.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow lg:col-span-2 flex flex-col justify-center bg-slate-50/80">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-sm">
                <Truck size={24} weight="regular" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Jaringan Distribusi &amp; Logistik Nasional</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Kami bermitra dengan ekspedisi kargo terpercaya untuk memastikan palet besar atau pengiriman multi-titik tiba dengan aman dan tepat waktu ke seluruh kota di Indonesia.
                </p>
                <Link to="/contact" className="text-slate-900 font-bold hover:underline flex items-center gap-1">
                  Konsultasikan kebutuhan logistik <ArrowRight size={16} weight="regular" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Produk Terpopuler untuk Partai Besar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900">Box Kemasan &amp; Packaging</h3>
              <p className="text-sm text-gray-500 mt-1">Mulai dari 1.000 pcs</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900">Brosur &amp; Flyer</h3>
              <p className="text-sm text-gray-500 mt-1">Mulai dari 5.000 pcs</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900">Buku Profil &amp; Katalog</h3>
              <p className="text-sm text-gray-500 mt-1">Mulai dari 500 pcs</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900">Paper Bag &amp; Tas Kertas</h3>
              <p className="text-sm text-gray-500 mt-1">Mulai dari 1.000 pcs</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
