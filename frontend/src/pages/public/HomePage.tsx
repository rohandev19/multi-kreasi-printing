import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  MagnifyingGlass,
  FileText,
  UploadSimple,
  Clock,
  Printer,
  Package,
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
    step: '1',
    deliverable: 'Draf Penawaran PDF Resmi',
    title: 'Surat Penawaran Resmi (RFQ)',
    desc: 'Hitung spesifikasi dan ajukan draf penawaran resmi berformat PDF untuk kelengkapan administrasi pengadaan korporat.',
    icon: FileText,
    action: { label: 'Ajukan RFQ', to: '/custom-order' },
  },
  {
    step: '2',
    deliverable: 'Laporan Pra-Cetak 300 DPI',
    title: 'Pre-Press & Pemeriksaan Berkas',
    desc: 'Validasi otomatis berkas desain hingga 100MB (PDF, AI, TIFF). Verifikasi resolusi 300 DPI, ruang warna CMYK, dan bleed area.',
    icon: UploadSimple,
    action: { label: 'Format Berkas', to: '/help' },
  },
  {
    step: '3',
    deliverable: 'QC Densitas Warna & Proofing',
    title: 'Produksi Presisi & Kontrol Mutu',
    desc: 'Pekerjaan dialirkan ke mesin digital offset atau format besar dengan kalibrasi warna presisi dan pemeriksaan fisik berkala.',
    icon: Printer,
    action: { label: 'Katalog Mesin', to: '/about' },
  },
  {
    step: '4',
    deliverable: 'Surat Jalan & Faktur Pajak 11%',
    title: 'Pengiriman & Faktur Resmi',
    desc: 'Pengepakan standar industri dengan Surat Jalan resmi, resi ekspedisi, serta faktur komersial dan e-Faktur PPN 11% terintegrasi.',
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
      scrollToTarget();
      const timer = setTimeout(scrollToTarget, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash, location.pathname]);

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
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
              {/* Main Headline with fluid typography */}
              <h1 
                className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.15]"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif' }}
              >
                Solusi Percetakan Komersial &amp; Pengadaan B2B Skala Industri.
              </h1>

              {/* Precise Subtitle */}
              <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Dari materi pemasaran korporat hingga box kemasan kustom. Dapatkan kalkulasi harga volume grosir,
                surat penawaran resmi (RFQ), validasi berkas pra-cetak 300 DPI, dan pelacakan pengerjaan real-time.
              </p>

              {/* Order Tracking Bar */}
              <div className="max-w-xl rounded-xl border border-slate-200 bg-slate-50 p-2.5 shadow-xs">
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
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 font-mono text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition-[background-color,transform] duration-150 hover:bg-slate-800 active:scale-[0.98]"
                  >
                    <span>Cek Status</span>
                    <ArrowRight size={15} weight="bold" />
                  </button>
                </form>
              </div>

              {/* Primary Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xs transition-[background-color,transform] duration-150 hover:bg-slate-800 active:scale-[0.98]"
                >
                  <Package size={18} weight="bold" />
                  <span>Jelajahi Katalog Lengkap</span>
                </Link>

                <Link
                  to="/custom-order"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-xs transition-[background-color,border-color,transform] duration-150 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98]"
                >
                  <FileText size={18} weight="bold" />
                  <span>Minta Penawaran (RFQ)</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Authentic Industrial Print Quality & Production Standards (5 Cols) */}
            <div className="lg:col-span-5 relative flex flex-col justify-center">
              <div className="relative w-full rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
                {/* Specification Sheet Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Standar Mutu Produksi Cetak
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Spesifikasi teknis &amp; toleransi pengerjaan workshop
                    </p>
                  </div>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    ISO 12647-2
                  </span>
                </div>

                {/* Production Press Visual */}
                <div className="relative my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-[16/10]">
                  <img
                    src="/BannerPabrik.jpg"
                    alt="Armada Mesin Cetak Offset & Digital Industri Multi Kreasi"
                    className="h-full w-full object-cover object-center"
                  />
                  <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-slate-950/80 px-3 py-1.5 text-[11px] text-white flex items-center justify-between">
                    <span className="font-medium">Armada Cetak Offset &amp; Digital</span>
                    <span className="text-slate-300">Format s/d Plano</span>
                  </div>
                </div>

                {/* Technical Quality Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-tight">Standar Warna</span>
                    <span className="text-xs font-bold text-slate-900">FOGRA 39</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-tight">Toleransi Potong</span>
                    <span className="text-xs font-bold text-slate-900">±0.5 mm</span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="block text-[10px] font-medium text-slate-500 uppercase tracking-tight">Resolusi File</span>
                    <span className="text-xs font-bold text-slate-900">300 DPI</span>
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
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Standar Pengerjaan Cetak Tanpa Hambatan
              </h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Alur kerja terstruktur yang dirancang untuk efisiensi tim purchasing, desainer grafis, dan divisi operasional korporat.
              </p>
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-700 transition-colors shrink-0"
            >
              <span>Lihat Kapasitas &amp; Armada Mesin</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {b2bWorkflows.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between transition-[border-color,box-shadow] duration-150 hover:border-slate-300 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
                        <Icon size={18} weight="bold" />
                      </div>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white tabular-nums">
                        {step.step}
                      </span>
                    </div>
                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 mb-2">
                      {step.deliverable}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100">
                    <Link
                      to={step.action.to}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-slate-700 transition-colors"
                    >
                      <span>{step.action.label}</span>
                      <CaretRight size={13} weight="bold" />
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
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Kalkulasi Estimasi Biaya Cetak Grosir Seketika.
              </h2>
              
              <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                Gunakan simulator Job Ticket interaktif ini untuk menghitung proyeksi biaya cetak volume grosir secara instan berbasis tier harga pabrik dan PPN 11%.
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={18} weight="bold" className="text-emerald-600 shrink-0" />
                  <span>Perhitungan otomatis diskon volume kuantitas bertingkat</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={18} weight="bold" className="text-emerald-600 shrink-0" />
                  <span>Transparansi rincian PPN 11% &amp; e-Faktur resmi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={18} weight="bold" className="text-emerald-600 shrink-0" />
                  <span>Langsung dapat diajukan menjadi Pesanan atau RFQ resmi</span>
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
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Matriks Spesifikasi &amp; Lini Produk Utama
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Standar material, finishing, dan estimasi waktu produksi untuk kategori cetak paling sering dipesan.
            </p>
          </div>

          {/* Desktop Table View / Mobile Card Stack */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 uppercase text-slate-600">
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
                        <div className="text-[11px] text-slate-500">{spec.category}</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">{spec.materials}</td>
                      <td className="px-5 py-4 text-slate-600">{spec.finishing}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900 tabular-nums">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px]">
                          <Clock size={12} weight="bold" />
                          {spec.turnaround}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={spec.link}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
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
              <span>
                *Membutuhkan spesifikasi gramatur, pisau pond, atau finishing khusus yang belum tertera?
              </span>
              <Link
                to="/custom-order"
                className="inline-flex items-center gap-1.5 font-bold text-slate-900 hover:underline shrink-0"
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
      <section id="workshop" className="border-b border-slate-200 bg-slate-50/70 py-16 sm:py-20 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left: Capability description */}
            <div className="space-y-6 lg:col-span-6">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl leading-tight">
                Kapasitas Produksi Skala Komersial &amp; Akurasi Warna Standar Pabrik.
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                Workshop Multi Kreasi Printing memadukan armada cetak offset berkecepatan tinggi untuk volume masif,
                digital production press untuk kebutuhan cepat tanpa minimum order, serta unit finishing presisi otomatis.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="bold" className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Konsistensi Warna CMYK Terkalibrasi</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Pemeriksaan densitas warna berkala memastikan cetakan batch pertama dan batch ulang memiliki saturasi identik.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="bold" className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Finishing In-House Terintegrasi</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Laminasi roll termal, mesin pond otomatis, potong program komputer, dan binding jilid dikerjakan satu atap.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle size={20} weight="bold" className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Arsip Aset &amp; Riwayat Cetak Aman</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Berkas siap cetak Anda tersimpan aman di Cloudflare R2 untuk kemudahan reorder kapan saja tanpa perlu kirim ulang.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Link
                  to="/bulk"
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-[background-color,transform] duration-150 hover:bg-slate-800 active:scale-[0.98]"
                >
                  Informasi Cetak Partai Besar
                </Link>
                <Link
                  to="/contact"
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 shadow-xs transition-[background-color,border-color,transform] duration-150 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98]"
                >
                  Jadwalkan Kunjungan Workshop
                </Link>
              </div>
            </div>

            {/* Right: Authentic Factory Image Split Grid */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white aspect-[4/5] shadow-xs group">
                <img
                  src="/BannerPabrik.jpg"
                  alt="Armada Mesin Percetakan Industri Multi Kreasi"
                  className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider block">
                    Area Workshop
                  </span>
                  <span className="text-sm font-bold text-white">
                    Offset &amp; Digital Production Press
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white aspect-[4/3] shadow-xs group">
                  <img
                    src="/BannerKemasan.jpg"
                    alt="Packaging & Box Kemasan Custom Multi Kreasi"
                    className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider block">
                      Lini Kemasan
                    </span>
                    <span className="text-xs font-bold text-white">
                      Custom Box, Foil &amp; Die-Cut
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 text-xs space-y-2 shadow-xs">
                  <div className="text-slate-900 font-bold flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-slate-600 font-medium">Jadwal Operasional Workshop</span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      Senin – Sabtu
                    </span>
                  </div>
                  <div className="text-slate-600 text-xs leading-relaxed">
                    Shift pengerjaan aktif melayani cetak volume besar, pesanan berkala, serta pengadaan ekspres korporat.
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
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-12 lg:flex lg:items-center lg:justify-between shadow-xs">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                <Buildings size={16} weight="bold" className="text-slate-900" />
                <span>Kemitraan Pengadaan Perusahaan (B2B)</span>
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
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-xs transition-[background-color,transform] duration-150 hover:bg-slate-800 active:scale-[0.98]"
              >
                <span>Buka Akun Perusahaan</span>
                <ArrowRight size={16} weight="bold" />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-xs transition-[background-color,border-color,transform] duration-150 hover:bg-slate-100 active:scale-[0.98]"
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
