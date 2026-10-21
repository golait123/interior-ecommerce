import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Package, 
  Sparkles, 
  Check, 
  X,
  ArrowRight, 
  Leaf, 
  Home, 
  ShieldCheck, 
  Plus, 
  Minus, 
  Sliders, 
  Star, 
  Truck,
  ChevronRight,
  Info,
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// -------------------------------------------------------------
// PREDEFINED PACKAGES CONFIGURATION
// -------------------------------------------------------------
interface PredefinedPackage {
  id: string;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  name: string;
  tagline: string;
  price: number;
  originalPrice: number;
  badge?: string;
  homeDecorFeatures: string[];
  nurseryFeatures: string[];
  servicesIncluded: string[];
  limitedServicesNotice?: string;
  isPopular?: boolean;
}

const PREDEFINED_PACKAGES: PredefinedPackage[] = [
  {
    id: 'pkg-basic',
    tier: 'BASIC',
    name: 'Basic Sanctuary Accent',
    tagline: 'Essential Single-Room Wall & Green Accent for Compact Living',
    price: 4999,
    originalPrice: 6999,
    badge: 'Starter Choice',
    homeDecorFeatures: [
      '1 Feature Wall Accent Styling (Up to 80 sq ft)',
      'Digital 2D Wallpaper & Paint Palette Moodboard',
      'Curated DIY Surface Preparation Guide'
    ],
    nurseryFeatures: [
      '2 NASA Air-Purifying Indoor Desk Plants (Snake Plant + ZZ)',
      '2 Handcrafted Terracotta Tabletop Planters',
      'Plant Nutrition & Sunlight Placement Guide'
    ],
    servicesIncluded: [
      'Virtual Design Consultation (30 mins)',
      'Doorstep Delivery of Swatches & Botanical Kit',
      '30-Day Digital Care Support'
    ],
    limitedServicesNotice: 'Limited Services: Self-installation kit with digital architect consultation. On-site masonry and automated irrigation not included in Basic tier.'
  },
  {
    id: 'pkg-standard',
    tier: 'STANDARD',
    name: 'Standard Harmony Combo',
    tagline: 'Complete Living Room Makeover + Balcony Green Garden Setup',
    price: 14999,
    originalPrice: 19999,
    badge: 'Most Popular',
    isPopular: true,
    homeDecorFeatures: [
      '2 Feature Walls Styling (Wallpaper Mural or Geometric Paneling, up to 180 sq ft)',
      'Aesthetic Wall Art / Floating Wood Console Styling',
      '3D Room Visualizer Interactive Preview'
    ],
    nurseryFeatures: [
      'Standard Balcony Garden Setup (6 Botanical Plants: Areca Palm, Monstera, Peace Lily & Foliage)',
      '4 Italian Sub-Irrigation Self-Watering Planters',
      'Organic Potting Soil, Perlite & Slow-Release Plant Food'
    ],
    servicesIncluded: [
      'White-Glove Professional On-Site Installation (Same-Day Setup)',
      'In-Person Interior Styling Specialist Visit',
      '60-Day Botanical Foliage Health Guarantee & Free Swatch Kit'
    ]
  },
  {
    id: 'pkg-premium',
    tier: 'PREMIUM',
    name: 'Premium Sanctuary Grand',
    tagline: 'Full Residence Multi-Room Interior Decor + Luxury Landscape Terrace',
    price: 34999,
    originalPrice: 46999,
    badge: 'Architectural Pro',
    homeDecorFeatures: [
      'Multi-Room Architectural Transformation (Living, Master Bedroom & Foyer Murals + Wood Paneling)',
      'Custom Sunburst Brass Mirror or Sheesham Credenza Coordination',
      'Full 360° Room Studio 3D Interactive Walkthrough'
    ],
    nurseryFeatures: [
      'Pro Luxury Nursery Landscape: 12 Exotic Indoor & Balcony Plants (Ficus Bonsai, Philodendrons & Palms)',
      '1 Bespoke Vertical Living Green Wall Module (6x4 ft)',
      'Automated Micro-Drip Irrigation System with Digital Timer'
    ],
    servicesIncluded: [
      'Dedicated Senior Interior Architect + Master Horticulturist',
      'Full Turnkey On-Site Installation & Precision Wall Fabrication',
      '1-Year Comprehensive Sanctuary Maintenance with Free Plant Replacement'
    ]
  }
];

