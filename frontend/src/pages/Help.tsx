import { EnvelopeSimple, Headphones, Phone, ShieldCheck } from '@phosphor-icons/react';

export const HelpPage = () => {
  const supportChannels = [
    {
      title: 'Customer support',
      description: 'Orders, delivery status, and production updates.',
      value: '+62 811-1234-567',
      icon: Phone,
    },
    {
      title: 'Email support',
      description: 'Questions about quotations, invoices, and custom projects.',
      value: 'support@multikreasiprinting.com',
      icon: EnvelopeSimple,
    },
    {
      title: 'Service coverage',
      description: 'Business hours Monday to Saturday, 08:00–18:00 WIB.',
      value: 'Jakarta & nationwide shipping',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8" style={{ color: 'var(--text-primary)' }}>
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--color-primary-600)' }}>Support</p>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Help & Support</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {supportChannels.map(({ title, description, value, icon: Icon }) => (
          <div
            key={title}
            className="rounded-lg border p-6 transition-all duration-150 ease-out hover:shadow-md"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}>
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
            <Headphones size={20} weight="regular" style={{ color: 'var(--color-primary-600)' }} />
            <h2 className="text-xl font-semibold">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>How do I request a custom quote?</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Send your design brief or product requirements via our custom order form and our sales team will reply within one business day.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Can I track my order?</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Yes. You can monitor production progress and shipping status from your dashboard or by contacting customer support.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Do you support bulk orders?</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>We handle corporate packaging, event merchandise, and recurring print runs with dedicated account support.</p>
            </div>
          </div>
        </section>

        <aside className="rounded-lg border p-6" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="mb-3 text-lg font-semibold">Need a faster response?</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>For urgent matters, include your order number and a brief description so our team can prioritize your request.</p>
          <a
            href="mailto:support@multikreasiprinting.com"
            className="mt-5 inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold transition-all duration-150"
            style={{ backgroundColor: 'var(--color-primary-600)', color: 'white' }}
          >
            Contact support
          </a>
        </aside>
      </div>
    </div>
  );
};
