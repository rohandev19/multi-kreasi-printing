export const PrivacyPolicyPage = () => {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="rounded-lg border p-6 sm:p-8" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)', color: 'var(--text-secondary)' }}>
        <h1 className="mb-6 text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Kebijakan Privasi</h1>
        <div className="space-y-6 text-base leading-relaxed">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Tanggal berlaku: 17 Oktober 2024</p>
        
        <p>
          Di PT Multi Kreasi Printing ("kami"), kami menghargai privasi Anda dan berkomitmen penuh untuk melindungi data pribadi Anda. 
          Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, memproses, dan menjaga kerahasiaan data pribadi Anda 
          sesuai dengan <strong>Undang-Undang Pelindungan Data Pribadi (UU PDP) No. 27 Tahun 2022</strong> Republik Indonesia.
        </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>1. Data yang Kami Kumpulkan</h2>
          <p>
            Kami mengumpulkan informasi pribadi yang Anda berikan secara langsung saat mendaftar akun, melakukan transaksi pemesanan, atau menghubungi layanan pelanggan kami. Data tersebut meliputi:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Data Identitas:</strong> Nama lengkap, NPWP (untuk keperluan penerbitan faktur pajak/invoice resmi).</li>
            <li><strong>Data Kontak:</strong> Alamat email, nomor telepon/WhatsApp, dan alamat fisik tujuan pengiriman.</li>
            <li><strong>Data Transaksi:</strong> Rincian pesanan produk, riwayat pembayaran, dan bukti transfer.</li>
          </ul>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>2. Tujuan Pemrosesan Data</h2>
          <p>Data pribadi Anda diproses secara ketat hanya untuk tujuan-tujuan berikut:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Memproses dan menyelesaikan pesanan cetak, penagihan, dan pengiriman barang Anda.</li>
            <li>Berkomunikasi dengan Anda mengenai status pesanan, verifikasi bukti bayar, atau layanan pelanggan.</li>
            <li>Mematuhi kewajiban hukum yang berlaku di Indonesia (seperti pelaporan perpajakan negara).</li>
          </ul>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>3. Retensi &amp; Penyimpanan Data</h2>
          <p>
            Kami hanya akan menyimpan data pribadi Anda selama diperlukan untuk memenuhi tujuan awal pengumpulannya, 
            termasuk untuk memenuhi persyaratan hukum, akuntansi, dan pelaporan audit yang diwajibkan oleh regulator.
          </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>4. Hak Anda Berdasarkan UU PDP</h2>
          <p>Berdasarkan UU Pelindungan Data Pribadi (UU PDP), Anda berhak untuk:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Meminta akses dan salinan data pribadi yang kami simpan.</li>
            <li>Meminta perbaikan data yang tidak lengkap atau tidak akurat.</li>
            <li>Meminta penghapusan atau pemusnahan data pribadi saat sudah tidak lagi relevan atau diperlukan.</li>
            <li>Menarik kembali persetujuan pemrosesan data sewaktu-waktu.</li>
          </ul>
          <p className="mt-4">
            Untuk menggunakan hak-hak ini, Anda dapat menghubungi Petugas Perlindungan Data kami melalui email di privacy@multikreasiprinting.com.
          </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>5. Keamanan Sistem</h2>
          <p>
            Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang ketat untuk mencegah kehilangan data tanpa sengaja, 
            akses tidak sah, pengubahan, atau pengungkapan data pribadi Anda. Akses data dibatasi secara ketat hanya untuk staf yang memiliki kepentingan operasional langsung.
          </p>
        </div>
      </div>
    </article>
  );
};
