import { Link } from 'react-router-dom';
import { Package, TrendDown, Clock, ShieldCheck, ArrowRight, Truck } from '@phosphor-icons/react';

export const BulkPrintingPage = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-primary-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-300 via-primary-900 to-black"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Enterprise Bulk Printing Solutions</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-10 leading-relaxed">
            Scale your business with our high-volume printing services. Enjoy significant cost savings, priority production, and dedicated B2B support for all your corporate printing needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/custom-order" className="bg-white text-primary-900 hover:bg-primary-50 font-bold py-3 px-8 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2">
              Request a Bulk Quote
              <ArrowRight size={18} weight="regular" />
            </Link>
            <Link to="/contact" className="bg-primary-800 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-lg border border-primary-600 transition-all">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us for High-Volume Orders?</h2>
          <p className="text-lg text-gray-600">We understand the unique challenges of enterprise procurement and large-scale marketing campaigns.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6">
              <TrendDown size={28} weight="regular" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Tiered Volume Discounts</h3>
            <p className="text-gray-600 leading-relaxed">
              The more you print, the less you pay per unit. Our dynamic pricing model ensures your business gets the best possible ROI on large campaigns.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6">
              <Clock size={28} weight="regular" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Priority Production Lane</h3>
            <p className="text-gray-600 leading-relaxed">
              Bulk orders from our B2B partners are routed to a dedicated high-speed production lane, ensuring tight corporate deadlines are always met.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck size={28} weight="regular" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Consistent Quality Control</h3>
            <p className="text-gray-600 leading-relaxed">
              Whether you order 1,000 or 100,000 units, our automated color-calibration and strict QA processes guarantee perfect consistency across the entire batch.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6">
              <Package size={28} weight="regular" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Packaging & Kitting</h3>
            <p className="text-gray-600 leading-relaxed">
              Need your brochures bundled in packs of 50? Or distinct shipments for different branch offices? We handle complex packaging requirements effortlessly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow lg:col-span-2 flex flex-col justify-center bg-primary-50/50">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-white text-primary-600 rounded-full flex items-center justify-center shadow-sm">
                <Truck size={24} weight="regular" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Nationwide Logistics Network</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We partner with top-tier logistics providers to ensure your large pallets or multi-destination shipments arrive safely and on time, anywhere in Indonesia. We handle the routing, tracking, and delivery confirmation so you don't have to.
                </p>
                <Link to="/contact" className="text-primary-600 font-bold hover:text-primary-800 flex items-center gap-1">
                  Discuss logistics requirements <ArrowRight size={16} weight="regular" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Frequently Ordered in Bulk</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900">Packaging Boxes</h3>
              <p className="text-sm text-gray-500 mt-1">Starting at 1,000 pcs</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900">Flyers & Brochures</h3>
              <p className="text-sm text-gray-500 mt-1">Starting at 5,000 pcs</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900">Corporate Books</h3>
              <p className="text-sm text-gray-500 mt-1">Starting at 500 pcs</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900">Paper Bags</h3>
              <p className="text-sm text-gray-500 mt-1">Starting at 1,000 pcs</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
