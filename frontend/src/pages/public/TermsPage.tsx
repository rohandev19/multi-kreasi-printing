export const TermsPage = () => {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="rounded-lg border p-6 sm:p-8" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)', color: 'var(--text-secondary)' }}>
        <h1 className="mb-6 text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Syarat &amp; Ketentuan Layanan</h1>
        <div className="space-y-6 text-base leading-relaxed">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Terakhir diperbarui: 5 Agustus 2026</p>
        
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>1. Penerimaan Ketentuan</h2>
          <p>
            Dengan mengakses dan menggunakan platform serta layanan yang disediakan oleh PT Multi Kreasi Printing ("kami"), 
            Anda menyetujui untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, 
            mohon untuk tidak menggunakan layanan kami.
          </p>
        
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>2. Pemesanan dan Pembayaran</h2>
          <p>
            Seluruh pesanan bergantung pada konfirmasi spesifikasi dan ketersediaan kapasitas mesin produksi. 
            Pembayaran wajib diselesaikan penuh atau sesuai termin perjanjian resmi (misal: uang muka 50%) sebelum proses cetak dimulai. 
            Produk cetak kustom yang telah masuk lini produksi tidak dapat dibatalkan atau dikembalikan dananya.
          </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>3. Berkas Desain &amp; Persetujuan Cetak (Proofing)</h2>
          <p>
            Pelanggan bertanggung jawab penuh memastikan berkas desain yang diunggah memenuhi spesifikasi teknis cetak 
            (resolusi minimal 300 DPI, bleed potong, mode warna CMYK). Kami menyediakan digital proof untuk persetujuan akhir. 
            Setelah berkas disetujui (ACC), kami tidak bertanggung jawab atas kesalahan ejaan atau tata letak yang terdapat pada berkas tersebut.
          </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>4. Waktu Produksi &amp; Pengiriman</h2>
          <p>
            Estimasi jadwal selesai dan pengiriman merupakan perkiraan terbaik berdasarkan beban antrian workshop. Kami tidak bertanggung jawab 
            atas kendala keterlambatan yang murni disebabkan oleh pihak ekspedisi logistik atau keadaan kahar (force majeure).
          </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>5. Perlindungan Data Pribadi (UU PDP)</h2>
          <p>
            Kami mengumpulkan dan mengelola data bisnis serta informasi pribadi Anda sesuai dengan Kebijakan Privasi kami dan peraturan perundang-undangan 
            Republik Indonesia (UU No. 27/2022 tentang Perlindungan Data Pribadi). Kami tidak memperjualbelikan data Anda kepada pihak ketiga manapun.
          </p>
        </div>
      </div>
    </article>
  );
};
