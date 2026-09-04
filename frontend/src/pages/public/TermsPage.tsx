export const TermsPage = () => {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="rounded-lg border p-6 sm:p-8" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)', color: 'var(--text-secondary)' }}>
        <h1 className="mb-6 text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Terms of Service</h1>
        <div className="space-y-6 text-base leading-relaxed">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Last updated: August 5, 2026</p>
        
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>1. Acceptance of Terms</h2>
          <p>
          By accessing and using the services provided by Multi Kreasi Printing ("we", "us", "our"), 
          you agree to be bound by these Terms and Conditions. If you do not agree to these terms, 
          please do not use our services.
          </p>
        
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>2. Orders and Payment</h2>
          <p>
          All orders are subject to acceptance and availability. Prices are subject to change without notice. 
          Payment must be made in full or as agreed upon (e.g., 50% down payment) before production begins. 
          Custom printed products are non-refundable once production has started.
          </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>3. Design Files & Proofing</h2>
          <p>
          Customers are responsible for ensuring that uploaded design files meet our specifications 
          (resolution, bleed, format). We will provide a digital proof for approval if requested. 
          Once approved, we are not liable for any errors (spelling, layout) present in the approved file.
          </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>4. Turnaround and Delivery</h2>
          <p>
          Estimated delivery dates are approximations and not guarantees. We are not liable for delays 
          caused by shipping carriers or unforeseen circumstances (force majeure).
          </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>5. Privacy and Data Protection (UU PDP)</h2>
          <p>
          We collect and process your personal data in accordance with our Privacy Policy and applicable 
          Indonesian data protection laws (UU No. 27/2022). We do not sell your personal information.
          </p>
        </div>
      </div>
    </article>
  );
};
