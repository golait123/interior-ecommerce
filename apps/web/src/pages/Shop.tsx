import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productsApi, Product } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';
import { 
  ArrowUpDown, 
  Search, 
  Sparkles, 
  RotateCcw,
  Layers,
  ChevronRight,
  Filter,
  Check,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  // URL state
  const spaceParam = searchParams.get('space') || '';
  const domainParam = searchParams.get('domain') || '';
  const categoryParam = searchParams.get('category') || '';
  const qParam = searchParams.get('q') || '';

  // Local filter states
  const [activeDomain, setActiveDomain] = useState<'indoor' | 'outdoor'>(
    domainParam === 'outdoor' ? 'outdoor' : 'indoor'
  );
  const [selectedSpace, setSelectedSpace] = useState<string>(spaceParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(qParam);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount' | 'name'>('featured');
  const [priceRange, setPriceRange] = useState<'all' | 'under-1500' | '1500-3000' | '3000-7000' | '7000-plus'>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Fetch Tree Data
  const { data: spacesData } = useQuery({
    queryKey: ['spaces-tree'],
    queryFn: productsApi.spacesTree
  });

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

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.categories
  });

  const domains = spacesData?.domains || [];
  const currentDomainObj = domains.find(d => d.slug === activeDomain);

  // Sync state if spaceParam changes externally
  useEffect(() => {
    if (spaceParam) {
      setSelectedSpace(spaceParam);
      // Determine domain of space
      const isOutdoor = domains.find(d => d.slug === 'outdoor')?.children.some(c => c.slug === spaceParam);
      if (isOutdoor || spaceParam === 'outdoor') {
        setActiveDomain('outdoor');
      } else {
        setActiveDomain('indoor');
      }
    }
  }, [spaceParam, domains]);

  const handleDomainSwitch = (domain: 'indoor' | 'outdoor') => {
    setActiveDomain(domain);
    setSelectedSpace(domain);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('domain', domain);
      next.set('space', domain);
      return next;
    });
  };

  const handleSpaceSelect = (slug: string) => {
    setSelectedSpace(slug);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('space', slug);
      next.set('domain', activeDomain);
      return next;
    });
  };

  // Find active space leaf metadata
  const activeLeaf = currentDomainObj?.children.find(c => c.slug === selectedSpace);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let items = productsData?.items ? [...productsData.items] : [];

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
        const avail = p.inventory.totalQuantity - p.inventory.reservedQuantity - p.inventory.damagedQuantity;
        return avail > 0;
      });
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
  }, [productsData?.items, priceRange, inStockOnly, sortBy]);

  const handleAddToCart = async (product: Product, quantity = 1) => {
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${product.name} to cart!`);
    } catch {
      toast.error('Please login to add items to cart.');
    }
  };

  const handleResetFilters = () => {
    setSelectedSpace(activeDomain);
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange('all');
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
    toast('Filters reset', { icon: '🔄' });
  };

  const hasActiveFilters = Boolean(
    (selectedSpace && selectedSpace !== 'indoor' && selectedSpace !== 'outdoor') || 
    selectedCategory || 
    priceRange !== 'all' || 
    inStockOnly || 
    searchQuery
  );

  return (
    <div className="page-wrapper bg-[#f7f5f0] min-h-screen">
      <Header />

      <main className="max-w-[1440px] mx-auto px-3 sm:px-6 py-4">
        {/* Top Breadcrumb & Page Banner */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border" style={{ borderColor: '#ded9d0' }}>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted mb-1">
              <span className="cursor-pointer hover:underline" onClick={() => navigate('/')}>Home</span>
              <ChevronRight size={12} />
              <span className="font-semibold text-dark">Blinkit-Style Architectural Shop</span>
              <ChevronRight size={12} />
              <span className="text-accent uppercase font-bold">
                {activeDomain === 'indoor' ? 'Indoor Sanctuaries' : 'Outdoor & Open-Air Living'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-playfair font-normal m-0 text-dark">
              {activeDomain === 'indoor' ? 'Indoor Architectural Spaces' : 'Outdoor, Lawn & Garden Decor'}
            </h1>
            <p className="text-xs text-muted mt-1 m-0">
              Browse authentic Sector 58 Banjara Market furniture, mirrors, brass decor, and rugs categorized room by room.
            </p>
          </div>

          {/* Blinkit Domain Tabs (Indoor vs Outdoor) */}
          <div className="inline-flex rounded-lg p-1 bg-[#ede6da] border" style={{ borderColor: '#ded9d0' }}>
            <button
              type="button"
              onClick={() => handleDomainSwitch('indoor')}
              className={`px-4 py-2 rounded-md text-xs font-bold cursor-pointer transition-all border-none flex items-center gap-2 ${
                activeDomain === 'indoor'
                  ? 'bg-[#2d2a27] text-white shadow-sm'
                  : 'bg-transparent text-[#2d2a27] hover:text-black'
              }`}
            >
              <span className="text-sm">🏠</span>
              <span>Indoor Spaces</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeDomain === 'indoor' ? 'bg-[#8c6f52] text-white' : 'bg-white/60 text-[#2d2a27]'
              }`}>
                40
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDomainSwitch('outdoor')}
              className={`px-4 py-2 rounded-md text-xs font-bold cursor-pointer transition-all border-none flex items-center gap-2 ${
                activeDomain === 'outdoor'
                  ? 'bg-[#2d2a27] text-white shadow-sm'
                  : 'bg-transparent text-[#2d2a27] hover:text-black'
              }`}
            >
              <span className="text-sm">🌿</span>
              <span>Outdoor & Garden</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeDomain === 'outdoor' ? 'bg-[#6a8c6f] text-white' : 'bg-white/60 text-[#2d2a27]'
              }`}>
                25
              </span>
            </button>
          </div>
        </div>

        {/* 2-COLUMN BLINKIT SHOPPING LAYOUT */}
        <div className="flex flex-col md:flex-row gap-5 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT STICKY SIDEBAR: CATEGORY / ROOM NAVIGATION (BLINKIT STYLE)           */}
          {/* ========================================================================= */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-white rounded-xl border p-3.5 shadow-2xs md:sticky md:top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar" style={{ borderColor: '#ded9d0' }}>
            
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b" style={{ borderColor: '#ded9d0' }}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-dark uppercase tracking-wider">
                <Layers size={14} className="text-accent" />
                <span>{activeDomain === 'indoor' ? 'Indoor Rooms' : 'Outdoor Zones'}</span>
              </div>
              <span className="text-[10px] text-muted font-mono font-semibold">
                {currentDomainObj?.children.length || 0} Categories
              </span>
            </div>

            {/* Room List (Blinkit vertical category rail) */}
            <div className="space-y-1">
              {/* "All [Domain]" Option */}
              <button
                type="button"
                onClick={() => handleSpaceSelect(activeDomain)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-between border ${
                  selectedSpace === activeDomain || !selectedSpace
                    ? 'bg-[#2d2a27] text-white border-[#2d2a27] shadow-2xs'
                    : 'bg-[#faf8f5] text-dark border-transparent hover:bg-[#f2ece2]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{activeDomain === 'indoor' ? '🏠' : '🌿'}</span>
                  <span>All {activeDomain === 'indoor' ? 'Indoor Sanctuaries' : 'Outdoor & Garden'}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  selectedSpace === activeDomain || !selectedSpace ? 'bg-[#8c6f52] text-white' : 'bg-[#ded9d0] text-dark'
                }`}>
                  {currentDomainObj?.count || 0}
                </span>
              </button>

              {/* Individual Rooms / Zones */}
              {currentDomainObj?.children.map(leaf => {
                const isSelected = selectedSpace === leaf.slug;
                return (
                  <button
                    key={leaf.slug}
                    type="button"
                    onClick={() => handleSpaceSelect(leaf.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-[#f4efe6] text-dark border-accent font-bold shadow-2xs'
                        : 'bg-white text-[#2d2a27] border-transparent hover:bg-[#faf8f5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base shrink-0">{leaf.icon}</span>
                      <span className="truncate">{leaf.name}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                      isSelected ? 'bg-accent text-white' : 'bg-[#eee8df] text-[#63574b]'
                    }`}>
                      {leaf.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Craft Category Filter Chips */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#ded9d0' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                  <Tag size={12} className="text-accent" />
                  <span>Artisan Craft</span>
                </span>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory('')}
                    className="text-[10px] text-accent hover:underline border-none bg-transparent cursor-pointer p-0"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5">
                {categories?.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                      selectedCategory === cat.slug
                        ? 'bg-dark text-white border-dark font-semibold'
                        : 'bg-[#faf8f5] text-dark border-[#ded9d0] hover:border-gray-400'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Price Budget in Sidebar */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: '#ded9d0' }}>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2">
                Price Budget
              </span>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as any)}
                className="w-full text-xs border rounded bg-[#faf8f5] py-1.5 px-2 font-medium cursor-pointer focus:outline-none"
                style={{ borderColor: '#ded9d0' }}
              >
                <option value="all">All Budgets</option>
                <option value="under-1500">Under ₹1,500</option>
                <option value="1500-3000">₹1,500 – ₹3,000</option>
                <option value="3000-7000">₹3,000 – ₹7,000</option>
                <option value="7000-plus">Above ₹7,000</option>
              </select>
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* RIGHT MAIN PRODUCT AREA (BLINKIT FAST PRODUCT GRID)                       */}
          {/* ========================================================================= */}
          <div className="flex-1 w-full">
            
            {/* Header Toolbar: Active Space Title, Search, In-Stock, Sort */}
            <div className="bg-white p-3.5 rounded-xl border mb-4 shadow-2xs" style={{ borderColor: '#ded9d0' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b" style={{ borderColor: '#ede7dd' }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {activeLeaf ? activeLeaf.icon : (activeDomain === 'indoor' ? '🏠' : '🌿')}
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-dark m-0 flex items-center gap-2">
                      <span>{activeLeaf ? activeLeaf.name : (activeDomain === 'indoor' ? 'All Indoor Sanctuaries' : 'All Outdoor & Garden')}</span>
                      <span className="text-xs px-2 py-0.2 rounded-full bg-[#f2ece2] text-dark font-mono font-bold">
                        {filteredProducts.length} items
                      </span>
                    </h2>
                    <p className="text-[11px] text-muted m-0 mt-0.5">
                      {activeLeaf ? activeLeaf.description : `Curated collection designed for modern ${activeDomain} architecture`}
                    </p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search in this space..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border bg-[#faf8f5] focus:outline-none focus:bg-white transition-colors"
                    style={{ borderColor: '#ded9d0' }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-dark border-none bg-transparent cursor-pointer p-0 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Controls Row */}
              <div className="pt-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Active Filter Chips & Reset */}
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f2ece2] text-dark border border-[#ded9d0] font-medium text-[11px]">
                      <span>Craft: {selectedCategory}</span>
                      <button onClick={() => setSelectedCategory('')} className="text-muted hover:text-danger border-none bg-transparent cursor-pointer p-0 leading-none">✕</button>
                    </span>
                  )}

                  {priceRange !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f2ece2] text-dark border border-[#ded9d0] font-medium text-[11px]">
                      <span>{priceRange}</span>
                      <button onClick={() => setPriceRange('all')} className="text-muted hover:text-danger border-none bg-transparent cursor-pointer p-0 leading-none">✕</button>
                    </span>
                  )}

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] text-danger hover:underline border-none bg-transparent cursor-pointer font-semibold flex items-center gap-1"
                    >
                      <RotateCcw size={11} /> Reset
                    </button>
                  )}
                </div>

                {/* In Stock & Sort Dropdown */}
                <div className="flex items-center gap-3 ml-auto">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-dark select-none">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded cursor-pointer accent-accent"
                    />
                    <span>In Stock Only</span>
                  </label>

                  <div className="flex items-center gap-1">
                    <ArrowUpDown size={13} className="text-muted" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-xs border rounded bg-white py-1 px-2 font-medium cursor-pointer focus:outline-none"
                      style={{ borderColor: '#ded9d0' }}
                    >
                      <option value="featured">Sort: Featured</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="discount">Discount: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className="loading-spinner mx-auto my-20"></div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="text-center py-16 bg-white border rounded-xl shadow-2xs" style={{ borderColor: '#ded9d0' }}>
                <div className="w-12 h-12 rounded-full bg-[#faf8f5] flex items-center justify-center text-muted mx-auto mb-3">
                  <Search size={22} />
                </div>
                <h3 className="text-base font-bold text-dark m-0 mb-1">No pieces found in this category</h3>
                <p className="text-xs text-muted mb-4 max-w-sm mx-auto">
                  Try switching rooms, clearing the craft filter, or resetting your budget range.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-secondary btn-sm text-xs font-semibold px-4 py-1.5"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
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
