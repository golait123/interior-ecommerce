import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { 
  Sparkles, 
  MapPin, 
  Hammer, 
  Leaf, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Compass, 
  Award,
  Users,
  HeartHandshake
} from 'lucide-react';

export default function About() {
  const pillars = [
    {
      title: 'Kiln-Dried Hardwoods',
      subtitle: '8% Moisture Stability',
      icon: <Hammer size={22} className="text-[var(--navy)]" />,
      desc: 'Seasoned Sheesham, Teak, and Mango hardwoods kiln-dried to eliminate warping and splitting, engineered to outlive generations.'
    },
    {
      title: 'Hand-Beaten Antique Brass',
      subtitle: 'Sand-Cast Metalcraft',
      icon: <Sparkles size={22} className="text-[var(--navy)]" />,
      desc: 'Solid sand-cast brass hand-hammered by 3rd generation metalsmiths, finished with warm protective organic beeswax.'
    },
    {
      title: 'Zero-Waste Murals',
      subtitle: 'Millimeter CAD Custom Fit',
      icon: <Layers size={22} className="text-[var(--navy)]" />,
      desc: 'Each wallpaper is printed to your room’s exact millimeter measurements, cutting out unnecessary roll landfill waste.'
    },
    {
      title: 'Living Green Architecture',
      subtitle: 'Porous Terracotta & NASA Foliage',
      icon: <Leaf size={22} className="text-[var(--navy)]" />,
      desc: 'Air-purifying foliage paired with unglazed, breathable terracotta planters hand-thrown on clay potter wheels.'
    }
  ];

  const artisans = [
    {
      name: 'Kalu Ram & Sons',
      craft: '3rd Generation Master Woodcarvers',
      heritage: 'Specializing in solid Sheesham fluted consoles & hand-carved floral crests.',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600'
    },
    {
      name: 'Devi Lal Guild',
      craft: 'Master Brass & Metalsmiths',
      heritage: 'Hand-hammering sunburst brass mirrors and sand-cast architectural handles.',
      image: 'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.25_f91b2dcc.jpg'
    },
    {
      name: 'Ram Swaroop Family',
      craft: 'Traditional Clay Potters',
      heritage: 'Throwing unglazed terracotta planters and porous urns on hand-rotated clay wheels.',
      image: 'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.13_91c47072.jpg'
    }
  ];

  return (
    <div className="page-wrapper bg-white min-h-screen">
      <Header />

      <main className="pt-6 pb-20">
        
        {/* ========================================================================= */}
        {/* 1. EDITORIAL HERO: BREADCRUMBS & MANIFESTO                                */}
        {/* ========================================================================= */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-14">
          {/* Breadcrumb Trail */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted mb-4">
            <Link to="/" className="hover:text-dark transition-colors">Home</Link>
            <ChevronRight size={12} />
            <span className="text-dark font-medium">About Us</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f0f5fc] border border-[#cbdceb] text-[#0f2444] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={13} className="text-[#0f2444]" />
            <span>The InteriorG Story</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-normal italic text-dark m-0 tracking-tight leading-tight">
            Nomadic Soul, Architectural Elegance.
          </h1>

          <p className="text-sm sm:text-base text-muted mt-5 max-w-2xl mx-auto leading-relaxed font-light">
            Founded in Sector 58 Gurugram, InteriorG bridges authentic Indian artisan heritage from the open-air workshops of Banjara Market into contemporary architectural sanctums.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* 2. HERO BANNER IMAGE                                                      */}
        {/* ========================================================================= */}
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="relative rounded-2xl overflow-hidden h-[340px] sm:h-[460px] border border-[var(--border)] shadow-sm">
            <img 
              src="/images/majestic-hero-living.jpg" 
              alt="InteriorG Architectural Living" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/85 via-[#0a192f]/35 to-transparent" />
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 text-white max-w-xl">
              <span className="text-[11px] uppercase font-bold tracking-widest text-[#93c5fd] block mb-2">
                Sector 58 Artisan Guild • Born in Gurugram
              </span>
              <h2 className="text-2xl sm:text-3xl font-playfair font-normal italic text-white m-0 leading-snug">
                "We don't build mass-produced furniture. We craft heirlooms that carry the soul of their maker."
              </h2>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. THE GENESIS NARRATIVE                                                  */}
        {/* ========================================================================= */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--navy)] tracking-widest uppercase mb-3">
                <MapPin size={14} className="text-[var(--navy)]" />
                <span>Our Roots • Sector 58 Banjara Market</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-playfair font-normal text-dark m-0 leading-snug">
                India’s Best-Kept Interior Secret, Reimagined for Modern Living.
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-muted leading-relaxed font-light mt-6">
                <p className="m-0">
                  For decades, nomadic craftspeople from Rajasthan, Haryana, and Uttar Pradesh gathered along the dirt lanes of Sector 58 Gurugram, hand-carving seasoned Sheesham consoles, hammering sunburst brass mirrors, and throwing terracotta urns on ancient potter wheels.
                </p>
                <p className="m-0">
                  Yet, finding the right piece required haggling through unorganized lanes, dealing with unpredictable shipping damages, and settling for standardized dimensions that rarely fit modern urban architecture.
                </p>
                <p className="m-0">
                  <strong>InteriorG was built to bridge this divide.</strong> We work hand-in-hand with over 50+ master artisan families, eliminating middlemen exploitation and providing dignified living wages, certified kiln-dried hardwoods, transparent pricing, and millimeter-accurate digital made-to-measure murals.
                </p>
              </div>

              {/* Master Artisan Quote Card */}
              <div className="p-6 bg-[#f0f5fc] border-l-4 border-[var(--navy)] rounded-r-xl border border-[var(--border)] mt-8 shadow-xs">
                <p className="text-xs sm:text-sm text-dark italic font-serif leading-relaxed m-0 mb-3">
                  "Every grain in seasoned Sheesham wood and every hammer stroke on brass tells the story of our ancestors. When you bring an InteriorG piece into your home, you carry our heritage forward."
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-dark block">Kalu Ram & Sons</span>
                    <span className="text-[11px] text-muted">3rd Generation Master Woodcarver, Sector 58 Guild</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#0f2444] text-[10px] font-semibold border border-[#cbdceb]">
                    <CheckCircle2 size={11} className="text-[#0f2444]" />
                    Verified Partner
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-[var(--border)] shadow-xs h-48">
                  <img 
                    src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=600" 
                    alt="Artisan woodcarving" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-[var(--border)] shadow-xs h-60">
                  <img 
                    src="https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.25_f91b2dcc.jpg" 
                    alt="Hand-beaten brass mirror" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="rounded-xl overflow-hidden border border-[var(--border)] shadow-xs h-60">
                  <img 
                    src="https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.13_91c47072.jpg" 
                    alt="Terracotta clay pottery" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-xl overflow-hidden border border-[var(--border)] shadow-xs h-48">
                  <img 
                    src="https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.02_f3fa2aa6.jpg" 
                    alt="Bespoke wallpaper print" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. THE FOUR CRAFTSMANSHIP PILLARS                                         */}
        {/* ========================================================================= */}
        <section className="bg-white py-16 border-y border-[var(--border)] mb-20">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[var(--navy)] uppercase tracking-widest block mb-2">
                The Artisan Standard
              </span>
              <h2 className="text-3xl font-playfair font-normal text-dark m-0">
                Four Pillars of InteriorG Quality
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-2 font-light">
                Every piece commissioned through our guild undergoes stringent seasoning, hand-polishing, and architectural testing.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((p, i) => (
                <div key={i} className="bg-white p-7 rounded-xl border border-[var(--border)] shadow-2xs hover:shadow-md hover:border-[var(--navy)] transition-all">
                  <div className="w-11 h-11 rounded-lg bg-[#f0f5fc] border border-[#cbdceb] flex items-center justify-center mb-4">
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-bold text-[var(--navy)] uppercase tracking-wider block mb-1">
                    {p.subtitle}
                  </span>
                  <h3 className="text-base font-serif font-medium text-dark m-0 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed m-0 font-light">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. MEET THE GUILD ARTISANS                                                */}
        {/* ========================================================================= */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold text-[var(--navy)] uppercase tracking-widest block mb-2">
              Master Families
            </span>
            <h2 className="text-3xl font-playfair font-normal text-dark m-0">
              Meet the Artisans
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-2 font-light">
              Centuries of generational craft passed down from parents to children in open-air workshops.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {artisans.map((artisan, idx) => (
              <div key={idx} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-2xs group hover:shadow-md transition-shadow">
                <div className="h-56 overflow-hidden">
                  <img 
                    src={artisan.image} 
                    alt={artisan.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg font-medium text-dark m-0">
                    {artisan.name}
                  </h3>
                  <span className="text-xs font-semibold text-[var(--navy)] block mt-1 mb-2.5">
                    {artisan.craft}
                  </span>
                  <p className="text-xs text-muted leading-relaxed m-0 font-light">
                    {artisan.heritage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. IMPACT & SUSTAINABILITY METRICS                                        */}
        {/* ========================================================================= */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="p-8 sm:p-10 bg-[#0a192f] text-white rounded-2xl shadow-lg grid grid-cols-2 md:grid-cols-4 gap-8 text-center border border-[#1b3a6b]">
            <div>
              <span className="text-3xl sm:text-5xl font-serif font-normal text-white block">50+</span>
              <span className="text-xs sm:text-sm text-blue-100 mt-1.5 block font-light">Master Artisan Families</span>
              <span className="text-[10px] text-blue-200 mt-0.5 block">Guaranteed Fair Living Wages</span>
            </div>

            <div>
              <span className="text-3xl sm:text-5xl font-serif font-normal text-white block">8%</span>
              <span className="text-xs sm:text-sm text-blue-100 mt-1.5 block font-light">Kiln-Dried Moisture</span>
              <span className="text-[10px] text-blue-200 mt-0.5 block">Anti-Warp Structural Lifetime</span>
            </div>

            <div>
              <span className="text-3xl sm:text-5xl font-serif font-normal text-white block">0%</span>
              <span className="text-xs sm:text-sm text-blue-100 mt-1.5 block font-light">Middlemen Markups</span>
              <span className="text-[10px] text-blue-200 mt-0.5 block">Workshop Direct to Patron</span>
            </div>

            <div>
              <span className="text-3xl sm:text-5xl font-serif font-normal text-white block">15k+</span>
              <span className="text-xs sm:text-sm text-blue-100 mt-1.5 block font-light">Sanctuaries Styled</span>
              <span className="text-[10px] text-blue-200 mt-0.5 block">Pan-India Architectural Delivery</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. FLAGSHIP STUDIO LOCATION & VISITS                                      */}
        {/* ========================================================================= */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 bg-white border border-[var(--border)] rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-[#f0f5fc] border border-[#cbdceb] flex items-center justify-center text-[var(--navy)] flex-shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-medium text-dark m-0">
                  Visit the Sector 58 Artisan Studio
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-1.5 leading-relaxed font-light">
                  Sector 58, Banjara Guild Studio, Golf Course Extension Road, Gurugram, Haryana 122011.<br />
                  Open Monday to Sunday, 10:00 AM – 8:00 PM IST.
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-[var(--navy)] font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} />
                    Walk-ins & Studio Visits Welcome
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <a
                href="https://maps.google.com/?q=Sector+58+Gurugram+Banjara+Market"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary w-full md:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Get Studio Directions</span>
                <Compass size={14} />
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
