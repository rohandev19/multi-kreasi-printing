import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CaretDown, CaretUp, MagnifyingGlass, ChatCircle, Question } from '@phosphor-icons/react';

const faqs = [
  {
    category: 'Pesanan & Produksi',
    questions: [
      {
        q: 'Berapa lama estimasi waktu pengerjaan produksi cetak?',
        a: 'Waktu produksi standar adalah 3-5 hari kerja tergantung jenis produk dan kuantitas. Layanan produksi kilat / express (1-2 hari) tersedia untuk produk tertentu dengan penyesuaian biaya prioritas.'
      },
      {
        q: 'Bisakah saya membatalkan atau mengubah pesanan setelah dibuat?',
        a: 'Pesanan hanya dapat diubah atau dibatalkan jika belum memasuki tahap approval atau naik cetak (In Production). Silakan segera hubungi tim customer service kami jika ada perubahan mendesak.'
      },
      {
        q: 'Berapa kuantitas pesanan minimal (MOQ)?',
        a: 'MOQ berbeda tergantung jenis produk. Kartu nama mulai dari 1 box (100 pcs), sedangkan cetak offset seperti brosur dan buku profil umumnya mulai dari 500 pcs. Rincian MOQ tertera pada masing-masing halaman produk.'
      }
    ]
  },
  {
    category: 'Berkas Desain & Spesifikasi',
    questions: [
      {
        q: 'Format berkas desain apa saja yang dapat diterima?',
        a: 'Kami menerima format PDF (sangat direkomendasikan), AI, PSD, EPS, dan JPEG/PNG beresolusi tinggi. Pastikan seluruh font teks telah di-convert/outlined dan tautan gambar telah di-embed.'
      },
      {
        q: 'Berapa standar resolusi dan mode warna yang harus digunakan?',
        a: 'Seluruh berkas desain wajib memiliki resolusi minimal 300 DPI untuk hasil cetak tajam. Gunakan mode warna CMYK, karena mode RGB dapat menghasilkan perbedaan warna saat dicetak fisik.'
      },
      {
        q: 'Apakah Multi Kreasi Printing menyediakan layanan bantuan desain?',
        a: 'Ya, tim in-house designer kami siap membantu pembuatan berkas baru maupun penyesuaian tata letak desain Anda. Hubungi kami untuk konsultasi kebutuhan desain grafis Anda.'
      }
    ]
  },
  {
    category: 'Pengiriman & Pembayaran',
    questions: [
      {
        q: 'Metode pembayaran apa saja yang didukung?',
        a: 'Kami mendukung transfer bank manual (BCA, Mandiri, BNI), Virtual Account, serta faktur tagihan tempo khusus untuk akun korporat B2B yang telah memiliki kontrak kemitraan.'
      },
      {
        q: 'Apakah melayani pengiriman ke seluruh Indonesia?',
        a: 'Ya, kami melayani pengiriman ke seluruh wilayah Indonesia melalui ekspedisi kargo darat, laut, dan udara terpercaya. Biaya kirim dihitung berdasarkan berat volumetrik dan kota tujuan.'
      },
      {
        q: 'Bisakah saya mengambil pesanan langsung di workshop?',
        a: 'Bisa, Anda dapat memilih opsi "Ambil Sendiri di Workshop" saat checkout. Anda akan menerima notifikasi status setelah barang selesai dipacking dan siap diambil.'
      }
    ]
  }
];

export const FaqPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>('0-0');

  const toggleAccordion = (index: string) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  const filteredFaqs = faqs.map(category => {
    return {
      ...category,
      questions: category.questions.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    };
  }).filter(category => category.questions.length > 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      
      {/* Hero Section */}
      <div className="bg-black py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10 animate-fade-in">
          <Question className="w-16 h-16 text-slate-300 mx-auto mb-6" weight="regular" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
            Pertanyaan Umum (FAQ)
          </h1>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
            Temukan jawaban lengkap seputar layanan percetakan, persiapan berkas desain, alur pemesanan, dan pengiriman kami.
          </p>
          
          <div className="relative max-w-xl mx-auto shadow-lg rounded-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlass className="h-6 w-6 text-slate-400" weight="regular" />
            </div>
            <input
              type="text"
              placeholder="Cari topik atau pertanyaan..."
              className="block w-full pl-12 pr-4 py-4 rounded-2xl border-0 ring-1 ring-inset ring-transparent bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:text-lg sm:leading-6 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="space-y-8">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, catIndex) => (
              <div key={catIndex} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 animate-fade-in" style={{ animationDelay: `${catIndex * 100}ms` }}>
                <h2 className="text-xl font-bold text-slate-900 mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, qIndex) => {
                    const index = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === index;
                    
                    return (
                      <div 
                        key={qIndex} 
                        className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${isOpen ? 'border-slate-300 bg-slate-50/60' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <button
                          onClick={() => toggleAccordion(index)}
                          className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                        >
                          <span className={`font-semibold pr-6 ${isOpen ? 'text-slate-900 font-bold' : 'text-slate-800'}`}>
                            {faq.q}
                          </span>
                          <span className={`flex-shrink-0 ml-4 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isOpen ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 text-slate-400'}`}>
                            {isOpen ? <CaretUp className="w-5 h-5" weight="regular" /> : <CaretDown className="w-5 h-5" weight="regular" />}
                          </span>
                        </button>
                        
                        <div 
                          className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <p className="text-slate-600 leading-relaxed font-medium">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
              <MagnifyingGlass className="w-12 h-12 text-slate-300 mx-auto mb-4" weight="regular" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Tidak ada hasil ditemukan</h3>
              <p className="text-slate-500">Kami tidak dapat menemukan pertanyaan yang cocok dengan "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-slate-900 font-bold hover:underline"
              >
                Hapus pencarian
              </button>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-slate-100 rounded-3xl p-8 sm:p-10 text-center border border-slate-200">
          <ChatCircle className="w-12 h-12 text-slate-800 mx-auto mb-4" weight="regular" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Masih memiliki pertanyaan lain?</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Tidak menemukan jawaban yang Anda cari? Tim customer support kami siap mendampingi kebutuhan Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl shadow-sm text-white bg-black hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all active:scale-95"
            >
              Hubungi Customer Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
