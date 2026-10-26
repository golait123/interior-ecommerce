import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Ruler, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  MapPin,
  Compass,
  Layers,
  Leaf,
  Trees,
  DoorOpen,
  Bed,
  Utensils,
  BookOpen,
  Tv,
  Bath,
  Baby,
  Sun,
  Armchair
} from 'lucide-react';
import { Product } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocationContext } from '../contexts/LocationContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface MobileQuickCatalogProps {
  products: Product[];
  onAddToCart?: (product: Product, quantity: number) => Promise<void>;
  onOpenQuickView?: (product: Product) => void;
}

// Interior & Exterior dedicated category structure for the left rail
const INTERIOR_CATEGORIES = [
  { id: 'all-interior', name: 'All Interior', icon: '🏠', countLabel: '140+ Items' },
  { id: 'living-room', name: 'Living Rooms', icon: '🛋️', countLabel: '36 Items' },
  { id: 'wallpapers', name: 'Wallpapers', icon: '🖼️', countLabel: '48 Items' },
  { id: 'bedroom', name: 'Bedrooms', icon: '🛏️', countLabel: '28 Items' },
  { id: 'dining', name: 'Dining Suites', icon: '🍽️', countLabel: '18 Items' },
  { id: 'murals', name: 'Wall Murals', icon: '🎨', countLabel: '22 Items' },
  { id: 'study-room', name: 'Home Office', icon: '📚', countLabel: '15 Items' },
  { id: 'lighting', name: 'Luxury Lights', icon: '💡', countLabel: '24 Items' },
  { id: 'pooja-room', name: 'Mandir Decor', icon: '🪔', countLabel: '12 Items' },
  { id: 'bathroom', name: 'Bath & Vanity', icon: '🛁', countLabel: '14 Items' },
  { id: 'kids-room', name: 'Kids Nursery', icon: '🧸', countLabel: '16 Items' },
];

const EXTERIOR_CATEGORIES = [
  { id: 'all-exterior', name: 'All Exterior', icon: '🌿', countLabel: '90+ Items' },
  { id: 'balcony', name: 'Balconies', icon: '🪴', countLabel: '28 Items' },
  { id: 'lawn', name: 'Garden & Lawn', icon: '🌳', countLabel: '32 Items' },
  { id: 'patio', name: 'Courtyard & Patio', icon: '☀️', countLabel: '18 Items' },
  { id: 'terrace', name: 'Rooftop Terrace', icon: '🏙️', countLabel: '20 Items' },
  { id: 'home-nursery', name: 'Botanical Plants', icon: '🌱', countLabel: '45 Items' },
  { id: 'parking', name: 'Porch & Cladding', icon: '🚗', countLabel: '14 Items' },
];

const ALL_CATEGORIES = [
  { id: 'all', name: 'All Spaces', icon: '✨', countLabel: 'All 240+' },
  ...INTERIOR_CATEGORIES.slice(1),
  ...EXTERIOR_CATEGORIES.slice(1)
];

// Subcategory filter chips
const INTERIOR_SUB_CHIPS = ['All', 'Peel & Stick', '3D Acoustic', 'Botanical', 'Textured Linen', 'Solid Teak', 'Antique Brass'];
const EXTERIOR_SUB_CHIPS = ['All', 'Air Purifying', 'Self-Watering', 'Balcony Planters', 'Weatherproof', 'Terracotta', 'Lawn Turf'];

