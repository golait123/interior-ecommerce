import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  Award, 
  Layers, 
  Hammer, 
  Feather, 
  Leaf, 
  ArrowRight,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export function OurStorySection() {
  return (
    <section id="story" className="story-section page py-16 my-12 border-t" style={{ borderColor: '#ded9d0' }}>
      {/* Header Badge & Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f5efe6] border border-[#c4a982] rounded-full text-xs font-semibold text-[#8c6f52] mb-3">
          <Sparkles size={13} className="text-[#8c6f52]" />
          <span>The Banjara Artisan Heritage</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-normal text-dark m-0 font-playfair tracking-tight">
          The Soul of Banjara Market, Crafted for Modern Living.
        </h2>
        <p className="text-sm md:text-base text-muted mt-3 leading-relaxed">
          From the dusty artisan lanes of Sector 58 Gurugram into contemporary Indian interiors — we bridge authentic nomadic Indian craft with precision custom sizing and conscious design.
        </p>
      </div>

      {/* Two-Column Story Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
        {/* Left Column: Narrative */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="flex items-center gap-2 text-xs font-bold text-accent tracking-widest uppercase">
            <MapPin size={14} />
            <span>Born in Sector 58 Gurugram, India</span>
          </div>

          <h3 className="text-2xl font-normal text-dark m-0 font-playfair leading-snug">
            Where Centuries of Rajasthani Metalcraft & Hardwood Carpentry Meet Your Home
          </h3>

          <p className="text-sm text-muted leading-relaxed m-0">
            For decades, <strong>Banjara Market</strong> has been India’s best-kept interior secret. Nomadic craftspeople from Rajasthan, Haryana, and Uttar Pradesh set up open-air workshops, hand-carving seasoned Sheesham wood consoles, hammering sunburst brass mirrors, and throwing terracotta urns on clay wheels.
          </p>

          <p className="text-sm text-muted leading-relaxed m-0">
            Yet, finding the right piece required haggling in crowded lanes, dealing with unpredictable shipping, and settling for standard sizes that rarely fit modern apartments. <strong>InteriorG</strong> was created to change that.
          </p>

          <p className="text-sm text-muted leading-relaxed m-0">
            We partner directly with over <strong>50+ master craft families</strong>. We bring their heirloom artistry online with fair living wages, certified kiln-dried hardwoods, transparent pricing, and millimeter-accurate digital custom wallpapers — with zero middlemen markup.
          </p>

          {/* Master Artisan Quote Card */}
          <div className="p-5 bg-[#faf8f5] border-l-4 border-accent rounded-r shadow-xs mt-2" style={{ borderTop: '1px solid #ded9d0', borderRight: '1px solid #ded9d0', borderBottom: '1px solid #ded9d0' }}>
            <p className="text-xs md:text-sm text-dark italic leading-relaxed m-0 mb-3 font-serif">
              "Every curve in Sheesham wood and every hammer strike on brass tells a story of our ancestors. We don't just build furniture — we craft heirlooms that outlive generations."
            </p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-dark block">Kalu Ram & Sons</span>
                <span className="text-[11px] text-muted">3rd Generation Master Woodcarver, Banjara Market</span>
              </div>
              <span className="badge badge-green text-[10px]">Verified Partner</span>
            </div>
          </div>
        </div>

        {/* Right Column: Artisan Photo Collage */}
        <div className="lg:col-span-5 relative">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-3">
              <div className="h-44 rounded overflow-hidden shadow border" style={{ borderColor: '#ded9d0' }}>
                <img 
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=500" 
                  alt="Artisan woodcarving" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="h-56 rounded overflow-hidden shadow border" style={{ borderColor: '#ded9d0' }}>
                <img 
                  src="https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.25_f91b2dcc.jpg" 
                  alt="Hand-beaten antique brass mirror" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <div className="h-56 rounded overflow-hidden shadow border" style={{ borderColor: '#ded9d0' }}>
                <img 
                  src="https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.13_91c47072.jpg" 
                  alt="Terracotta clay vase pottery" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="h-44 rounded overflow-hidden shadow border" style={{ borderColor: '#ded9d0' }}>
                <img 
                  src="https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.02_f3fa2aa6.jpg" 
                  alt="Bespoke wallpaper artisan block print" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Floating Artisan Badge */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-dark text-white px-5 py-2.5 rounded-full shadow-xl border border-white/20 flex items-center gap-2 whitespace-nowrap">
            <Award size={16} className="text-[#c4a982]" />
            <span className="text-xs font-semibold">100% Direct Artisan Guild Sourced</span>
          </div>
        </div>
      </div>

      {/* The 4 Craftsmanship Pillars */}
      <div className="mt-8 pt-8 border-t" style={{ borderColor: '#ded9d0' }}>
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs text-accent uppercase font-bold tracking-wider">Our Standards</span>
          <h3 className="text-xl md:text-2xl font-normal text-dark m-0 font-playfair">
            The Four Pillars of InteriorG Quality
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-5 border rounded shadow-xs hover:border-dark transition-all" style={{ borderColor: '#ded9d0' }}>
            <div className="w-10 h-10 rounded-full bg-[#f5efe6] flex items-center justify-center text-accent mb-3">
              <Hammer size={18} />
            </div>
            <h4 className="text-sm font-bold text-dark m-0 mb-1">Seasoned Solid Hardwoods</h4>
            <p className="text-xs text-muted leading-relaxed m-0">
              Kiln-dried Sheesham, Mango, and Teak woods seasoned to 8% moisture content for lifelong anti-warp stability.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-5 border rounded shadow-xs hover:border-dark transition-all" style={{ borderColor: '#ded9d0' }}>
            <div className="w-10 h-10 rounded-full bg-[#f5efe6] flex items-center justify-center text-accent mb-3">
              <Sparkles size={18} />
            </div>
            <h4 className="text-sm font-bold text-dark m-0 mb-1">Hand-Beaten Antique Brass</h4>
            <p className="text-xs text-muted leading-relaxed m-0">
              Sand-cast and hand-hammered metals carrying authentic artisanal textures, finished with protective beeswax.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-5 border rounded shadow-xs hover:border-dark transition-all" style={{ borderColor: '#ded9d0' }}>
            <div className="w-10 h-10 rounded-full bg-[#f5efe6] flex items-center justify-center text-accent mb-3">
              <Layers size={18} />
            </div>
            <h4 className="text-sm font-bold text-dark m-0 mb-1">Zero-Waste Digital Murals</h4>
            <p className="text-xs text-muted leading-relaxed m-0">
              Every wallpaper is printed to your room’s exact millimeter measurements, cutting out unnecessary landfill roll waste.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-5 border rounded shadow-xs hover:border-dark transition-all" style={{ borderColor: '#ded9d0' }}>
            <div className="w-10 h-10 rounded-full bg-[#f5efe6] flex items-center justify-center text-accent mb-3">
              <Leaf size={18} />
            </div>
            <h4 className="text-sm font-bold text-dark m-0 mb-1">Non-Toxic & VOC-Free</h4>
            <p className="text-xs text-muted leading-relaxed m-0">
              Water-based odorless pigment inks and breathable substrates safe for children, pets, and bedroom air quality.
            </p>
          </div>
        </div>
      </div>

      {/* Impact Numbers Bar */}
      <div className="mt-12 p-8 bg-[#2d2a27] text-white rounded shadow-md grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <span className="text-3xl md:text-4xl font-bold text-[#c4a982] font-playfair block">50+</span>
          <span className="text-xs text-gray-300 mt-1 block">Master Artisan Families</span>
        </div>
        <div>
          <span className="text-3xl md:text-4xl font-bold text-[#c4a982] font-playfair block">12,000+</span>
          <span className="text-xs text-gray-300 mt-1 block">Indian Homes Transformed</span>
        </div>
        <div>
          <span className="text-3xl md:text-4xl font-bold text-[#c4a982] font-playfair block">100%</span>
          <span className="text-xs text-gray-300 mt-1 block">Solid Wood & Authentic Metals</span>
        </div>
        <div>
          <span className="text-3xl md:text-4xl font-bold text-[#c4a982] font-playfair block">4.9 ★</span>
          <span className="text-xs text-gray-300 mt-1 block">Verified Customer Rating</span>
        </div>
      </div>

      {/* Bottom CTA Bar */}
      <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
        <a href="#shop" className="btn btn-primary px-8 py-3 text-sm font-semibold">
          Explore Banjara Collection
        </a>
        <a href="#custom" className="btn btn-secondary px-8 py-3 text-sm font-semibold">
          Customize Your Wallpaper
        </a>
      </div>
    </section>
  );
}
