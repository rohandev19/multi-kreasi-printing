import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  Pause,
  Play,
} from '@phosphor-icons/react';

interface BannerSlide {
  id: string;
  image: string;
  titleMain: string;
  titleAccent?: string;
  ctaText: string;
  ctaLink: string;
}

const bannerSlides: BannerSlide[] = [
  {
    id: 'slide-offset',
    image: '/BannerTerbaru.webp',
    titleMain: 'Cetak Brosur & Materi Promosi Grosir',
    titleAccent: 'Presisi Standar Industri',
    ctaText: 'Jelajahi Katalog Produk',
    ctaLink: '/products',
  },
  {
    id: 'slide-packaging',
    image: '/BannerKemasan.jpg',
    titleMain: 'Kemasan Eksklusif & Hardbox Produk',
    titleAccent: 'Finishing Foil Emas',
    ctaText: 'Konsultasi Kemasan Kustom',
    ctaLink: '/custom-order',
  },
  {
    id: 'slide-corporate',
    image: '/BannerPabrik.jpg',
    titleMain: 'Pengadaan Percetakan Perusahaan',
    titleAccent: 'Fasilitas Bisnis B2B',
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
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const activeSlide = bannerSlides[currentIdx];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
      <div
        className="group relative h-40 sm:h-48 md:h-56 lg:h-60 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-md"
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
              alt={`${slide.titleMain} ${slide.titleAccent || ''}`}
              className="h-full w-full object-cover object-center"
            />
            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/20 sm:to-transparent" />
          </div>
        ))}

        {/* Content Overlay */}
        <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-10 lg:px-12 max-w-3xl">
          {/* Refined 1-Line Title */}
          <h2 
            className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-white leading-snug drop-shadow-sm flex flex-wrap items-center gap-x-2"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            <span>{activeSlide.titleMain}</span>
            {activeSlide.titleAccent && (
              <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-yellow-300 bg-clip-text text-transparent font-extrabold">
                • {activeSlide.titleAccent}
              </span>
            )}
          </h2>

          {/* Action Button - Sleek Pill */}
          <div className="mt-3 sm:mt-4 flex items-center">
            <Link
              to={activeSlide.ctaLink}
              className="group/btn inline-flex items-center gap-2 rounded-full bg-white/95 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-900 shadow-md backdrop-blur-xs transition-all duration-200 hover:bg-white hover:shadow-lg hover:shadow-white/15 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{activeSlide.ctaText}</span>
              <ArrowRight size={13} weight="bold" className="transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Slide Navigation Arrows */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Slide Sebelumnya"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/90 transition-[background-color,color] duration-150 hover:bg-black/80 hover:text-white opacity-0 group-hover:opacity-100"
        >
          <CaretLeft size={16} weight="bold" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Slide Berikutnya"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/90 transition-[background-color,color] duration-150 hover:bg-black/80 hover:text-white opacity-0 group-hover:opacity-100"
        >
          <CaretRight size={16} weight="bold" />
        </button>

        {/* Controls: Pause/Play & Indicator Dots */}
        <div className="absolute bottom-3 right-4 sm:right-6 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? "Lanjutkan putaran banner" : "Jeda putaran banner"}
            title={isPaused ? "Lanjutkan putaran banner" : "Jeda putaran banner"}
            className="flex h-5 w-5 items-center justify-center rounded text-white/70 hover:text-white transition-colors"
          >
            {isPaused ? <Play size={11} weight="fill" /> : <Pause size={11} weight="fill" />}
          </button>
          <div className="flex items-center gap-1.5">
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
    </div>
  );
};
