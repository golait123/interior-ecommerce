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
  Clock, 
  Star, 
  Compass, 
  Layers, 
  CheckCircle2, 
  Info,
  Calendar,
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
  image?: string;
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

  // Calculate combo total price
  const comboTotal = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const item = COMBO_CATALOG.find(i => i.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
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
    // Add to cart as a bespoke commission package
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

      <main className="py-8">
        {/* ========================================================================= */}
        {/* HERO BANNER: ALL-IN-ONE HOME DECOR & NURSERY PACKAGES                     */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0F2444] via-[#16335f] to-[#1e467d] text-white p-8 sm:p-12 shadow-xl border border-white/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#38BDF8] text-xs font-semibold uppercase tracking-widest mb-4">
                <Sparkles size={14} />
                <span>Interior Decor + Botanical Nursery Combos</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-white m-0">
                Turnkey Decor & Living Garden Packages
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-200 font-light leading-relaxed">
                Elevate your home with seamless packages combining custom architectural wallpapers, artisan furniture, and lush nursery landscaping. Choose our curated tiers or craft a custom combo.
              </p>

              {/* Package Mode Switcher */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('predefined')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    activeTab === 'predefined'
                      ? 'bg-white text-[#0F2444] shadow-lg scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <Package size={15} />
                  <span>Curated Packages (Basic, Standard, Pro)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('custom')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    activeTab === 'custom'
                      ? 'bg-white text-[#0F2444] shadow-lg scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <Sliders size={15} />
                  <span>Design Your Combo Package (Min. ₹3,000)</span>
                </button>

                <Link
                  to="/nursery-customizer"
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#38BDF8] hover:text-white border border-[#38BDF8]/40 hover:border-white/60 transition-colors inline-flex items-center gap-1.5 ml-auto"
                >
                  <span>3D Bespoke Nursery Studio</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* VIEW 1: PREDEFINED PACKAGES (BASIC, STANDARD, PREMIUM)                    */}
        {/* ========================================================================= */}
        {activeTab === 'predefined' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#0284C7]">
                Architectural & Botanical Tiers
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 mt-1">
                Choose the Sanctuary Tier for Your Residence
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Every package combines high-end interior surfaces with thriving biophilic nursery greenery.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {PREDEFINED_PACKAGES.map(pkg => (
                <div
                  key={pkg.id}
                  className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
                    pkg.isPopular
                      ? 'border-[#0284C7] shadow-xl ring-2 ring-[#0284C7]/20 bg-gradient-to-b from-white to-[#f0f9ff]'
                      : 'border-slate-200 shadow-sm bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {pkg.badge && (
                    <div className="absolute top-4 right-4">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${
                        pkg.isPopular ? 'bg-[#0284C7] text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                      {pkg.tier} TIER
                    </span>
                    <h3 className="text-2xl font-serif font-medium text-slate-900 mt-1 m-0">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed min-h-[36px]">
                      {pkg.tagline}
                    </p>

                    <div className="mt-5 pb-5 border-b border-slate-100 flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
                        ₹{pkg.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm text-slate-400 line-through">
                        ₹{pkg.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded ml-auto">
                        Save ₹{(pkg.originalPrice - pkg.price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Home Decor Inclusions */}
                    <div className="mt-6">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
                        <Home size={14} className="text-[#0284C7]" />
                        <span>Home Decor Package Features:</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {pkg.homeDecorFeatures.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Nursery Decor Inclusions */}
                    <div className="mt-6">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
                        <Leaf size={14} className="text-emerald-600" />
                        <span>Nursery Decor Package Features:</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {pkg.nurseryFeatures.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Services & Warranty */}
                    <div className="mt-6">
                      <h4 className="text-xs uppercase tracking-wider font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
                        <ShieldCheck size={14} className="text-sky-600" />
                        <span>Execution & Warranty:</span>
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {pkg.servicesIncluded.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 size={13} className="text-sky-600 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limited Services Notice for Basic User */}
                    {pkg.limitedServicesNotice && (
                      <div className="mt-6 p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2 leading-relaxed">
                        <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                        <span>{pkg.limitedServicesNotice}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:p-8 pt-0">
                    <button
                      type="button"
                      onClick={() => handleBookPredefined(pkg)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
                        pkg.isPopular
                          ? 'bg-[#0F2444] hover:bg-[#16335f] text-white shadow-md hover:shadow-lg'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>Book {pkg.name}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CUSTOM COMBO BUILDER (MINIMUM ₹3,000 THRESHOLD)                   */}
        {/* ========================================================================= */}
        {activeTab === 'custom' && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-10 mb-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-2">
                  <Sliders size={13} />
                  <span>Design Your Custom Combo Package</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 m-0">
                  Pick & Pair Home Decor with Living Nursery Elements
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2">
                  Select your desired accent walls, artisan furniture, and biological plants. Minimum combo booking total must be <span className="font-semibold text-slate-900">greater than ₹3,000</span> for bundled logistics and professional setup.
                </p>
              </div>

              {/* Threshold Banner */}
              <div className={`mt-6 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                isThresholdMet 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div className="flex items-start gap-3">
                  {isThresholdMet ? (
                    <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider m-0">
                      {isThresholdMet ? 'Minimum Order Threshold Met!' : 'Minimum Combo Value: ₹3,000 Required'}
                    </h4>
                    <p className="text-xs mt-0.5 opacity-90 m-0">
                      {isThresholdMet 
                        ? `Your current combo total is ₹${comboTotal.toLocaleString('en-IN')}. Eligible for combined white-glove delivery & installation.` 
                        : `Your current total is ₹${comboTotal.toLocaleString('en-IN')}. Please add ₹${(MIN_COMBO_THRESHOLD - comboTotal).toLocaleString('en-IN')} more to book this custom package.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Combo Total</span>
                    <span className="text-2xl font-serif font-bold text-slate-900">
                      ₹{comboTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleBookCustomCombo}
                    disabled={!isThresholdMet}
                    className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
                      isThresholdMet
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>{isThresholdMet ? 'Book Combo Package' : `Add ₹${MIN_COMBO_THRESHOLD - comboTotal} More`}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* SELECTION CATALOG TABS */}
            <div className="space-y-10">
              
              {/* Category A: Home Decor Options */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-5">
                  <Home size={18} className="text-[#0284C7]" />
                  <h3 className="font-serif text-lg font-medium text-slate-900 m-0">
                    Step 1: Choose Home Decoration Elements
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {COMBO_CATALOG.filter(c => c.category === 'home').map(item => {
                    const isSelected = !!selectedItems[item.id];
                    const qty = selectedItems[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-sky-50/60 border-sky-400 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {item.tag}
                            </span>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                              isSelected ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check size={12} />}
                            </div>
                          </div>
                          <h4 className="font-serif text-sm font-semibold text-slate-900 m-0">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="font-serif font-bold text-slate-900 text-base">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>

                          {isSelected && (
                            <div 
                              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, -1)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, 1)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600"
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

              {/* Category B: Nursery Botanical Options */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-5">
                  <Leaf size={18} className="text-emerald-600" />
                  <h3 className="font-serif text-lg font-medium text-slate-900 m-0">
                    Step 2: Choose Nursery Decor & Plant Elements
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {COMBO_CATALOG.filter(c => c.category === 'nursery').map(item => {
                    const isSelected = !!selectedItems[item.id];
                    const qty = selectedItems[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-emerald-50/60 border-emerald-400 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800">
                              {item.tag}
                            </span>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                              isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check size={12} />}
                            </div>
                          </div>
                          <h4 className="font-serif text-sm font-semibold text-slate-900 m-0">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="font-serif font-bold text-slate-900 text-base">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>

                          {isSelected && (
                            <div 
                              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, -1)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, 1)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600"
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

              {/* Category C: Professional White-Glove Add-Ons */}
              <div>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-5">
                  <ShieldCheck size={18} className="text-sky-600" />
                  <h3 className="font-serif text-lg font-medium text-slate-900 m-0">
                    Step 3: Add Professional Execution & Care
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {COMBO_CATALOG.filter(c => c.category === 'service').map(item => {
                    const isSelected = !!selectedItems[item.id];
                    const qty = selectedItems[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem(item.id)}
                        className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-slate-100/90 border-slate-400 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                              {item.tag}
                            </span>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                              isSelected ? 'bg-slate-800 border-slate-800 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check size={12} />}
                            </div>
                          </div>
                          <h4 className="font-serif text-sm font-semibold text-slate-900 m-0">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="font-serif font-bold text-slate-900 text-base">
                            ₹{item.price.toLocaleString('en-IN')}
                          </span>

                          {isSelected && (
                            <div 
                              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, -1)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{qty}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, 1)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600"
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

            {/* STICKY BOTTOM CHECKOUT TRAY FOR COMBO */}
            <div className="sticky bottom-6 mt-12 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300 p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Package size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-semibold text-slate-900">
                      Custom Sanctuary Combo Summary
                    </span>
                    <span className="text-xs text-slate-400">
                      ({Object.keys(selectedItems).length} elements picked)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 m-0">
                    {isThresholdMet 
                      ? '✨ Valid combo. Eligible for instant booking with ₹3,000+ privilege warranty.' 
                      : `⚠️ Total is below ₹3,000 threshold. Add ₹${(MIN_COMBO_THRESHOLD - comboTotal).toLocaleString('en-IN')} more to proceed.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Combo Package Total</span>
                  <span className="text-2xl font-serif font-bold text-slate-900">
                    ₹{comboTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleBookCustomCombo}
                  disabled={!isThresholdMet}
                  className={`px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all ${
                    isThresholdMet
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg scale-102 cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{isThresholdMet ? 'Book Custom Combo' : `Add ₹${MIN_COMBO_THRESHOLD - comboTotal} More`}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}
