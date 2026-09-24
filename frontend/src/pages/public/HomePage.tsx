import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, Package, Printer, Truck, UploadSimple, ClipboardText, MagnifyingGlass } from '@phosphor-icons/react';
import { HeroBackgroundImage } from '../../components/HeroBackgroundImage';
import { HeroOverlay } from '../../components/HeroOverlay';
import type { HeroImageConfig } from '../../types/heroImage';

const heroImageConfig: HeroImageConfig = {
  desktop: { webp: '/BannerTerbaru.webp', png: '/BannerHome.png' },
  tablet: { webp: '/BannerTerbaru.webp', png: '/BannerHome.png' },
  mobile: { webp: '/BannerTerbaru.webp', png: '/BannerHome.png' },
  alt: 'Multi Kreasi Printing - Solusi Percetakan Terpercaya',
  objectPosition: 'center center',
  overlayOpacity: 0.5,
};

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
      <section className="relative overflow-hidden border-b" style={{ backgroundColor: 'var(--color-neutral-950)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <HeroBackgroundImage config={heroImageConfig} />
        <HeroOverlay opacity={heroImageConfig.overlayOpacity} />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border backdrop-blur-sm px-5 py-2 text-sm font-semibold shadow-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.25)', color: 'var(--text-inverse)' }}>
              <span className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-success-400)' }} />
              Portal Percetakan Online - Pesan & Pantau dengan Mudah
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight leading-tight sm:text-5xl lg:text-6xl" style={{ color: 'var(--text-inverse)', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              Solusi Percetakan Terpercaya untuk Bisnis Anda.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Unggah desain, minta penawaran, dan pantau proses produksi secara real-time — tanpa ribetnya email telepon berantai.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/products"
                className="group inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: 'var(--color-primary-600)', boxShadow: '0 10px 25px -5px rgba(var(--color-primary-600-rgb), 0.4)' }}
              >
                Lihat Katalog Produk
                <ArrowRight size={20} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/custom-order"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 backdrop-blur-sm px-8 py-4 text-base font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.4)', color: 'var(--text-inverse)' }}
              >
                Pesan Custom
                <ArrowRight size={20} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {actionCards.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="group rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
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
            <p className="text-sm font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--color-primary-600)' }}>Layanan Unggulan</p>
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
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: 'var(--color-neutral-100)', color: 'var(--color-primary-600)' }}>
                  <Icon size={30} weight="bold" />
                </div>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
                <Link to="/products" className="group/link mt-6 inline-flex items-center gap-2 text-base font-bold transition-all duration-200" style={{ color: 'var(--color-primary-600)' }}>
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--color-primary-50)' }}>
                <Headphones size={24} weight="bold" style={{ color: 'var(--color-primary-600)' }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Butuh Bantuan?</h2>
            </div>
            <p className="mt-5 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Tim dukungan kami siap membantu pertanyaan pesanan, update produksi, dan persiapan file desain.
            </p>
            <Link
              to="/help"
              className="group mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
              style={{ backgroundColor: 'var(--color-primary-600)' }}
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
