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
  RotateCcw,
  SlidersHorizontal,
  Search,
  Star,
  Filter,
  ArrowUpDown
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

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Nursery Main Department / Category states
  const [activeMenuDropdown, setActiveMenuDropdown] = useState<string | null>(null);
  const [selectedMainMenuCat, setSelectedMainMenuCat] = useState<string | null>(null);
  const [selectedSubCat, setSelectedSubCat] = useState<string | null>(null);

  // Filter Sidebar states
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under-300' | '300-500' | '500-1000' | 'above-1000'>('all');
  const [selectedRating, setSelectedRating] = useState<'all' | '4-above' | '3-above'>('all');

  // Product Type internal search inside sidebar
  const [productTypeSearch, setProductTypeSearch] = useState('');

  // Mobile sidebar filter drawer toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Accordion toggle states (- / + toggles)
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isProductTypeOpen, setIsProductTypeOpen] = useState(true);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isRatingOpen, setIsRatingOpen] = useState(true);

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

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.productType && p.productType.toLowerCase().includes(q)) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q))
      );
    }

    // 2. Filter by Main Menu Category
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
          return text.includes('gift') || text.includes('lucky') || text.includes('jade') || text.includes('brass') || text.includes('bonsai');
        }
        return true;
      });
    }

    // 3. Filter by SubCategory
    if (selectedSubCat) {
      const keyword = selectedSubCat.replace(/-/g, ' ');
      result = result.filter(p => {
        const text = `${p.name} ${p.description}`.toLowerCase();
        return text.includes(keyword.split(' ')[0]);
      });
    }

    // 4. Filter by Product Type Checkboxes (OR logic amongst selected types)
    if (selectedProductTypes.length > 0) {
      result = result.filter(p => {
        if (!p.productType) return false;
        return selectedProductTypes.includes(p.productType);
      });
    }

    // 5. Filter by Availability
    if (selectedAvailability === 'in-stock') {
      result = result.filter(p => p.inStock !== false);
    } else if (selectedAvailability === 'out-of-stock') {
      result = result.filter(p => p.inStock === false);
    }

    // 6. Filter by Price Bracket
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

    // 7. Filter by Rating
    if (selectedRating === '4-above') {
      result = result.filter(p => (p.rating || 0) >= 4);
    } else if (selectedRating === '3-above') {
      result = result.filter(p => (p.rating || 0) >= 3);
    }

    // 8. Sort by options
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
    searchQuery,
    selectedMainMenuCat, 
    selectedSubCat, 
    selectedProductTypes, 
    selectedAvailability, 
    priceFilter, 
    selectedRating,
    sortBy
  ]);

  const handleProductTypeToggle = (type: string) => {
    setSelectedProductTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedMainMenuCat(null);
    setSelectedSubCat(null);
    setSelectedProductTypes([]);
    setSelectedAvailability('all');
    setPriceFilter('all');
    setSelectedRating('all');
    setSortBy('best-selling');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedMainMenuCat) count++;
    if (selectedSubCat) count++;
    if (selectedProductTypes.length > 0) count += selectedProductTypes.length;
    if (selectedAvailability !== 'all') count++;
    if (priceFilter !== 'all') count++;
    if (selectedRating !== 'all') count++;
    return count;
  }, [searchQuery, selectedMainMenuCat, selectedSubCat, selectedProductTypes, selectedAvailability, priceFilter, selectedRating]);

  const hasActiveFilters = activeFiltersCount > 0;

  // Filtered product types for sidebar internal search
  const visibleProductTypes = useMemo(() => {
    if (!productTypeSearch.trim()) return NURSERY_PRODUCT_TYPES;
    return NURSERY_PRODUCT_TYPES.filter(pt => 
      pt.name.toLowerCase().includes(productTypeSearch.toLowerCase().trim())
    );
  }, [productTypeSearch]);

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
        {/* 3. NURSERY DEPARTMENT NAV (QUICK-CATEGORY PILL TABS)                     */}
        {/* ========================================================================= */}
        <section id="nursery-store" className="nursery-department-nav">
          <div className="max-w-[1440px] mx-auto px-4">
            <div className="nursery-pills-scroll">
              <button
                type="button"
                onClick={() => {
                  setSelectedMainMenuCat(null);
                  setSelectedSubCat(null);
                }}
                className={`nursery-pill-btn ${!selectedMainMenuCat ? 'active' : ''}`}
              >
                <span>All Catalog</span>
                <span className="nursery-pill-badge">{masterNurseryCatalog.length}</span>
              </button>

              {NURSERY_MAIN_MENU.map(cat => {
                const isSelected = selectedMainMenuCat === cat.slug;
                const emoji = cat.slug === 'plants' ? '🌱' :
                              cat.slug === 'planters' ? '🪴' :
                              cat.slug === 'seeds' ? '🌾' :
                              cat.slug === 'bulbs' ? '🌷' :
                              cat.slug === 'gardening' ? '🌿' :
                              cat.slug === 'gifts' ? '🎁' : '🧪';

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedMainMenuCat(null);
                        setSelectedSubCat(null);
                      } else {
                        setSelectedMainMenuCat(cat.slug);
                        setSelectedSubCat(null);
                      }
                    }}
                    className={`nursery-pill-btn ${isSelected ? 'active' : ''}`}
                  >
                    <span>{emoji} {cat.name}</span>
                  </button>
                );
              })}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="ml-auto flex-shrink-0 text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Reset All</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. NURSERY STORE CATALOG WITH STANDARD REDESIGNED FILTERS & SORTING       */}
        {/* ========================================================================= */}
        <section className="nursery-catalog-layout">
          {/* ======================================================================= */}
          {/* LEFT SIDEBAR: FILTERS IN STANDARD FORMAT                                */}
          {/* ======================================================================= */}
          <aside className="nursery-sidebar-filters">
            <div className="nursery-sidebar-card">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#0f492c]" />
                  <h2 className="text-base font-bold text-stone-900 m-0">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-xs text-stone-500 hover:text-red-600 font-semibold transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Accordion 1: Department / Category */}
              <div className="nursery-filter-group">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="nursery-filter-group-header"
                >
                  <span className="font-semibold text-stone-900">Category</span>
                  {isCategoryOpen ? <Minus size={15} /> : <Plus size={15} />}
                </button>

                {isCategoryOpen && (
                  <div className="pt-2 pl-1 space-y-1">
                    <label className="nursery-checkbox-item">
                      <input
                        type="radio"
                        name="main-cat-radio"
                        checked={!selectedMainMenuCat}
                        onChange={() => {
                          setSelectedMainMenuCat(null);
                          setSelectedSubCat(null);
                        }}
                        className="accent-emerald-700"
                      />
                      <span>All Categories</span>
                      <span className="text-stone-400 text-xs ml-auto font-mono">({masterNurseryCatalog.length})</span>
                    </label>

                    {NURSERY_MAIN_MENU.map(cat => {
                      const isChecked = selectedMainMenuCat === cat.slug;
                      return (
                        <label key={cat.id} className="nursery-checkbox-item">
                          <input
                            type="radio"
                            name="main-cat-radio"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedMainMenuCat(cat.slug);
                              setSelectedSubCat(null);
                            }}
                            className="accent-emerald-700"
                          />
                          <span>{cat.name}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Accordion 2: Product type */}
              <div className="nursery-filter-group">
                <button
                  type="button"
                  onClick={() => setIsProductTypeOpen(!isProductTypeOpen)}
                  className="nursery-filter-group-header"
                >
                  <span className="font-semibold text-stone-900">Product type</span>
                  {isProductTypeOpen ? <Minus size={15} /> : <Plus size={15} />}
                </button>

                {isProductTypeOpen && (
                  <div className="pt-2 pl-1 space-y-1">
                    <input
                      type="text"
                      placeholder="Search types..."
                      value={productTypeSearch}
                      onChange={(e) => setProductTypeSearch(e.target.value)}
                      className="nursery-filter-subsearch"
                    />

                    {visibleProductTypes.map(pt => {
                      const isChecked = selectedProductTypes.includes(pt.name);
                      return (
                        <label key={pt.id} className="nursery-checkbox-item">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleProductTypeToggle(pt.name)}
                          />
                          <span className="truncate">{pt.name}</span>
                          <span className="text-stone-400 text-xs ml-auto font-mono">
                            ({pt.count})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Accordion 3: Price */}
              <div className="nursery-filter-group">
                <button
                  type="button"
                  onClick={() => setIsPriceOpen(!isPriceOpen)}
                  className="nursery-filter-group-header"
                >
                  <span className="font-semibold text-stone-900">Price Range</span>
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

              {/* Accordion 4: Availability */}
              <div className="nursery-filter-group">
                <button
                  type="button"
                  onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
                  className="nursery-filter-group-header"
                >
                  <span className="font-semibold text-stone-900">Availability</span>
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
                      <span>In stock items only</span>
                    </label>
                    <label className="nursery-checkbox-item">
                      <input
                        type="checkbox"
                        checked={selectedAvailability === 'out-of-stock'}
                        onChange={() => setSelectedAvailability(selectedAvailability === 'out-of-stock' ? 'all' : 'out-of-stock')}
                      />
                      <span>Include out of stock</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Accordion 5: Customer Rating */}
              <div className="nursery-filter-group border-none">
                <button
                  type="button"
                  onClick={() => setIsRatingOpen(!isRatingOpen)}
                  className="nursery-filter-group-header"
                >
                  <span className="font-semibold text-stone-900">Customer Rating</span>
                  {isRatingOpen ? <Minus size={15} /> : <Plus size={15} />}
                </button>

                {isRatingOpen && (
                  <div className="pt-2 pl-1 space-y-1">
                    {[
                      { id: 'all', label: 'All Ratings' },
                      { id: '4-above', label: '4★ & above' },
                      { id: '3-above', label: '3★ & above' },
                    ].map(r => (
                      <label key={r.id} className="nursery-checkbox-item">
                        <input
                          type="radio"
                          name="rating-filter"
                          checked={selectedRating === r.id}
                          onChange={() => setSelectedRating(r.id as any)}
                          className="accent-emerald-700"
                        />
                        <span className="flex items-center gap-1">
                          {r.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: TOOLBAR, ACTIVE CHIPS & PRODUCT GRID                       */}
          {/* ======================================================================= */}
          <div className="flex-1 w-full min-w-0">

            {/* Standard Redesigned Toolbar */}
            <div className="nursery-standard-toolbar">
              {/* Left: Total Count and Mobile Filter Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg border border-stone-200 cursor-pointer"
                >
                  <SlidersHorizontal size={14} />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-[#0f492c] text-white text-[10px] px-1.5 py-0.2 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <div className="text-xs sm:text-sm text-stone-600">
                  Showing <strong className="text-stone-900 font-semibold">{filteredProducts.length}</strong> of{' '}
                  <span className="text-stone-500">{masterNurseryCatalog.length} products</span>
                </div>
              </div>

              {/* Center: Search Box */}
              <div className="nursery-search-box">
                <Search size={14} className="text-stone-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search plants, planters, seeds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-stone-400 hover:text-stone-600 text-xs p-0 border-none bg-transparent cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Right: Sort By & View As */}
              <div className="flex items-center gap-3">
                <div className="nursery-sort-group">
                  <span className="text-xs font-semibold text-stone-500 hidden sm:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="nursery-sort-select"
                  >
                    <option value="best-selling">Best Selling</option>
                    <option value="featured">Featured / Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Alphabetically: A–Z</option>
                    <option value="name-desc">Alphabetically: Z–A</option>
                  </select>
                </div>

                <div className="nursery-viewas-group">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`nursery-viewas-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    title="Grid view"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`nursery-viewas-btn ${viewMode === 'list' ? 'active' : ''}`}
                    title="List view"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips Strip (Standard Dedicated Bar) */}
            {hasActiveFilters && (
              <div className="nursery-active-chips-strip">
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5 mr-1">
                  <Filter size={13} className="text-[#0f492c]" />
                  Active Filters:
                </span>

                {searchQuery && (
                  <div className="nursery-filter-chip">
                    <span>Search: "{searchQuery}"</span>
                    <button type="button" onClick={() => setSearchQuery('')}><X size={12} /></button>
                  </div>
                )}

                {selectedMainMenuCat && (
                  <div className="nursery-filter-chip">
                    <span>Category: {selectedMainMenuCat}</span>
                    <button type="button" onClick={() => setSelectedMainMenuCat(null)}><X size={12} /></button>
                  </div>
                )}

                {selectedSubCat && (
                  <div className="nursery-filter-chip">
                    <span>{selectedSubCat.replace(/-/g, ' ')}</span>
                    <button type="button" onClick={() => setSelectedSubCat(null)}><X size={12} /></button>
                  </div>
                )}

                {selectedProductTypes.map(t => (
                  <div key={t} className="nursery-filter-chip">
                    <span>{t}</span>
                    <button type="button" onClick={() => handleProductTypeToggle(t)}><X size={12} /></button>
                  </div>
                ))}

                {selectedAvailability !== 'all' && (
                  <div className="nursery-filter-chip">
                    <span>{selectedAvailability === 'in-stock' ? 'In Stock Only' : 'Out of Stock'}</span>
                    <button type="button" onClick={() => setSelectedAvailability('all')}><X size={12} /></button>
                  </div>
                )}

                {priceFilter !== 'all' && (
                  <div className="nursery-filter-chip">
                    <span>Price: {priceFilter.replace('-', ' ')}</span>
                    <button type="button" onClick={() => setPriceFilter('all')}><X size={12} /></button>
                  </div>
                )}

                {selectedRating !== 'all' && (
                  <div className="nursery-filter-chip">
                    <span>Rating: {selectedRating === '4-above' ? '4★ & up' : '3★ & up'}</span>
                    <button type="button" onClick={() => setSelectedRating('all')}><X size={12} /></button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-xs text-red-600 hover:text-red-700 font-bold ml-auto flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Clear All</span>
                </button>
              </div>
            )}

            {/* Products Container */}
            {isLoading ? (
              <div className="py-24 text-center">
                <div className="loading-spinner mx-auto mb-3"></div>
                <p className="text-sm text-stone-500">Loading nursery collection...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 px-6 text-center bg-white border border-dashed border-stone-300 rounded-2xl shadow-xs">
                <div className="w-14 h-14 bg-emerald-50 text-[#0f492c] rounded-full flex items-center justify-center mx-auto mb-3.5">
                  <Leaf size={28} />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1.5">No botanical items match your filter</h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-5">
                  We couldn't find any items matching your exact combination. Try clearing some filters or browse our most popular categories below.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="px-4 py-2 bg-[#0f492c] hover:bg-[#165e39] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Reset All Filters
                  </button>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2.5">
                    Or explore popular collections:
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleClearAllFilters();
                        setSelectedMainMenuCat('plants');
                      }}
                      className="text-xs font-semibold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full cursor-pointer"
                    >
                      🌱 All Live Plants
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleClearAllFilters();
                        setSelectedMainMenuCat('planters');
                      }}
                      className="text-xs font-semibold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full cursor-pointer"
                    >
                      🪴 Handcrafted Planters
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleClearAllFilters();
                        setSelectedProductTypes(['Combo Packs - Plants']);
                      }}
                      className="text-xs font-semibold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full cursor-pointer"
                    >
                      ✨ Air-Purifier Combos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleClearAllFilters();
                        setSelectedMainMenuCat('gifts');
                      }}
                      className="text-xs font-semibold px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full cursor-pointer"
                    >
                      🎁 Good Luck Gifts
                    </button>
                  </div>
                </div>
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
