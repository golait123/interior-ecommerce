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
import { 
  NURSERY_MAIN_MENU, 
  NURSERY_PRODUCT_TYPES, 
  NURSERY_CATALOG_PRODUCTS 
} from '../data/nurseryCategories';
import { 
  Sparkles, 
  Wind, 
  HeartHandshake, 
  Droplets, 
  SunMedium, 
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Leaf,
  Copy,
  Check,
  ShieldCheck,
  Percent,
  LayoutGrid,
  List,
  Minus,
  Plus,
  Gift,
  X,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Gardening() {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Voucher Copy State
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  // Free Plant Modal State
  const [showFreePlantModal, setShowFreePlantModal] = useState(false);

  // Nursery Main Menu states
  const [activeMenuDropdown, setActiveMenuDropdown] = useState<string | null>(null);
  const [selectedMainMenuCat, setSelectedMainMenuCat] = useState<string | null>(null);
  const [selectedSubCat, setSelectedSubCat] = useState<string | null>(null);

  // Filter Sidebar states (Screenshot 1)
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under-300' | '300-500' | '500-1000' | 'above-1000'>('all');

  // Accordion toggle states (- / + toggles)
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(true);
  const [isProductTypeOpen, setIsProductTypeOpen] = useState(true);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);

  // Toolbar states (Screenshot 1)
  const [sortBy, setSortBy] = useState<string>('best-selling');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch backend products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-gardening-catalog'],
    queryFn: () => productsApi.list({ limit: 50 })
  });

  const apiProducts = productsData?.items || [];

  // Filter botanical products from DB
  const dbOutdoorProducts = useMemo(() => {
    return apiProducts.filter(p => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.type}`.toLowerCase();
      const slugs = p.spaceSlugs || p.spaces?.map(s => s.slug) || [];
      return (
        p.primaryDomain === 'outdoor' || 
        slugs.includes('outdoor') || 
        slugs.includes('balcony') || 
        slugs.includes('lawn-garden') || 
        slugs.includes('home-nursery') ||
        text.includes('plant') || 
        text.includes('garden') || 
        text.includes('pot') || 
        text.includes('planter')
      );
    });
  }, [apiProducts]);

  // Combined Master Catalog: Authentic items from Screenshot 1 & 2-5 + DB products
  const masterNurseryCatalog = useMemo(() => {
    const combined = [...NURSERY_CATALOG_PRODUCTS];
    dbOutdoorProducts.forEach(dbp => {
      if (!combined.some(c => c.name.toLowerCase() === dbp.name.toLowerCase())) {
        combined.push({
          ...dbp,
          productType: dbp.type === 'HOME_DECOR' ? 'Planters' : 'Plants',
          rating: 4.8,
          reviewCount: 35,
          offerText: dbp.discountPrice ? 'Save 15%' : undefined,
          inStock: true
        });
      }
    });
    return combined;
  }, [dbOutdoorProducts]);

  // Filter logic
  const filteredProducts = useMemo(() => {
    let result = [...masterNurseryCatalog];

    // Filter by Main Menu Category
    if (selectedMainMenuCat) {
      result = result.filter(p => {
        const text = `${p.name} ${p.description} ${p.category?.slug || ''} ${p.productType || ''}`.toLowerCase();
        if (selectedMainMenuCat === 'gardening') {
          return text.includes('pack') || text.includes('garden') || text.includes('kit') || text.includes('lawn');
        }
        if (selectedMainMenuCat === 'plants') {
          return text.includes('plant') || text.includes('foliage') || text.includes('sansevieria') || text.includes('pothos');
        }
        if (selectedMainMenuCat === 'seeds') {
          return text.includes('seed') || text.includes('herb');
        }
        if (selectedMainMenuCat === 'bulbs') {
          return text.includes('bulb') || text.includes('lily') || text.includes('ranunculus');
        }
        if (selectedMainMenuCat === 'planters') {
          return text.includes('pot') || text.includes('planter') || text.includes('vase') || text.includes('tray') || text.includes('stand');
        }
        if (selectedMainMenuCat === 'soil-fertilizer') {
          return text.includes('soil') || text.includes('fertilizer') || text.includes('vermicompost') || text.includes('cocopeat');
        }
        if (selectedMainMenuCat === 'gifts') {
          return text.includes('gift') || text.includes('lucky') || text.includes('jade') || text.includes('bonsai');
        }
        return true;
      });
    }

    // Filter by SubCategory
    if (selectedSubCat) {
      const keyword = selectedSubCat.replace(/-/g, ' ');
      result = result.filter(p => {
        const text = `${p.name} ${p.description}`.toLowerCase();
        return text.includes(keyword.split(' ')[0]);
      });
    }

    // Filter by Product Type Checkboxes (Screenshot 1)
    if (selectedProductTypes.length > 0) {
      result = result.filter(p => {
        if (!p.productType) return false;
        return selectedProductTypes.includes(p.productType);
      });
    }

    // Filter by Availability (Screenshot 1)
    if (selectedAvailability === 'in-stock') {
      result = result.filter(p => p.inStock !== false);
    } else if (selectedAvailability === 'out-of-stock') {
      result = result.filter(p => p.inStock === false);
    }

    // Filter by Price Bracket
    if (priceFilter === 'under-300') {
      result = result.filter(p => Number(p.discountPrice || p.price) < 300);
    } else if (priceFilter === '300-500') {
      result = result.filter(p => {
        const price = Number(p.discountPrice || p.price);
        return price >= 300 && price <= 500;
      });
    } else if (priceFilter === '500-1000') {
      result = result.filter(p => {
        const price = Number(p.discountPrice || p.price);
        return price > 500 && price <= 1000;
      });
    } else if (priceFilter === 'above-1000') {
      result = result.filter(p => Number(p.discountPrice || p.price) > 1000);
    }

    // Sort by options (Screenshot 1)
    if (sortBy === 'best-selling') {
      result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => Number(a.discountPrice || a.price) - Number(b.discountPrice || b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => Number(b.discountPrice || b.price) - Number(a.discountPrice || a.price));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'featured') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [
    masterNurseryCatalog, 
    selectedMainMenuCat, 
    selectedSubCat, 
    selectedProductTypes, 
    selectedAvailability, 
    priceFilter, 
    sortBy
  ]);

  const handleProductTypeToggle = (type: string) => {
    setSelectedProductTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleClearAllFilters = () => {
    setSelectedMainMenuCat(null);
    setSelectedSubCat(null);
    setSelectedProductTypes([]);
    setSelectedAvailability('all');
    setPriceFilter('all');
    setSortBy('best-selling');
  };

  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${product.name} to cart!`);
    } catch {
      toast.error('Unable to add item to cart.');
    }
  };

  const handleCopyVoucher = () => {
    navigator.clipboard.writeText('BOTANICALFREE');
    setCopiedVoucher(true);
    toast.success('✨ Voucher BOTANICALFREE copied to clipboard!');
    setTimeout(() => setCopiedVoucher(false), 3000);
  };

  const botanicalPillars = [
    {
      icon: <Wind className="text-[#38bdf8]" size={22} />,
      title: 'Active Air Purification',
      desc: 'NASA-evaluated foliage filtering benzene, formaldehyde, and airborne dust naturally inside urban homes.'
    },
    {
      icon: <HeartHandshake className="text-[#38bdf8]" size={22} />,
      title: 'Biophilic Stress Reduction',
      desc: 'Living botanical foliage scientifically proven to lower cortisol levels and elevate focus by 23% in living spaces.'
    },
    {
      icon: <Droplets className="text-[#38bdf8]" size={22} />,
      title: 'Natural Microclimate Cooling',
      desc: 'Transpiration through porous terracotta cools ambient temperatures by 2–4°C in summer months.'
    },
    {
      icon: <SunMedium className="text-[#38bdf8]" size={22} />,
      title: 'Breathable Terracotta Porosity',
      desc: 'Hand-thrown earthen clay breathes naturally, preventing root moisture stagnation without synthetic fertilizers.'
    }
  ];

  const hasActiveFilters = 
    selectedMainMenuCat !== null || 
    selectedSubCat !== null || 
    selectedProductTypes.length > 0 || 
    selectedAvailability !== 'all' || 
    priceFilter !== 'all';

  return (
    <div className="page-wrapper bg-white">
      <Header />

      <main>
        {/* ========================================================================= */}
        {/* 1. BOTANICAL HERO BANNER: IMAGE ON LEFT, OFFERS RIGHT, VOUCHER DOWN SIDE */}
        {/* ========================================================================= */}
        <section className="hero-split-banner" aria-label="Botanical Sanctuaries & Nursery Banner">
          <div className="hero-split-stage">
            <div className="hero-split-panel active">
              {/* TOP ROW: IMAGE ON LEFT & OFFERS DETAIL ON RIGHT */}
              <div className="hero-split-main">
                {/* LEFT: IMAGE SHOWCASE */}
                <div className="hero-split-left">
                  <div className="hero-split-img-wrapper">
                    <img 
                      src="/images/outdoor-garden.jpg" 
                      alt="Lush Botanical Garden & Nursery Design Sanctuary" 
                      className="hero-split-img"
                      loading="eager"
                    />
                    <div className="hero-split-img-tag">
                      <Leaf size={12} className="text-emerald-400" />
                      <span>Botanical Living Studio</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT: OFFERS DETAIL */}
                <div className="hero-split-right">
                  <div className="hero-split-badges">
                    <span className="hero-split-badge-tag">
                      <Leaf size={13} style={{ color: '#38bdf8' }} />
                      <span>Living Nature Sanctuary • Air-Purifying Greens</span>
                    </span>
                    <span className="hero-split-discount-pill">
                      <Percent size={12} />
                      <span>Complimentary Planter with ₹4,999</span>
                    </span>
                  </div>

                  <h1 className="hero-split-title">
                    Botanical Sanctuaries & Garden Decor
                    <span className="hero-split-highlight">
                      • Complimentary Planter
                    </span>
                  </h1>

                  <p className="hero-split-desc">
                    Air-purifying nursery greens in handcrafted artisanal fluted ceramic & unglazed terracotta planters. Delivered potted, nourished, and fully acclimated across India.
                  </p>

                  {/* Trust Perks Strip */}
                  <div className="hero-split-perks">
                    <span className="hero-split-perk">
                      <Leaf size={14} className="hero-split-perk-icon" />
                      <span>Air-Purifying Certified Greens</span>
                    </span>
                    <span className="hero-split-perk">
                      <Sparkles size={14} className="hero-split-perk-icon" />
                      <span>Delivered Potted & Acclimated</span>
                    </span>
                    <span className="hero-split-perk">
                      <ShieldCheck size={14} className="hero-split-perk-icon" />
                      <span>14-Day Plant Health Guarantee</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* DOWN SIDE OF BANNER: VOUCHER CODE & RESPECTIVE BUTTON */}
              <div className="hero-split-bottom-bar">
                {/* Voucher Box with 1-Click Copy */}
                <div className="hero-split-voucher-box">
                  <div className="hero-split-voucher-meta">
                    <span className="hero-split-voucher-label">
                      Botanical Privilege Voucher
                    </span>
                    <span className="hero-split-voucher-code">
                      BOTANICALFREE
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyVoucher}
                    className="hero-split-copy-btn"
                    title="Copy voucher code"
                    aria-label="Copy voucher code BOTANICALFREE"
                  >
                    {copiedVoucher ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span>{copiedVoucher ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                {/* Respective Action Button */}
                <div className="hero-split-cta-wrapper flex items-center gap-3">
                  <Link to="/nursery-customizer" className="hero-split-btn bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    <Sparkles size={15} />
                    <span>Customize Your Nursery</span>
                  </Link>
                  <a href="#nursery-store" className="hero-split-btn">
                    <span>Shop Nursery Catalog</span>
                    <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. BESPOKE NURSERY CUSTOMIZATION SHOWCASE BANNER                          */}
        {/* ========================================================================= */}
        <section className="gardening-customizer-section">
          <div className="gardening-customizer-banner">
            <div className="gardening-customizer-bg-glow" aria-hidden="true" />
            <div className="gardening-customizer-bg-dots" aria-hidden="true" />
            
            <div className="gardening-customizer-content">
              <span className="gardening-customizer-pill">
                <Sparkles size={13} />
                <span>Customer Choice Nursery Customization</span>
              </span>
              <h2 className="gardening-customizer-title">
                Design Your Complete Bespoke Nursery
              </h2>
              <p className="gardening-customizer-desc">
                Choose your exact space layout (Balcony, Terrace, Verandah, or Corner), custom dimensions, microclimate sunlight, curated NASA foliage, terracotta or ceramic pottery finishes, and automated irrigation.
              </p>
              
              <div className="gardening-customizer-perks">
                <span className="gardening-customizer-perk">
                  <Check size={14} className="text-emerald-400" /> Custom Dimensions
                </span>
                <span className="gardening-customizer-perk">
                  <Check size={14} className="text-emerald-400" /> Tailored Plant Palettes
                </span>
                <span className="gardening-customizer-perk">
                  <Check size={14} className="text-emerald-400" /> Hand-thrown Terracotta
                </span>
                <span className="gardening-customizer-perk">
                  <Check size={14} className="text-emerald-400" /> Live Instant ₹ Quote
                </span>
              </div>
            </div>

            <div className="gardening-customizer-btn-wrap">
              <Link
                to="/nursery-customizer"
                className="gardening-customizer-btn"
              >
                <span>Launch Nursery Studio</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. NURSERY MAIN MENU (SCREENSHOTS 2, 3, 4, 5 CATEGORIES BAR)              */}
        {/* ========================================================================= */}
        <section id="nursery-store" className="nursery-menu-bar sticky top-0 z-30 shadow-xs">
          <div className="max-w-[1440px] mx-auto px-4">
            <div className="nursery-menu-list">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 mr-2 flex items-center gap-1.5 flex-shrink-0">
                <Leaf size={14} className="text-emerald-600" />
                Main Menu:
              </span>

              {NURSERY_MAIN_MENU.map(cat => {
                const isSelected = selectedMainMenuCat === cat.slug;
                const isDropdownOpen = activeMenuDropdown === cat.slug;

                return (
                  <div 
                    key={cat.id} 
                    className="relative"
                    onMouseEnter={() => setActiveMenuDropdown(cat.slug)}
                    onMouseLeave={() => setActiveMenuDropdown(null)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedMainMenuCat === cat.slug) {
                          setSelectedMainMenuCat(null);
                          setSelectedSubCat(null);
                        } else {
                          setSelectedMainMenuCat(cat.slug);
                          setSelectedSubCat(null);
                        }
                      }}
                      className={`nursery-menu-item-btn ${isSelected ? 'active' : ''}`}
                    >
                      <span>{cat.name}</span>
                      <ChevronDown size={13} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Mega Dropdown for Subcategories */}
                    {isDropdownOpen && (
                      <div className="nursery-menu-dropdown">
                        <div className="col-span-full pb-2 mb-2 border-b border-stone-100 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-emerald-800 tracking-wider">
                            Explore {cat.name} Categories
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMainMenuCat(cat.slug);
                              setSelectedSubCat(null);
                              setActiveMenuDropdown(null);
                            }}
                            className="text-xs text-stone-500 hover:text-emerald-700 underline font-medium"
                          >
                            View All in {cat.name}
                          </button>
                        </div>

                        {cat.subcategories.map(sub => (
                          <div
                            key={sub.id}
                            onClick={() => {
                              setSelectedMainMenuCat(cat.slug);
                              setSelectedSubCat(sub.slug);
                              setActiveMenuDropdown(null);
                            }}
                            className={`nursery-dropdown-subitem ${selectedSubCat === sub.slug ? 'bg-emerald-50 text-emerald-800 font-semibold border-emerald-300' : ''}`}
                          >
                            <span>{sub.name}</span>
                            <span className="text-[11px] text-stone-400 font-mono">
                              ({sub.count || 25})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="ml-auto flex-shrink-0 text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-sm bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. NURSERY STORE CATALOG WITH LEFT FILTERS & SORTING (SCREENSHOT 1)        */}
        {/* ========================================================================= */}
        <section className="nursery-catalog-layout">
          {/* ======================================================================= */}
          {/* LEFT SIDEBAR: FILTERS (EXACT MATCH TO SCREENSHOT 1 & SCREENSHOTS 2-5)   */}
          {/* ======================================================================= */}
          <aside className="nursery-sidebar-filters">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-200">
              <h2 className="nursery-filter-heading m-0">Filters</h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-xs text-stone-500 hover:text-stone-900 underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>


            {/* Accordion 2: Product type (Exact match to Screenshot 1) */}
            <div className="nursery-filter-group">
              <button
                type="button"
                onClick={() => setIsProductTypeOpen(!isProductTypeOpen)}
                className="nursery-filter-group-header"
              >
                <span>Product type</span>
                {isProductTypeOpen ? <Minus size={15} /> : <Plus size={15} />}
              </button>

              {isProductTypeOpen && (
                <div className="pt-2 pl-1 space-y-1">
                  {NURSERY_PRODUCT_TYPES.map(pt => {
                    const isChecked = selectedProductTypes.includes(pt.name);
                    return (
                      <label key={pt.id} className="nursery-checkbox-item">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleProductTypeToggle(pt.name)}
                        />
                        <span>{pt.name}</span>
                        <span className="text-stone-400 text-xs ml-auto">
                          ({pt.count})
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accordion 3: Availability (Exact match to Screenshot 1) */}
            <div className="nursery-filter-group">
              <button
                type="button"
                onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
                className="nursery-filter-group-header"
              >
                <span>Availability</span>
                {isAvailabilityOpen ? <Minus size={15} /> : <Plus size={15} />}
              </button>

              {isAvailabilityOpen && (
                <div className="pt-2 pl-1 space-y-1">
                  <label className="nursery-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedAvailability === 'in-stock'}
                      onChange={() => setSelectedAvailability(selectedAvailability === 'in-stock' ? 'all' : 'in-stock')}
                    />
                    <span>In stock</span>
                    <span className="text-stone-400 text-xs ml-auto">(270)</span>
                  </label>
                  <label className="nursery-checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedAvailability === 'out-of-stock'}
                      onChange={() => setSelectedAvailability(selectedAvailability === 'out-of-stock' ? 'all' : 'out-of-stock')}
                    />
                    <span>Out of stock</span>
                    <span className="text-stone-400 text-xs ml-auto">(188)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Accordion 4: Price Filter */}
            <div className="nursery-filter-group border-none">
              <button
                type="button"
                onClick={() => setIsPriceOpen(!isPriceOpen)}
                className="nursery-filter-group-header"
              >
                <span>Price</span>
                {isPriceOpen ? <Minus size={15} /> : <Plus size={15} />}
              </button>

              {isPriceOpen && (
                <div className="pt-2 pl-1 space-y-1">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-300', label: 'Under ₹300' },
                    { id: '300-500', label: '₹300 - ₹500' },
                    { id: '500-1000', label: '₹500 - ₹1,000' },
                    { id: 'above-1000', label: 'Above ₹1,000' },
                  ].map(p => (
                    <label key={p.id} className="nursery-checkbox-item">
                      <input
                        type="radio"
                        name="price-bracket"
                        checked={priceFilter === p.id}
                        onChange={() => setPriceFilter(p.id as any)}
                        className="accent-emerald-700"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: TOOLBAR & PRODUCT GRID (SCREENSHOT 1)                     */}
          {/* ======================================================================= */}
          <div className="flex-1 w-full min-w-0">
            {/* Top Toolbar */}
            <div className="nursery-toolbar">
              <div className="flex flex-wrap items-center gap-4">
                {/* Category Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-600">Category</span>
                  <select
                    value={selectedSubCat ? `${selectedMainMenuCat}:${selectedSubCat}` : (selectedMainMenuCat || 'all')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'all') {
                        setSelectedMainMenuCat(null);
                        setSelectedSubCat(null);
                      } else if (val.includes(':')) {
                        const [cat, sub] = val.split(':');
                        setSelectedMainMenuCat(cat);
                        setSelectedSubCat(sub);
                      } else {
                        setSelectedMainMenuCat(val);
                        setSelectedSubCat(null);
                      }
                    }}
                    className="nursery-sort-select"
                  >
                    <option value="all">All Categories</option>
                    {NURSERY_MAIN_MENU.map(cat => (
                      <optgroup key={cat.id} label={cat.name}>
                        <option value={cat.slug}>All {cat.name}</option>
                        {cat.subcategories.map(sub => (
                          <option key={sub.id} value={`${cat.slug}:${sub.slug}`}>
                            {sub.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Sort By Dropdown (Screenshot 1: "Sort by Best selling") */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-600">Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="nursery-sort-select"
                  >
                    <option value="best-selling">Best selling</option>
                    <option value="featured">Featured</option>
                    <option value="price-low">Price, low to high</option>
                    <option value="price-high">Price, high to low</option>
                    <option value="name-asc">Alphabetically, A-Z</option>
                    <option value="name-desc">Alphabetically, Z-A</option>
                    <option value="date-new">Date, new to old</option>
                    <option value="date-old">Date, old to new</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {selectedMainMenuCat && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm">
                    Category: {selectedMainMenuCat}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedMainMenuCat(null)} />
                  </span>
                )}
                {selectedSubCat && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-sm">
                    {selectedSubCat.replace(/-/g, ' ')}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedSubCat(null)} />
                  </span>
                )}
                {selectedProductTypes.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-800 border border-stone-200 rounded-sm">
                    {t}
                    <X size={12} className="cursor-pointer" onClick={() => handleProductTypeToggle(t)} />
                  </span>
                ))}
                <span className="text-stone-500 font-medium ml-1">
                  ({filteredProducts.length} items found)
                </span>
              </div>

              {/* Right: View As Options (Screenshot 1: Grid & List icons) */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">View as</span>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`nursery-viewas-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  title="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`nursery-viewas-btn ${viewMode === 'list' ? 'active' : ''}`}
                  title="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {/* Products Container */}
            {isLoading ? (
              <div className="py-24 text-center">
                <div className="loading-spinner mx-auto mb-3"></div>
                <p className="text-sm text-stone-500">Loading nursery collection...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-stone-50 border border-stone-200 p-8 rounded-sm">
                <Leaf size={36} className="mx-auto text-stone-400 mb-3" />
                <h3 className="text-lg font-medium text-stone-800 mb-1">No botanical items match your filter</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mb-4">
                  Try unchecking some filter options or reset the filters to browse our full nursery collection.
                </p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-sm cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={!product.isCustomizable ? (p) => handleAddToCart(p, 1) : undefined}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={!product.isCustomizable ? (p) => handleAddToCart(p, 1) : undefined}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. THE FOUR PRINCIPLES OF LIVING ARCHITECTURE                             */}
        {/* ========================================================================= */}
        <section className="py-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 border-t border-[var(--border)]">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0f2444] bg-[#f0f5fc] px-3 py-1 rounded-full border border-[#cbdceb] inline-block mb-2">
              Botanical Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-playfair font-normal italic text-dark m-0">
              The Four Principles of Living Architecture
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-2 font-light max-w-xl mx-auto leading-relaxed">
              Every InteriorG botanical piece is engineered around biophilic living, structural durability, and natural environmental wellness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {botanicalPillars.map((pillar, i) => (
              <div 
                key={i} 
                className="bg-[#faf9f7] p-6 rounded-xl border border-[#ded9d0] shadow-xs hover:shadow-md hover:border-[var(--navy)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[var(--navy)] text-white flex items-center justify-center mb-4 shadow-sm">
                    {pillar.icon}
                  </div>
                  <h3 className="text-base font-serif font-semibold text-dark mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed m-0 font-light">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating "Get a free plant" Button (Screenshot 1: bottom-right coral pill) */}
      <button
        type="button"
        onClick={() => setShowFreePlantModal(true)}
        className="nursery-floating-free-plant"
        title="Get a free plant offer"
      >
        <Gift size={16} />
        <span>Get a free plant</span>
      </button>

      {/* Free Plant Interactive Modal */}
      {showFreePlantModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setShowFreePlantModal(false)}
        >
          <div 
            className="bg-white max-w-md w-full p-6 rounded-lg shadow-2xl relative border-2 border-emerald-500 animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowFreePlantModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="text-center pt-2">
              <div className="w-14 h-14 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Gift size={28} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-1">
                Claim Your Complimentary Plant 🌱
              </h3>
              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                Add any nursery items worth ₹999 or more to your cart, or use privilege voucher code <strong className="text-emerald-700">BOTANICALFREE</strong> during checkout to receive an acclimated Jade Plant or Succulent seedling absolutely free!
              </p>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-md mb-5 text-left text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Free Potted Botanical Seedling with orders &gt; ₹999</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Pre-potted in nursery eco-thermoform cup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>Includes 14-day plant transit guarantee</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleCopyVoucher();
                  setShowFreePlantModal(false);
                }}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
              >
                Copy Voucher & Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

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
