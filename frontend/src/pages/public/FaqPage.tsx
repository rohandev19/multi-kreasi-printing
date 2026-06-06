import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, MessageCircle, HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: 'Orders & Production',
    questions: [
      {
        q: 'How long does production usually take?',
        a: 'Standard production time is 3-5 business days depending on the product and quantity. Express production (1-2 days) is available for selected items with an additional rush fee.'
      },
      {
        q: 'Can I cancel or modify my order after placing it?',
        a: 'Orders can only be modified or cancelled if they have not entered the production phase. Please contact our support team immediately if you need to make changes.'
      },
      {
        q: 'What is your minimum order quantity (MOQ)?',
        a: 'MOQ varies by product. For example, business cards start at 1 box (100 pcs), while offset printing items like brochures typically start at 500 pcs. Check individual product pages for specific MOQ.'
      }
    ]
  },
  {
    category: 'Design & File Preparation',
    questions: [
      {
        q: 'What file formats do you accept?',
        a: 'We accept PDF (preferred), AI, PSD, EPS, and high-resolution JPEG/PNG files. Please ensure all text is outlined and images are embedded.'
      },
      {
        q: 'What should the resolution and color mode be?',
        a: 'All files should be at least 300 DPI for high-quality printing. Please use CMYK color mode, as RGB colors may look different when printed.'
      },
      {
        q: 'Do you provide design services?',
        a: 'Yes, our in-house design team can help create or modify your designs. Design service fees vary based on complexity. Contact us for a quote.'
      }
    ]
  },
  {
    category: 'Shipping & Payment',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept bank transfers (BCA, Mandiri, BNI), credit cards, and e-wallets (GoPay, OVO, Dana).'
      },
      {
        q: 'Do you ship nationwide?',
        a: 'Yes, we ship across Indonesia using trusted courier partners. Shipping fees are calculated at checkout based on weight and destination.'
      },
      {
        q: 'Can I pick up my order directly?',
        a: 'Yes, you can choose "Self Pickup" during checkout. You will be notified when your order is ready for collection at our workshop in Jakarta.'
      }
    ]
  }
];

export const FaqPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<string | null>('0-0');

  const toggleAccordion = (index: string) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  const filteredFaqs = faqs.map(category => {
    return {
      ...category,
      questions: category.questions.filter(faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    };
  }).filter(category => category.questions.length > 0);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      
      {/* Hero Section */}
      <div className="bg-indigo-600 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10 animate-fade-in">
          <HelpCircle className="w-16 h-16 text-indigo-200 mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-indigo-100 mb-10 max-w-2xl mx-auto">
            Find answers to common questions about our printing services, file preparation, ordering process, and more.
          </p>
          
          <div className="relative max-w-xl mx-auto shadow-lg rounded-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search for answers..."
              className="block w-full pl-12 pr-4 py-4 rounded-2xl border-0 ring-1 ring-inset ring-transparent bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-lg sm:leading-6 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="space-y-8">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((category, catIndex) => (
              <div key={catIndex} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 animate-fade-in" style={{ animationDelay: `${catIndex * 100}ms` }}>
                <h2 className="text-xl font-bold text-slate-900 mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, qIndex) => {
                    const index = `${catIndex}-${qIndex}`;
                    const isOpen = openIndex === index;
                    
                    return (
                      <div 
                        key={qIndex} 
                        className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${isOpen ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300'}`}
                      >
                        <button
                          onClick={() => toggleAccordion(index)}
                          className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                        >
                          <span className={`font-semibold pr-6 ${isOpen ? 'text-indigo-900' : 'text-slate-800'}`}>
                            {faq.q}
                          </span>
                          <span className={`flex-shrink-0 ml-4 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </span>
                        </button>
                        
                        <div 
                          className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <p className="text-slate-600 leading-relaxed font-medium">
                            {faq.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-500">We couldn't find any FAQs matching "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-indigo-600 font-bold hover:text-indigo-700"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-indigo-50 rounded-3xl p-8 sm:p-10 text-center border border-indigo-100/50">
          <MessageCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Still have questions?</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Can't find the answer you're looking for? Our friendly support team is here to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="inline-flex justify-center items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
