import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  MagnifyingGlass,
  FileText,
  UploadSimple,
  ShieldCheck,
  Clock,
  Printer,
  Package,
  Stack,
  CheckCircle,
  Truck,
  Buildings,
  PhoneCall,
  CaretRight,
} from '@phosphor-icons/react';
import { JobTicketEstimator } from '../../components/home/JobTicketEstimator';
import { ColorBar } from '../../components/home/PrintMarks';
import { CompactHeroBanner } from '../../components/home/CompactHeroBanner';

interface SpecRow {
  category: string;
  name: string;
  materials: string;
  finishing: string;
  turnaround: string;
  link: string;
}

const industrialSpecs: SpecRow[] = [
  {
    category: 'Materi Pemasaran',
    name: 'Brosur & Flyer Lipat',
    materials: 'Art Paper 120g / 150g, Matte Paper',
    finishing: 'Laminasi Doff/Glossy, Lipat 2/3 Panel',
    turnaround: '2 - 3 Hari Kerja',
    link: '/products?search=Brosur',
  },
  {
    category: 'Identitas Bisnis',
    name: 'Kartu Nama & Company Kit',
    materials: 'Art Carton 260g / 310g, Fancy Paper',
    finishing: 'Spot UV, Poly Foil Emas/Perak, Sudut Oval',
    turnaround: '1 - 2 Hari Kerja',
    link: '/products?search=Kartu',
  },
  {
    category: 'Packaging & Box',
    name: 'Custom Box Kemasan & Hardbox',
    materials: 'Duplex 350g, Ivory 300g, Corrugated E-Flute',
    finishing: 'Pond Die-Cut, Lem Kunci, Emboss Timbul',
    turnaround: '4 - 7 Hari Kerja',
    link: '/products?search=Kemasan',
  },
  {
    category: 'Format Besar (Outdoor)',
    name: 'Banner & Spanduk High-Res',
    materials: 'Flexi Frontlite Korea 440g, Albatros, Luster',
    finishing: 'Mata Ayam (Eyelets), Selongsong, Laminasi Dingin',
    turnaround: '1 Hari Kerja',
    link: '/products?search=Banner',
  },
  {
    category: 'Buku & Majalah',
    name: 'Katalog Produk & Annual Report',
    materials: 'Cover Art Carton 260g + Isi HVS/AP 100g',
    finishing: 'Jilid Perfect Binding (Lem Panas), Steples Jahit Kawat',
    turnaround: '3 - 5 Hari Kerja',
    link: '/products?search=Katalog',
  },
];

const b2bWorkflows = [
  {
    step: '01',
    title: 'Surat Penawaran Resmi (RFQ)',
    desc: 'Hitung spesifikasi dan ajukan draf quotation resmi berformat PDF untuk kelengkapan administrasi pengadaan korporat.',
    icon: FileText,
    action: { label: 'Ajukan RFQ', to: '/custom-order' },
  },
  {
    step: '02',
    title: 'Pre-Press & Pemeriksaan Berkas',
    desc: 'Validasi otomatis berkas desain hingga 100MB (PDF, AI, TIFF). Verifikasi resolusi 300 DPI, ruang warna CMYK, dan bleed area.',
    icon: UploadSimple,
    action: { label: 'Format Berkas', to: '/help' },
  },
  {
    step: '03',
    title: 'Produksi Presisi & Quality Control',
    desc: 'Pekerjaan dialirkan ke mesin digital offset atau format besar dengan kalibrasi warna presisi dan pemeriksaan fisik berlapis.',
    icon: Printer,
    action: { label: 'Katalog Mesin', to: '/about' },
  },
  {
    step: '04',
    title: 'Pengiriman & Faktur Resmi',
    desc: 'Pengepakan standar industri dengan Surat Jalan resmi, resi ekspedisi, serta faktur komersial dan PPN 11% yang terintegrasi.',
    icon: Truck,
    action: { label: 'Layanan Kirim', to: '/contact' },
  },
];

