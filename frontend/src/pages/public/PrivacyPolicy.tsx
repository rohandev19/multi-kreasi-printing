export const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">Privacy Policy</h1>
      <div className="prose prose-sm sm:prose text-slate-600">
        <p className="text-sm text-slate-400 mb-8">Effective Date: October 17, 2024</p>
        
        <p>
          At Multi Kreasi Printing ("we", "us", "our"), we respect your privacy and are committed to protecting your personal data. 
          This Privacy Policy explains how we collect, use, process, and protect your personal data in compliance with the 
          <strong> Undang-Undang Pelindungan Data Pribadi (UU PDP) No. 27 Tahun 2022</strong> of Indonesia.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Data We Collect</h2>
        <p>
          We collect personal data that you provide directly to us when you register for an account, place an order, or contact us. This may include:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Identity Data:</strong> Full name, NPWP (for invoicing).</li>
          <li><strong>Contact Data:</strong> Email address, phone number, physical delivery address.</li>
          <li><strong>Transaction Data:</strong> Details about payments and orders placed with us.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Purpose of Data Processing</h2>
        <p>Your personal data is strictly processed for the following purposes:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>To fulfill and manage your orders, invoices, and deliveries.</li>
          <li>To communicate with you regarding order statuses or customer support.</li>
          <li>To comply with legal obligations (e.g., tax reporting).</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Data Retention</h2>
        <p>
          We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, 
          including for the purposes of satisfying any legal, accounting, or reporting requirements.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Your Rights under UU PDP</h2>
        <p>Under the UU PDP, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Request access to your personal data.</li>
          <li>Request correction of incomplete or inaccurate data.</li>
          <li>Request the deletion or destruction of your personal data when it is no longer necessary.</li>
          <li>Withdraw your consent for data processing at any time.</li>
        </ul>
        <p className="mt-4">
          To exercise any of these rights, please contact our Data Protection Officer at privacy@multikreasiprinting.com.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Security</h2>
        <p>
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, 
          used, accessed in an unauthorized way, altered, or disclosed. Access to your data is limited to employees 
          who have a business need to know.
        </p>
      </div>
    </div>
  );
};
