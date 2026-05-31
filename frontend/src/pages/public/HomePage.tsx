import { Link } from 'react-router-dom';
import { ArrowRight, Printer, Package, Truck, Star, ShieldCheck, Clock, BadgePercent, Headphones } from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-slate-900 to-purple-900/40 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold tracking-wide uppercase mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Enterprise B2B Printing
          </span>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-[1.1]">
            Professional Printing for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Modern Businesses</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl font-medium leading-relaxed">
            High-volume, commercial-grade print solutions delivered with precision and speed. From corporate identity to large format displays.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mx-auto">
            <Link to="/products" className="h-14 px-8 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_60px_rgba(79,70,229,0.5)] active:scale-95">
              Browse Catalog
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/contact" className="h-14 px-8 rounded-full bg-slate-800 text-white font-bold text-lg flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all active:scale-95">
              Contact Sales
            </Link>
          </div>
          
          <div className="mt-16 flex items-center gap-8 text-slate-400 text-sm font-semibold uppercase tracking-wider justify-center w-full border-t border-slate-800/50 pt-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">500+</span> Clients
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">10M+</span> Prints
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Our Core Services</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Comprehensive printing solutions tailored for enterprise requirements.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Corporate Identity', desc: 'Business cards, letterheads, and envelopes with premium finishes.', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Marketing Materials', desc: 'Brochures, flyers, and catalogs designed to convert.', icon: Printer, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { title: 'Large Format', desc: 'Indoor & outdoor banners, x-banners, and rigid signs.', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((cat, i) => (
              <div key={i} className="group bg-slate-50 p-8 rounded-3xl border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300">
                <div className={`w-16 h-16 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-3">{cat.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium mb-8">{cat.desc}</p>
                <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Explore category <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Streamlined Process</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">From concept to delivery in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-200"></div>
            
            {[
              { step: '01', title: 'Upload & Configure', desc: 'Upload your print-ready files and configure specifications directly in our portal.' },
              { step: '02', title: 'Proof & Approve', desc: 'Review digital proofs and track production status in real-time.' },
              { step: '03', title: 'Fast Delivery', desc: 'Receive your high-quality prints securely packaged and delivered on time.' },
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-8 border-slate-50 shadow-sm flex items-center justify-center text-2xl font-black text-indigo-600 mb-6 relative z-10">
                  {step.step}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Why Choose MK Printing</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Built for scale, quality, and reliability.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Quality Guarantee', desc: 'Premium materials and strict quality control on every order.', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: 'Fast Turnaround', desc: 'Optimized production lines to meet your tight deadlines.', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Competitive Pricing', desc: 'Volume discounts and transparent pricing for B2B clients.', icon: BadgePercent, color: 'text-amber-600', bg: 'bg-amber-50' },
              { title: 'Dedicated Support', desc: 'A dedicated account manager for your enterprise needs.', icon: Headphones, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((feature, i) => (
              <div key={i} className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-5`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Trusted by Industry Leaders</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">See what our corporate partners say about us.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: "MK Printing has been our reliable partner for over 3 years. Their ability to deliver high-quality marketing materials on tight deadlines is unmatched.", name: "Budi Santoso", role: "Marketing Director", company: "PT Mega Nusantara" },
              { quote: "The transition to their B2B portal streamlined our procurement process significantly. We save hours every week on print orders.", name: "Siti Rahma", role: "Procurement Head", company: "Retailindo Group" },
              { quote: "Exceptional quality for our large format banners. Their attention to detail and color accuracy is exactly what our brand needs.", name: "Andi Wijaya", role: "Creative Lead", company: "Studio Kreasi" },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
                <div className="flex gap-1 mb-6 text-amber-400">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-600 italic font-medium leading-relaxed mb-8 flex-1">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-200">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl shadow-indigo-600/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 tracking-tight">Ready to elevate your printed materials?</h2>
              <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto font-medium">
                Join hundreds of businesses that trust MK Printing for their commercial needs. Create an account to access custom pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="h-14 px-8 rounded-full bg-white text-indigo-600 font-bold text-lg flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95 shadow-md">
                  Create Account
                </Link>
                <Link to="/products" className="h-14 px-8 rounded-full bg-indigo-700 text-white font-bold text-lg flex items-center justify-center hover:bg-indigo-800 transition-all active:scale-95 border border-indigo-500">
                  View Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