// -------------------------------------------------------------
// CUSTOM COMBO BUILDER OPTIONS
// -------------------------------------------------------------
interface ComboOptionItem {
  id: string;
  category: 'home' | 'nursery' | 'service';
  name: string;
  price: number;
  description: string;
  tag: string;
}

const COMBO_CATALOG: ComboOptionItem[] = [
  // Home Decor Elements
  {
    id: 'hd-mural',
    category: 'home',
    name: 'Bespoke Textured Wallpaper Mural (100 sq ft)',
    price: 3200,
    description: 'Custom scaled seamless luxury canvas or peel-and-stick mural',
    tag: 'Wall Decor'
  },
  {
    id: 'hd-paneling',
    category: 'home',
    name: 'Acoustic Fluted Wood Paneling (Single Zone)',
    price: 4500,
    description: 'Natural teak or charcoal fluted slat acoustic paneling',
    tag: 'Woodwork'
  },
  {
    id: 'hd-console',
    category: 'home',
    name: 'Handcrafted Sheesham Floating Console Table',
    price: 8900,
    description: 'Solid seasoned wood console with live edge natural wax finish',
    tag: 'Furniture'
  },
  {
    id: 'hd-mirror',
    category: 'home',
    name: 'Artisan Sunburst Brass Wall Mirror (32")',
    price: 3400,
    description: 'Hand-hammered brass frame with beveled crystal glass',
    tag: 'Accent Mirror'
  },
  {
    id: 'hd-lighting',
    category: 'home',
    name: 'Architectural Warm LED Sconces Duo (3000K)',
    price: 2400,
    description: 'Indirect ambient mood lighting for feature walls',
    tag: 'Lighting'
  },

  // Nursery Botanical Elements
  {
    id: 'nur-airpure',
    category: 'nursery',
    name: 'NASA Clean Air Botanical Pack (4 Foliage Plants)',
    price: 1800,
    description: 'Areca Palm, Snake Plant, Peace Lily & Chlorophytum',
    tag: 'Air Purifying'
  },
  {
    id: 'nur-greenwall',
    category: 'nursery',
    name: 'Modular Vertical Green Living Wall Panel (3x3 ft)',
    price: 3900,
    description: 'Modular living vertical frame with automatic moisture wick',
    tag: 'Vertical Garden'
  },
  {
    id: 'nur-selfwater',
    category: 'nursery',
    name: 'Italian Ceramic Self-Watering Planters (Trio)',
    price: 2100,
    description: 'Glazed terracotta self-watering pots with sub-irrigation reservoir',
    tag: 'Planters'
  },
  {
    id: 'nur-bonsai',
    category: 'nursery',
    name: 'Grafted Exotic Ficus Ginseng Bonsai (7 Years)',
    price: 2600,
    description: 'Sculpted live bonsai in handcrafted stoneware oval dish',
    tag: 'Collector Bonsai'
  },
  {
    id: 'nur-herbs',
    category: 'nursery',
    name: 'Terrace Kitchen & Medicinal Herb Garden Kit',
    price: 2200,
    description: 'Italian Basil, Spearmint, Rosemary, Thyme & Lemon Grass in railing planters',
    tag: 'Kitchen Garden'
  },

  // White-Glove Professional Services
  {
    id: 'srv-architect',
    category: 'service',
    name: 'On-Site Senior Architect Laser Measurement & Plan',
    price: 1500,
    description: 'Home visit with laser dimension survey & CAD layout draft',
    tag: 'Consultation'
  },
  {
    id: 'srv-drip',
    category: 'service',
    name: 'Balcony Automated Drip Irrigation Setup & Plumbing',
    price: 2500,
    description: 'Programmable battery-powered timer valve with micro drippers',
    tag: 'Automation'
  },
  {
    id: 'srv-care',
    category: 'service',
    name: '6-Month Master Horticulturist Plant Doctor Care',
    price: 1900,
    description: 'Quarterly on-site health checkup, pruning, soil aeration & pest shield',
    tag: 'Maintenance'
  }
];

