import { Link } from 'react-router-dom';
import { Printer } from '@phosphor-icons/react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t py-12" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Printer size={24} weight="regular" style={{ color: 'var(--text-primary)' }} />
              <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>MK Printing</span>
            </div>
            <p className="text-sm">
              Solusi percetakan B2B enterprise premium untuk bisnis modern.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Perusahaan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="transition-colors duration-150 hover:text-[var(--text-primary)]">Tentang Kami</Link></li>
              <li><Link to="/contact" className="transition-colors duration-150 hover:text-[var(--text-primary)]">Kontak</Link></li>
              <li><Link to="/careers" className="transition-colors duration-150 hover:text-[var(--text-primary)]">Karir</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Layanan</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="transition-colors duration-150 hover:text-[var(--text-primary)]">Katalog Produk</Link></li>
              <li><Link to="/custom-order" className="transition-colors duration-150 hover:text-[var(--text-primary)]">Pesanan Kustom</Link></li>
              <li><Link to="/bulk" className="transition-colors duration-150 hover:text-[var(--text-primary)]">Cetak Partai Besar</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Legalitas</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="transition-colors duration-150 hover:text-[var(--text-primary)]">Syarat &amp; Ketentuan</Link></li>
              <li><Link to="/privacy" className="transition-colors duration-150 hover:text-[var(--text-primary)]">Kebijakan Privasi</Link></li>
              <li><Link to="/help" className="transition-colors duration-150 hover:text-[var(--text-primary)]">Bantuan &amp; Dukungan</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t pt-8 text-sm md:flex-row" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
          <p>&copy; {new Date().getFullYear()} PT Multi Kreasi Printing. Seluruh hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
};
