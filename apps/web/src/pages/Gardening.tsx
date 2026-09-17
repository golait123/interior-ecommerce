import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { productsApi, Product } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';
import { 
  Sparkles, 
  Wind, 
  HeartHandshake, 
  Droplets, 
  SunMedium, 
  ChevronRight,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Leaf
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Gardening() {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [activeZone, setActiveZone] = useState<string>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Fetch outdoor and botanical products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-gardening'],
    queryFn: () => productsApi.list({ space: 'outdoor', limit: 50 })
  });

  const allOutdoorProducts = productsData?.items || [];

  // Filter products by zone tab
  const filteredProducts = useMemo(() => {
    if (activeZone === 'all') return allOutdoorProducts;
    return allOutdoorProducts.filter(p => {
      const slugs = p.spaceSlugs || p.spaces?.map(s => s.slug) || [];
      return slugs.includes(activeZone);
    });
  }, [allOutdoorProducts, activeZone]);

  const handleAddToCart = async (product: Product, quantity = 1) => {
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${product.name} to cart!`);
    } catch {
      toast.error('Please login to add items to cart.');
    }
  };

  const botanicalPillars = [
    {
      icon: <Wind className="text-[#6a8c6f]" size={24} />,
      title: 'Active Air Purification',
      desc: 'NASA-evaluated foliage that filters benzene, formaldehyde, and airborne dust naturally inside high-rise urban apartments.'
    },
    {
      icon: <HeartHandshake className="text-[#6a8c6f]" size={24} />,
      title: 'Biophilic Stress Reduction',
      desc: 'Natural organic greenery lowers cortisol levels and boosts creative focus by 23% according to architectural wellness research.'
    },
    {
      icon: <Droplets className="text-[#6a8c6f]" size={24} />,
      title: 'Microclimate Cooling',
      desc: 'Transpiration through unglazed terracotta cools balcony ambient temperature by 2–4°C during warm Indian summer afternoons.'
    },
    {
      icon: <SunMedium className="text-[#6a8c6f]" size={24} />,
      title: 'Porous Terracotta Soil Health',
      desc: 'Hand-thrown earthen clay breathes naturally, preventing root rot and eliminating chemical fertilizers with rich organic compost.'
    }
  ];

  return (
    <div className="page-wrapper bg-[#f8f9f6] min-h-screen">
      <Header />

      <main>
        {/* BOTANICAL HERO BANNER */}
        <section className="page pt-6 pb-4">
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#d8e2d4] bg-[#232e24]">
            {/* Background image & gradient overlay */}
            <div className="relative w-full h-[380px] md:h-[440px]">
              <img
                src="/images/interiorg-hero-banner.jpg"
                alt="Gardening and Botanical Plant Decoration"
                className="w-full h-full object-cover object-center filter saturate-125"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-[#1d291e]/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141e15] via-transparent to-transparent" />
            </div>

            {/* Content overlay */}
            <div className="absolute inset-0 z-10 p-6 md:p-12 flex flex-col justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge text-xs font-semibold px-3 py-1 bg-[#6a8c6f] text-white backdrop-blur-md flex items-center gap-1.5">
                    <Leaf size={12} /> The Botanical Living Studio
                  </span>
                  <span className="text-xs text-emerald-200 hidden sm:inline font-mono">
                    AIR-PURIFYING PLANTS & HANDCRAFTED PLANTERS
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-normal max-w-2xl leading-tight m-0">
                  Gardening & Plant Decoration
                </h1>
                <p className="text-sm md:text-base text-gray-200 mt-3 max-w-xl font-light leading-relaxed">
                  Transform your balcony, lawn, and verandah into lush, oxygen-rich sanctuaries. Pair seasoned Sheesham plant stands with terracotta urns and resilient indigenous greenery.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/20">
                <a
                  href="#catalog"
                  className="btn btn-primary bg-[#6a8c6f] hover:bg-[#58755c] text-white py-2.5 px-5 text-xs font-semibold border-none shadow-md cursor-pointer flex items-center gap-2"
                >
                  <span>Explore Plant & Gardening Decor</span>
                  <ChevronRight size={14} />
                </a>
                <Link
                  to="/shop?domain=outdoor"
                  className="btn bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/30 py-2.5 px-5 text-xs font-medium cursor-pointer"
                >
                  Open in Blinkit Shop Mode
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4 PILLARS OF BOTANICAL LIVING */}
        <section className="page py-8">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#58755c]">
              Why Live with Plants?
            </span>
            <h2 className="text-2xl md:text-3xl font-playfair font-normal text-dark mt-1">
              The Four Principles of Living Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {botanicalPillars.map((pillar, i) => (
              <div 
                key={i} 
                className="bg-white p-5 rounded-xl border border-[#d8e2d4] shadow-2xs hover:shadow-sm hover:border-[#6a8c6f] transition-all"
              >
                <div className="w-11 h-11 rounded-lg bg-[#eef4ec] flex items-center justify-center mb-3">
                  {pillar.icon}
                </div>
                <h3 className="text-sm font-bold text-dark mb-1.5">{pillar.title}</h3>
                <p className="text-xs text-muted leading-relaxed m-0">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTANICAL PRODUCT CATALOG SECTION */}
        <section id="catalog" className="page py-8 border-t border-[#ded9d0]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="badge badge-yellow text-xs font-semibold mb-1 inline-block">
                ✦ 100% Organic & Hand-Poured Ceramics
              </span>
              <h2 className="text-2xl md:text-3xl font-playfair font-normal text-dark m-0">
                Lawn, Balcony & Plant Catalog
              </h2>
              <p className="text-xs text-muted mt-1 m-0">
                Filtered from our Sector 58 Gurugram nursery and artisan terracotta guild.
              </p>
            </div>

            {/* Zone Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-white border p-1 rounded-xl shadow-2xs overflow-x-auto no-scrollbar" style={{ borderColor: '#ded9d0' }}>
              {[
                { id: 'all', label: 'All Plants & Decor', count: allOutdoorProducts.length },
                { id: 'balcony', label: '☕ Balcony Greenery', count: 18 },
                { id: 'lawn-garden', label: '🌱 Lawn & Garden', count: 12 },
                { id: 'nursery', label: '🪴 Home Nursery', count: 8 },
                { id: 'patio', label: '🌿 Patio & Terrace', count: 15 }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveZone(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border-none whitespace-nowrap flex items-center gap-1.5 ${
                    activeZone === tab.id
                      ? 'bg-[#2d2a27] text-white shadow-xs'
                      : 'bg-transparent text-muted hover:text-dark'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeZone === tab.id ? 'bg-[#6a8c6f] text-white' : 'bg-gray-100 text-dark'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="loading-spinner mx-auto my-16"></div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={!p.isCustomizable ? (prod) => handleAddToCart(prod, 1) : undefined}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border rounded-xl" style={{ borderColor: '#ded9d0' }}>
              <p className="text-xs text-muted">No plants found for this specific zone.</p>
            </div>
          )}
        </section>

        {/* URBAN PLANT STYLING GUIDE */}
        <section className="page py-10 my-6 bg-[#eef4ec] rounded-2xl border border-[#d8e2d4] p-6 md:p-10">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#58755c]">
              InteriorG Landscape Guide
            </span>
            <h2 className="text-2xl md:text-3xl font-playfair font-normal text-dark mt-1 mb-3">
              How to Style a Lush High-Rise Balcony
            </h2>
            <div className="space-y-3 text-xs md:text-sm text-[#3b473d] leading-relaxed">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#58755c] shrink-0 mt-0.5" />
                <span>
                  <strong>Vertical Layering:</strong> Place taller Fiddle Leaf and Areca palms against corner walls to create privacy from neighboring towers without blocking sunlight.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#58755c] shrink-0 mt-0.5" />
                <span>
                  <strong>Hand-Thrown Terracotta:</strong> Always use breathable earthen terracotta planters with drainage plates to avoid balcony floor water-stains during monsoon downpours.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[#58755c] shrink-0 mt-0.5" />
                <span>
                  <strong>Organic Herbal Railings:</strong> Line balcony railings with sweet basil, mint, and lemongrass in terracotta troughs to naturally repel mosquitoes while infusing fresh fragrance.
                </span>
              </div>
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
