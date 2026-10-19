import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Hammer, 
  Leaf, 
  Layers, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Compass, 
  CheckCircle2, 
  HeartHandshake,
  Users,
  Flame,
  Maximize2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutUsSection() {
  const [activePillar, setActivePillar] = useState(0);

  const pillars = [
    {
      id: 'hardwood',
      title: 'Kiln-Dried Hardwoods',
      subtitle: '8% Moisture Stability',
      icon: <Hammer size={20} className="text-[var(--navy)]" />,
      desc: 'Seasoned Sheesham, Teak, and Mango hardwoods kiln-dried to eliminate warping and splitting, built to outlive generations.'
    },
    {
      id: 'brass',
      title: 'Hand-Beaten Brass',
      subtitle: 'Authentic Sand-Cast Metal',
      icon: <Sparkles size={20} className="text-[var(--navy)]" />,
      desc: 'Solid sand-cast brass hand-hammered by 3rd generation metalsmiths, hand-rubbed with natural beeswax for warm antique patina.'
    },
    {
      id: 'murals',
      title: 'Zero-Waste Murals',
      subtitle: 'Millimeter CAD Custom Fit',
      icon: <Layers size={20} className="text-[var(--navy)]" />,
      desc: 'Each wallpaper is custom printed to the exact millimeter dimensions of your walls, eliminating landfill roll waste.'
    },
    {
      id: 'botanicals',
      title: 'Living Green Architecture',
      subtitle: 'NASA Clean Air Foliage',
      icon: <Leaf size={20} className="text-[var(--navy)]" />,
      desc: 'Air-purifying foliage paired with unglazed, porous terracotta planters thrown on traditional potters’ wheels.'
    }
  ];

  return (
    <section id="about" className="py-20 bg-white border-t border-[var(--border)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. HERO HEADER: EDITORIAL MANIFESTO                                       */}
        {/* ========================================================================= */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f0f5fc] border border-[#cbdceb] text-[#0f2444] text-xs font-semibold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles size={13} className="text-[#0f2444]" />
            <span>About InteriorG • Artisan Guild</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-playfair font-normal italic text-dark m-0 tracking-tight leading-tight">
            Nomadic Soul, Architectural Elegance.
          </h2>

          <p className="text-sm sm:text-base text-muted mt-4 leading-relaxed font-light">
            Born in the dusty artisan lanes of <strong>Sector 58 Banjara Market Gurugram</strong>, InteriorG bridges authentic handcrafted Indian heritage with precision made-to-measure design and conscious architecture.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. MODERN BENTO GRID (THE SIGNATURE 2026 LAYOUT)                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
          
          {/* BENTO CARD 1: HERITAGE STORY (Large 7-Col) */}
          <div className="lg:col-span-7 bg-white border border-[var(--border)] rounded-2xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--navy)] tracking-widest uppercase mb-3">
                <MapPin size={14} className="text-[var(--navy)]" />
                <span>Sector 58 Gurugram, India</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-playfair font-normal text-dark m-0 leading-snug">
                Where Centuries of Nomadic Craftsmanship Meet Contemporary Indian Homes.
              </h3>

              <p className="text-xs sm:text-sm text-muted mt-4 leading-relaxed font-light">
                For generations, Banjara nomadic craftspeople from Rajasthan, Haryana, and Uttar Pradesh carved consoles from solid Sheesham wood and hammered sunburst brass mirrors. Finding them required haggling in crowded lanes, dealing with fragile logistics, and settling for standard sizes that rarely fit modern apartments.
              </p>

              <p className="text-xs sm:text-sm text-muted mt-3 leading-relaxed font-light">
                <strong>InteriorG was founded to transform this ecosystem</strong>: We partner directly with over 50+ master artisan families, providing dignified fair living wages, certified kiln-dried hardwoods, transparent patron pricing, and millimeter-accurate digital customization.
              </p>
            </div>

            {/* Master Artisan Quote Pill */}
            <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[var(--navy)] text-white flex items-center justify-center font-serif text-lg font-bold">
                  KR
                </div>
                <div>
                  <h4 className="text-xs font-bold text-dark m-0">Kalu Ram & Sons Guild</h4>
                  <p className="text-[11px] text-muted m-0">3rd Generation Master Woodcarver, Banjara Market</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f5fc] border border-[#cbdceb] text-[#0f2444] text-[11px] font-semibold">
                <CheckCircle2 size={12} className="text-[#0f2444]" />
                Verified Guild Partner
              </span>
            </div>
          </div>

          {/* BENTO CARD 2: ARTISAN AT WORK VISUAL COLLAGE (5-Col) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] group h-56 lg:h-auto">
              <img 
                src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=800" 
                alt="Master Artisan Woodcarving" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/85 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#93c5fd] block">Hand-Carved</span>
                <p className="text-xs font-medium m-0 leading-tight">Solid Sheesham Woodwork</p>
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] group h-40">
                <img 
                  src="https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.25_f91b2dcc.jpg" 
                  alt="Hand-beaten brass mirror" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#93c5fd] block">Sand-Cast</span>
                  <p className="text-xs font-medium m-0">Sunburst Brass</p>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] group h-40">
                <img 
                  src="https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.13_91c47072.jpg" 
                  alt="Terracotta clay pottery" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block">Porous Clay</span>
                  <p className="text-xs font-medium m-0">Breathable Pottery</p>
                </div>
              </div>
            </div>
          </div>

          {/* BENTO CARD 3: THE GUILD STANDARD PILLARS (Interactive 12-Col) */}
          <div className="lg:col-span-12 bg-white border border-[var(--border)] rounded-2xl p-8 sm:p-10 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b border-[var(--border)]">
              <div>
                <span className="text-[11px] font-bold text-[var(--navy)] uppercase tracking-widest block mb-1">
                  The Artisan Benchmark
                </span>
                <h3 className="text-2xl sm:text-3xl font-playfair font-normal text-dark m-0">
                  Four Pillars of InteriorG Quality
                </h3>
              </div>
              <p className="text-xs text-muted max-w-md m-0 font-light leading-relaxed">
                Every piece commissioned through InteriorG passes rigorous kiln-drying, hand-finishing, and structural validation before arriving in your home.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {pillars.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setActivePillar(idx)}
                  className={`p-6 rounded-xl border transition-all cursor-pointer ${
                    activePillar === idx 
                      ? 'border-[var(--navy)] bg-[#f0f5fc] shadow-sm -translate-y-1' 
                      : 'border-[var(--border)] bg-white hover:border-[var(--navy)] hover:shadow-2xs'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-[var(--border)] flex items-center justify-center mb-4 shadow-2xs">
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-[var(--navy)] uppercase block mb-1">
                    {p.subtitle}
                  </span>
                  <h4 className="text-base font-serif font-medium text-dark m-0 mb-2">
                    {p.title}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed m-0 font-light">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. IMPACT NUMBERS BAR (MODERN METRIC STRIP)                                */}
        {/* ========================================================================= */}
        <div className="p-8 sm:p-10 bg-[#0a192f] text-white rounded-2xl shadow-lg grid grid-cols-2 md:grid-cols-4 gap-8 text-center border border-[#1b3a6b] mb-16">
          <div>
            <span className="text-3xl sm:text-5xl font-serif font-normal text-white block">50+</span>
            <span className="text-xs sm:text-sm text-blue-100 mt-1.5 block font-light">Master Artisan Families</span>
            <span className="text-[10px] text-blue-200 mt-0.5 block">Direct Living Wages</span>
          </div>

          <div>
            <span className="text-3xl sm:text-5xl font-serif font-normal text-white block">8%</span>
            <span className="text-xs sm:text-sm text-blue-100 mt-1.5 block font-light">Moisture-Controlled Timber</span>
            <span className="text-[10px] text-blue-200 mt-0.5 block">Zero Warp Guarantee</span>
          </div>

          <div>
            <span className="text-3xl sm:text-5xl font-serif font-normal text-white block">0%</span>
            <span className="text-xs sm:text-sm text-blue-100 mt-1.5 block font-light">Middlemen Markups</span>
            <span className="text-[10px] text-blue-200 mt-0.5 block">Workshop Direct to Patron</span>
          </div>

          <div>
            <span className="text-3xl sm:text-5xl font-serif font-normal text-white block">15k+</span>
            <span className="text-xs sm:text-sm text-blue-100 mt-1.5 block font-light">Sanctuaries Styled</span>
            <span className="text-[10px] text-blue-200 mt-0.5 block">Pan-India Express Staging</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. WORKSHOP VISIT & DESIGN CONSULTATION INVITATION (BOTTOM CTA)          */}
        {/* ========================================================================= */}
        <div className="p-8 sm:p-10 bg-white border border-[var(--border)] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#f0f5fc] border border-[#cbdceb] flex items-center justify-center text-[var(--navy)] flex-shrink-0">
              <Compass size={24} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-normal text-dark m-0">
                Experience the Craftsmanship in Person
              </h3>
              <p className="text-xs sm:text-sm text-muted mt-1 m-0 font-light">
                Visit our Sector 58 Banjara Market Artisan Studio in Gurugram, or schedule a virtual 3D room styling consultation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/shop"
              className="btn btn-primary w-full md:w-auto inline-flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Explore Collection</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
