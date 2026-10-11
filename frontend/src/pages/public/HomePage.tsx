import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, Package, Printer, Truck, UploadSimple, ClipboardText, MagnifyingGlass } from '@phosphor-icons/react';
import { HeroPhotoSlider } from '../../components/home/HeroPhotoSlider';

const actionCards = [
  {
    icon: ClipboardText,
    title: 'Lihat Katalog Produk',
    description: 'Jelajahi berbagai produk standar, pilihan bahan, dan ukuran sebelum memesan penawaran.',
  },
  {
    icon: UploadSimple,
    title: 'Unggah File Desain',
    description: 'Kirim file desain cetak yang siap produksi dan pastikan tim produksi memahami kebutuhan Anda.',
  },
  {
    icon: MagnifyingGlass,
    title: 'Pantau Setiap Pesanan',
    description: 'Ikuti proses proofing, produksi, dan pengiriman langsung dari satu dashboard pelanggan.',
  },
];

const serviceCards = [
  {
    icon: Package,
    title: 'Identitas Perusahaan',
    description: 'Kartu nama, kop surat, amplop, dan map untuk keperluan operasional sehari-hari.',
  },
  {
    icon: Printer,
    title: 'Materi Pemasaran',
    description: 'Brosur, flyer, katalog, dan kemasan untuk kampanye dan peluncuran produk.',
  },
  {
    icon: Truck,
    title: 'Percetakan Format Besar',
    description: 'Spanduk, papan reklame, dan materi acara dengan finishing berkualitas tinggi.',
  },
];

export const HomePage: React.FC = () => {
  return (
    <div className="w-full" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Hero Section with Elegant Photo Slider */}
      <HeroPhotoSlider />




      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {actionCards.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: 'var(--color-neutral-100)', color: '#000000' }}>
                <Icon size={28} weight="bold" />
              </div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
              <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y" style={{ backgroundColor: 'var(--color-neutral-50)', borderColor: 'var(--border-default)' }}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: '#000000' }}>Layanan Unggulan</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Pilih Jenis Percetakan yang Anda Butuhkan</h2>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Kami menyediakan berbagai layanan percetakan berkualitas untuk memenuhi kebutuhan bisnis dan personal Anda.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {serviceCards.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: 'var(--color-neutral-100)', color: '#000000' }}>
                  <Icon size={30} weight="bold" />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
                <Link to="/products" className="group/link mt-6 inline-flex items-center gap-2 text-base font-bold transition-all duration-200" style={{ color: '#000000' }}>
                  Lihat Produk
                  <ArrowRight size={18} weight="bold" className="transition-transform duration-200 group-hover/link:translate-x-1" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border p-8" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Didesain untuk Kemudahan Produksi & Pelanggan</h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Antarmuka kami memprioritaskan status pesanan, pengiriman file, dan persetujuan penawaran agar setiap proses memiliki langkah yang jelas.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {['Setujui Proof', 'Bayar Invoice', 'Pantau Pengiriman'].map((item) => (
                <div key={item} className="rounded-xl border px-5 py-4 text-base font-semibold transition-all duration-200 hover:scale-[1.02]" style={{ backgroundColor: 'var(--color-neutral-50)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border p-8" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--color-neutral-100)' }}>
                <Headphones size={24} weight="bold" style={{ color: '#000000' }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Butuh Bantuan?</h2>
            </div>
            <p className="mt-5 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Tim dukungan kami siap membantu pertanyaan pesanan, update produksi, dan persiapan file desain.
            </p>
            <Link
              to="/help"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              style={{ backgroundColor: '#000000', color: '#ffffff' }}
            >
              Hubungi Kami
              <ArrowRight size={18} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
};