export function MobileQuickCatalog({
  products,
  onAddToCart,
  onOpenQuickView
}: MobileQuickCatalogProps) {
  const { user } = useAuth();
  const { cart, addItem, updateItem, removeItem } = useCart();
  const { currentCountry } = useLocationContext();
  const navigate = useNavigate();

  // Top Domain Toggle: Interior vs. Exterior vs. All
  const [activeDomain, setActiveDomain] = useState<'interior' | 'exterior' | 'all'>('interior');

  // Left Category Rail selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all-interior');

  // Right Feed Subcategory Chip
  const [selectedSubChip, setSelectedSubChip] = useState<string>('All');

  // Search & Sort
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  // Active Multi-image preview indexes per card
  const [cardImageIndexes, setCardImageIndexes] = useState<Record<string, number>>({});

  // Categories list based on domain
  const currentCategories = useMemo(() => {
    if (activeDomain === 'interior') return INTERIOR_CATEGORIES;
    if (activeDomain === 'exterior') return EXTERIOR_CATEGORIES;
    return ALL_CATEGORIES;
  }, [activeDomain]);

  // Handle Domain Change
  const handleDomainChange = (domain: 'interior' | 'exterior' | 'all') => {
    setActiveDomain(domain);
    setSelectedSubChip('All');
    if (domain === 'interior') setSelectedCategoryId('all-interior');
    else if (domain === 'exterior') setSelectedCategoryId('all-exterior');
    else setSelectedCategoryId('all');
  };

  // Filter products based on domain, category rail, subchip, and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Domain Filter
      if (activeDomain === 'interior') {
        const isOutdoorOnly = p.primaryDomain === 'outdoor';
        if (isOutdoorOnly) return false;
      } else if (activeDomain === 'exterior') {
        const isIndoorOnly = p.primaryDomain === 'indoor';
        if (isIndoorOnly) return false;
      }

      // 2. Category Rail Filter
      if (selectedCategoryId !== 'all' && selectedCategoryId !== 'all-interior' && selectedCategoryId !== 'all-exterior') {
        const pText = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.spaceSlugs?.join(' ') || ''} ${(p.spaces || []).map(s => s.slug).join(' ')}`.toLowerCase();
        const catKey = selectedCategoryId.toLowerCase();

        const matchSpace = (p.spaces || []).some(s => s.slug.includes(catKey) || catKey.includes(s.slug));
        const matchSlug = (p.spaceSlugs || []).some(s => s.includes(catKey) || catKey.includes(s));
        const matchText = pText.includes(catKey.replace(/-/g, ' '));
        
        if (!matchSpace && !matchSlug && !matchText) {
          // Special fallback keyword checks
          if (catKey === 'wallpapers' && (pText.includes('wallpaper') || p.type?.includes('WALLPAPER'))) {
            // pass
          } else if (catKey === 'lighting' && (pText.includes('lamp') || pText.includes('light') || pText.includes('sconce') || pText.includes('chandelier'))) {
            // pass
          } else if (catKey === 'murals' && (pText.includes('mural') || pText.includes('art'))) {
            // pass
          } else {
            return false;
          }
        }
      }

      // 3. Sub-chip keyword filter
      if (selectedSubChip !== 'All') {
        const chipKey = selectedSubChip.toLowerCase();
        const pFull = `${p.name} ${p.description} ${p.material || ''} ${p.finish || ''} ${(p.botanicalBenefits || []).join(' ')}`.toLowerCase();
        if (!pFull.includes(chipKey)) return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const pFull = `${p.name} ${p.description} ${p.category?.name || ''} ${p.material || ''} ${p.sku}`.toLowerCase();
        if (!pFull.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => {
      const pA = Number(a.discountPrice || a.price);
      const pB = Number(b.discountPrice || b.price);
      if (sortBy === 'price-asc') return pA - pB;
      if (sortBy === 'price-desc') return pB - pA;
      if (sortBy === 'discount') {
        const discA = a.discountPrice ? (Number(a.price) - pA) : 0;
        const discB = b.discountPrice ? (Number(b.price) - pB) : 0;
        return discB - discA;
      }
      return 0; // featured default
    });
  }, [products, activeDomain, selectedCategoryId, selectedSubChip, searchQuery, sortBy]);

  // Stepper handlers
  const handleItemIncrement = async (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      navigate('/login');
      return;
    }
    if (isUpdatingId) return;
    setIsUpdatingId(product.id);

    const cartItem = cart?.items?.find((item) => item.product.id === product.id);
    const count = cartItem ? cartItem.quantity : 0;

    try {
      if (count === 0) {
        if (onAddToCart) {
          await onAddToCart(product, 1);
        } else {
          await addItem(product.id, 1);
          toast.success(`Added ${product.name} to bag`);
        }
      } else if (cartItem) {
        await updateItem(cartItem.id, count + 1);
      }
    } catch {
      toast.error('Unable to update bag');
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleItemDecrement = async (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user || isUpdatingId) return;
    setIsUpdatingId(product.id);

    const cartItem = cart?.items?.find((item) => item.product.id === product.id);
    const count = cartItem ? cartItem.quantity : 0;

    try {
      if (count === 1 && cartItem) {
        await removeItem(cartItem.id);
        toast('Removed from bag', { icon: '🗑️' });
      } else if (count > 1 && cartItem) {
        await updateItem(cartItem.id, count - 1);
      }
    } catch {
      toast.error('Unable to update bag');
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Card Image Switcher
  const handleCardImageNext = (productId: string, totalImages: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCardImageIndexes(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages
    }));
  };

  return (
    <div className="mobile-quick-catalog-wrapper w-full bg-[#f8f6f0] text-stone-900 pb-20">
      {/* ========================================================================= */}
      {/* 1. TOP STICKY APP BAR (Instant Dispatch + Location Pin + Search)          */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 shadow-xs">
        {/* Express Dispatch Strip */}
        <div className="px-3.5 py-1.5 bg-[#0f2444] text-white flex items-center justify-between text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wide text-emerald-300">⚡ EXPRESS DISPATCH</span>
            <span className="text-stone-300 hidden sm:inline">• In 24–48 Hours</span>
          </div>
          <div className="flex items-center gap-1 text-stone-300">
            <MapPin size={12} className="text-amber-400" />
            <span className="truncate max-w-[130px]">Delhi NCR • {currentCountry?.code || 'IN'}</span>
          </div>
        </div>

        {/* Domain Segmented Control: Interior vs Exterior */}
        <div className="px-3 py-2 bg-stone-50 border-b border-stone-200">
          <div className="grid grid-cols-3 gap-1 bg-stone-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleDomainChange('interior')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                activeDomain === 'interior'
                  ? 'bg-[#0f2444] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <span>🏠</span>
              <span>Interior</span>
            </button>

            <button
              type="button"
              onClick={() => handleDomainChange('exterior')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                activeDomain === 'exterior'
                  ? 'bg-[#15803d] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <span>🌿</span>
              <span>Exterior</span>
            </button>

            <button
              type="button"
              onClick={() => handleDomainChange('all')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                activeDomain === 'all'
                  ? 'bg-[#8c6f52] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <span>✨</span>
              <span>All Spaces</span>
            </button>
          </div>
        </div>

        {/* Compact Search Bar & Sort Dropdown */}
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={`Search ${activeDomain === 'interior' ? 'interior wallpapers, wood...' : activeDomain === 'exterior' ? 'balcony plants, planters...' : 'all pieces...'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-stone-100 border border-stone-200 rounded-lg text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#8c6f52] focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 border-none bg-transparent cursor-pointer p-0"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1.5 bg-stone-100 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 focus:outline-none focus:border-[#8c6f52]"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">₹ Low to High</option>
              <option value="price-desc">₹ High to Low</option>
              <option value="discount">Top Discount</option>
            </select>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. DUAL-PANE QUICK COMMERCE LAYOUT (Left Category Rail + Right Feed)       */}
      {/* ========================================================================= */}
      <div className="flex w-full items-start">
        {/* LEFT VERTICAL CATEGORY RAIL (Width ~76px) */}
        <aside className="w-[76px] sm:w-[84px] shrink-0 sticky top-[125px] h-[calc(100vh-125px)] overflow-y-auto bg-stone-100 border-r border-stone-200 no-scrollbar">
          <div className="py-2 flex flex-col items-center gap-1.5">
            {currentCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setSelectedSubChip('All');
                  }}
                  className={`w-[68px] sm:w-[76px] py-2 px-1 rounded-xl flex flex-col items-center text-center transition-all cursor-pointer relative border-none ${
                    isSelected
                      ? 'bg-white text-[#8c6f52] shadow-xs font-bold'
                      : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900 bg-transparent'
                  }`}
                >
                  {/* Left Active Accent Pill Bar */}
                  {isSelected && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#8c6f52] rounded-r-md" />
                  )}

                  {/* Circle Icon Badge */}
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg mb-1 transition-transform ${
                    isSelected ? 'bg-[#8c6f52]/10 scale-105' : 'bg-stone-200/70'
                  }`}>
                    {cat.icon}
                  </span>

                  {/* 2-line clamped title */}
                  <span className="text-[10px] sm:text-[11px] leading-tight line-clamp-2 px-0.5">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT PRODUCT FEED & HIGH-DENSITY 2-COLUMN CATALOG */}
        <main className="flex-1 min-w-0 p-2.5 sm:p-4">
          {/* Sticky Subcategory Chip Slider */}
          <div className="sticky top-[125px] z-20 bg-[#f8f6f0] pt-1 pb-2 mb-2 -mx-2.5 px-2.5 sm:-mx-4 sm:px-4 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(activeDomain === 'interior' ? INTERIOR_SUB_CHIPS : EXTERIOR_SUB_CHIPS).map((chip) => {
              const isSel = selectedSubChip === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSelectedSubChip(chip)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isSel
                      ? 'bg-[#8c6f52] text-white border-[#8c6f52] shadow-xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Item Count & Context Bar */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2.5 px-1">
            <span>
              Showing <strong className="text-stone-900 font-bold">{filteredProducts.length}</strong> items
            </span>
            <span className="text-[11px] text-[#8c6f52] font-semibold flex items-center gap-1">
              <Zap size={11} fill="currentColor" />
              <span>Tap 📐 for Dimensions</span>
            </span>
          </div>

          {/* HIGH-DENSITY 2-COLUMN CATALOG GRID (Replica Quick-Commerce Sizing) */}
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-300 my-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Search size={20} />
              </div>
              <h4 className="text-sm font-bold text-stone-800 mb-1">No articles found</h4>
              <p className="text-xs text-stone-500 mb-3">
                No items match your active subcategory or search term in this department.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedSubChip('All');
                  setSearchQuery('');
                  setSelectedCategoryId(activeDomain === 'interior' ? 'all-interior' : activeDomain === 'exterior' ? 'all-exterior' : 'all');
                }}
                className="px-3.5 py-1.5 bg-[#8c6f52] text-white text-xs font-bold rounded-lg cursor-pointer border-none"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {filteredProducts.map((product) => {
                const curPrice = Number(product.discountPrice || product.price);
                const origPrice = Number(product.price);
                const hasDiscount = product.discountPrice && origPrice > curPrice;
                const discountPct = hasDiscount 
                  ? Math.round(((origPrice - curPrice) / origPrice) * 100) 
                  : null;

                const rawImages = (product.images && product.images.length > 0)
                  ? product.images
                  : ['/images/outdoor-garden.jpg'];

                const curImgIdx = cardImageIndexes[product.id] || 0;
                const currentImg = rawImages[curImgIdx % rawImages.length];

                // Cart item quantity
                const cartItem = cart?.items?.find((item) => item.product.id === product.id);
                const itemCount = cartItem ? cartItem.quantity : 0;
                const isBusy = isUpdatingId === product.id;

                return (
                  <div 
                    key={product.id}
                    className="quick-catalog-card bg-white rounded-xl border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Image Stage (Aspect Ratio ~1:1 with Multi-Image preview) */}
                    <div className="relative w-full aspect-square bg-stone-100 overflow-hidden group">
                      <Link to={`/products/${product.id}`} className="block w-full h-full">
                        <img
                          src={currentImg}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-104"
                        />
                      </Link>

                      {/* Top Badges */}
                      <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                        {discountPct ? (
                          <span className="bg-[#15803d] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs tracking-wider">
                            {discountPct}% OFF
                          </span>
                        ) : product.isCustomizable ? (
                          <span className="bg-[#0f2444] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            CUSTOM
                          </span>
                        ) : (
                          <span className="bg-amber-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                            CURATED
                          </span>
                        )}
                      </div>

                      {/* Multi-Image Dot Carousel Controls */}
                      {rawImages.length > 1 && (
                        <div 
                          className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between pointer-events-none"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Indicator Dots */}
                          <div className="flex items-center gap-1 bg-black/60 px-1.5 py-0.5 rounded-full backdrop-blur-xs">
                            {rawImages.slice(0, 4).map((_, i) => (
                              <span
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  (curImgIdx % rawImages.length) === i ? 'bg-amber-400 w-2.5' : 'bg-white/60'
                                }`}
                              />
                            ))}
                          </div>

                          {/* Next Image Switcher Tap */}
                          <button
                            type="button"
                            onClick={(e) => handleCardImageNext(product.id, rawImages.length, e)}
                            className="pointer-events-auto bg-black/60 hover:bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full cursor-pointer border-none flex items-center gap-0.5"
                            title="Flip to next view"
                          >
                            <span>Next</span>
                            <ChevronRight size={10} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card Content & Details */}
                    <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Delivery ETA Pill */}
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold mb-1">
                          <Zap size={11} fill="currentColor" />
                          <span>⚡ 2-Day Delivery</span>
                        </div>

                        {/* Title (2-line clamped) */}
                        <Link
                          to={`/products/${product.id}`}
                          className="text-xs sm:text-[13px] font-bold text-stone-900 leading-tight line-clamp-2 hover:text-[#8c6f52] transition-colors mb-1"
                          title={product.name}
                        >
                          {product.name}
                        </Link>

                        {/* Dimension / Pack Spec Tag */}
                        <div className="text-[10px] text-stone-500 font-medium truncate mb-2">
                          {product.type === 'CUSTOM_WALLPAPER' ? '57 sq.ft / roll' : product.unit ? `Per ${product.unit}` : 'Standard Piece'}
                          {product.material && ` • ${product.material}`}
                        </div>
                      </div>

                      {/* Price Row & Quick ADD / Stepper Button */}
                      <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-stone-100 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-extrabold text-stone-900 leading-none">
                            ₹{curPrice.toLocaleString('en-IN')}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-stone-400 line-through">
                              ₹{origPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Compact Quick ADD or Stepper (- 1 +) */}
                        {itemCount > 0 ? (
                          <div 
                            className="flex items-center border border-emerald-600 bg-emerald-50 rounded-lg overflow-hidden h-7"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          >
                            <button
                              type="button"
                              onClick={(e) => handleItemDecrement(product, e)}
                              disabled={isBusy}
                              className="w-6 h-full flex items-center justify-center text-emerald-800 hover:bg-emerald-100 cursor-pointer border-none bg-transparent"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-5 text-center text-xs font-black text-emerald-900">
                              {itemCount}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleItemIncrement(product, e)}
                              disabled={isBusy}
                              className="w-6 h-full flex items-center justify-center text-emerald-800 hover:bg-emerald-100 cursor-pointer border-none bg-transparent"
                              aria-label="Increase quantity"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleItemIncrement(product, e)}
                            disabled={isBusy}
                            className="px-2.5 py-1 rounded-lg border border-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer h-7"
                            title="Quick Add to Bag"
                          >
                            <Plus size={12} />
                            <span>ADD</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
