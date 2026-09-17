import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { productsApi, Product } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';
import { WallpaperCustomizer } from '../components/WallpaperCustomizer';
import { OurStorySection } from '../components/OurStorySection';
import { FeaturedWorksSlider } from '../components/FeaturedWorksSlider';
import { ArticleJournalSlider } from '../components/ArticleJournalSlider';
import { 
  Sparkles, 
  ArrowRight,
  ChevronRight,
  Leaf,
  Layers,
  ShoppingBag,
  ShieldCheck,
  Ruler,
  TreeDeciduous,
  Truck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useCart();

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Fetch products for featured signature showcase
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-home-featured'],
    queryFn: () => productsApi.list({ limit: 20 })
  });

  // Pick top 4 curated signature pieces for home showcase
  const signaturePieces = useMemo(() => {
    return productsData?.items ? productsData.items.slice(0, 4) : [];
  }, [productsData?.items]);

  // Extract customizable wallpapers for Customizer section
  const customizableProducts = useMemo(() => {
    return productsData?.items.filter(p => p.isCustomizable) || [];
  }, [productsData?.items]);

  const handleAddToCart = async (product: Product, quantity = 1) => {
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${product.name} to cart!`);
    } catch {
      toast.error('Please login to add items to cart.');
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      
      <main>
        {/* ========================================================================= */}
        {/* LUXURY HERO BANNER (10% smaller from original per user request)           */}
        {/* Original was h-[520px] md:h-[620px], now h-[468px] md:h-[558px]           */}
        {/* ========================================================================= */}
        <section className="hero-banner-section page pt-4 pb-4">
          <div className="hero-banner-card relative rounded-xl overflow-hidden shadow-xl border border-[#ded9d0] bg-[#2d2a27]">
            {/* Background Poster Image */}
            <div className="relative w-full h-[468px] md:h-[558px]">
              <img
                src="/images/interiorg-hero-banner.jpg"
                alt="InteriorG Luxury Modern Indian Interiors"
                className="w-full h-full object-cover object-center"
              />
              {/* Rich Radial & Linear Vignette for Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
            </div>

            {/* Editorial Content Overlay */}
            <div className="absolute inset-0 z-10 p-5 md:p-10 flex flex-col justify-between text-white">
              {/* Top Banner Row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="badge badge-yellow text-xs font-semibold px-3 py-1 bg-[#c4a982]/90 text-dark backdrop-blur-md">
                    ✦ Sector 58 Banjara Market Guild
                  </span>
                  <span className="text-xs text-white/80 hidden sm:inline">
                    Handcrafted in Gurugram • Delivered Pan-India
                  </span>
                </div>

                {user && (
                  <div className="px-3 py-1 rounded bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium text-white">
                    👋 Welcome back, <strong>{user.name}</strong>
                  </div>
                )}
              </div>

              {/* Central Editorial Heading & Taglines */}
              <div className="max-w-3xl my-auto py-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs tracking-[0.25em] uppercase text-[#e2cbb2] font-semibold font-mono">
                    INTERIORG ARCHITECTURAL LIVING
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl md:text-5xl font-playfair font-normal leading-[1.1] m-0 text-white drop-shadow-md">
                  Artisanal Soul.<br />
                  <span className="italic text-[#f4eee4]">Architectural Elegance.</span>
                </h1>

                <p className="text-xs sm:text-sm md:text-base text-white/90 mt-3 mb-5 max-w-2xl font-light leading-relaxed">
                  Where centuries-old Indian artisan heritage meets contemporary architectural sanctuaries. Curated from Gurugram to your walls with 100% solid seasoned woods, hand-hammered antique brass, and bespoke made-to-measure murals.
                </p>

                {/* Brand Distinction Micro-Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c4a982]" /> Solid Seasoned Sheesham
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c4a982]" /> Sand-Cast Antique Brass
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c4a982]" /> Bespoke Wall Murals
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link 
                    to="/shop" 
                    className="btn btn-primary bg-[#8c6f52] hover:bg-[#735940] text-white py-3 px-5 text-xs font-semibold border-none shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <span>Explore Shopping Studio</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link 
                    to="/gardening" 
                    className="btn bg-[#6a8c6f] hover:bg-[#58755c] text-white py-3 px-5 text-xs font-semibold border-none shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Leaf size={14} />
                    <span>Gardening & Plants</span>
                  </Link>
                  <a 
                    href="#works" 
                    className="btn btn-ghost bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 py-3 px-5 text-xs font-medium cursor-pointer"
                  >
                    Our Works
                  </a>
                </div>
              </div>

              {/* Bottom Architectural Caption */}
              <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-white/70">
                <span>
                  ✦ Featured Space: <strong>The Vasant Vihar Penthouse</strong> • Terracotta Botanical Mural & Carved Sheesham
                </span>
                <span className="hidden md:inline font-mono text-[11px]">
                  NEW DELHI • GURUGRAM • PAN-INDIA DISPATCH
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="trust-bar page py-4">
          <div className="trust-item">
            <strong>Direct Artisan Sourcing</strong>
            <span>Sector 58 Gurugram guild</span>
          </div>
          <div className="trust-item">
            <strong>Made-to-Measure</strong>
            <span>Zero-waste precision fit</span>
          </div>
          <div className="trust-item">
            <strong>Solid Hardwoods</strong>
            <span>100% seasoned Sheesham & Teak</span>
          </div>
          <div className="trust-item">
            <strong>Insured Delivery</strong>
            <span>Safe transit across all pincodes</span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* OUR WORK DISPLAY (PROMINENTLY FEATURED ON HOME PAGE AS REQUESTED)          */}
        {/* ========================================================================= */}
        <section id="works" className="pt-2 pb-6">
          <FeaturedWorksSlider />
        </section>

        {/* ========================================================================= */}
        {/* TWO EDITORIAL SHOPPING PORTALS: INDOOR SANCTUARIES & BOTANICAL GARDENING   */}
        {/* ========================================================================= */}
        <section className="page py-8">
          <div className="text-center mb-6">
            <span className="badge badge-yellow text-xs font-semibold mb-1 inline-block">
              ✦ Architectural Categorization
            </span>
            <h2 className="text-2xl md:text-3xl font-playfair font-normal text-dark mt-1">
              Curated Living Sanctuaries
            </h2>
            <p className="text-xs text-muted max-w-lg mx-auto mt-1">
              Explore our dual design philosophy: interior bespoke woodwork & mirrors, or outdoor botanical freshness and pottery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PORTAL 1: INDOOR SHOPPING */}
            <div className="relative rounded-2xl overflow-hidden border border-[#ded9d0] shadow-sm group bg-[#2d2a27] text-white flex flex-col justify-between p-6 sm:p-8 min-h-[340px]">
              <div className="absolute inset-0 z-0">
                <img
                  src="/images/interiorg-project-bedroom.jpg"
                  alt="Indoor Architectural Sanctuaries"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#c4a982] text-dark">
                    🏠 40 Artisan Pieces
                  </span>
                  <span className="text-xs text-gray-300">11 Room Suites</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-playfair font-normal m-0 text-white">
                  Indoor Architectural Spaces
                </h3>
                <p className="text-xs text-gray-200 mt-2 max-w-md font-light leading-relaxed">
                  Living rooms, grand foyers, bedrooms, dining suites, and private mini-theatres styled with hand-hammered brass, Lambani embroidery, and seasoned Sheesham consoles.
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between">
                <span className="text-xs text-[#c4a982] font-mono">Blinkit-Style Room Selector</span>
                <Link
                  to="/shop?domain=indoor"
                  className="btn btn-sm bg-white text-dark hover:bg-[#faf8f5] text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 border-none shadow-md"
                >
                  <span>Shop Indoor Spaces</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* PORTAL 2: GARDENING & PLANT DECORATION */}
            <div className="relative rounded-2xl overflow-hidden border border-[#d8e2d4] shadow-sm group bg-[#1c261e] text-white flex flex-col justify-between p-6 sm:p-8 min-h-[340px]">
              <div className="absolute inset-0 z-0">
                <img
                  src="/images/interiorg-project-dining.jpg"
                  alt="Gardening and Plant Decoration"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#6a8c6f] text-white">
                    🌿 25 Botanical Pieces
                  </span>
                  <span className="text-xs text-gray-300">Balcony & Lawn Nursery</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-playfair font-normal m-0 text-white">
                  Gardening & Plant Decoration
                </h3>
                <p className="text-xs text-gray-200 mt-2 max-w-md font-light leading-relaxed">
                  Transform open-air balconies, garden verandas, and sunrooms with NASA-evaluated air-purifying foliage, unglazed terracotta urns, and botanical plant stands.
                </p>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between">
                <span className="text-xs text-emerald-300 font-mono">Terracotta & Greenery</span>
                <Link
                  to="/gardening"
                  className="btn btn-sm bg-[#6a8c6f] hover:bg-[#58755c] text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 border-none shadow-md"
                >
                  <span>Explore Gardening & Plants</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CURATED SIGNATURE PIECES (CLEAN 4-ITEM SHOWCASE WITHOUT CLUTTER)          */}
        {/* ========================================================================= */}
        <section className="page py-8 border-t border-[#ded9d0]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <span className="badge badge-yellow text-xs font-semibold mb-1 inline-block">
                ✦ Masterpiece Highlights
              </span>
              <h2 className="text-2xl md:text-3xl font-playfair font-normal text-dark m-0">
                Signature Artisan Creations
              </h2>
              <p className="text-xs text-muted mt-1 m-0">
                A brief glimpse into our 41-piece master catalog.
              </p>
            </div>

            <Link
              to="/shop"
              className="btn btn-secondary btn-sm text-xs font-semibold flex items-center gap-1.5"
            >
              <span>View All 41 Products in Shopping Studio</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {signaturePieces.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={!p.isCustomizable ? (prod) => handleAddToCart(prod, 1) : undefined}
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>

          {/* Quick Commerce Banner */}
          <div className="mt-6 p-4 rounded-xl bg-[#faf8f5] border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor: '#ded9d0' }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <div>
                <span className="font-bold text-dark">Looking for room-by-room shopping?</span>
                <span className="text-muted ml-2 hidden sm:inline">Use our Blinkit-style split navigation to browse living rooms, bedrooms, kitchens, and balconies.</span>
              </div>
            </div>

            <Link
              to="/shop"
              className="btn btn-primary btn-sm text-xs font-semibold px-4 py-1.5 whitespace-nowrap"
            >
              Launch Shopping Studio
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BESPOKE WALLPAPER STUDIO (#custom)                                        */}
        {/* ========================================================================= */}
        <section id="custom" className="customizer-section page py-12 my-6 border-t" style={{ borderColor: '#ded9d0' }}>
          <WallpaperCustomizer customizableProducts={customizableProducts} />
        </section>

        {/* ========================================================================= */}
        {/* THE JOURNAL & ARTICLES SLIDER (#journal)                                  */}
        {/* ========================================================================= */}
        <section id="journal">
          <ArticleJournalSlider />
        </section>

        {/* ========================================================================= */}
        {/* OUR ARTISAN STORY SECTION (#story)                                        */}
        {/* ========================================================================= */}
        <section id="story">
          <OurStorySection />
        </section>

        {/* ========================================================================= */}
        {/* ARCHITECTURAL STANDARDS STRIP                                             */}
        {/* ========================================================================= */}
        <section className="role-strip page py-10 my-6 bg-white rounded-xl border" style={{ borderColor: '#ded9d0' }}>
          <h2 className="text-xl font-playfair font-normal text-center mb-6">InteriorG Architectural Standard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4 text-center">
            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-[#faf8f5] flex items-center justify-center mx-auto mb-2 text-accent font-bold">
                1
              </div>
              <h3 className="text-sm font-bold mb-1">Authentic Gurugram Craft</h3>
              <p className="text-xs text-muted leading-relaxed">Direct from Sector 58 Banjara Guild, eliminating showroom markups.</p>
            </div>
            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-[#faf8f5] flex items-center justify-center mx-auto mb-2 text-accent font-bold">
                2
              </div>
              <h3 className="text-sm font-bold mb-1">Bespoke Room Sizing</h3>
              <p className="text-xs text-muted leading-relaxed">Made-to-measure dimensions engineered for modern high-rise apartments.</p>
            </div>
            <div className="p-4">
              <div className="w-10 h-10 rounded-full bg-[#faf8f5] flex items-center justify-center mx-auto mb-2 text-accent font-bold">
                3
              </div>
              <h3 className="text-sm font-bold mb-1">Living Greenery & Ceramics</h3>
              <p className="text-xs text-muted leading-relaxed">NASA-approved indoor foliage paired with unglazed cooling terracotta.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(product, qty) => handleAddToCart(product, qty)}
        />
      )}

      <Footer />
    </div>
  );
}