export const HomePage: React.FC = () => {
  const [orderQuery, setOrderQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const scrollToTarget = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      // Try immediate and short delay to handle fast and lazy DOM elements
      scrollToTarget();
      const timer = setTimeout(scrollToTarget, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash, location.pathname]);

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    // Direct user to orders tracking in customer dashboard
    navigate(`/dashboard/my-orders?search=${encodeURIComponent(orderQuery.trim())}`);
  };

  return (
    <div className="w-full" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      {/* Compact Commercial Banner under Navbar */}
      <CompactHeroBanner />

      {/* =========================================================================
          SECTION 1: HERO - B2B INDUSTRIAL MASTHEAD + LIVE JOB TICKET ESTIMATOR
          ========================================================================= */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white pt-8 pb-16 lg:pt-12 lg:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Industrial Positioning & Quick Actions (7 Cols) */}
            <div className="space-y-6 lg:col-span-7">
              {/* Technical Spec Meta Label */}
              <div className="inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>PT MULTI KREASI PRINTING</span>
                <span className="text-slate-300">|</span>
                <span>COMMERCIAL PRINTING PLATFORM</span>
              </div>

              {/* Main Headline with fluid Plus Jakarta Sans */}
              <h1 
                className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.15]"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif' }}
              >
                Solusi Percetakan Komersial &amp; Pengadaan B2B Skala Industri.
              </h1>

              {/* Precise Subtitle */}
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Dari materi pemasaran korporat hingga box kemasan kustom. Dapatkan kalkulasi harga volume grosir,
                surat penawaran resmi, validasi berkas pra-cetak 300 DPI, dan pelacakan pengerjaan real-time.
              </p>

              {/* Order Tracking Bar */}
              <div className="max-w-xl rounded-lg border border-slate-200 bg-slate-50 p-2.5 shadow-sm">
                <form onSubmit={handleTrackOrder} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <MagnifyingGlass
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Lacak Pesanan (contoh: ORD-2026-1042)..."
                      value={orderQuery}
                      onChange={(e) => setOrderQuery(e.target.value)}
                      className="w-full rounded border border-slate-200 bg-white py-2 pl-9 pr-3 font-mono text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded bg-black px-4 py-2 text-xs sm:text-sm font-bold text-white transition-all hover:bg-neutral-800"
                  >
                    <span>Cek Status</span>
                    <ArrowRight size={15} weight="bold" />
                  </button>
                </form>
              </div>

              {/* Primary Buttons & Trust Metrics */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded bg-black px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-neutral-800 hover:scale-[1.01]"
                >
                  <Package size={18} weight="bold" />
                  <span>Jelajahi Katalog Lengkap</span>
                </Link>

                <Link
                  to="/custom-order"
                  className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition-all hover:bg-slate-50 hover:border-slate-400"
                >
                  <FileText size={18} weight="bold" />
                  <span>Minta Penawaran (RFQ)</span>
                </Link>
              </div>

              {/* Assurances Micro-grid */}
              <div className="grid grid-cols-2 gap-3 pt-4 sm:grid-cols-4 font-mono text-xs text-slate-600 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} weight="bold" className="text-black shrink-0" />
                  <span>Pre-Press 300 DPI</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} weight="bold" className="text-black shrink-0" />
                  <span>Turnaround 1-3 Hari</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stack size={18} weight="bold" className="text-black shrink-0" />
                  <span>Tier Harga Pabrik</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={18} weight="bold" className="text-black shrink-0" />
                  <span>PPN 11% &amp; Invoice Resmi</span>
                </div>
              </div>
            </div>

            {/* Right Column: 2D Super Advanced Commercial Press Machine (5 Cols) */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
              <div className="relative w-full rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/70 to-white p-6 shadow-sm overflow-hidden group">
                {/* Technical Header Pill */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="font-bold text-slate-800 tracking-tight">DIGITAL PRESS HYPERION X1</span>
                  </div>
                  <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white tracking-widest uppercase">
                    2D Commercial Engine
                  </span>
                </div>

                {/* 2D Printer Image (Without Background, Clean Isolated Cut) */}
                <div className="relative my-3 flex items-center justify-center py-2">
                  <img
                    src="/modern-digital-press.jpg"
                    alt="Mesin Cetak Komersial Digital 2D"
                    className="w-full max-h-[310px] object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>

                {/* Technical Features Tag Bar */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 font-mono text-[10px] text-center">
                  <div className="rounded bg-slate-100/80 p-2">
                    <span className="block text-slate-400 font-medium">SPEED</span>
                    <span className="font-bold text-slate-800">18.000 IMP/H</span>
                  </div>
                  <div className="rounded bg-slate-100/80 p-2">
                    <span className="block text-slate-400 font-medium">GAMUT</span>
                    <span className="font-bold text-cyan-600">CMYK + O/W</span>
                  </div>
                  <div className="rounded bg-slate-100/80 p-2">
                    <span className="block text-slate-400 font-medium">ACCURACY</span>
                    <span className="font-bold text-slate-800">2400 DPI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CMYK Process Color Bar Divider */}
      <ColorBar />

      {/* =========================================================================
          SECTION 2: B2B OPERATIONAL WORKFLOW (GATEWAYS)
          ========================================================================= */}
      <section id="workflow" className="border-b border-slate-200 bg-slate-50/70 py-16 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="max-w-2xl">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
                B2B WORKFLOW STANDARD
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Standar Pengerjaan Cetak Tanpa Hambatan
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Alur kerja terstruktur yang dirancang untuk efisiensi tim purchasing, desainer grafis, dan divisi operasional korporat.
              </p>
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-black hover:underline shrink-0"
            >
              <span>Pelajari Kapasitas Mesin</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {b2bWorkflows.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-400 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-900">
                        <Icon size={20} weight="bold" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400">
                        STAGE {step.step}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      to={step.action.to}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-slate-700 transition-colors"
                    >
                      <span>{step.action.label}</span>
                      <CaretRight size={14} weight="bold" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: KALKULATOR & SIMULASI JOB TICKET B2B
          ========================================================================= */}
      <section id="estimator" className="border-b border-slate-200 bg-white py-16 sm:py-20 scroll-mt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Context & Guidance */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs font-semibold text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                <span>INTERACTIVE JOB TICKET V2.4</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Kalkulasi Estimasi Biaya Cetak Grosir Seketika.
              </h2>
              
              <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                Gunakan simulator Job Ticket interaktif ini untuk menghitung proyeksi biaya cetak volume grosir secara instan berbasis tier harga pabrik dan PPN 11%.
              </p>

              <div className="space-y-3 pt-2 font-mono text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-black">✓</span>
                  <span>Perhitungan otomatis diskon volume kuantitas</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-black">✓</span>
                  <span>Transparansi rincian PPN 11% &amp; e-Faktur resmi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-black">✓</span>
                  <span>Langsung dapat diajukan menjadi Pesanan atau RFQ</span>
                </div>
              </div>
            </div>

            {/* Right: The Interactive Estimator Form */}
            <div className="lg:col-span-7">
              <JobTicketEstimator />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: SPECIFICATION MATRIX & POPULAR INDUSTRIAL CAPABILITIES
          ========================================================================= */}
      <section id="specs" className="bg-white py-16 border-b border-slate-200 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">
              PRODUCTION SPECIFICATIONS
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Matriks Spesifikasi &amp; Lini Produk Utama
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Standar material, finishing, dan estimasi waktu produksi untuk kategori cetak paling sering dipesan.
            </p>
          </div>

          {/* Desktop Table View / Mobile Card Stack */}
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-mono uppercase text-slate-600">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-bold">Kategori &amp; Produk</th>
                    <th scope="col" className="px-5 py-3.5 font-bold">Pilihan Material / Kertas</th>
                    <th scope="col" className="px-5 py-3.5 font-bold">Opsi Finishing Teknis</th>
                    <th scope="col" className="px-5 py-3.5 font-bold">Estimasi Selesai</th>
                    <th scope="col" className="px-5 py-3.5 text-right font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {industrialSpecs.map((spec) => (
                    <tr key={spec.name} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{spec.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{spec.category}</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">{spec.materials}</td>
                      <td className="px-5 py-4 text-slate-600">{spec.finishing}</td>
                      <td className="px-5 py-4 font-mono font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px]">
                          <Clock size={12} weight="bold" />
                          {spec.turnaround}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={spec.link}
                          className="inline-flex items-center gap-1 rounded border border-slate-200 px-2.5 py-1 text-xs font-bold text-black hover:bg-slate-100 transition-colors"
                        >
                          <span>Pilih</span>
                          <CaretRight size={12} weight="bold" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
              <span className="font-mono">
                *Membutuhkan spesifikasi gramatur, pisau pond, atau finishing khusus yang belum tertera?
              </span>
              <Link
                to="/custom-order"
                className="inline-flex items-center gap-1.5 font-bold text-black hover:underline shrink-0"
              >
                <span>Konsultasikan Proyek Kustom Anda</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: REAL PRODUCTION WORKSHOP & ENTERPRISE ADVANTAGE
          ========================================================================= */}
      <section id="workshop" className="bg-slate-950 text-white py-16 sm:py-20 border-t border-slate-800 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left: Capability description */}
            <div className="space-y-6 lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>WORKSHOP &amp; PRODUCTION ARMADA</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
                Kapasitas Produksi Skala Komersial &amp; Akurasi Warna Standar Pabrik.
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-slate-300">
                Workshop Multi Kreasi Printing memadukan armada cetak offset berkecepatan tinggi untuk volume masif,
                digital production press untuk kebutuhan cepat tanpa minimum order, serta unit finishing presisi otomatis.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="bold" className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Konsistensi Warna CMYK Terkalibrasi</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Pemeriksaan densitas warna berkala memastikan cetakan batch pertama dan batch ulang memiliki saturasi identik.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="bold" className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Finishing In-House Terintegrasi</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Laminasi roll termal, mesin pond otomatis, potong program komputer, dan binding jilid dikerjakan satu atap.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="bold" className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Arsip Aset &amp; Riwayat Cetak Aman</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Berkas siap cetak Anda tersimpan aman di Cloudflare R2 untuk kemudahan reorder kapan saja tanpa perlu kirim ulang.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  to="/bulk"
                  className="rounded bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100 shadow-sm"
                >
                  Informasi Cetak Partai Besar
                </Link>
                <Link
                  to="/contact"
                  className="rounded border border-slate-700 bg-slate-900/60 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                  Jadwalkan Kunjungan Workshop
                </Link>
              </div>
            </div>

            {/* Right: Authentic Factory Image Split Grid */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950 aspect-[4/5] group">
                <img
                  src="/BannerPabrik.jpg"
                  alt="Armada Mesin Percetakan Industri"
                  className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">
                    PRODUCTION FLOOR
                  </span>
                  <span className="text-sm font-bold text-white">
                    Offset &amp; Digital Production Press
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-950 aspect-[4/3] group">
                  <img
                    src="/BannerKemasan.jpg"
                    alt="Packaging & Box Kemasan Custom"
                    className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">
                      PACKAGING LINE
                    </span>
                    <span className="text-xs font-bold text-white">
                      Custom Box, Foil &amp; Die-Cut
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-5 font-mono text-xs space-y-2">
                  <div className="text-slate-200 font-bold flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-300">STATUS FASILITAS</span>
                    <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      OPERASIONAL
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">
                    Shift pengerjaan aktif melayani pesanan reguler, ekspres, dan tender korporat harian.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: CORPORATE ACCOUNT CALLOUT & ASSISTANCE
          ========================================================================= */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 sm:p-12 lg:flex lg:items-center lg:justify-between shadow-sm">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase text-slate-500 mb-2">
                <Buildings size={16} weight="bold" />
                <span>KEMITRAAN PENGADAAN PERUSAHAAN (B2B)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Punya Kebutuhan Cetak Rutin atau Anggaran Kantor Tahunan?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Daftarkan perusahaan Anda untuk mendapatkan harga kontrak khusus, fasilitas penagihan termin (Term of Payment),
                alokasi account manager khusus, dan pengiriman terjadwal ke berbagai cabang.
              </p>
            </div>

            <div className="mt-8 flex shrink-0 flex-col gap-3 sm:flex-row lg:mt-0">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded bg-black px-6 py-3 text-sm font-bold text-white transition-all hover:bg-neutral-800 shadow-sm"
              >
                <span>Buka Akun Perusahaan</span>
                <ArrowRight size={16} weight="bold" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition-all hover:bg-slate-100"
              >
                <PhoneCall size={16} weight="bold" />
                <span>Hubungi Tim Sales</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
