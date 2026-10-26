import React from 'react';
import { Link } from 'react-router-dom';
import { Printer, MapPin, Phone, EnvelopeSimple, ShieldCheck } from '@phosphor-icons/react';

export const Footer: React.FC = () => {
  return (
    <footer 
      className="mt-auto border-t border-slate-200 bg-slate-50 pt-14 pb-10 text-slate-600"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1: Corporate Entity & Address (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-2xs">
                <Printer size={20} weight="bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-slate-950 leading-tight">
                  PT MULTI KREASI PRINTING
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase -mt-0.5">
                  COMMERCIAL OFFSET &amp; PACKAGING
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 max-w-sm">
              Mitra percetakan komersial dan kemasan terintegrasi untuk kebutuhan korporasi, instansi, dan UMKM. Didukung armada mesin berstandar ISO 12647-2 dan fasilitas perpajakan e-Faktur PPN 11%.
            </p>

            <div className="space-y-2 text-xs text-slate-700 pt-1">
              <div className="flex items-start gap-2">
                <MapPin size={15} weight="bold" className="text-slate-500 mt-0.5 shrink-0" />
                <span>Kawasan Industri &amp; Workshop Cetak, Jakarta Barat, DKI Jakarta</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={15} weight="bold" className="text-slate-500 shrink-0" />
                <span className="font-mono font-medium">(021) 555-8899 / +62 812-9988-7766</span>
              </div>
              <div className="flex items-center gap-2">
                <EnvelopeSimple size={15} weight="bold" className="text-slate-500 shrink-0" />
                <span className="font-mono font-medium">procurement@multikreasiprinting.com</span>
              </div>
            </div>
          </div>

          {/* Col 2: Layanan & Produk */}
          <div>
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-slate-900">
              Layanan Produksi
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/products?category=marketing" className="hover:text-slate-950 transition-colors">
                  Brosur &amp; Flyer Komersial
                </Link>
              </li>
              <li>
                <Link to="/products?category=packaging" className="hover:text-slate-950 transition-colors">
                  Packaging &amp; Hardbox Custom
                </Link>
              </li>
              <li>
                <Link to="/products?category=large-format" className="hover:text-slate-950 transition-colors">
                  Banner Outdoor &amp; Spanduk
                </Link>
              </li>
              <li>
                <Link to="/products?category=corporate" className="hover:text-slate-950 transition-colors">
                  Stationery &amp; Kartu Nama
                </Link>
              </li>
              <li>
                <Link to="/bulk" className="hover:text-slate-950 transition-colors">
                  Cetak Partai Besar (Grosir)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal & Alur Kerja B2B */}
          <div>
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-slate-900">
              Pengadaan &amp; B2B
            </h3>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link to="/custom-order" className="hover:text-slate-950 transition-colors">
                  Pengajuan Penawaran (RFQ)
                </Link>
              </li>
              <li>
                <Link to="/#estimator" className="hover:text-slate-950 transition-colors">
                  Kalkulator Job Ticket
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-orders" className="hover:text-slate-950 transition-colors">
                  Pelacakan Status Pesanan
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-slate-950 transition-colors">
                  Kapasitas Armada Mesin
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-slate-950 transition-colors">
                  Konsultasi Teknis Pra-Cetak
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Standar & Kepatuhan */}
          <div>
            <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-slate-900">
              Kepatuhan &amp; Mutu
            </h3>
            <div className="space-y-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs mb-1">
                  <ShieldCheck size={16} weight="bold" className="text-emerald-600" />
                  <span>Jaminan Standar Warna</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Sertifikasi FOGRA 39 &amp; ISO 12647-2 dengan densitas spektrofotometer terkalibrasi.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                <span className="block font-bold text-slate-900 text-xs mb-1">
                  Administrasi e-Faktur
                </span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Faktur komersial resmi &amp; e-Faktur PPN 11% terbit bersamaan dengan Surat Jalan fisik.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row gap-4">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} PT Multi Kreasi Printing. Seluruh hak cipta dilindungi. Terdaftar resmi di Kementerian Hukum dan HAM RI.
          </p>

          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to="/terms" className="hover:text-slate-900 transition-colors">
              Syarat &amp; Ketentuan
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-slate-900 transition-colors">
              Kebijakan Privasi
            </Link>
            <span>•</span>
            <Link to="/help" className="hover:text-slate-900 transition-colors">
              Pusat Bantuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
