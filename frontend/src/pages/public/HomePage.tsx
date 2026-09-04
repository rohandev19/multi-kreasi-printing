import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, Package, Printer, ShieldCheck, Truck, UploadSimple, Clock, ClipboardText, MagnifyingGlass } from '@phosphor-icons/react';
import { HeroBackgroundImage } from '../../components/HeroBackgroundImage';
import { HeroOverlay } from '../../components/HeroOverlay';
import type { HeroImageConfig } from '../../types/heroImage';

const heroImageConfig: HeroImageConfig = {
  desktop: { webp: '/BannerResize.webp', png: '/BannerHome.png' },
  tablet: { webp: '/BannerResize.webp', png: '/BannerHome.png' },
  mobile: { webp: '/BannerResize.webp', png: '/BannerHome.png' },
  alt: 'Multi Kreasi Printing production banner',
  objectPosition: 'center center',
  overlayOpacity: 0.46,
};

const actionCards = [
  {
    icon: ClipboardText,
    title: 'Browse the catalog',
    description: 'Check standard products, materials, and sizes before requesting a quote.',
  },
  {
    icon: UploadSimple,
    title: 'Upload design files',
    description: 'Send print-ready artwork and keep the production team aligned from the start.',
  },
  {
    icon: MagnifyingGlass,
    title: 'Track every order',
    description: 'Follow proofing, production, and delivery from a single customer workspace.',
  },
];

const serviceCards = [
  {
    icon: Package,
    title: 'Corporate identity',
    description: 'Business cards, letterheads, envelopes, and folders for daily operations.',
  },
  {
    icon: Printer,
    title: 'Marketing materials',
    description: 'Brochures, flyers, catalogs, and packaging for campaigns and launches.',
  },
  {
    icon: Truck,
    title: 'Large format',
    description: 'Banners, signage, and event materials with production-ready finishing.',
  },
];

const supportPoints = [
  { label: 'Response time', value: 'Within one business day', icon: Clock },
  { label: 'Quality checks', value: 'Proof before print', icon: ShieldCheck },
  { label: 'Human support', value: 'Chat, phone, and email', icon: Headphones },
];

export const HomePage: React.FC = () => {
  return (
    <div className="w-full" style={{ backgroundColor: 'var(--bg-base)' }}>
      <section className="relative overflow-hidden border-b" style={{ backgroundColor: 'var(--color-neutral-950)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <HeroBackgroundImage config={heroImageConfig} />
        <HeroOverlay opacity={heroImageConfig.overlayOpacity} />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-start gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-end lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text-inverse)' }}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-success-400)' }} />
              Production portal for print ordering and tracking
            </div>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: 'var(--text-inverse)' }}>
              Print operations that stay clear, fast, and on schedule.
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.78)' }}>
              Upload files, request quotes, and follow production updates without email chains or guesswork.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors duration-150"
                style={{ backgroundColor: 'var(--color-primary-600)' }}
              >
                Explore catalog
                <ArrowRight size={18} weight="regular" />
              </Link>
              <Link
                to="/custom-order"
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold transition-colors duration-150"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text-inverse)' }}
              >
                Request custom order
              </Link>
            </div>
          </div>

          <div className="grid w-full gap-3 lg:max-w-md">
            {supportPoints.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-lg border p-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-inverse)' }}>
                  <Icon size={18} weight="regular" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: 'rgba(255,255,255,0.62)' }}>{label}</p>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'var(--text-inverse)' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {actionCards.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-lg border p-6"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-600)' }}>
                <Icon size={22} weight="regular" />
              </div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y" style={{ backgroundColor: 'var(--color-neutral-50)', borderColor: 'var(--border-default)' }}>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--color-primary-600)' }}>Popular services</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Pick the print workflow you need</h2>
            <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We keep the public landing page focused on actual customer actions, not marketing filler.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {serviceCards.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-lg border p-6"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-neutral-100)', color: 'var(--color-primary-600)' }}>
                  <Icon size={24} weight="regular" />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
                <Link to="/products" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-primary-600)' }}>
                  View products
                  <ArrowRight size={16} weight="regular" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Designed for production teams and customers</h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The interface prioritizes order status, file handoff, and quote approval so every visit has a clear next step.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {['Approve proof', 'Pay invoice', 'Track shipment'].map((item) => (
                <div key={item} className="rounded-lg border px-4 py-3 text-sm font-medium" style={{ backgroundColor: 'var(--color-neutral-50)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border p-6" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-3">
              <Headphones size={20} weight="regular" style={{ color: 'var(--color-primary-600)' }} />
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Need help?</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Support is available for order questions, production updates, and file preparation.
            </p>
            <Link
              to="/help"
              className="mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors duration-150"
              style={{ backgroundColor: 'var(--color-primary-600)' }}
            >
              Contact support
              <ArrowRight size={16} weight="regular" />
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
};
