import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { productsApi, Product } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';
import { AddProductModal } from '../components/AddProductModal';
import { MobileQuickCatalog } from '../components/MobileQuickCatalog';
import { ArticleDimensionViewer } from '../components/ArticleDimensionViewer';
import { CategoryFilterTree } from '../components/CategoryFilterTree';
import { getHierarchyForDomain } from '../data/categoryHierarchy';
import { useLocationContext } from '../contexts/LocationContext';
import { 
  ArrowUpDown, 
  Search, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Filter, 
  Check, 
  Grid3X3, 
  LayoutGrid, 
  List, 
  Smartphone,
  X, 
  SlidersHorizontal, 
  Sparkles, 
  Plus, 
  Minus, 
  Tag, 
  Truck, 
  Package, 
  ShieldCheck, 
  Star, 
  Leaf, 
  MapPin, 
  Armchair, 
  DoorOpen, 
  Bed,
  Utensils,
  CookingPot,
  BookOpen,
  Tv,
  Bath,
  Baby,
  Sun,
  Trees,
  Compass,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useLocationContext();

  // URL state
  const spaceParam = searchParams.get('space') || '';
  const domainParam = searchParams.get('domain') || '';
  const categoryParam = searchParams.get('category') || '';
  const qParam = searchParams.get('q') || '';

  // Local filter states
  const [activeDomain, setActiveDomain] = useState<'all' | 'indoor' | 'outdoor'>(
    domainParam === 'outdoor' ? 'outdoor' : domainParam === 'indoor' ? 'indoor' : 'all'
  );
  const [selectedSpace, setSelectedSpace] = useState<string>(spaceParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [subCategoryKeywords, setSubCategoryKeywords] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedColorKeyword, setSelectedColorKeyword] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(qParam);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount' | 'name'>('featured');
  const [priceRange, setPriceRange] = useState<'all' | 'under-1500' | '1500-3000' | '3000-7000' | '7000-plus'>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<'all' | '4-above' | '3-above'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Accordion toggle states (matching Gardening page design pattern)
  const [isSpaceOpen, setIsSpaceOpen] = useState<boolean>(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState<boolean>(true);
  const [isPriceOpen, setIsPriceOpen] = useState<boolean>(true);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState<boolean>(true);
  const [isRatingOpen, setIsRatingOpen] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [categorySearch, setCategorySearch] = useState<string>('');

  // Quick View & Dimensions State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [dimensionProduct, setDimensionProduct] = useState<Product | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Dedicated Mobile Layout detection and view state
  const [activeLayoutView, setActiveLayoutView] = useState<'mobile-catalog' | 'desktop-studio'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024 ? 'mobile-catalog' : 'desktop-studio';
    }
    return 'desktop-studio';
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setActiveLayoutView('mobile-catalog');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch Tree Data
  const { data: spacesData } = useQuery({
    queryKey: ['spaces-tree'],
    queryFn: productsApi.spacesTree
  });

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.categories
  });

  const domains = spacesData?.domains || [];
  const totalProducts = spacesData?.totalProducts || 0;
  const indoorDomain = domains.find(d => d.slug === 'indoor');
  const outdoorDomain = domains.find(d => d.slug === 'outdoor');

  // Fetch Products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { q: searchQuery, category: selectedCategory, space: selectedSpace }],
    queryFn: () => productsApi.list({ 
      q: searchQuery, 
      category: selectedCategory, 
      space: selectedSpace, 
      limit: 50 
    })
  });

  // Fetch Full Catalog for Mobile Quick View
  const { data: allCatalogData } = useQuery({
    queryKey: ['products-full-quick-catalog'],
    queryFn: () => productsApi.list({ limit: 100 })
  });
  const allCatalogProducts = allCatalogData?.items || productsData?.items || [];

  // Sync state if URL query params change
  useEffect(() => {
    if (spaceParam) {
      setSelectedSpace(spaceParam);
      const isOutdoor = outdoorDomain?.children.some(c => c.slug === spaceParam) || spaceParam === 'outdoor';
      if (isOutdoor) {
        setActiveDomain('outdoor');
      } else {
        setActiveDomain('indoor');
      }
    } else if (domainParam) {
      setActiveDomain(domainParam as any);
      setSelectedSpace(domainParam);
    } else {
      setActiveDomain('all');
      setSelectedSpace('');
    }
  }, [spaceParam, domainParam, outdoorDomain]);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(qParam);
  }, [qParam]);

  const handleDomainSelect = (domain: 'all' | 'indoor' | 'outdoor') => {
    setActiveDomain(domain);
    if (domain === 'all') {
      setSelectedSpace('');
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('domain');
        next.delete('space');
        return next;
      });
    } else {
      setSelectedSpace(domain);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('domain', domain);
        next.set('space', domain);
        return next;
      });
    }
  };

  const handleSpaceSelect = (slug: string) => {
    if (selectedSpace === slug) {
      const fallback = activeDomain === 'all' ? '' : activeDomain;
      setSelectedSpace(fallback);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (activeDomain === 'all') {
          next.delete('space');
        } else {
          next.set('space', activeDomain);
        }
        return next;
      });
    } else {
      setSelectedSpace(slug);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('space', slug);
        if (activeDomain !== 'all') {
          next.set('domain', activeDomain);
        }
        return next;
      });
    }
  };

  const handleCategorySelect = (slug: string) => {
    if (selectedCategory === slug) {
      setSelectedCategory('');
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('category');
        return next;
      });
    } else {
      setSelectedCategory(slug);
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (slug) next.set('category', slug);
        else next.delete('category');
        return next;
      });
    }
  };

  // Spaces under current domain
  const activeDomainSpaces = useMemo(() => {
    if (activeDomain === 'indoor') return indoorDomain?.children || [];
    if (activeDomain === 'outdoor') return outdoorDomain?.children || [];
    return [...(indoorDomain?.children || []), ...(outdoorDomain?.children || [])];
  }, [activeDomain, indoorDomain, outdoorDomain]);

  // Filtered categories in accordion subsearch
  const visibleCategories = useMemo(() => {
    if (!categories) return [];
    if (!categorySearch.trim()) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categories, categorySearch]);

  const getSpaceEmoji = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('living')) return '🛋️';
    if (s.includes('bed')) return '🛏️';
    if (s.includes('dining')) return '🍽️';
    if (s.includes('kitchen')) return '🍳';
    if (s.includes('bath')) return '🚿';
    if (s.includes('hall') || s.includes('foyer') || s.includes('entryway')) return '🚪';
    if (s.includes('office') || s.includes('study')) return '💼';
    if (s.includes('kids') || s.includes('nursery') || s.includes('child')) return '🧸';
    if (s.includes('pooja') || s.includes('mandir')) return '✨';
    if (s.includes('lounge') || s.includes('theatre') || s.includes('media')) return '🍸';
    if (s.includes('balcony')) return '🌿';
    if (s.includes('terrace')) return '🌅';
    if (s.includes('patio')) return '🪴';
    if (s.includes('courtyard')) return '🏡';
    if (s.includes('lawn')) return '🌱';
    if (s.includes('verandah')) return '☕';
    if (s.includes('pool')) return '🏊';
    if (s.includes('vertical')) return '🍃';
    return '✨';
  };

  const categoryTree = useMemo(() => {
    return getHierarchyForDomain(activeDomain);
  }, [activeDomain]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let items = productsData?.items ? [...productsData.items] : [];

    // Filter by SubCategory Keywords (Screenshot 3)
    if (subCategoryKeywords.length > 0) {
      items = items.filter(p => {
        const text = `${p.name} ${p.description || ''} ${p.material || ''} ${p.finish || ''} ${p.category?.name || ''}`.toLowerCase();
        return subCategoryKeywords.some(kw => text.includes(kw.toLowerCase()));
      });
    }

    // Filter by Color (Screenshot 3)
    if (selectedColorKeyword) {
      items = items.filter(p => {
        const text = `${p.name} ${p.description || ''} ${p.finish || ''} ${p.material || ''}`.toLowerCase();
        return text.includes(selectedColorKeyword.toLowerCase());
      });
    }

    // Filter by Price Range
    if (priceRange === 'under-1500') {
      items = items.filter(p => Number(p.discountPrice || p.price) < 1500);
    } else if (priceRange === '1500-3000') {
      items = items.filter(p => {
        const price = Number(p.discountPrice || p.price);
        return price >= 1500 && price <= 3000;
      });
    } else if (priceRange === '3000-7000') {
      items = items.filter(p => {
        const price = Number(p.discountPrice || p.price);
        return price > 3000 && price <= 7000;
      });
    } else if (priceRange === '7000-plus') {
      items = items.filter(p => Number(p.discountPrice || p.price) > 7000);
    }

    // Filter by In Stock
    if (inStockOnly) {
      items = items.filter(p => {
        if (!p.inventory) return true;
        const avail = p.inventory.totalQuantity - p.inventory.reservedQuantity - (p.inventory.damagedQuantity || 0);
        return avail > 0;
      });
    }

    // Filter by Rating
    if (selectedRating === '4-above') {
      items = items.filter(p => (p.rating || 4.8) >= 4);
    } else if (selectedRating === '3-above') {
      items = items.filter(p => (p.rating || 4.8) >= 3);
    }

    // Sort Products
    if (sortBy === 'price-asc') {
      items.sort((a, b) => Number(a.discountPrice || a.price) - Number(b.discountPrice || b.price));
    } else if (sortBy === 'price-desc') {
      items.sort((a, b) => Number(b.discountPrice || b.price) - Number(a.discountPrice || a.price));
    } else if (sortBy === 'discount') {
      items.sort((a, b) => {
        const discA = a.discountPrice ? (Number(a.price) - Number(a.discountPrice)) / Number(a.price) : 0;
        const discB = b.discountPrice ? (Number(b.price) - Number(b.discountPrice)) / Number(b.price) : 0;
        return discB - discA;
      });
    } else if (sortBy === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return items;
  }, [productsData?.items, subCategoryKeywords, selectedColorKeyword, priceRange, inStockOnly, selectedRating, sortBy]);

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

  const handleClearAllFilters = () => {
    setSelectedSpace(activeDomain === 'all' ? '' : activeDomain);
    setSelectedCategory('');
    setSelectedSubCategory(null);
    setSubCategoryKeywords([]);
    setSelectedColor(null);
    setSelectedColorKeyword(null);
    setSearchQuery('');
    setPriceRange('all');
    setInStockOnly(false);
    setSelectedRating('all');
    setSortBy('featured');
    setSearchParams(prev => {
      const next = new URLSearchParams();
      if (activeDomain !== 'all') next.set('domain', activeDomain);
      return next;
    });
    toast('Filters reset', { icon: '🔄' });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedSpace && selectedSpace !== activeDomain && selectedSpace !== '') count++;
    if (selectedCategory) count++;
    if (selectedSubCategory) count++;
    if (selectedColor) count++;
    if (priceRange !== 'all') count++;
    if (inStockOnly) count++;
    if (selectedRating !== 'all') count++;
    return count;
  }, [searchQuery, selectedSpace, activeDomain, selectedCategory, selectedSubCategory, selectedColor, priceRange, inStockOnly, selectedRating]);

  const hasActiveFilters = activeFiltersCount > 0;

  // Active space title for display
  const activeSpaceObj = [...(indoorDomain?.children || []), ...(outdoorDomain?.children || [])].find(c => c.slug === selectedSpace);
  const activeCategoryObj = categories?.find(c => c.slug === selectedCategory);

  return (
    <div className="page-wrapper bg-white min-h-screen">
      <Header />

      <main>
        {/* ========================================================================= */}
        {/* 1. TRUST BADGES RIBBON (SCREENSHOT 1)                                     */}
        {/* ========================================================================= */}
        <div className="nl-trust-ribbon">
          <div className="nl-trust-ribbon-inner">
            <div className="nl-trust-pill">
              <Truck size={14} />
              <span>Free Pan-India Delivery on Orders over ₹499</span>
            </div>
            <div className="nl-trust-pill">
              <Package size={14} />
              <span>
                {activeDomain === 'indoor' 
                  ? '100% Breathable Transit-Safe Furniture & Mural Packaging'
                  : '100% Breathable Transit-Safe Plant Packaging'}
              </span>
            </div>
            <div className="nl-trust-pill">
              <ShieldCheck size={14} />
              <span>
                {activeDomain === 'indoor'
                  ? '10-Year Solid Hardwood Structural Guarantee'
                  : '7-Day Live Plant Replacement Guarantee'}
              </span>
            </div>
            <div className="nl-trust-pill">
              <Star size={14} fill="#4ade80" />
              <span>Over 1.5 Lakh+ Happy Green Homes Across India</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. HERO STUDIO HEADER WITH CITY PINCODE CHECK (SCREENSHOT 1 DESIGN)        */}
        {/* ========================================================================= */}
        <header className={`nl-hero-header ${activeDomain === 'indoor' ? 'domain-theme-indoor' : activeDomain === 'outdoor' ? 'domain-theme-outdoor' : ''}`}>
          <div className="nl-hero-glow" aria-hidden="true" />
          <div className="nl-hero-content">
            {/* Breadcrumb Trail on top of header */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-200/80 mb-3 uppercase tracking-wider">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight size={12} />
              <Link to="/shop" className="hover:text-white transition-colors">Catalog</Link>
              {activeDomain !== 'all' && (
                <>
                  <ChevronRight size={12} />
                  <span className="text-white font-medium capitalize">
                    {activeDomain === 'indoor' ? 'Interior Design' : 'Exterior Design'}
                  </span>
                </>
              )}
              {activeSpaceObj && activeSpaceObj.slug !== activeDomain && (
                <>
                  <ChevronRight size={12} />
                  <span className="text-[#86efac] font-semibold">{activeSpaceObj.name}</span>
                </>
              )}
            </div>

            <div className="nl-hero-top-row">
              <div>
                <div className="nl-hero-badge">
                  <Leaf size={13} />
                  <span>
                    {activeDomain === 'indoor'
                      ? 'CasaCanvas Interior Studio • Bespoke Customizer'
                      : activeDomain === 'outdoor'
                      ? 'Nurserylive Botanical Studio • Bespoke Customizer'
                      : 'InteriorG Architectural Studio • Curated Catalog'}
                  </span>
                </div>

                <h1 className="nl-hero-title">
                  {activeSpaceObj && activeSpaceObj.slug !== activeDomain
                    ? activeSpaceObj.name
                    : activeDomain === 'indoor'
                    ? 'Custom Interior & Living Studio'
                    : activeDomain === 'outdoor'
                    ? 'Custom Nursery & Balcony Studio'
                    : 'The Curated Architecture & Living Collection'}
                </h1>

                <p className="nl-hero-subtitle">
                  {activeDomain === 'indoor'
                    ? 'Customize your ideal indoor haven in 4 simple steps. Select your living area, pick solid Teak & Sheesham hardwoods, choose artisanal brass accents, and enjoy doorstep white-glove plant and furnishings delivery across India.'
                    : activeDomain === 'outdoor'
                    ? 'Customize your ideal green sanctuary in 4 simple steps. Select your living area, pick NASA-certified plant packs, choose premium self-watering pots, and enjoy doorstep white-glove plant delivery across India.'
                    : 'Customize your complete home & garden living space in simple steps. Authentic solid hardwoods, bespoke wallpapers, hand-thrown terracotta pottery, and live botanical plants delivered nationwide.'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Store Manager Controls Bar (ADMIN / STOCK_MANAGER) */}
        {user && (user.role === 'ADMIN' || user.role === 'STOCK_MANAGER') && (
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#e8dfd5] flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="badge badge-blue">Store Manager Mode</span>
                <span className="text-xs text-[#555]">
                  Logged in as <strong>{user.name}</strong> ({user.role}). You have full catalog management access.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="btn btn-primary btn-sm flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>+ Add Product</span>
                </button>
                <Link
                  to="/admin/products"
                  className="btn btn-secondary btn-sm flex items-center gap-1.5"
                >
                  <SlidersHorizontal size={14} />
                  <span>Manage Catalog</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. TOP HORIZONTAL CATEGORY/SPACE NAVIGATION PILLS                         */}
        {/* ========================================================================= */}
        <section className="nursery-department-nav">
          <div className="max-w-[1440px] mx-auto px-4">
            <div className="nursery-pills-scroll">
              <button
                type="button"
                onClick={() => handleSpaceSelect(activeDomain === 'all' ? '' : activeDomain)}
                className={`nursery-pill-btn ${(!selectedSpace || selectedSpace === activeDomain) ? 'active' : ''}`}
              >
                <span>All {activeDomain === 'indoor' ? 'Interior' : activeDomain === 'outdoor' ? 'Exterior' : 'Spaces'}</span>
                <span className="nursery-pill-badge">
                  {activeDomain === 'indoor' ? (indoorDomain?.count ?? 0) : activeDomain === 'outdoor' ? (outdoorDomain?.count ?? 0) : totalProducts}
                </span>
              </button>

              {activeDomainSpaces.map(leaf => {
                const isSelected = selectedSpace === leaf.slug;
                const emoji = getSpaceEmoji(leaf.slug);
                return (
                  <button
                    key={leaf.slug}
                    type="button"
                    onClick={() => handleSpaceSelect(leaf.slug)}
                    className={`nursery-pill-btn ${isSelected ? 'active' : ''}`}
                  >
                    <span>{emoji} {leaf.name}</span>
                    {leaf.count > 0 && <span className="nursery-pill-badge">{leaf.count}</span>}
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

        {/* Layout View Selector Bar (Mobile Quick Catalog vs Desktop Studio) */}
        <div className="max-w-[1440px] mx-auto px-4 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveLayoutView('mobile-catalog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
                activeLayoutView === 'mobile-catalog'
                  ? 'bg-[#0f2444] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 bg-transparent'
              }`}
            >
              <Smartphone size={14} />
              <span>📱 Express Mobile Catalog</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveLayoutView('desktop-studio')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
                activeLayoutView === 'desktop-studio'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 bg-transparent'
              }`}
            >
              <LayoutGrid size={14} />
              <span>🖥️ Studio Grid</span>
            </button>
          </div>

          <span className="text-xs text-stone-500 hidden sm:inline">
            {activeLayoutView === 'mobile-catalog' 
              ? '⚡ Viewing fast dual-pane mobile shopping layout with dimension blueprints' 
              : 'Viewing comprehensive architectural studio'}
          </span>
        </div>

        {activeLayoutView === 'mobile-catalog' ? (
          <MobileQuickCatalog
            products={allCatalogProducts}
            onAddToCart={(p, q) => handleAddToCart(p, q)}
            onOpenQuickView={(p) => setQuickViewProduct(p)}
          />
        ) : (
          /* ========================================================================= */
          /* 3. TWO-COLUMN CATALOG LAYOUT WITH FILTERS SIDEBAR AND PRODUCT GRID        */
          /* ========================================================================= */
          <section className="nursery-catalog-layout">
          {/* ======================================================================= */}
          {/* LEFT SIDEBAR: FILTERS CARD ACCORDIONS                                    */}
          {/* ======================================================================= */}
          <aside className="nursery-sidebar-filters">
            <div className="nursery-sidebar-card">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[var(--navy)]" />
                  <h2 className="text-base font-bold text-stone-900 m-0">Filters</h2>
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-100 text-[var(--navy)] text-[11px] font-bold px-2 py-0.5 rounded-full">
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

              {/* Accordion 1: Category & Subsections (Screenshot 3 Hierarchical Dropdowns) */}
              <div className="nursery-filter-group">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="nursery-filter-group-header"
                >
                  <span className="font-semibold text-stone-900">Category & Subsections</span>
                  {isCategoryOpen ? <Minus size={15} /> : <Plus size={15} />}
                </button>

                {isCategoryOpen && (
                  <CategoryFilterTree
                    categories={categoryTree}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(slug) => {
                      setSelectedCategory(slug);
                      setSelectedSubCategory(null);
                      setSubCategoryKeywords([]);
                      setSelectedColor(null);
                      setSelectedColorKeyword(null);
                      setSearchParams(prev => {
                        const next = new URLSearchParams(prev);
                        if (slug) next.set('category', slug);
                        else next.delete('category');
                        return next;
                      });
                    }}
                    selectedSubCategory={selectedSubCategory}
                    onSelectSubCategory={(slug, keywords) => {
                      setSelectedSubCategory(slug);
                      setSubCategoryKeywords(keywords);
                      if (!slug) {
                        setSelectedColor(null);
                        setSelectedColorKeyword(null);
                      }
                    }}
                    selectedColor={selectedColor}
                    onSelectColor={(colorId, keyword) => {
                      setSelectedColor(colorId);
                      setSelectedColorKeyword(keyword);
                    }}
                  />
                )}
              </div>

              {/* Accordion 3: Price Range */}
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
                      { id: 'under-1500', label: `Under ${formatPrice(1500)}` },
                      { id: '1500-3000', label: `${formatPrice(1500)} - ${formatPrice(3000)}` },
                      { id: '3000-7000', label: `${formatPrice(3000)} - ${formatPrice(7000)}` },
                      { id: '7000-plus', label: `Above ${formatPrice(7000)}` },
                    ].map(p => (
                      <label key={p.id} className="nursery-checkbox-item">
                        <input
                          type="radio"
                          name="shop-price-bracket"
                          checked={priceRange === p.id}
                          onChange={() => setPriceRange(p.id as any)}
                          className="accent-[var(--navy)]"
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
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="accent-[var(--navy)]"
                      />
                      <span>In stock pieces only</span>
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
                          name="shop-rating-filter"
                          checked={selectedRating === r.id}
                          onChange={() => setSelectedRating(r.id as any)}
                          className="accent-[var(--navy)]"
                        />
                        <span className="flex items-center gap-1">{r.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </aside>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: TOOLBAR, ACTIVE CHIPS STRIP & PRODUCT GRID                  */}
          {/* ======================================================================= */}
          <div className="flex-1 w-full min-w-0">

            {/* Standard Toolbar */}
            <div className="nursery-standard-toolbar">
              {/* Left: Total Count (Clean standard toolbar - Screenshot 1 updated) */}
              <div className="flex items-center gap-3">
                <div className="text-xs sm:text-sm text-stone-600">
                  Showing <strong className="text-stone-900 font-semibold">{filteredProducts.length}</strong> of{' '}
                  <span className="text-stone-500">{productsData?.total ?? filteredProducts.length} pieces</span>
                </div>
              </div>

              {/* Center: Search Box */}
              <div className="nursery-search-box">
                <Search size={14} className="text-stone-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search pieces, wood, brass..."
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

              {/* Right: Sort By & View Mode */}
              <div className="flex items-center gap-3">
                <div className="nursery-sort-group">
                  <span className="text-xs font-semibold text-stone-500 hidden sm:inline">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="nursery-sort-select"
                  >
                    <option value="featured">Best Selling / Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="discount">Highest Discount</option>
                    <option value="name">Alphabetically: A–Z</option>
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

            {/* Active Filter Chips Strip */}
            {hasActiveFilters && (
              <div className="nursery-active-chips-strip">
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5 mr-1">
                  <Filter size={13} className="text-[var(--navy)]" />
                  Active Filters:
                </span>

                {searchQuery && (
                  <div className="nursery-filter-chip">
                    <span>Search: "{searchQuery}"</span>
                    <button type="button" onClick={() => setSearchQuery('')}><X size={12} /></button>
                  </div>
                )}

                {selectedSpace && selectedSpace !== activeDomain && (
                  <div className="nursery-filter-chip">
                    <span>Space: {activeSpaceObj?.name || selectedSpace}</span>
                    <button type="button" onClick={() => handleSpaceSelect(activeDomain === 'all' ? '' : activeDomain)}><X size={12} /></button>
                  </div>
                )}

                {selectedCategory && (
                  <div className="nursery-filter-chip">
                    <span>Category: {activeCategoryObj?.name || selectedCategory}</span>
                    <button type="button" onClick={() => handleCategorySelect('')}><X size={12} /></button>
                  </div>
                )}

                {selectedSubCategory && (
                  <div className="nursery-filter-chip">
                    <span>Sub-Section: {selectedSubCategory.replace(/-/g, ' ')}</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedSubCategory(null);
                        setSubCategoryKeywords([]);
                        setSelectedColor(null);
                        setSelectedColorKeyword(null);
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {selectedColor && (
                  <div className="nursery-filter-chip">
                    <span>Colour: {selectedColor}</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedColor(null);
                        setSelectedColorKeyword(null);
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {priceRange !== 'all' && (
                  <div className="nursery-filter-chip">
                    <span>Price: {priceRange.replace('-', ' ')}</span>
                    <button type="button" onClick={() => setPriceRange('all')}><X size={12} /></button>
                  </div>
                )}

                {inStockOnly && (
                  <div className="nursery-filter-chip">
                    <span>In Stock Only</span>
                    <button type="button" onClick={() => setInStockOnly(false)}><X size={12} /></button>
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

            {/* Products Grid */}
            {isLoading ? (
              <div className="py-24 text-center">
                <div className="loading-spinner mx-auto mb-3"></div>
                <p className="text-sm text-stone-500">Loading catalog pieces...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 px-6 text-center bg-white border border-dashed border-stone-300 rounded-2xl shadow-xs">
                <div className="w-14 h-14 bg-blue-50 text-[var(--navy)] rounded-full flex items-center justify-center mx-auto mb-3.5">
                  <Search size={24} />
                </div>
                <h3 className="text-lg font-bold text-stone-900 mb-1.5">No pieces match your filter</h3>
                <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-5">
                  We couldn't find any pieces matching your exact combination. Try clearing some filters or exploring all rooms.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="px-4 py-2 bg-[var(--navy)] hover:bg-[#1b3a6b] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="catalog-grid-4">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={!product.isCustomizable ? (p) => handleAddToCart(p, 1) : undefined}
                    onQuickView={(p) => setQuickViewProduct(p)}
                    onOpenDimensions={(p) => setDimensionProduct(p)}
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
                    onOpenDimensions={(p) => setDimensionProduct(p)}
                  />
                ))}
              </div>
            )}

          </div>
        </section>
      )}
      </main>

      {/* Mobile Filters Drawer Modal */}
      {showMobileFilters && (
        <div 
          className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setShowMobileFilters(false)}
        >
          <div 
            className="bg-white w-[320px] max-w-[85vw] h-full overflow-y-auto p-5 shadow-2xl flex flex-col justify-between"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[var(--navy)]" />
                  <h3 className="text-base font-bold text-stone-900 m-0">Filters</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Categories (Screenshot 3 Hierarchical Dropdowns) */}
              <div className="mb-4 pt-3 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Category & Subsections</h4>
                <div className="max-h-72 overflow-y-auto">
                  <CategoryFilterTree
                    categories={categoryTree}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(slug) => {
                      setSelectedCategory(slug);
                      setSelectedSubCategory(null);
                      setSubCategoryKeywords([]);
                      setSelectedColor(null);
                      setSelectedColorKeyword(null);
                    }}
                    selectedSubCategory={selectedSubCategory}
                    onSelectSubCategory={(slug, keywords) => {
                      setSelectedSubCategory(slug);
                      setSubCategoryKeywords(keywords);
                      if (!slug) {
                        setSelectedColor(null);
                        setSelectedColorKeyword(null);
                      }
                    }}
                    selectedColor={selectedColor}
                    onSelectColor={(colorId, keyword) => {
                      setSelectedColor(colorId);
                      setSelectedColorKeyword(keyword);
                    }}
                  />
                </div>
              </div>

              {/* Mobile Price */}
              <div className="mb-4 pt-3 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Price Range</h4>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-1500', label: `Under ${formatPrice(1500)}` },
                    { id: '1500-3000', label: `${formatPrice(1500)} - ${formatPrice(3000)}` },
                    { id: '3000-7000', label: `${formatPrice(3000)} - ${formatPrice(7000)}` },
                    { id: '7000-plus', label: `Above ${formatPrice(7000)}` },
                  ].map(p => (
                    <label key={p.id} className="nursery-checkbox-item">
                      <input
                        type="radio"
                        name="m-shop-price-bracket"
                        checked={priceRange === p.id}
                        onChange={() => setPriceRange(p.id as any)}
                        className="accent-[var(--navy)]"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile In Stock */}
              <div className="mb-4 pt-3 border-t border-stone-100">
                <label className="nursery-checkbox-item">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-[var(--navy)]"
                  />
                  <span className="font-semibold text-stone-800">In stock pieces only</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="btn btn-secondary btn-sm flex-1"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="btn btn-primary btn-sm flex-1"
              >
                View ({filteredProducts.length})
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

      {/* Add Product Modal for Store Managers */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultRole="ADMIN"
      />

      {/* Interactive Multi-Image Dimension & Angle Viewer Modal */}
      <ArticleDimensionViewer
        product={dimensionProduct}
        isOpen={Boolean(dimensionProduct)}
        onClose={() => setDimensionProduct(null)}
        onAddToCart={(product, qty) => handleAddToCart(product, qty)}
      />

      <Footer />
    </div>
  );
}
