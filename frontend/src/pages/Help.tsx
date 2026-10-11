import { EnvelopeSimple, Headphones, Phone, ShieldCheck } from '@phosphor-icons/react';

export const HelpPage = () => {
  const supportChannels = [
    {
      title: 'Customer Support',
      description: 'Informasi pesanan, status pengiriman, dan update antrian produksi.',
      value: '+62 811-1234-567',
      icon: Phone,
    },
    {
      title: 'Dukungan Email',
      description: 'Pertanyaan seputar penawaran harga, faktur tagihan, dan proyek cetak kustom.',
      value: 'support@multikreasiprinting.com',
      icon: EnvelopeSimple,
    },
    {
      title: 'Jam Layanan Operasional',
      description: 'Senin sampai Sabtu, pukul 08:00–18:00 WIB.',
      value: 'Workshop Jakarta & Kirim Seluruh Indonesia',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8" style={{ color: 'var(--text-primary)' }}>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.12em]" style={{ color: '#000000' }}>Bantuan</p>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Bantuan &amp; Dukungan Pelanggan</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {supportChannels.map(({ title, description, value, icon: Icon }) => (
          <div
            key={title}
            className="rounded-lg border p-6 transition-colors duration-150 ease-out hover:bg-[var(--color-neutral-50)]"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-neutral-100)', color: '#000000' }}>
              <Icon size={22} weight="regular" />
            </div>
            <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <p className="mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-lg border p-6" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="mb-4 flex items-center gap-3">
            <Headphones size={20} weight="regular" style={{ color: '#000000' }} />
            <h2 className="text-xl font-semibold">Pertanyaan yang Sering Diajukan</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Bagaimana cara mengajukan penawaran harga kustom?</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Kirimkan rincian spesifikasi cetak melalui form pesanan kustom kami, dan tim sales akan mengirimkan penawaran resmi dalam 1 hari kerja.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Bisakah saya memantau status pesanan saya?</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Bisa. Anda dapat memantau progres antrian produksi hingga resi pengiriman langsung melalui dashboard pesanan saya atau menghubungi tim support kami.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Apakah melayani pemesanan partai besar korporat?</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Kami melayani pembuatan packaging korporat, merchandise acara, dan cetakan rutin berkala dengan dedicated account manager.</p>
            </div>
          </div>
        </section>

        <aside className="rounded-lg border p-6" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="mb-3 text-lg font-semibold">Butuh respons lebih cepat?</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Untuk keperluan mendesak, sertakan nomor referensi pesanan dan deskripsi singkat agar tim kami dapat memprioritaskan penanganan Anda.</p>
          <a
            href="mailto:support@multikreasiprinting.com"
            className="mt-5 inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold transition-all duration-150 hover:bg-slate-800"
            style={{ backgroundColor: '#000000', color: '#ffffff' }}
          >
            Hubungi Tim Support
          </a>
        </aside>
      </div>
    </div>
  );
};
