export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">About Multi Kreasi Printing</h1>
      <div className="prose prose-lg text-gray-600 prose-indigo">
        <p className="lead text-xl">
          We are a professional printing company dedicated to providing high-quality printing solutions 
          for businesses of all sizes. With state-of-the-art equipment and a passionate team, we turn your 
          ideas into tangible reality.
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Our Mission</h2>
        <p>
          To empower businesses with exceptional printed materials that elevate their brand presence, 
          delivered with speed, reliability, and unparalleled customer service.
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Why Choose Us?</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Premium Quality:</strong> We use industry-leading printers and materials.</li>
          <li><strong>Fast Turnaround:</strong> Meeting your tight deadlines is our priority.</li>
          <li><strong>Expert Support:</strong> Our team is ready to assist from design to delivery.</li>
          <li><strong>Competitive Pricing:</strong> High quality doesn't have to break the bank.</li>
        </ul>
      </div>
    </div>
  );
};
