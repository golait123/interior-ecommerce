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
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { 
  ArrowRight,
  Compass,
  Sprout,
  Calculator,
  Layers,
  Sparkles,
  Star,
  CheckCircle2,
  Maximize2,
  Ruler,
  Check,
  ChevronRight,
  Truck,
  ShieldCheck,
  Wrench,
  RotateCcw,
  Heart,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

// 3D Room Swatch Options
const SWATCH_OPTIONS = [
  {
    id: 'botanical',
    name: 'Leaf Harmony Botanical',
    category: 'Wallpaper',
    colorHex: '#2D5A27',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    rollPrice: 2090
  },
  {
    id: 'textured',
    name: 'Raw Linen Texture',
    category: 'Textured Roll',
    colorHex: '#C5A880',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    rollPrice: 1850
  },
  {
    id: 'acoustic',
    name: 'Nordic Oak Slats',
    category: '3D Panel',
    colorHex: '#8C533C',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
    rollPrice: 3400
  },
  {
    id: 'stone',
    name: 'Venetian Marble Cream',
    category: 'Luxury Finish',
    colorHex: '#E9DFD0',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    rollPrice: 2450
  }
];

// Trending 5 Categories (Module 1 poster)
const TRENDING_CATEGORIES = [
  {
    id: 'wallpapers',
    name: 'Wallpapers',
    tagline: 'Botanical, Textured & Peel-and-Stick',
    itemCount: '240+ Styles',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    path: '/shop?category=wallpapers'
  },
  {
    id: 'panels',
    name: '3D Wall Panels',
    tagline: 'Acoustic Wooden Slats & Fluted Tiles',
    itemCount: '85+ Designs',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80',
    path: '/shop?category=panels'
  },
  {
    id: 'curtains',
    name: 'Curtains & Drapes',
    tagline: 'Linen Sheers & Blackout Velvet',
    itemCount: '110+ Fabrics',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    path: '/shop?category=curtains'
  },
  {
    id: 'indoor-plants',
    name: 'Indoor Plants',
    tagline: 'Air-Purifying Monstera & Fiddle Leaf',
    itemCount: '95+ Varieties',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
    path: '/gardening?filter=indoor'
  },
  {
    id: 'planters',
    name: 'Bonsai & Planters',
    tagline: 'Handmade Ceramics & Self-Watering Pots',
    itemCount: '130+ Planters',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80',
    path: '/gardening?filter=planters'
  }
];

// Customer Testimonials (Module 1 poster)
const TESTIMONIALS = [
  {
    id: 'rev-1',
    rating: 5,
    name: 'Pooja Malhotra',
    location: 'Bandra West, Mumbai',
    review: 'The 360° Room Studio is revolutionary. I saw the Leaf Harmony botanical wallpaper on my exact living room wall before purchasing. The installers came on time, and the seamless finish is stunning!',
    product: 'Leaf Harmony Wallpaper • 6 Rolls',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'rev-2',
    rating: 5,
    name: 'Arjun Venkat',
    location: 'Indiranagar, Bengaluru',
    review: 'The wall roll calculator gave me the exact number of rolls needed with 10% wastage. Not a single meter was wasted, and the acoustic wood slats have completely eliminated room echo in my home office.',
    product: 'Nordic Oak Acoustic Slats • 8 Panels',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'rev-3',
    rating: 5,
    name: 'Neha Sharma',
    location: 'Vasant Vihar, New Delhi',
    review: 'Ordering plants online used to be risky, but InteriorG moisture-lock packaging delivered my Monstera Deliciosa and Fiddle Leaf Fig without a single wilted leaf. Looks straight out of an architectural digest.',
    product: 'Monstera Deliciosa & Ceramic Urn',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  }
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useCart();

  // Swatch visualizer state
  const [selectedSwatch, setSelectedSwatch] = useState(SWATCH_OPTIONS[0]);

  // Wall Roll Calculator State
  const [wallWidth, setWallWidth] = useState<number>(12);
  const [wallHeight, setWallHeight] = useState<number>(10);
  const [calcRolls, setCalcRolls] = useState<number>(3);
  const [calcPrice, setCalcPrice] = useState<number>(6270);
  const [calcCoverage, setCalcCoverage] = useState<number>(120);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Category filter for product showcase
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Recalculate rolls
  const handleCalculateRolls = () => {
    const area = wallWidth * wallHeight;
    setCalcCoverage(area);
    // Standard roll covers 57 sq.ft; with 10% safety margin:
    const needed = Math.max(1, Math.ceil((area * 1.1) / 57));
    setCalcRolls(needed);
    setCalcPrice(needed * 2090);
    toast.success(`Calculated: ${needed} rolls required for ${area} sq.ft`);
  };

  // Fetch catalog
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-home-showcase'],
    queryFn: () => productsApi.list({ limit: 40 })
  });

  const allProducts = productsData?.items || [];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (!allProducts.length) return [];
    if (activeCategory === 'all') return allProducts.slice(0, 8);
    return allProducts.filter(p => {
      const cat = p.category?.name?.toLowerCase() || '';
      const type = p.type?.toLowerCase() || '';
      if (activeCategory === 'wallpapers') return cat.includes('wall') || type.includes('wall');
      if (activeCategory === 'plants') return cat.includes('plant') || cat.includes('nurser') || p.primaryDomain === 'outdoor';
      if (activeCategory === 'panels') return cat.includes('panel') || cat.includes('acoustic');
      if (activeCategory === 'planters') return cat.includes('pot') || cat.includes('planter');
      return true;
    }).slice(0, 8);
  }, [allProducts, activeCategory]);

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

  return (
    <div className="interiorg-homepage-wrapper">
      <Header />

      <main>
        {/* ========================================================================= */}
        {/* 1. DUAL HERO SHOWCASE SPLIT (Module 1 from Poster)                       */}
        {/* ========================================================================= */}
        <section className="dual-hero-section">
          {/* LEFT HERO: TRANSFORM YOUR WALLS */}
          <div className="hero-split-side hero-split-walls">
            <div className="hero-split-image-layer" style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85)'
            }} />
            <div className="hero-split-gradient-overlay" />

            <div className="hero-split-content">
              <div className="hero-kicker-badge">
                <Compass size={14} className="text-gold" />
                <span>Luxury Wall Decor & Paneling</span>
              </div>
              <h1 className="hero-split-title">
                Transform Your Walls into Living Art
              </h1>
              <p className="hero-split-desc">
                Elevate your sanctuary with 400+ botanical wallpapers, raw textured linens, and acoustic 3D slats engineered for acoustic warmth and architectural prestige.
              </p>

              <div className="hero-cta-group">
                <Link to="/room-studio" className="hero-primary-btn">
                  <span>Launch 360° Studio</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/shop" className="hero-secondary-btn">
                  <span>Browse Wallpapers</span>
                </Link>
              </div>

              <div className="hero-perk-pills">
                <span className="perk-pill">✓ Peel & Stick</span>
                <span className="perk-pill">✓ 10-Yr Warranty</span>
                <span className="perk-pill">✓ Free Swatches</span>
              </div>
            </div>
          </div>

          {/* RIGHT HERO: BRING NATURE INDOORS */}
          <div className="hero-split-side hero-split-nature">
            <div className="hero-split-image-layer" style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1400&q=85)'
            }} />
            <div className="hero-split-gradient-overlay nature-overlay" />

            <div className="hero-split-content">
              <div className="hero-kicker-badge nature-badge">
                <Sprout size={14} className="text-primary-green" />
                <span>Biophilic Nursery & Green Living</span>
              </div>
              <h2 className="hero-split-title">
                Bring Nature Indoors with Living Foliage
              </h2>
              <p className="hero-split-desc">
                Cleanse indoor air and ground your living spaces with hardy air-purifiers, exotic monsteras, and artisan stoneware planters delivered safely with moisture protection.
              </p>

              <div className="hero-cta-group">
                <Link to="/gardening" className="hero-primary-btn green-btn">
                  <span>Shop Plants & Nursery</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/gardening/customize" className="hero-secondary-btn">
                  <span>Customizer Studio</span>
                </Link>
              </div>

              <div className="hero-perk-pills">
                <span className="perk-pill">✓ Moisture-Safe Box</span>
                <span className="perk-pill">✓ Pet-Safe Options</span>
                <span className="perk-pill">✓ Care Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. INTERACTIVE FEATURE CARDS: 3D VISUALIZER + ROLL CALCULATOR             */}
        {/* ========================================================================= */}
        <section className="interactive-feature-cards-section">
          <div className="feature-cards-container">
            {/* CARD 1: 3D ROOM VISUALIZER SWATCH CARD */}
            <div className="feature-card visualizer-swatch-card">
              <div className="card-top-tag">
                <Sparkles size={14} className="text-gold mr-1 inline" />
                <span>Interactive Visualizer Tool</span>
              </div>
              <h3 className="feature-card-heading">
                360° Room Studio Preview
              </h3>
              <p className="feature-card-sub">
                Select a luxury finish below to see how it instantly dresses up the accent wall in real-time.
              </p>

              {/* Interactive Room Canvas Preview */}
              <div className="preview-canvas-box">
                <img
                  src={selectedSwatch.image}
                  alt={selectedSwatch.name}
                  className="preview-canvas-img"
                />
                <div className="preview-canvas-overlay">
                  <div className="canvas-product-badge">
                    <span className="canvas-product-name">{selectedSwatch.name}</span>
                    <span className="canvas-product-price">₹{selectedSwatch.rollPrice.toLocaleString('en-IN')} / Roll</span>
                  </div>
                  <Link to="/room-studio" className="canvas-fullscreen-link" title="Open Full 360 Studio">
                    <Maximize2 size={16} />
                  </Link>
                </div>
              </div>

              {/* Swatch Selector Row */}
              <div className="swatches-selector-row">
                <span className="swatches-label">Choose Finish:</span>
                <div className="swatches-pills-list">
                  {SWATCH_OPTIONS.map((swatch) => (
                    <button
                      key={swatch.id}
                      type="button"
                      className={`swatch-pill-btn ${selectedSwatch.id === swatch.id ? 'active' : ''}`}
                      onClick={() => setSelectedSwatch(swatch)}
                    >
                      <span
                        className="swatch-color-dot"
                        style={{ backgroundColor: swatch.colorHex }}
                      />
                      <span className="swatch-btn-name">{swatch.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="feature-card-footer">
                <Link to="/room-studio" className="card-action-btn">
                  <span>Enter Full 360° Studio</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* CARD 2: WALL ROLL CALCULATOR CARD */}
            <div className="feature-card roll-calculator-card" id="calculator">
              <div className="card-top-tag">
                <Calculator size={14} className="text-primary-green mr-1 inline" />
                <span>Precision Estimation</span>
              </div>
              <h3 className="feature-card-heading">
                Smart Wall Roll Calculator
              </h3>
              <p className="feature-card-sub">
                Avoid over-ordering or running short. Input your wall dimensions to calculate exact rolls needed.
              </p>

              {/* Calculator Inputs */}
              <div className="calc-inputs-grid">
                <div className="calc-input-field">
                  <label htmlFor="wall-width-input">Wall Width (ft)</label>
                  <div className="input-with-unit">
                    <input
                      id="wall-width-input"
                      type="number"
                      min={4}
                      max={80}
                      value={wallWidth}
                      onChange={(e) => setWallWidth(Number(e.target.value) || 0)}
                    />
                    <span className="unit-label">ft</span>
                  </div>
                </div>

                <div className="calc-input-field">
                  <label htmlFor="wall-height-input">Wall Height (ft)</label>
                  <div className="input-with-unit">
                    <input
                      id="wall-height-input"
                      type="number"
                      min={4}
                      max={30}
                      value={wallHeight}
                      onChange={(e) => setWallHeight(Number(e.target.value) || 0)}
                    />
                    <span className="unit-label">ft</span>
                  </div>
                </div>
              </div>

              {/* Calculation Output Box */}
              <div className="calc-result-box">
                <div className="calc-metric-row">
                  <span className="metric-label">Total Wall Area:</span>
                  <span className="metric-val">{calcCoverage} sq.ft</span>
                </div>
                <div className="calc-metric-row">
                  <span className="metric-label">Estimated Rolls Needed:</span>
                  <span className="metric-val highlight">{calcRolls} Standard Rolls</span>
                </div>
                <div className="calc-metric-row">
                  <span className="metric-label">Includes Safety Wastage:</span>
                  <span className="metric-val text-success">10% Pattern Allowance</span>
                </div>
                <div className="calc-metric-row total-row">
                  <span className="metric-label">Estimated Material Cost:</span>
                  <span className="metric-val price-val">₹{calcPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="calc-action-row">
                <button
                  type="button"
                  onClick={handleCalculateRolls}
                  className="calc-recalculate-btn"
                >
                  <Calculator size={15} />
                  <span>Recalculate Rolls</span>
                </button>
                <Link to="/shop" className="calc-shop-btn">
                  <span>Shop Matching Rolls</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. TRENDING CATEGORIES (5 Cards from Module 1 of Poster)                 */}
        {/* ========================================================================= */}
        <section className="trending-categories-section">
          <div className="trending-container">
            <div className="section-header-row">
              <div>
                <span className="section-kicker">Curated Spaces</span>
                <h2 className="section-title">Trending Architectural Categories</h2>
                <p className="section-desc">
                  Explore bespoke design categories curated to transform walls, living suites, and light-filled balconies.
                </p>
              </div>
              <Link to="/shop" className="view-all-text-link">
                <span>View Full Catalog</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="trending-cards-grid">
              {TRENDING_CATEGORIES.map((cat) => (
                <Link key={cat.id} to={cat.path} className="trending-cat-card">
                  <div className="cat-card-image-box">
                    <img src={cat.image} alt={cat.name} className="cat-card-img" />
                    <span className="cat-card-count-badge">{cat.itemCount}</span>
                  </div>
                  <div className="cat-card-content">
                    <h3 className="cat-card-title">{cat.name}</h3>
                    <p className="cat-card-tagline">{cat.tagline}</p>
                    <span className="cat-card-cta">
                      <span>Explore</span>
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. PRODUCT SHOWCASE WITH CATEGORY FILTERS                                */}
        {/* ========================================================================= */}
        <section className="product-showcase-section">
          <div className="showcase-container">
            <div className="showcase-header">
              <h2 className="showcase-title">Signature InteriorG Editions</h2>
              <p className="showcase-desc">
                From hand-pressed botanical wallpapers to air-cleansing fiddle leaf figs, hand-finished for discerning homes.
              </p>

              {/* Filter Pills */}
              <div className="showcase-filter-pills">
                <button
                  type="button"
                  className={`filter-pill-btn ${activeCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('all')}
                >
                  All Masterpieces
                </button>
                <button
                  type="button"
                  className={`filter-pill-btn ${activeCategory === 'wallpapers' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('wallpapers')}
                >
                  Wallpapers
                </button>
                <button
                  type="button"
                  className={`filter-pill-btn ${activeCategory === 'panels' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('panels')}
                >
                  3D Panels
                </button>
                <button
                  type="button"
                  className={`filter-pill-btn ${activeCategory === 'plants' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('plants')}
                >
                  Indoor Plants
                </button>
                <button
                  type="button"
                  className={`filter-pill-btn ${activeCategory === 'planters' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('planters')}
                >
                  Stoneware Planters
                </button>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="loading-spinner mx-auto my-16" />
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={!product.isCustomizable ? (p) => handleAddToCart(p, 1) : undefined}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}

            <div className="showcase-bottom-cta">
              <Link to="/shop" className="showcase-browse-all-btn">
                <span>View All 400+ Sanctuary Items</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. CUSTOMER LOVE & TESTIMONIALS (Module 1 from Poster)                    */}
        {/* ========================================================================= */}
        <section className="customer-testimonials-section">
          <div className="testimonials-container">
            <div className="text-center mb-10">
              <span className="section-kicker">Verified Customer Stories</span>
              <h2 className="section-title">Loved by 12,000+ Homeowners & Designers</h2>
              <p className="section-desc max-w-xl mx-auto">
                Read how our 360° Studio, wallpaper rolls, and nursery botanicals are elevating residences across India.
              </p>
            </div>

            <div className="testimonials-grid">
              {TESTIMONIALS.map((t) => (
                <div key={t.id} className="testimonial-card">
                  <div className="testimonial-rating-stars">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={16} className="star-gold fill-gold" />
                    ))}
                  </div>
                  <p className="testimonial-quote">"{t.review}"</p>
                  
                  <div className="testimonial-author-row">
                    <img src={t.avatar} alt={t.name} className="author-avatar" />
                    <div className="author-meta">
                      <div className="flex items-center gap-1.5">
                        <strong className="author-name">{t.name}</strong>
                        <span title="Verified Homeowner"><CheckCircle2 size={14} className="text-success" /></span>
                      </div>
                      <span className="author-location">{t.location}</span>
                      <span className="author-product-tag">{t.product}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. SIX TRUST BENEFIT PILLARS SECTION                                      */}
        {/* ========================================================================= */}
        <section className="trust-benefits-showcase">
          <div className="trust-benefits-container">
            <div className="text-center mb-8">
              <span className="section-kicker">The InteriorG Standard</span>
              <h3 className="section-title">Designed for Enduring Luxury</h3>
            </div>

            <div className="trust-grid-six">
              <div className="trust-feature-item">
                <div className="trust-feature-icon">
                  <Truck size={24} />
                </div>
                <h4>Free Pan-India Delivery</h4>
                <p>Tracked delivery to 19,000+ pin codes with moisture-proof packaging.</p>
              </div>

              <div className="trust-feature-item">
                <div className="trust-feature-icon">
                  <ShieldCheck size={24} />
                </div>
                <h4>10-Year Warranty</h4>
                <p>Commercial-grade colorfast guarantee, scratch & wipe-clean resistance.</p>
              </div>

              <div className="trust-feature-item">
                <div className="trust-feature-icon">
                  <Wrench size={24} />
                </div>
                <h4>Professional Installation</h4>
                <p>Certified wallpaper and panel master installers in 50+ major cities.</p>
              </div>

              <div className="trust-feature-item">
                <div className="trust-feature-icon">
                  <Calculator size={24} />
                </div>
                <h4>Zero Wastage Calculator</h4>
                <p>Precise pattern repeat calculations ensure you never overbuy rolls.</p>
              </div>

              <div className="trust-feature-item">
                <div className="trust-feature-icon">
                  <RotateCcw size={24} />
                </div>
                <h4>Easy 7-Day Returns</h4>
                <p>Hassle-free replacement policy if your order arrives damaged or skewed.</p>
              </div>

              <div className="trust-feature-item">
                <div className="trust-feature-icon">
                  <Compass size={24} />
                </div>
                <h4>Architect Consultation</h4>
                <p>Get complimentary space planning advice from our in-house design guild.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
