import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { productsApi, Product } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';
import { useLocationContext } from '../contexts/LocationContext';
import { 
  ArrowUpDown, 
  Search, 
  RotateCcw,
  ChevronRight,
  Filter,
  Check,
  Grid3X3,
  LayoutGrid,
  X,
  SlidersHorizontal,
  Sparkles
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
  const [searchQuery, setSearchQuery] = useState<string>(qParam);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount' | 'name'>('featured');
  const [priceRange, setPriceRange] = useState<'all' | 'under-1500' | '1500-3000' | '3000-7000' | '7000-plus'>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [columnCount, setColumnCount] = useState<3 | 4>(4);

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
  const totalProducts = spacesData?.totalProducts || 0;
  const indoorDomain = domains.find(d => d.slug === 'indoor');
  const outdoorDomain = domains.find(d => d.slug === 'outdoor');

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
    }
  }, [spaceParam, domainParam, outdoorDomain]);

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
      // Unselect to domain
      setSelectedSpace(activeDomain === 'all' ? '' : activeDomain);
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
        next.set('domain', activeDomain);
        return next;
      });
    }
  };

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

  const handleResetFilters = () => {
    setActiveDomain('all');
    setSelectedSpace('');
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange('all');
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
    toast('Filters reset', { icon: '🔄' });
  };

  const hasActiveFilters = Boolean(
    selectedSpace || 
    selectedCategory || 
    priceRange !== 'all' || 
    inStockOnly || 
    searchQuery
  );

  // Active space title for display
  const activeSpaceObj = [...(indoorDomain?.children || []), ...(outdoorDomain?.children || [])].find(c => c.slug === selectedSpace);
  const activeCategoryObj = categories?.find(c => c.slug === selectedCategory);

  return (
    <div className="page-wrapper bg-white min-h-screen">
      <Header />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        
        {/* ========================================================================= */}
        {/* 1. EDITORIAL HEADER WITH LIVE PIECES COUNT                                */}
        {/* ========================================================================= */}
        <div className="mb-6 pb-5 border-b border-[#eaeaea] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-1.5 text-xs text-muted mb-2 uppercase tracking-wider">
              <Link to="/" className="hover:text-dark transition-colors">Home</Link>
              <ChevronRight size={12} />
              <span className="text-dark font-medium">Catalog</span>
              {activeDomain !== 'all' && (
                <>
                  <ChevronRight size={12} />
                  <span className="text-dark font-medium capitalize">{activeDomain === 'indoor' ? 'Indoor Living' : 'Outdoor & Botanical'}</span>
                </>
              )}
              {activeSpaceObj && (
                <>
                  <ChevronRight size={12} />
                  <span className="text-[var(--navy)] font-semibold">{activeSpaceObj.name}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-serif italic font-normal text-dark tracking-tight m-0">
                {activeSpaceObj ? activeSpaceObj.name : activeDomain === 'indoor' ? 'Indoor Sanctuaries' : activeDomain === 'outdoor' ? 'Outdoor & Botanical Living' : 'The Curated Collection'}
              </h1>
              <span className="badge badge-navy text-xs font-mono font-semibold px-2.5 py-0.5 mt-1">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-muted mt-1.5 max-w-2xl font-light leading-relaxed m-0">
              {activeSpaceObj?.description || 'Authentic solid Sheesham and Teak hardwoods, hand-hammered brass, bespoke wall murals, and NASA-rated air-purifying botanical living pieces.'}
            </p>
          </div>

          {/* Quick Domain Filter Pills */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <button
              type="button"
              onClick={() => handleDomainSelect('all')}
              className={`shop-domain-tab ${activeDomain === 'all' ? 'active' : ''}`}
            >
              <span>All Pieces</span>
              <span className="shop-filter-count">{totalProducts}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDomainSelect('indoor')}
              className={`shop-domain-tab ${activeDomain === 'indoor' ? 'active' : ''}`}
            >
              <span>🏠 Indoor</span>
              <span className="shop-filter-count">{indoorDomain?.count ?? 0}</span>
            </button>

            <button
              type="button"
              onClick={() => handleDomainSelect('outdoor')}
              className={`shop-domain-tab ${activeDomain === 'outdoor' ? 'active' : ''}`}
            >
              <span>🌿 Outdoor</span>
              <span className="shop-filter-count">{outdoorDomain?.count ?? 0}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. ORGANIZED CONTROL CENTER (SUB-SPACES, SEARCH, CRAFT, BUDGET & SORT)    */}
        {/* ========================================================================= */}
        <div className="shop-control-center">
          
          {/* A. CONTEXTUAL ROOM / ZONE SUB-PILLS */}
          {activeDomain !== 'all' && (
            <div className="mb-4 pb-4 border-b border-[#f0ece4]">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <span>Select {activeDomain === 'indoor' ? 'Room Space' : 'Outdoor Zone'}:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSpaceSelect(activeDomain)}
                  className={`shop-subspace-pill ${selectedSpace === activeDomain || !selectedSpace ? 'active' : ''}`}
                >
                  <span>All {activeDomain === 'indoor' ? 'Indoor Rooms' : 'Outdoor Zones'}</span>
                  <span className="shop-filter-count">
                    {activeDomain === 'indoor' ? (indoorDomain?.count ?? 0) : (outdoorDomain?.count ?? 0)}
                  </span>
                </button>

                {(activeDomain === 'indoor' ? indoorDomain?.children : outdoorDomain?.children)?.map(leaf => {
                  const isSelected = selectedSpace === leaf.slug;
                  return (
                    <button
                      key={leaf.slug}
                      type="button"
                      onClick={() => handleSpaceSelect(leaf.slug)}
                      className={`shop-subspace-pill ${isSelected ? 'active' : ''}`}
                    >
                      <span>{leaf.icon}</span>
                      <span>{leaf.name}</span>
                      <span className="shop-filter-count">{leaf.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* B. STREAMLINED TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Left Controls: Search, Craft, Budget, In-Stock */}
            <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-[280px]">
              {/* Quick Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search pieces, wood, brass..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-8 pr-7 py-2 rounded-lg bg-[#faf9f7] border border-[#ded9d0] focus:border-[var(--navy)] focus:bg-white focus:outline-none w-48 sm:w-56 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-black border-none bg-transparent cursor-pointer p-0 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Craft / Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs bg-[#faf9f7] border border-[#ded9d0] rounded-lg px-3 py-2 pr-8 font-medium text-dark focus:outline-none focus:border-[var(--navy)] focus:bg-white cursor-pointer transition-all"
                >
                  <option value="">Artisan Craft: All</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Budget Range Dropdown */}
              <div className="relative">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value as any)}
                  className="text-xs bg-[#faf9f7] border border-[#ded9d0] rounded-lg px-3 py-2 pr-8 font-medium text-dark focus:outline-none focus:border-[var(--navy)] focus:bg-white cursor-pointer transition-all"
                >
                  <option value="all">Budget: All Prices</option>
                  <option value="under-1500">Under {formatPrice(1500)}</option>
                  <option value="1500-3000">{formatPrice(1500)} – {formatPrice(3000)}</option>
                  <option value="3000-7000">{formatPrice(3000)} – {formatPrice(7000)}</option>
                  <option value="7000-plus">Above {formatPrice(7000)}</option>
                </select>
              </div>

              {/* In Stock Toggle Pill */}
              <label className={`flex items-center gap-1.5 cursor-pointer text-xs font-medium px-3 py-2 rounded-lg border transition-all select-none ${
                inStockOnly 
                  ? 'border-[var(--navy)] bg-[#f4f7fb] text-[var(--navy)] font-semibold' 
                  : 'border-[#ded9d0] bg-[#faf9f7] text-dark hover:border-[#cfcfcf]'
              }`}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded cursor-pointer accent-[var(--navy)]"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Right Controls: Sort & Grid Layout */}
            <div className="flex items-center gap-2.5 flex-wrap ml-auto">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-muted hidden sm:inline">Sort:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs bg-[#faf9f7] border border-[#ded9d0] rounded-lg px-3 py-2 pr-8 font-medium text-dark focus:outline-none focus:border-[var(--navy)] focus:bg-white cursor-pointer transition-all"
                  >
                    <option value="featured">Featured Curations</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="discount">Highest Guild Discount</option>
                    <option value="name">Piece Name: A to Z</option>
                  </select>
                </div>
              </div>

              {/* Grid Column Layout Switcher (3 vs 4 columns) */}
              <div className="hidden sm:flex items-center border border-[#ded9d0] rounded-lg bg-[#faf9f7] p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setColumnCount(3)}
                  className={`p-1.5 rounded-md cursor-pointer border-none transition-all ${
                    columnCount === 3 ? 'bg-[var(--navy)] text-white shadow-sm' : 'text-muted hover:text-black bg-transparent'
                  }`}
                  title="3 Columns Wide View"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setColumnCount(4)}
                  className={`p-1.5 rounded-md cursor-pointer border-none transition-all ${
                    columnCount === 4 ? 'bg-[var(--navy)] text-white shadow-sm' : 'text-muted hover:text-black bg-transparent'
                  }`}
                  title="4 Columns Compact View"
                >
                  <Grid3X3 size={14} />
                </button>
              </div>
            </div>

          </div>

          {/* C. ACTIVE FILTER TAGS & RESET */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-[#f0ece4] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted font-medium">Active Filters:</span>

              {selectedSpace && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2f0eb] text-dark border border-[#ded9d0] font-medium">
                  <span>Space: {activeSpaceObj?.name || selectedSpace}</span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedSpace('')} 
                    className="hover:text-red-600 border-none bg-transparent cursor-pointer p-0 font-bold text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}

              {activeCategoryObj && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2f0eb] text-dark border border-[#ded9d0] font-medium">
                  <span>Craft: {activeCategoryObj.name}</span>
                  <button 
                    type="button" 
                    onClick={() => setSelectedCategory('')} 
                    className="hover:text-red-600 border-none bg-transparent cursor-pointer p-0 font-bold text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}

              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2f0eb] text-dark border border-[#ded9d0] font-medium">
                  <span>Budget: {priceRange}</span>
                  <button 
                    type="button" 
                    onClick={() => setPriceRange('all')} 
                    className="hover:text-red-600 border-none bg-transparent cursor-pointer p-0 font-bold text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2f0eb] text-dark border border-[#ded9d0] font-medium">
                  <span>In Stock Only</span>
                  <button 
                    type="button" 
                    onClick={() => setInStockOnly(false)} 
                    className="hover:text-red-600 border-none bg-transparent cursor-pointer p-0 font-bold text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f2f0eb] text-dark border border-[#ded9d0] font-medium">
                  <span>"{searchQuery}"</span>
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')} 
                    className="hover:text-red-600 border-none bg-transparent cursor-pointer p-0 font-bold text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-red-600 hover:underline border-none bg-transparent cursor-pointer font-semibold ml-2 flex items-center gap-1"
              >
                <RotateCcw size={12} /> Reset All
              </button>
            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 3. PRODUCT GRID (ORGANIZED 3-COL / 4-COL PROPORTIONS)                     */}
        {/* ========================================================================= */}
        {isLoading ? (
          <div className="loading-spinner mx-auto my-24"></div>
        ) : filteredProducts.length > 0 ? (
          <div className={`grid gap-6 ${columnCount === 4 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}`}>
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
          <div className="text-center py-20 bg-[#faf9f7] rounded-xl border border-[#ded9d0]">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-muted mx-auto mb-3 border border-[#ded9d0] shadow-sm">
              <Search size={22} />
            </div>
            <h3 className="text-xl font-serif italic font-normal text-dark m-0 mb-1">
              No Pieces Match Your Active Selection
            </h3>
            <p className="text-xs text-muted mb-5 max-w-sm mx-auto font-light leading-relaxed">
              Try choosing a different room space, clearing the craft filter, or adjusting your budget range.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-sm btn-primary text-xs px-5 py-2.5 font-semibold uppercase tracking-wider"
            >
              Reset All Filters
            </button>
          </div>
        )}
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
