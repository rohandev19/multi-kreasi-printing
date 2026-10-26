import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CaretLeft, CaretRight, Sparkle } from '@phosphor-icons/react';

export interface SlideItem {
  id: string;
  image: string;
  badge: string;
  title: string;
  description: string;
  primaryCta: {
    label: string;
    to: string;
  };
  secondaryCta: {
    label: string;
    to: string;
  };
}

const slides: SlideItem[] = [
  {
    id: 'slide-1',
    image: '/BannerTerbaru.webp',
    badge: 'Pusat Produksi Percetakan Modern',
    title: 'Solusi Percetakan Terpercaya untuk Bisnis Anda.',
    description: 'Unggah desain, minta penawaran, dan pantau proses produksi secara real-time — tanpa ribetnya email & telepon berantai.',
    primaryCta: { label: 'Lihat Katalog Produk', to: '/products' },
    secondaryCta: { label: 'Pesan Custom', to: '/custom-order' },
  },
  {
    id: 'slide-2',
    image: '/BannerKemasan.jpg',
    badge: 'Packaging & Corporate Stationery',
    title: 'Kemasan Mewah & Eksklusif untuk Identitas Brand Anda.',
    description: 'Hardbox premium, packaging custom, hot print foil emas, dan finishing berkelas untuk meningkatkan nilai produk bisnis Anda.',
    primaryCta: { label: 'Jelajahi Kemasan', to: '/products' },
    secondaryCta: { label: 'Konsultasi Desain', to: '/custom-order' },
  },
  {
    id: 'slide-3',
    image: '/BannerPabrik.jpg',
    badge: 'Kapasitas Produksi Skala Industri',
    title: 'Presisi Warna Konsisten & Mesin Kecepatan Tinggi.',
    description: 'Didukung armada mesin Heidelberg & Roland mutakhir untuk menangani cetak brosur, flyer, dan buku korporat volume besar.',
    primaryCta: { label: 'Minta Penawaran', to: '/custom-order' },
    secondaryCta: { label: 'Katalog Lengkap', to: '/products' },
  },
];

export const HeroPhotoSlider: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <section 
      className="relative w-full h-[540px] sm:h-[600px] lg:h-[680px] overflow-hidden bg-slate-950 select-none group border-b border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Photo Slider Percetakan"
    >
      {/* Background Slides with Ken-Burns and Crossfade */}
      {slides.map((slide, index) => {
        const isActive = index === currentIdx;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Image with subtle zoom */}
            <img
              src={slide.image}
              alt={slide.title}
              className={`w-full h-full object-cover object-center transform transition-transform duration-[7000ms] ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            />

            {/* Gradient Overlays for Maximum Contrast & Elegance */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
          </div>
        );
      })}

      {/* Main Content Area */}
      <div className="relative z-20 mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-3xl">
          {slides.map((slide, index) => {
            const isActive = index === currentIdx;
            if (!isActive) return null;

            return (
              <div 
                key={slide.id}
                className="animate-[fadeIn_0.7s_ease-out_forwards] space-y-6"
              >
                {/* Badge Tag */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-white/95 shadow-sm">
                  <Sparkle size={14} weight="fill" className="text-white" />
                  <span>{slide.badge}</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-3xl font-extrabold tracking-tight leading-tight sm:text-5xl lg:text-6xl text-white drop-shadow-md">
                  {slide.title}
                </h1>

                {/* Subtitle / Description */}
                <p className="text-base sm:text-lg leading-relaxed text-white/85 max-w-2xl drop-shadow">
                  {slide.description}
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-3.5 sm:flex-row">
                  <Link
                    to={slide.primaryCta.to}
                    className="group/btn inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold text-white shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                    style={{ backgroundColor: 'var(--color-primary-600)', color: '#ffffff', boxShadow: 'var(--shadow-lg)' }}
                  >
                    {slide.primaryCta.label}
                    <ArrowRight size={18} weight="bold" className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </Link>

                  <Link
                    to={slide.secondaryCta.to}
                    className="group/btn inline-flex items-center justify-center gap-2 rounded-xl border-2 backdrop-blur-md px-7 py-3.5 text-base font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.4)', color: 'var(--text-inverse)' }}
                  >
                    {slide.secondaryCta.label}
                    <ArrowRight size={18} weight="bold" className="transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev / Next Navigation Arrows */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Slide sebelumnya"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/40 hover:bg-slate-900/80 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all duration-200 opacity-70 group-hover:opacity-100 hover:scale-110 active:scale-95"
      >
        <CaretLeft size={22} weight="bold" />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Slide berikutnya"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/40 hover:bg-slate-900/80 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all duration-200 opacity-70 group-hover:opacity-100 hover:scale-110 active:scale-95"
      >
        <CaretRight size={22} weight="bold" />
      </button>

      {/* Bottom Slide Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-slate-950/40 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIdx;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              aria-label={`Pindah ke slide ${idx + 1}`}
              className="flex items-center gap-2 group/dot py-1 focus:outline-none"
            >
              <span
                className={`h-2 rounded-full transition-all duration-500 ${
                  isActive 
                    ? 'w-8 bg-white shadow-md shadow-white/50' 
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
              <span className={`text-[11px] font-mono font-bold transition-colors ${isActive ? 'text-white' : 'text-white/40 group-hover/dot:text-white/70'}`}>
                0{idx + 1}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
