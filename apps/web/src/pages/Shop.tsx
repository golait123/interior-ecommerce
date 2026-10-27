import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { productsApi, Product } from '../api/products';
import { useCart, setPendingCartItem } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';
import { AddProductModal } from '../components/AddProductModal';
import { MobileQuickCatalog } from '../components/MobileQuickCatalog';
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

  // Lock body scroll when filter drawer is open to prevent background bleed and scroll glitch
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileFilters]);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
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

  // Determine effective domain & space for API query
  const isDomainSpace = !selectedSpace || 
    selectedSpace === 'all' || 
    selectedSpace === 'indoor' || 
    selectedSpace === 'outdoor' || 
    selectedSpace === 'interior' || 
    selectedSpace === 'exterior' || 
    selectedSpace === activeDomain;

  const queryDomain = (selectedSpace === 'indoor' || selectedSpace === 'interior')
    ? 'indoor'
    : (selectedSpace === 'outdoor' || selectedSpace === 'exterior')
    ? 'outdoor'
    : (activeDomain !== 'all' ? activeDomain : undefined);

  const querySpace = isDomainSpace ? undefined : selectedSpace;

  // Fetch Products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', { q: searchQuery, category: selectedCategory, space: querySpace, domain: queryDomain }],
    queryFn: () => productsApi.list({ 
      q: searchQuery, 
      category: selectedCategory, 
      space: querySpace, 
      domain: queryDomain,
      limit: 100 
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
    return categories.filter(c => c?.name?.toLowerCase().includes(categorySearch.toLowerCase()));
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

    // Filter by Domain (Indoor vs Outdoor vs All)
    const effectiveDomain = (selectedSpace === 'indoor' || selectedSpace === 'interior')
      ? 'indoor'
      : (selectedSpace === 'outdoor' || selectedSpace === 'exterior')
      ? 'outdoor'
      : activeDomain;

    if (effectiveDomain && effectiveDomain !== 'all') {
      items = items.filter(p => p.primaryDomain === effectiveDomain || p.primaryDomain === 'both');
    }

    // Filter by Selected Space / Room (Living Room, Bedroom, Dining, Balcony, Pooja, etc.)
    const isDomainOnly = !selectedSpace || 
      selectedSpace === 'all' || 
      selectedSpace === 'indoor' || 
      selectedSpace === 'outdoor' || 
      selectedSpace === 'interior' || 
      selectedSpace === 'exterior' || 
      selectedSpace === activeDomain;

    if (!isDomainOnly) {
      const sSlug = selectedSpace.toLowerCase().trim();
      const sKey = sSlug.replace(/-/g, ' ');

      items = items.filter(p => {
        // Direct match in spaceSlugs array
        if (Array.isArray(p.spaceSlugs) && p.spaceSlugs.length > 0) {
          return p.spaceSlugs.some(s => s.toLowerCase() === sSlug || s.toLowerCase().includes(sSlug));
        }

        // Direct match in spaces object array
        if (Array.isArray(p.spaces) && p.spaces.length > 0) {
          return p.spaces.some((s: any) => {
            if (!s) return false;
            if (typeof s === 'string') return s.toLowerCase() === sSlug;
            return s.slug?.toLowerCase() === sSlug || (s.name && s.name.toLowerCase().includes(sKey));
          });
        }

        // Fallback to keyword in name or description only if no space metadata exists
        const text = `${p.name} ${p.description || ''} ${p.category?.name || ''}`.toLowerCase();
        return text.includes(sKey) || text.includes(sSlug.replace(/-/g, ' '));
      });
    }

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
  }, [productsData?.items, selectedSpace, activeDomain, subCategoryKeywords, selectedColorKeyword, priceRange, inStockOnly, selectedRating, sortBy]);

  // Progressive Infinite Scroll (Loads 8 items per scroll batch, matching 2x4 orientation)
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset visibleCount whenever any filter or search changes
  useEffect(() => {
    setVisibleCount(8);
  }, [
    selectedSpace,
    activeDomain,
    selectedCategory,
    subCategoryKeywords,
    selectedColorKeyword,
    priceRange,
    inStockOnly,
    selectedRating,
    searchQuery,
    sortBy,
  ]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  // IntersectionObserver for auto-loading next batch when scrolling near bottom
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 8, filteredProducts.length));
        }
      },
      { root: null, rootMargin: '350px 0px', threshold: 0.05 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, filteredProducts.length]);

  // Window scroll fallback listener
  useEffect(() => {
    if (!hasMore) return;
    const handleScroll = () => {
      const scrollPos = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 500;
      if (scrollPos >= threshold) {
        setVisibleCount(prev => Math.min(prev + 8, filteredProducts.length));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, filteredProducts.length]);

  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (!user) {
      setPendingCartItem({
        productId: product.id,
        quantity,
        productName: product.name,
        returnTo: window.location.pathname + window.location.search,
      });
      toast('Please sign in to add this piece to your cart. We\'ve saved your selection!', {
        id: 'signin-to-add-toast',
        icon: '🔐',
        duration: 4000,
      });
      navigate('/login?returnTo=/cart&reason=add_to_cart');
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
        {/* 1. TRUST BADGES RIBBON (DESKTOP ONLY - HIDDEN ON MOBILE)                  */}
        {/* ========================================================================= */}
        <div className="nl-trust-ribbon hidden md:block">
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
        {/* 2. HERO STUDIO HEADER (DESKTOP ONLY - HIDDEN ON MOBILE)                   */}
        {/* ========================================================================= */}
        <header className={`nl-hero-header hidden md:block ${activeDomain === 'indoor' ? 'domain-theme-indoor' : activeDomain === 'outdoor' ? 'domain-theme-outdoor' : ''}`}>
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
                  <span className="text-[#86efac] font-semibold">{activeSpaceObj?.name || activeSpaceObj?.slug}</span>
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
                    ? (activeSpaceObj?.name || activeSpaceObj?.slug)
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

        {/* DEDICATED SYSTEMATIC MOBILE SHOP HEADER (Mobile Only) */}
        <div className="md:hidden px-3 pt-3 pb-1 bg-stone-50 border-b border-stone-200">
          <div className="grid grid-cols-3 gap-1.5 bg-stone-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleDomainSelect('indoor')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-none ${
                activeDomain === 'indoor'
                  ? 'bg-[#0f2444] text-white shadow-xs'
                  : 'text-stone-700 bg-transparent hover:text-stone-900'
              }`}
            >
              <span>🏠 Interior</span>
            </button>
            <button
              type="button"
              onClick={() => handleDomainSelect('outdoor')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-none ${
                activeDomain === 'outdoor'
                  ? 'bg-[#15803d] text-white shadow-xs'
                  : 'text-stone-700 bg-transparent hover:text-stone-900'
              }`}
            >
              <span>🌿 Exterior</span>
            </button>
            <button
              type="button"
              onClick={() => handleDomainSelect('all')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border-none ${
                activeDomain === 'all'
                  ? 'bg-[#8c6f52] text-white shadow-xs'
                  : 'text-stone-700 bg-transparent hover:text-stone-900'
              }`}
            >
              <span>✨ All Spaces</span>
            </button>
          </div>
        </div>

        {/* Store Manager Controls Bar (ADMIN / STOCK_MANAGER) */}
        {user && (user.role === 'ADMIN' || user.role === 'STOCK_MANAGER') && (
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-4">
            <div className="p-3.5 rounded-xl bg-[#faf7f2] border border-[#e8dfd5] flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="badge badge-blue">Store Manager Mode</span>
                <span className="text-xs text-[#555]">
                  Logged in as <strong>{user?.name || user?.email || 'Store Manager'}</strong> ({user?.role || 'ADMIN'}). You have full catalog management access.
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

              {activeDomainSpaces.filter(Boolean).map(leaf => {
                if (!leaf) return null;
                const isSelected = selectedSpace === leaf.slug;
                const emoji = getSpaceEmoji(leaf.slug || '');
                return (
                  <button
                    key={leaf.slug || Math.random()}
                    type="button"
                    onClick={() => handleSpaceSelect(leaf.slug)}
                    className={`nursery-pill-btn ${isSelected ? 'active' : ''}`}
                  >
                    <span>{emoji} {leaf.name || leaf.slug}</span>
                    {(leaf.count || 0) > 0 && <span className="nursery-pill-badge">{leaf.count}</span>}
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
        {/* 3. CATALOG LAYOUT WITH FILTERS SIDEBAR AND PRODUCT GRID                   */}
        {/* ========================================================================= */}
        <section className="nursery-catalog-layout">
          {/* ======================================================================= */}
          {/* LEFT SIDEBAR: FILTERS CARD ACCORDIONS (DESKTOP ONLY)                     */}
          {/* ======================================================================= */}
          <aside className="nursery-sidebar-filters hidden lg:block">
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
          {/* RIGHT COLUMN: UNIFIED SMART TOOLBAR & PRODUCT GRID                       */}
          {/* ======================================================================= */}
          <div className="flex-1 w-full min-w-0">

            {/* UNIFIED SMART COMMERCE TOOLBAR (Consolidated Space-Efficient Design) */}
            <div className="shop-smart-toolbar">
              {/* Left group: Filter Trigger + Item Count + Inline Active Filter Badges */}
              <div className="shop-toolbar-left">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  className="shop-filter-trigger-btn"
                  title="Filter catalog"
                >
                  <SlidersHorizontal size={13} />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="shop-filter-badge">{activeFiltersCount}</span>
                  )}
                </button>

                <div className="shop-item-counter">
                  Showing <strong>{hasMore ? `${displayedProducts.length} of ${filteredProducts.length}` : filteredProducts.length}</strong> pieces
                </div>

                {/* Inline Active Filters Pills (Utilizing free horizontal space wisely) */}
                {selectedSpace && selectedSpace !== activeDomain && (
                  <div className="shop-inline-pill">
                    <span>{activeSpaceObj?.name || selectedSpace}</span>
                    <button type="button" onClick={() => handleSpaceSelect(activeDomain === 'all' ? '' : activeDomain)} aria-label="Remove space filter">
                      <X size={11} />
                    </button>
                  </div>
                )}

                {selectedCategory && (
                  <div className="shop-inline-pill">
                    <span>{activeCategoryObj?.name || selectedCategory}</span>
                    <button type="button" onClick={() => handleCategorySelect('')} aria-label="Remove category filter">
                      <X size={11} />
                    </button>
                  </div>
                )}

                {priceRange !== 'all' && (
                  <div className="shop-inline-pill">
                    <span>{priceRange.replace('-', ' ')}</span>
                    <button type="button" onClick={() => setPriceRange('all')} aria-label="Remove price filter">
                      <X size={11} />
                    </button>
                  </div>
                )}

                {inStockOnly && (
                  <div className="shop-inline-pill">
                    <span>In Stock</span>
                    <button type="button" onClick={() => setInStockOnly(false)} aria-label="Remove in stock filter">
                      <X size={11} />
                    </button>
                  </div>
                )}

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="shop-clear-all-link"
                    title="Clear all active filters"
                  >
                    <RotateCcw size={11} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Center group: Smart Compact Search Box */}
              <div className="shop-toolbar-search">
                <Search size={14} className="shop-search-icon" />
                <input
                  type="text"
                  placeholder="Search pieces, wallpapers, plants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="shop-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="shop-search-clear"
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Right group: Sort By & View Mode */}
              <div className="shop-toolbar-right">
                <div className="shop-sort-box">
                  <span className="shop-sort-label">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="shop-sort-select"
                  >
                    <option value="featured">Best Selling</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="discount">Top Discount</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>

                <div className="shop-view-toggle">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`shop-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    title="Grid View (4 columns)"
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`shop-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    title="List View"
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>
            </div>

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
              <>
                <div className="catalog-grid-4">
                  {displayedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={!product.isCustomizable ? (p) => handleAddToCart(p, 1) : undefined}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>
                {/* Infinite Scroll Sentinel & Loader */}
                <div ref={sentinelRef} className="h-8 w-full flex items-center justify-center my-2 pointer-events-none" />
                {hasMore && (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-stone-500">
                    <div className="w-6 h-6 border-2 border-stone-200 border-t-[#0f2444] rounded-full animate-spin" />
                    <span className="text-xs font-medium">Loading more pieces...</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayedProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={!product.isCustomizable ? (p) => handleAddToCart(p, 1) : undefined}
                      onQuickView={(p) => setQuickViewProduct(p)}
                    />
                  ))}
                </div>
                {/* Infinite Scroll Sentinel & Loader */}
                <div ref={sentinelRef} className="h-8 w-full flex items-center justify-center my-2 pointer-events-none" />
                {hasMore && (
                  <div className="py-6 flex flex-col items-center justify-center gap-2 text-stone-500">
                    <div className="w-6 h-6 border-2 border-stone-200 border-t-[#0f2444] rounded-full animate-spin" />
                    <span className="text-xs font-medium">Loading more pieces...</span>
                  </div>
                )}
              </>
            )}

          </div>
        </section>
      </main>

      {/* Clean Off-Canvas Filter Drawer (Solid, Zero-Blur, No Background Bleed) */}
      {showMobileFilters && (
        <div 
          className="fixed inset-0 z-[10020] flex bg-black/45"
          onClick={() => setShowMobileFilters(false)}
        >
          <div 
            className="bg-white w-[350px] max-w-[90vw] h-full shadow-2xl flex flex-col z-[10030] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Solid Sticky Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-[#0f2444]" />
                <h3 className="text-base font-bold text-stone-900 m-0">Catalog Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors"
                aria-label="Close filters drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Solid Content Area */}
            <div className="flex-1 overflow-y-auto p-4 overscroll-contain bg-white space-y-4">
              {/* Category & Subsections */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Category & Subsections</h4>
                <div className="max-h-72 overflow-y-auto border border-stone-200 rounded-lg p-2 bg-stone-50/50">
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

              {/* Price Range */}
              <div className="pt-3 border-t border-stone-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Price Range</h4>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under-1500', label: `Under ${formatPrice(1500)}` },
                    { id: '1500-3000', label: `${formatPrice(1500)} - ${formatPrice(3000)}` },
                    { id: '3000-7000', label: `${formatPrice(3000)} - ${formatPrice(7000)}` },
                    { id: '7000-plus', label: `Above ${formatPrice(7000)}` },
                  ].map(p => (
                    <label key={p.id} className="nursery-checkbox-item cursor-pointer">
                      <input
                        type="radio"
                        name="m-shop-price-bracket"
                        checked={priceRange === p.id}
                        onChange={() => setPriceRange(p.id as any)}
                        className="accent-[#0f2444]"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* In Stock Only */}
              <div className="pt-3 border-t border-stone-100">
                <label className="nursery-checkbox-item cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-[#0f2444]"
                  />
                  <span className="font-semibold text-stone-800">In stock pieces only</span>
                </label>
              </div>
            </div>

            {/* Solid Sticky Footer Actions */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="btn btn-secondary btn-sm flex-1 py-2 font-semibold"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="btn btn-primary btn-sm flex-1 py-2 font-semibold"
              >
                Apply ({filteredProducts.length})
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

      <Footer />
    </div>
  );
}
