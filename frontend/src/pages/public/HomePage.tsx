import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Printer, Truck, ShieldCheck, Clock, BadgePercent, Headphones, ArrowRight, Star } from 'lucide-react';
import { HeroBackgroundImage } from '../../components/HeroBackgroundImage';
import { HeroOverlay } from '../../components/HeroOverlay';
import type { HeroImageConfig } from '../../types/heroImage';

const heroImageConfig: HeroImageConfig = {
  desktop: {
    webp: '/BannerResize.webp',
    png: '/BannerHome.png',
  },
  tablet: {
    webp: '/BannerResize.webp',
    png: '/BannerHome.png',
  },
  mobile: {
    webp: '/BannerResize.webp',
    png: '/BannerHome.png',
  },
  alt: 'Multi Kreasi Printing production banner',
  objectPosition: 'center center',
  overlayOpacity: 0.5,
};

export const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="relative w-full bg-slate-950 py-32 lg:py-48 overflow-hidden">
        <HeroBackgroundImage config={heroImageConfig} />
        <HeroOverlay opacity={heroImageConfig.overlayOpacity} />
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-purple-900/40 z-0"></div>
        {/* Blurred Circles */}
        <div className="absolute top-0 right-0 z-1 h-[800px] w-[800px] -translate-y-1/2 translate-x-1/3 rounded-full bg-indigo-500/20 opacity-10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 z-1 h-[600px] w-[600px] -translate-x-1/4 translate-y-1/3 rounded-full bg-purple-500/20 opacity-10 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-indigo-300 text-sm font-bold uppercase tracking-wider">System Online & Ready</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mb-6">
            Enterprise Quality Print, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Delivered Faster.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 font-medium max-w-2xl mb-10">
            Multi Kreasi Printing provides premium corporate identity, marketing materials, and large format printing with a seamless digital ordering experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              to="/products"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] hover:bg-indigo-500 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Explore Catalog <ArrowRight size={20} />
            </Link>
            <Link 
              to="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-800 border border-slate-700 text-white font-bold text-lg hover:bg-slate-700 transition-colors flex items-center justify-center"
            >
              Contact Sales
            </Link>
          </div>

          <div className="border-t border-slate-800/50 pt-8 mt-16 flex items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base text-slate-400">
            <span className="font-semibold text-white">500+</span> Clients
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            <span className="font-semibold text-white">10M+</span> Prints
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700 hidden sm:block"></span>
            <div className="hidden sm:flex items-center gap-1 text-amber-400">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE SERVICES SECTION */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Everything your business needs</h2>
            <p className="text-lg text-slate-500">From business cards to massive outdoor banners, we deliver top-tier quality across all formats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Package size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Corporate Identity</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">Business cards, letterheads, envelopes, and premium folders designed to leave a lasting impression.</p>
              <Link to="/products" className="text-indigo-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                Explore category <ArrowRight size={16} />
              </Link>
            </div>
            <div className="group bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Printer size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Marketing Materials</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">High-volume flyers, brochures, product catalogs, and customized packaging boxes.</p>
              <Link to="/products" className="text-indigo-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                Explore category <ArrowRight size={16} />
              </Link>
            </div>
            <div className="group bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3">Large Format</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">Outdoor banners, roll-up banners, signages, and premium vehicle wraps with weather-resistant inks.</p>
              <Link to="/products" className="text-indigo-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                Explore category <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="bg-slate-50 py-24 border-y border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Seamless Ordering Process</h2>
            <p className="text-lg text-slate-500">We've eliminated the friction from commercial printing.</p>
          </div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-200 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-8 border-slate-50 flex items-center justify-center text-2xl font-black text-indigo-600 shadow-md mb-6">
                  01
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Upload & Configure</h3>
                <p className="text-slate-600">Select your material specs and upload your print-ready design directly from your browser.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-8 border-slate-50 flex items-center justify-center text-2xl font-black text-indigo-600 shadow-md mb-6">
                  02
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Proof & Approve</h3>
                <p className="text-slate-600">Our prepress team checks your files and sends an invoice. Pay securely online.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-8 border-slate-50 flex items-center justify-center text-2xl font-black text-indigo-600 shadow-md mb-6">
                  03
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Fast Delivery</h3>
                <p className="text-slate-600">Track your production status in real-time until it arrives at your office.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US SECTION */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Quality Guarantee</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Strict quality control on every single batch before it leaves our facility.</p>
            </div>
            <div className="p-6 group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Fast Turnaround</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Optimized production schedules for rush orders when you need it yesterday.</p>
            </div>
            <div className="p-6 group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <BadgePercent size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Competitive Pricing</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Transparent B2B pricing tiers. The more you print, the more you save.</p>
            </div>
            <div className="p-6 group hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Headphones size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Dedicated Support</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Direct access to our account managers for complex custom printing needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="bg-slate-50 py-24 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-12 text-center tracking-tight">Trusted by leading enterprises</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex gap-1 text-amber-400 mb-6">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
              </div>
              <p className="text-slate-600 italic mb-8">"MK Printing completely changed how we procure our marketing materials. The dashboard makes reordering so easy, and the print quality is always flawless."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">AS</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Andi Saputra</h4>
                  <p className="text-xs text-slate-500">Marketing Director, PT Nusantara</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex gap-1 text-amber-400 mb-6">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
              </div>
              <p className="text-slate-600 italic mb-8">"Their rush order capability saved our event last month. Delivered 5,000 high-quality brochures in under 48 hours. Phenomenal service."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">DW</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Dina Wijaya</h4>
                  <p className="text-xs text-slate-500">Event Manager, Kreatif Organizer</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex gap-1 text-amber-400 mb-6">
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
                <Star size={18} fill="currentColor" />
              </div>
              <p className="text-slate-600 italic mb-8">"Very transparent pricing and excellent dashboard. We've shifted all our corporate packaging needs to MK Printing exclusively."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">BS</div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Budi Santoso</h4>
                  <p className="text-xs text-slate-500">Operations Head, Logistik Cepat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[3rem] p-12 lg:p-20 shadow-2xl shadow-indigo-600/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to elevate your print quality?</h2>
            <p className="text-indigo-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">Create an account today to view our full catalog, configure specifications, and get instant pricing.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-md"
              >
                Create Free Account
              </Link>
              <Link 
                to="/contact"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
