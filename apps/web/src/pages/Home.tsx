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
import { HeroPromotionalSlideshow } from '../components/HeroPromotionalSlideshow';
import { SubscriptionPlansSection } from '../components/SubscriptionPlansSection';
import { 
  ArrowRight,
  ChevronRight,
  Leaf,
  Sparkles,
  Flame,
  Tag,
  BookOpen,
  Video,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useCart();

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Active Tab for "Featured collection" (Image 2 Template)
  const [activeFeaturedTab, setActiveFeaturedTab] = useState<string>('Chairs');

  // Fetch products for featured showcase
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-home-featured'],
    queryFn: () => productsApi.list({ limit: 50 })
  });

  const allProducts = productsData?.items || [];

  // New Arrivals (Fresh 4 to 8 pieces with discount offers)
  const newArrivals = useMemo(() => {
    if (!allProducts.length) return [];
    return allProducts.slice(0, 4);
  }, [allProducts]);

  // Filter products for the active "Featured collection" tab (Image 2)
  const displayedFeaturedProducts = useMemo(() => {
    if (!allProducts.length) return [];

    let filtered = [...allProducts];

    if (activeFeaturedTab === 'Chairs') {
      filtered = allProducts.filter(p => {
        const text = `${p.name} ${p.description} ${p.type}`.toLowerCase();
        return text.includes('chair') || text.includes('sofa') || text.includes('lounge') || text.includes('stool') || text.includes('bench') || text.includes('console');
      });
    } else if (activeFeaturedTab === 'Living Room') {
      filtered = allProducts.filter(p => {
        const slugs = p.spaceSlugs || p.spaces?.map(s => s.slug) || [];
        return slugs.includes('living-room') || p.primaryDomain === 'indoor';
      });
    } else if (activeFeaturedTab === 'Bedroom') {
      filtered = allProducts.filter(p => {
        const slugs = p.spaceSlugs || p.spaces?.map(s => s.slug) || [];
        return slugs.includes('bedroom');
      });
    } else if (activeFeaturedTab === 'Dining Room') {
      filtered = allProducts.filter(p => {
        const slugs = p.spaceSlugs || p.spaces?.map(s => s.slug) || [];
        return slugs.includes('dining-room') || p.name.toLowerCase().includes('dining');
      });
    } else if (activeFeaturedTab === 'Outdoor & Garden') {
      filtered = allProducts.filter(p => {
        return p.primaryDomain === 'outdoor';
      });
    }

    // Return first 4 items for the 4-column row (or fallback if empty)
    return filtered.length >= 4 ? filtered.slice(0, 4) : allProducts.slice(0, 4);
  }, [allProducts, activeFeaturedTab]);

  // Extract customizable wallpapers for Customizer section
  const customizableProducts = useMemo(() => {
    return allProducts.filter(p => p.isCustomizable);
  }, [allProducts]);

  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${product.name} to bag!`);
    } catch {
      toast.error('Unable to add item to bag.');
    }
  };

  const featuredTabs = [
    'Chairs',
    'Living Room',
    'Bedroom',
    'Dining Room',
    'Outdoor & Garden'
  ];

  return (
    <div className="page-wrapper bg-white">
      <Header />
      
      <main>
        {/* ========================================================================= */}
        {/* UNIFIED MAJESTIC HERO & PROMOTIONAL SLIDESHOW (IMAGE 1 + IMAGE 2)          */}
        {/* ========================================================================= */}
        <HeroPromotionalSlideshow />





        {/* ========================================================================= */}
        {/* 3. NEW ARRIVALS & SPECIAL DISCOUNTED OFFERS (#new-arrivals)               */}
        {/* ========================================================================= */}
        <section id="new-arrivals" className="py-12 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-b border-[var(--border)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#f0f5fc] border border-[#cbdceb] text-[#0f2444] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles size={12} className="text-[#0f2444]" />
                <span>Autumn Guild Releases • Flat 20% OFF Active</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-playfair font-normal italic text-dark m-0">
                New Arrivals & Discounted Editions
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-2 font-light max-w-xl leading-relaxed">
                Hand-carved solid Sheesham consoles, sand-cast sunburst brass mirrors, and living botanical planters launched with limited introductory discounts.
              </p>
            </div>

            <Link
              to="/shop?sort=newest"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--navy)] hover:text-[var(--navy-hover)] border-b border-[var(--navy)] pb-1 transition-all self-start md:self-auto whitespace-nowrap"
            >
              <span>Explore All New Arrivals</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {isLoading ? (
            <div className="loading-spinner mx-auto my-16"></div>
          ) : (
            <div className="product-grid">
              {newArrivals.map(product => (
                <ProductCard
                  key={`new-${product.id}`}
                  product={product}
                  onAddToCart={!product.isCustomizable ? (p) => handleAddToCart(p, 1) : undefined}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 4. CURATED LIVING SUBSCRIPTION PLANS                                      */}
        {/* ========================================================================= */}
        <SubscriptionPlansSection />

        {/* ========================================================================= */}
        {/* 5. FEATURED COLLECTION (IMAGE 2 TEMPLATE)                                 */}
        {/* ========================================================================= */}
        <section className="featured-collection-section">
          {/* Section Heading in Italic Serif */}
          <h2 className="featured-collection-heading">
            Featured collection
          </h2>

          {/* Centered Category Tabs with Pill Outline */}
          <div className="featured-collection-tabs">
            {featuredTabs.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFeaturedTab(tab)}
                className={`featured-pill-tab ${activeFeaturedTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 4-Column Product Grid */}
          {isLoading ? (
            <div className="loading-spinner mx-auto my-16"></div>
          ) : (
            <div className="product-grid">
              {displayedFeaturedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={!product.isCustomizable ? (p) => handleAddToCart(p, 1) : undefined}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}

          {/* View All CTA */}
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[var(--navy)] hover:text-[var(--navy-hover)] border-b border-[var(--navy)] pb-1 transition-all"
            >
              <span>Explore Entire Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ARCHITECTURAL SANCTUARIES: INDOOR & BOTANICAL PORTALS                     */}
        {/* ========================================================================= */}
        <section className="py-16 max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PORTAL 1: INDOOR SANCTUARIES */}
            <div className="sanctuary-portal-card" style={{ backgroundColor: '#0a192f' }}>
              <img
                src="/images/indoor-sanctuary.jpg"
                alt="Indoor Architectural Sanctuaries"
                className="sanctuary-portal-bg"
              />
              <div className="sanctuary-portal-overlay" />

              <div className="sanctuary-portal-content">
                <span className="sanctuary-portal-tag" style={{ color: '#93c5fd' }}>
                  InteriorG Guild Spaces
                </span>
                <h3 className="sanctuary-portal-title">
                  Indoor Sanctuaries
                </h3>
                <p className="sanctuary-portal-desc">
                  Curated living rooms, bedrooms, dining pavilions, and bespoke wall murals crafted from seasoned hardwoods and sand-cast brass.
                </p>
              </div>

              <div className="sanctuary-portal-footer">
                <Link
                  to="/shop?domain=indoor"
                  className="sanctuary-portal-btn"
                >
                  <span>Shop Indoor Spaces</span>
                  <ChevronRight size={15} />
                </Link>
              </div>
            </div>

            {/* PORTAL 2: OUTDOOR & GARDENING */}
            <div className="sanctuary-portal-card" style={{ backgroundColor: '#0c2238' }}>
              <img
                src="/images/outdoor-garden.jpg"
                alt="Outdoor Botanical Living & Gardening"
                className="sanctuary-portal-bg"
              />
              <div className="sanctuary-portal-overlay" />

              <div className="sanctuary-portal-content">
                <span className="sanctuary-portal-tag" style={{ color: '#93c5fd' }}>
                  Botanical Living Studio
                </span>
                <h3 className="sanctuary-portal-title">
                  Outdoor & Garden
                </h3>
                <p className="sanctuary-portal-desc">
                  Sunlit verandas, balcony greenery, NASA-approved air-purifying foliage, and unglazed terracotta planters handcrafted to breathe naturally.
                </p>
              </div>

              <div className="sanctuary-portal-footer">
                <Link
                  to="/gardening"
                  className="sanctuary-portal-btn"
                >
                  <span>Explore Outdoor & Garden</span>
                  <ChevronRight size={15} />
                </Link>
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