export default function Packages() {
  const { themeConfig } = useTheme();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');
  
  // Custom combo selections: itemId -> quantity
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({
    'hd-mural': 1,
    'nur-airpure': 1
  });

  // Calculate combo totals & itemized list
  const { homeSubtotal, nurserySubtotal, servicesSubtotal, selectedItemsList, comboTotal } = useMemo(() => {
    let home = 0;
    let nursery = 0;
    let service = 0;
    let total = 0;
    const list: (ComboOptionItem & { qty: number })[] = [];

    Object.entries(selectedItems).forEach(([id, qty]) => {
      const item = COMBO_CATALOG.find(i => i.id === id);
      if (item) {
        list.push({ ...item, qty });
        const linePrice = item.price * qty;
        total += linePrice;
        if (item.category === 'home') home += linePrice;
        else if (item.category === 'nursery') nursery += linePrice;
        else if (item.category === 'service') service += linePrice;
      }
    });

    return {
      homeSubtotal: home,
      nurserySubtotal: nursery,
      servicesSubtotal: service,
      selectedItemsList: list,
      comboTotal: total
    };
  }, [selectedItems]);

  const MIN_COMBO_THRESHOLD = 3000;
  const isThresholdMet = comboTotal >= MIN_COMBO_THRESHOLD;

  const handleToggleItem = (id: string) => {
    setSelectedItems(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setSelectedItems(prev => {
      const current = prev[id] || 0;
      const nextQty = current + delta;
      const next = { ...prev };
      if (nextQty <= 0) {
        delete next[id];
      } else {
        next[id] = nextQty;
      }
      return next;
    });
  };

  const handleBookPredefined = (pkg: PredefinedPackage) => {
    addItem('pkg_' + pkg.id, 1, {
      packageName: pkg.name,
      tier: pkg.tier,
      price: pkg.price,
      type: 'PREDEFINED_PACKAGE'
    });
    toast.success(`Booked ${pkg.name}! Added to your Sanctuary Bag.`);
    navigate('/cart');
  };

  const handleBookCustomCombo = () => {
    if (!isThresholdMet) {
      toast.error(`Minimum combo package value must be at least ₹${MIN_COMBO_THRESHOLD.toLocaleString('en-IN')}`);
      return;
    }

    const itemsSummary = Object.entries(selectedItems).map(([id, qty]) => {
      const it = COMBO_CATALOG.find(c => c.id === id);
      return `${it?.name} (x${qty})`;
    }).join(', ');

    addItem('custom_combo_' + Date.now(), 1, {
      packageName: 'Custom Home + Nursery Combo Package',
      totalPrice: comboTotal,
      selectedItems: itemsSummary,
      type: 'CUSTOM_COMBO_PACKAGE'
    });

    toast.success(`Custom Combo Package (₹${comboTotal.toLocaleString('en-IN')}) added to bag!`);
    navigate('/cart');
  };

  return (
    <div className="page-wrapper bg-white min-h-screen">
      <Header />

      <main>
        {/* ========================================================================= */}
        {/* 1. TRUST BADGES RIBBON (STANDARD TEMPLATE ACCENT)                         */}
        {/* ========================================================================= */}
        <div className="nl-trust-ribbon pkg-trust-ribbon">
          <div className="nl-trust-ribbon-inner">
            <div className="nl-trust-pill">
              <Truck size={14} />
              <span>Turnkey Pan-India Delivery & On-Site Installation</span>
            </div>
            <div className="nl-trust-pill">
              <Package size={14} />
              <span>Combined Home Decor + Botanical Nursery Guarantee</span>
            </div>
            <div className="nl-trust-pill">
              <ShieldCheck size={14} />
              <span>Up to 1-Year Comprehensive Sanctuary Warranty</span>
            </div>
            <div className="nl-trust-pill">
              <Star size={14} fill="currentColor" />
              <span>Over 10,000+ Luxury Home Makeovers Across India</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TEMPLATE HERO HEADER (ADAPTS TO CHOSEN THEME)                          */}
        {/* ========================================================================= */}
        <header className="nl-hero-header pkg-hero-header">
          <div className="nl-hero-glow" aria-hidden="true" />
          <div className="nl-hero-content">
            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-1.5 text-xs opacity-80 mb-3 uppercase tracking-wider">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={12} />
              <Link to="/shop" className="hover:text-white transition-colors">Interior Design</Link>
              <ChevronRight size={12} />
              <span className="font-semibold" style={{ color: 'var(--hero-accent-color)' }}>
                Decor & Nursery Packages
              </span>
            </div>

            <div className="nl-hero-top-row">
              <div>
                <div className="nl-hero-badge">
                  <Sparkles size={13} />
                  <span>Turnkey All-in-One Decor • Bespoke Sanctuary Packages</span>
                </div>
                <h1 className="nl-hero-title">
                  Home Decor & Living Nursery Packages
                </h1>
                <p className="nl-hero-subtitle">
                  Elevate your residence with turnkey packages combining custom architectural wallpapers, artisan solid wood furniture, and lush nursery landscaping. Choose curated tiers or design a custom combo.
                </p>

                {/* Package Mode Switcher */}
                <div className="pkg-switcher-bar">
                  <button
                    type="button"
                    onClick={() => setActiveTab('predefined')}
                    className={`pkg-switcher-tab ${activeTab === 'predefined' ? 'active' : ''}`}
                  >
                    <Package size={14} />
                    <span>Curated Packages (Basic, Standard, Pro)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('custom')}
                    className={`pkg-switcher-tab ${activeTab === 'custom' ? 'active' : ''}`}
                  >
                    <Sliders size={14} />
                    <span>Design Your Combo Package (Min. ₹3,000)</span>
                  </button>

                  <Link
                    to="/nursery-customizer"
                    className="pkg-switcher-tab"
                    title="Launch 3D Botanical Customizer Studio"
                  >
                    <Leaf size={14} />
                    <span>Open 3D Nursery Studio</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 3. SECTION CONTENT (STANDARD CONTAINER)                                   */}
        {/* ========================================================================= */}
        <div className="pkg-page-container py-12">
          
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: PREDEFINED CURATED PACKAGES (BASIC, STANDARD, PREMIUM) */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'predefined' && (
            <section>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <span 
                  className="text-xs uppercase tracking-widest font-bold block mb-1"
                  style={{ color: 'var(--accent)' }}
                >
                  Turnkey Sanctuary Tiers
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[var(--text-main)] m-0">
                  Select the Ideal Package for Your Residence
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2">
                  Every package combines high-end interior wall art and furnishings with thriving botanical nursery greenery.
                </p>
              </div>

              <div className="pkg-grid">
                {PREDEFINED_PACKAGES.map(pkg => (
                  <div
                    key={pkg.id}
                    className={`pkg-card ${pkg.isPopular ? 'pkg-card-popular' : ''}`}
                  >
                    {pkg.badge && (
                      <span className={`pkg-badge ${pkg.isPopular ? 'pkg-badge-popular' : ''}`}>
                        {pkg.badge}
                      </span>
                    )}

                    <div>
                      <span className="pkg-tier-label">{pkg.tier} TIER</span>
                      <h3 className="pkg-title">{pkg.name}</h3>
                      <p className="pkg-tagline">{pkg.tagline}</p>

                      <div className="pkg-price-row">
                        <span className="pkg-price-current">
                          ₹{pkg.price.toLocaleString('en-IN')}
                        </span>
                        <span className="pkg-price-mrp">
                          ₹{pkg.originalPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="pkg-price-save">
                          Save ₹{(pkg.originalPrice - pkg.price).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Home Decor Inclusions */}
                      <div className="pkg-feature-group">
                        <h4 className="pkg-feature-title">
                          <Home size={14} />
                          <span>Home Decor Package:</span>
                        </h4>
                        <ul className="pkg-feature-list">
                          {pkg.homeDecorFeatures.map((feat, idx) => (
                            <li key={idx} className="pkg-feature-item">
                              <Check size={14} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Nursery Decor Inclusions */}
                      <div className="pkg-feature-group">
                        <h4 className="pkg-feature-title">
                          <Leaf size={14} />
                          <span>Nursery Decor Package:</span>
                        </h4>
                        <ul className="pkg-feature-list">
                          {pkg.nurseryFeatures.map((feat, idx) => (
                            <li key={idx} className="pkg-feature-item">
                              <Check size={14} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Services & Warranty */}
                      <div className="pkg-feature-group">
                        <h4 className="pkg-feature-title">
                          <ShieldCheck size={14} />
                          <span>Execution & Warranty:</span>
                        </h4>
                        <ul className="pkg-feature-list">
                          {pkg.servicesIncluded.map((feat, idx) => (
                            <li key={idx} className="pkg-feature-item">
                              <CheckCircle2 size={13} />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Limited Services Notice for Basic Tier */}
                      {pkg.limitedServicesNotice && (
                        <div className="pkg-limited-notice">
                          <Info size={14} className="shrink-0 mt-0.5 text-amber-600" />
                          <span>{pkg.limitedServicesNotice}</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleBookPredefined(pkg)}
                      className={`pkg-btn-book ${pkg.isPopular ? 'pkg-btn-book-popular' : ''}`}
                    >
                      <span>Book {pkg.name}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: CUSTOM COMBO BUILDER (PARALLEL 2-COLUMN LAYOUT)        */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'custom' && (
            <section>
              <div className="pkg-combo-intro">
                <span 
                  className="text-xs font-bold uppercase tracking-wider block mb-1"
                  style={{ color: 'var(--accent)' }}
                >
                  Interactive Combo Customizer
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[var(--text-main)] m-0">
                  Design Your Own Decor & Nursery Package
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 max-w-3xl leading-relaxed">
                  Select your bespoke interior elements on the left, while your live package summary, threshold qualification, and itemized totals update in real-time on the right.
                </p>
              </div>

              {/* 2-COLUMN PARALLEL LAYOUT: Left Steps + Right Sticky Summary */}
              <div className="pkg-combo-layout">
                
                {/* ======================================================== */}
                {/* LEFT COLUMN: Plan & Component Selection Steps            */}
                {/* ======================================================== */}
                <div className="pkg-combo-main space-y-10">
                  
                  {/* Step 1: Home Decor */}
                  <div>
                    <div className="pkg-step-heading">
                      <Home size={18} />
                      <h3>Step 1: Choose Home Decoration Elements</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {COMBO_CATALOG.filter(c => c.category === 'home').map(item => {
                        const isSelected = !!selectedItems[item.id];
                        const qty = selectedItems[item.id] || 0;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleItem(item.id)}
                            className={`pkg-combo-card ${isSelected ? 'selected' : ''}`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border)]">
                                  {item.tag}
                                </span>
                                <div className="pkg-combo-check">
                                  {isSelected && <Check size={13} />}
                                </div>
                              </div>
                              <h4 className="font-serif text-sm font-semibold text-[var(--text-main)] m-0">
                                {item.name}
                              </h4>
                              <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[var(--border-light)] flex items-center justify-between">
                              <span className="font-serif font-bold text-[var(--text-main)] text-base">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>

                              {isSelected && (
                                <div 
                                  className="flex items-center gap-2 bg-white border border-[var(--border)] rounded-lg p-0.5 shadow-xs"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, -1)}
                                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-[var(--text-main)]"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="text-xs font-bold w-4 text-center text-[var(--text-main)]">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-[var(--text-main)]"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Nursery Botanical Decor */}
                  <div>
                    <div className="pkg-step-heading">
                      <Leaf size={18} />
                      <h3>Step 2: Choose Nursery Decor & Botanical Plants</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {COMBO_CATALOG.filter(c => c.category === 'nursery').map(item => {
                        const isSelected = !!selectedItems[item.id];
                        const qty = selectedItems[item.id] || 0;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleItem(item.id)}
                            className={`pkg-combo-card ${isSelected ? 'selected' : ''}`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border)]">
                                  {item.tag}
                                </span>
                                <div className="pkg-combo-check">
                                  {isSelected && <Check size={13} />}
                                </div>
                              </div>
                              <h4 className="font-serif text-sm font-semibold text-[var(--text-main)] m-0">
                                {item.name}
                              </h4>
                              <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[var(--border-light)] flex items-center justify-between">
                              <span className="font-serif font-bold text-[var(--text-main)] text-base">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>

                              {isSelected && (
                                <div 
                                  className="flex items-center gap-2 bg-white border border-[var(--border)] rounded-lg p-0.5 shadow-xs"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, -1)}
                                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-[var(--text-main)]"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="text-xs font-bold w-4 text-center text-[var(--text-main)]">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-[var(--text-main)]"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Professional Execution, Plumbing & Plant Care */}
                  <div>
                    <div className="pkg-step-heading">
                      <ShieldCheck size={18} />
                      <h3>Step 3: Professional Execution, Plumbing & Plant Care</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {COMBO_CATALOG.filter(c => c.category === 'service').map(item => {
                        const isSelected = !!selectedItems[item.id];
                        const qty = selectedItems[item.id] || 0;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleItem(item.id)}
                            className={`pkg-combo-card ${isSelected ? 'selected' : ''}`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-main)] border border-[var(--border)]">
                                  {item.tag}
                                </span>
                                <div className="pkg-combo-check">
                                  {isSelected && <Check size={13} />}
                                </div>
                              </div>
                              <h4 className="font-serif text-sm font-semibold text-[var(--text-main)] m-0">
                                {item.name}
                              </h4>
                              <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                                {item.description}
                              </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-[var(--border-light)] flex items-center justify-between">
                              <span className="font-serif font-bold text-[var(--text-main)] text-base">
                                ₹{item.price.toLocaleString('en-IN')}
                              </span>

                              {isSelected && (
                                <div 
                                  className="flex items-center gap-2 bg-white border border-[var(--border)] rounded-lg p-0.5 shadow-xs"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, -1)}
                                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-[var(--text-main)]"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="text-xs font-bold w-4 text-center text-[var(--text-main)]">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-[var(--text-main)]"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* ======================================================== */}
                {/* RIGHT COLUMN: Sticky Parallel Summary Sidebar            */}
                {/* ======================================================== */}
                <aside className="pkg-combo-sidebar">
                  <div className="pkg-summary-sticky-card">
                    {/* Header */}
                    <div className="pkg-summary-header">
                      <div className="pkg-summary-icon">
                        <Package size={22} />
                      </div>
                      <div>
                        <h3 className="pkg-summary-title">Custom Sanctuary Combo</h3>
                        <span className="pkg-summary-count">
                          {selectedItemsList.length} element{selectedItemsList.length === 1 ? '' : 's'} selected
                        </span>
                      </div>
                    </div>

                    {/* Minimum Threshold Requirement Box */}
                    <div className={`pkg-summary-threshold ${isThresholdMet ? 'unlocked' : 'locked'}`}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{isThresholdMet ? 'Threshold Unlocked' : 'Minimum ₹3,000 Order'}</span>
                        <span>₹{comboTotal.toLocaleString('en-IN')} / ₹3,000</span>
                      </div>
                      <div className="pkg-threshold-bar-bg">
                        <div 
                          className="pkg-threshold-bar-fill" 
                          style={{
                            width: `${Math.min(100, (comboTotal / MIN_COMBO_THRESHOLD) * 100)}%`,
                            background: isThresholdMet ? 'var(--brand-sage, #15803D)' : '#F59E0B'
                          }}
                        />
                      </div>
                      <p className="text-[11px] mt-2 m-0 opacity-90 leading-tight">
                        {isThresholdMet 
                          ? '✨ Valid combo. Eligible for instant booking with ₹3,000+ privilege warranty.'
                          : `⚠️ Add ₹${(MIN_COMBO_THRESHOLD - comboTotal).toLocaleString('en-IN')} more to unlock package booking.`}
                      </p>
                    </div>

                    {/* Itemized Picked Components */}
                    <div className="mb-2">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                        Selected Components:
                      </span>
                      {selectedItemsList.length === 0 ? (
                        <p className="text-xs text-[var(--text-muted)] italic py-3 text-center">
                          No items picked. Select items on the left to build your combo.
                        </p>
                      ) : (
                        <div className="pkg-picked-items-list">
                          {selectedItemsList.map(item => (
                            <div key={item.id} className="pkg-picked-item-row">
                              <div className="min-w-0 flex-1">
                                <div className="pkg-picked-item-title truncate">{item.name}</div>
                                <div className="pkg-picked-item-tag">{item.tag} • ₹{item.price.toLocaleString('en-IN')} ea</div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(item.id, -1)}
                                  className="w-5 h-5 flex items-center justify-center rounded bg-white border border-slate-200 text-xs text-slate-700 hover:bg-slate-100"
                                >
                                  -
                                </button>
                                <span className="font-bold text-xs w-3 text-center">{item.qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(item.id, 1)}
                                  className="w-5 h-5 flex items-center justify-center rounded bg-white border border-slate-200 text-xs text-slate-700 hover:bg-slate-100"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleItem(item.id)}
                                  className="pkg-picked-item-del ml-1"
                                  title="Remove item"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cost Breakdown Table */}
                    <div className="pkg-breakdown-table">
                      <div className="pkg-breakdown-row">
                        <span>Home Decor Elements</span>
                        <span>₹{homeSubtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pkg-breakdown-row">
                        <span>Nursery Foliage & Planters</span>
                        <span>₹{nurserySubtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pkg-breakdown-row">
                        <span>Execution & Care Services</span>
                        <span>₹{servicesSubtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="pkg-breakdown-row">
                        <span>Site Survey & CAD Layout</span>
                        <span className="text-emerald-600 font-semibold">FREE (Package Perk)</span>
                      </div>
                      <div className="pkg-breakdown-row total">
                        <span>Total Combo Package</span>
                        <span className="total-amount">₹{comboTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Booking Action Button */}
                    <button
                      type="button"
                      onClick={handleBookCustomCombo}
                      disabled={!isThresholdMet}
                      className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        isThresholdMet
                          ? 'pkg-btn-book-popular shadow-md cursor-pointer scale-101'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>{isThresholdMet ? 'Book Custom Combo Package' : `Add ₹${MIN_COMBO_THRESHOLD - comboTotal} More to Book`}</span>
                      <ArrowRight size={14} />
                    </button>

                    {/* Guarantees & Perks */}
                    <div className="pkg-summary-perks">
                      <div className="pkg-summary-perk-item">
                        <ShieldCheck size={13} />
                        <span>White-glove doorstep delivery & professional setup</span>
                      </div>
                      <div className="pkg-summary-perk-item">
                        <Leaf size={13} />
                        <span>60-day living plant health & replacement warranty</span>
                      </div>
                    </div>

                  </div>
                </aside>

              </div>
            </section>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
