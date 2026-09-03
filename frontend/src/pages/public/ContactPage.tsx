import { useToast } from '../../contexts/ToastContext';

export const ContactPage = () => {
  const { success } = useToast();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <p className="text-gray-600 mb-8">
            Have a question about our services or need a custom quote? 
            Fill out the form and our team will get back to you within 24 hours.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="font-semibold text-gray-900 w-24">Address:</span>
              <span className="text-gray-600">Jl. Sudirman No. 123<br/>Jakarta Selatan, 12190<br/>Indonesia</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 w-24">Phone:</span>
              <span className="text-gray-600">+62 812 3456 7890</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 w-24">Email:</span>
              <span className="text-gray-600">hello@mkprinting.com</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); success('Message Sent', 'We will get back to you soon!'); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={4} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" required></textarea>
            </div>
            <button type="submit" className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
