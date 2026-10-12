import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CaretLeft, CaretRight, Buildings, Package, Printer } from '@phosphor-icons/react';

interface BannerSlide {
  id: string;
  image: string;
  badgeIcon: React.ElementType;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 'slide-offset',
    image: '/BannerTerbaru.webp',
    badgeIcon: Printer,
    badge: 'PRODUKSI PERCETAKAN KOMERSIAL',
    title: 'Cetak Volume Grosir Cepat & Presisi Warna Standar Industri',
    description: 'Kapasitas puluhan ribu lembar per hari untuk brosur, flyer, company profile, dan materi promosi korporat.',
    ctaText: 'Jelajahi Katalog Produk',
    ctaLink: '/products',
    secondaryCtaText: 'Hitung Job Ticket',
    secondaryCtaLink: '#estimator',
  },
  {
    id: 'slide-packaging',
    image: '/BannerKemasan.jpg',
    badgeIcon: Package,
    badge: 'PACKAGING & HARD-BOX CUSTOM',
    title: 'Kemasan Eksklusif, Box Produk & Finishing Foil Emas',
    description: 'Kombinasi material Duplex, Ivory, dan corrugated dengan laminasi doff/glossy serta pond die-cut presisi.',
    ctaText: 'Konsultasi Kemasan Kustom',
    ctaLink: '/custom-order',
  },
  {
    id: 'slide-corporate',
    image: '/BannerPabrik.jpg',
    badgeIcon: Buildings,
    badge: 'PENGADAAN PERUSAHAAN (B2B)',
    title: 'Fasilitas Satu Atap, e-Faktur PPN 11% & TOP s/d 45 Hari',
    description: 'Kemitraan pengadaan berkala untuk PT/CV dengan alokasi account manager khusus dan pengiriman terjadwal.',
    ctaText: 'Minta Penawaran Resmi (RFQ)',
    ctaLink: '/custom-order',
  },
];

export const CompactHeroBanner: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % bannerSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const activeSlide = bannerSlides[currentIdx];
  const BadgeIcon = activeSlide.badgeIcon;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <div
        className="group relative h-48 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-950 shadow-xs"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Image Slides */}
        {bannerSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIdx ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover object-center"
            />
            {/* Deep High-Contrast Directional Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/25 sm:via-black/60 sm:to-transparent" />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10 lg:px-12 max-w-2xl sm:max-w-3xl">
          {/* Badge */}
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider text-white border border-white/20 mb-2 sm:mb-3">
            <BadgeIcon size={13} weight="bold" className="text-emerald-400" />
            <span>{activeSlide.badge}</span>
          </div>

          {/* Title with fluid Plus Jakarta Sans */}
          <h2 
            className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            {activeSlide.title}
          </h2>

          {/* Subtitle */}
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed max-w-xl">
            {activeSlide.description}
          </p>

          {/* Action Button */}
          <div className="mt-3 sm:mt-4 flex items-center gap-3">
            <Link
              to={activeSlide.ctaLink}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-100 hover:gap-2"
            >
              <span>{activeSlide.ctaText}</span>
              <ArrowRight size={13} weight="bold" />
            </Link>

            {activeSlide.secondaryCtaText && (
              <a
                href={activeSlide.secondaryCtaLink}
                onClick={(e) => {
                  if (activeSlide.secondaryCtaLink?.startsWith('#')) {
                    e.preventDefault();
                    const targetId = activeSlide.secondaryCtaLink.replace('#', '');
                    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', activeSlide.secondaryCtaLink);
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-black/60"
              >
                <span>{activeSlide.secondaryCtaText}</span>
              </a>
            )}
          </div>
        </div>

        {/* Slide Navigation Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Slide Sebelumnya"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white opacity-0 group-hover:opacity-100"
        >
          <CaretLeft size={16} weight="bold" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Slide Berikutnya"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white opacity-0 group-hover:opacity-100"
        >
          <CaretRight size={16} weight="bold" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-3 right-4 sm:right-6 z-20 flex items-center gap-1.5">
          {bannerSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              aria-label={`Buka slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIdx
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
