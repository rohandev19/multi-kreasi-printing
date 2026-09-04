export const PrivacyPolicyPage = () => {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="rounded-lg border p-6 sm:p-8" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)', color: 'var(--text-secondary)' }}>
        <h1 className="mb-6 text-4xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h1>
        <div className="space-y-6 text-base leading-relaxed">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Effective date: October 17, 2024</p>
        
        <p>
          At Multi Kreasi Printing ("we", "us", "our"), we respect your privacy and are committed to protecting your personal data. 
          This Privacy Policy explains how we collect, use, process, and protect your personal data in compliance with the 
          <strong> Undang-Undang Pelindungan Data Pribadi (UU PDP) No. 27 Tahun 2022</strong> of Indonesia.
        </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>1. Data We Collect</h2>
          <p>
          We collect personal data that you provide directly to us when you register for an account, place an order, or contact us. This may include:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Identity Data:</strong> Full name, NPWP (for invoicing).</li>
            <li><strong>Contact Data:</strong> Email address, phone number, physical delivery address.</li>
            <li><strong>Transaction Data:</strong> Details about payments and orders placed with us.</li>
          </ul>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>2. Purpose of Data Processing</h2>
          <p>Your personal data is strictly processed for the following purposes:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>To fulfill and manage your orders, invoices, and deliveries.</li>
            <li>To communicate with you regarding order statuses or customer support.</li>
            <li>To comply with legal obligations (e.g., tax reporting).</li>
          </ul>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>3. Data Retention</h2>
          <p>
          We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, 
          including for the purposes of satisfying any legal, accounting, or reporting requirements.
          </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>4. Your Rights under UU PDP</h2>
          <p>Under the UU PDP, you have the right to:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Request access to your personal data.</li>
            <li>Request correction of incomplete or inaccurate data.</li>
            <li>Request the deletion or destruction of your personal data when it is no longer necessary.</li>
            <li>Withdraw your consent for data processing at any time.</li>
          </ul>
          <p className="mt-4">
          To exercise any of these rights, please contact our Data Protection Officer at privacy@multikreasiprinting.com.
          </p>

          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>5. Security</h2>
          <p>
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
          used, accessed in an unauthorized way, altered, or disclosed. Access to your data is limited to employees 
          who have a business need to know.
          </p>
        </div>
      </div>
    </article>
  );
};
