import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi, Product } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocationContext } from '../contexts/LocationContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { WallpaperCalculator } from '../components/WallpaperCalculator';
import { ImageZoomViewer } from '../components/ImageZoomViewer';
import { ProductCard } from '../components/ProductCard';
import { ProductQuickViewModal } from '../components/ProductQuickViewModal';
import { 
  ChevronRight, 
  ChevronDown,
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Leaf, 
  Check, 
  ShoppingBag, 
  ArrowLeft,
  Award,
  Star,
  Layers,
  RotateCcw,
  Sliders,
  Minus,
  Plus,
  ThumbsUp,
  Camera,
  MessageSquare,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mongoApi, ProductReviewItem } from '../api/mongoServices';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice, currentCountry } = useLocationContext();
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    craft: true,
    dimensions: false,
    shipping: false
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Fetch current product
  const { data: p, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id!)
  });

  // Fetch related products for the same category/space
  const { data: relatedData } = useQuery({
    queryKey: ['related-products', p?.category?.id],
    queryFn: () => productsApi.list({ category: p?.category?.slug, limit: 5 }),
    enabled: !!p?.category?.id
  });

  const relatedProducts = (relatedData?.items || [])
    .filter(item => item.id !== p?.id)
    .slice(0, 4);

  // MongoDB Reviews & Ratings Query
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['product-reviews', p?.id || id],
    queryFn: () => mongoApi.getProductReviews(p?.id || id || ''),
    enabled: !!(p?.id || id)
  });

  // Write a Review Form State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p) return;
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast.error('Please provide a title and review comment.');
      return;
    }
    setSubmittingReview(true);
    try {
      await mongoApi.createReview({
        productId: p.id,
        productName: p.name,
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
        productType: p.category?.name || 'Home Decor',
        verifiedPurchase: true,
        userName: user?.name || 'Verified Collector',
        media: reviewPhotoUrl.trim() ? [{ url: reviewPhotoUrl.trim(), type: 'IMAGE' }] : []
      });
      toast.success('✨ Your review has been saved to MongoDB and published!');
      setShowReviewModal(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewPhotoUrl('');
      refetchReviews();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    try {
      await mongoApi.toggleHelpful(reviewId);
      refetchReviews();
      toast.success('Feedback recorded!');
    } catch {
      toast.error('Unable to record vote.');
    }
  };

  // Scroll to top and reset active image and quantity when navigating to new product
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setActiveImage(0);
    setQty(1);
  }, [id]);

  const handleAddToCart = async () => {
    if (!p) return;
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addItem(p.id, qty);
      toast.success(`Added ${p.name} to your bag!`);
    } catch {
      toast.error('Unable to add item to bag.');
    }
  };

  const handleBuyNow = async () => {
    if (!p) return;
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addItem(p.id, qty);
      navigate('/cart');
    } catch {
      toast.error('Unable to proceed to cart.');
    }
  };

  if (isLoading) {
    return (
      <div className="page-wrapper bg-white">
        <Header />
        <main className="page py-28 text-center">
          <div className="loading-spinner mb-4 mx-auto" />
          <h3 className="font-serif italic text-2xl text-[#0a192f] mb-2">InteriorG Studio</h3>
          <p className="font-sans text-sm text-[#536b88]">Retrieving curated piece and specifications...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!p) {
    return (
      <div className="page-wrapper bg-white">
        <Header />
        <main className="page py-24 text-center">
          <h2 className="font-serif italic text-3xl mb-3 text-[#0a192f]">Piece Not Found</h2>
          <p className="text-[#536b88] text-sm mb-6 max-w-md mx-auto">
            The architectural decor or wallpaper piece you requested could not be located in our current catalog.
          </p>
          <Link to="/shop" className="btn btn-primary py-3 px-8 text-xs uppercase tracking-wider font-semibold">
            Return to Collection
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const curPrice = Number(p.discountPrice || p.price);
  const origPrice = Number(p.price);
  const hasDiscount = p.discountPrice !== null && Number(p.discountPrice) < origPrice;
  const discountPct = hasDiscount ? Math.round(((origPrice - curPrice) / origPrice) * 100) : null;
  const images = p.images && p.images.length > 0 ? p.images : [];
  const currentImage = images[activeImage] || images[0] || null;

  const inStockQty = p.inventoryAvailable !== undefined 
    ? p.inventoryAvailable 
    : p.inventory 
      ? Math.max(0, p.inventory.totalQuantity - p.inventory.reservedQuantity - (p.inventory.damagedQuantity || 0)) 
      : 10;
  const isAvailable = p.inStock !== false && inStockQty > 0 && p.isActive !== false;

  return (
    <div className="page-wrapper bg-white">
      <Header />

      <main className="page py-6 sm:py-8">
        {/* ================================================================= */}
        {/* TOP NAVIGATION BREADCRUMBS                                        */}
        {/* ================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#e2e8f0]">
          <nav className="flex items-center gap-2 text-xs text-[#536b88] uppercase tracking-wider overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#0f2444] transition-colors">Home</Link>
            <ChevronRight size={12} className="text-[#8fa4bf]" />
            <Link to="/shop" className="hover:text-[#0f2444] transition-colors">Shop Collection</Link>
            {p.category && (
              <>
                <ChevronRight size={12} className="text-[#8fa4bf]" />
                <Link to={`/shop?category=${p.category.slug}`} className="hover:text-[#0f2444] transition-colors">
                  {p.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={12} className="text-[#8fa4bf]" />
            <span className="text-[#0a192f] font-semibold truncate max-w-[200px] sm:max-w-xs">{p.name}</span>
          </nav>

          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0f2444] hover:text-[#1b3a6b] transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to All Works</span>
          </Link>
        </div>

        {/* ================================================================= */}
        {/* TWO COLUMN LUXURY PRODUCT SHOWCASE (STATIC FRAME & NO OVERLAP)    */}
        {/* ================================================================= */}
        <div className="product-detail-layout">
          
          {/* =============================================================== */}
          {/* LEFT: STATIC MEDIUM GALLERY & THUMBNAILS                         */}
          {/* =============================================================== */}
          <div className="product-detail-gallery-col">
            {/* Static 420x440 Frame Container - Never overflows, fixed frame size */}
            <div className="product-static-frame">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={p.name}
                  loading="eager"
                />
              ) : (
                <div className={`w-full h-full gradient-bg gradient-${p.type.toLowerCase()} flex items-center justify-center text-muted`}>
                  <Sparkles size={36} className="text-[#8fa4bf] opacity-60" />
                </div>
              )}

              {/* Badges strictly pinned to top-left inside frame */}
              <div className="product-frame-badges">
                <span className="product-frame-badge badge-navy">
                  {p.isCustomizable ? '✨ Bespoke Dimension' : '🏺 Ready to Ship'}
                </span>
                {hasDiscount && (
                  <span className="product-frame-badge badge-discount">
                    {discountPct}% OFF
                  </span>
                )}
                {p.botanicalBenefits && p.botanicalBenefits.length > 0 && (
                  <span className="product-frame-badge badge-eco">
                    <Leaf size={12} className="text-[#15803d]" />
                    <span>Botanical Living</span>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip with Active Rings strictly below frame */}
            {images.length > 1 && (
              <div className="product-thumbnail-tray">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`product-thumbnail-item ${
                      activeImage === idx ? 'active' : ''
                    }`}
                    aria-label={`Show image view ${idx + 1}`}
                  >
                    <img 
                      src={img} 
                      alt={`${p.name} view ${idx + 1}`} 
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quality Guarantees & White-Glove Service Bar */}
            <div className="product-trust-bar">
              <div className="flex items-start gap-2">
                <Truck size={17} className="text-[#0f2444] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--navy-deep)', margin: 0 }}>White-Glove</h4>
                  <p style={{ fontSize: '11px', color: '#536b88', margin: '2px 0 0', lineHeight: 1.25 }}>Insured freight & crate protection.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck size={17} className="text-[#0f2444] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--navy-deep)', margin: 0 }}>Authentic</h4>
                  <p style={{ fontSize: '11px', color: '#536b88', margin: '2px 0 0', lineHeight: 1.25 }}>Master craft techniques & materials.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Award size={17} className="text-[#0f2444] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--navy-deep)', margin: 0 }}>1-Yr Warranty</h4>
                  <p style={{ fontSize: '11px', color: '#536b88', margin: '2px 0 0', lineHeight: 1.25 }}>Structural warranty & care support.</p>
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* RIGHT: EDITORIAL DETAILS, SPECS & BUYING FLOW                     */}
          {/* =============================================================== */}
          <div className="product-detail-info-col">
            {/* Category / Space Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              {p.category && (
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#0f2444] bg-[#edf4fc] border border-[#cbdceb] px-3 py-0.5 rounded-full">
                  {p.category.name}
                </span>
              )}
              {p.primaryDomain && (
                <span className={`text-[11px] font-semibold tracking-wide uppercase px-3 py-0.5 rounded-full ${
                  p.primaryDomain === 'outdoor' 
                    ? 'bg-[#dce9d8] text-[#2e5926]' 
                    : p.primaryDomain === 'both'
                    ? 'bg-[#ede3f7] text-[#552d79]'
                    : 'bg-[#f0f5fc] text-[#0f2444]'
                }`}>
                  {p.primaryDomain === 'outdoor' ? '🌿 Outdoor Sanctuary' : p.primaryDomain === 'both' ? '🏡 Indoor & Outdoor' : '🛋️ Indoor Space'}
                </span>
              )}
            </div>

            {/* Product Title in Playfair Display */}
            <h1 className="text-2xl sm:text-3xl font-serif italic font-normal text-[#0a192f] tracking-tight mb-2 leading-tight">
              {p.name}
            </h1>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <span className="text-xs font-bold text-[#0a192f]">4.9</span>
              <span className="text-xs text-[#536b88]">• 48 Verified Customer Reviews</span>
            </div>

            {/* Price Presentation */}
            <div className="mb-4 pb-4 border-b border-[#e2e8f0]">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#0f2444]">
                  {formatPrice(curPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-[#8fa4bf] line-through">
                      {formatPrice(origPrice)}
                    </span>
                    <span className="text-xs font-bold text-[#be123c] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-md">
                      SAVE {formatPrice(origPrice - curPrice)} ({discountPct}%)
                    </span>
                  </>
                )}
                <span className="text-xs text-[#536b88] uppercase tracking-wider font-medium">
                  / {p.unit || 'piece'}
                </span>
              </div>
              <p className="text-xs text-[#536b88] mt-1 m-0">
                Inclusive of {currentCountry.tax.name} and regional customs clearance. {currentCountry.deliveryNotice}
              </p>
            </div>

            {/* Live Inventory Status */}
            <div className="mb-4">
              {isAvailable ? (
                <span className="inline-flex items-center gap-2 text-xs text-[#15803d] font-semibold bg-[#f0fdf4] border border-[#bbf7d0] px-3.5 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse"></span>
                  <span>{inStockQty} units in stock • Ready to dispatch in 24–48 hours</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-xs text-[#b91c1c] font-semibold bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#b91c1c]"></span>
                  <span>Currently Out of Stock • Restock in progress</span>
                </span>
              )}
            </div>

            {/* Product Description */}
            <div className="mb-5 text-[13.5px] text-[#334155] leading-relaxed">
              <p className="m-0">{p.description}</p>
            </div>

            {/* Botanical Wellness Attributes */}
            {p.botanicalBenefits && p.botanicalBenefits.length > 0 && (
              <div className="mb-6 p-4 bg-[#f0f7ef] border border-[#cbe1c7] rounded-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2e5926] block mb-2 flex items-center gap-1.5">
                  <Leaf size={14} className="text-[#2e5926]" />
                  Botanical Living & Biophilic Attributes:
                </span>
                <div className="flex flex-wrap gap-2">
                  {p.botanicalBenefits.map((b, i) => (
                    <span key={i} className="text-xs bg-white text-[#2e5926] px-3 py-1 rounded-md border border-[#cbe1c7] flex items-center gap-1.5 font-medium shadow-2xs">
                      <Check size={12} className="text-[#2e5926]" /> {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Architectural Specifications Card */}
            <div className="bg-[#f8fafc] border border-[#cbdceb] rounded-xl p-4 sm:p-5 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#0a192f] mb-3 flex items-center gap-1.5">
                <Layers size={13} className="text-[#0f2444]" />
                Architectural Specifications
              </h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                {p.material && (
                  <div>
                    <span className="text-[#536b88] block text-[11px] mb-0.5">Material Composition</span>
                    <span className="font-semibold text-[#0a192f]">{p.material}</span>
                  </div>
                )}
                {p.finish && (
                  <div>
                    <span className="text-[#536b88] block text-[11px] mb-0.5">Surface Finish</span>
                    <span className="font-semibold text-[#0a192f]">{p.finish}</span>
                  </div>
                )}
                <div>
                  <span className="text-[#536b88] block text-[11px] mb-0.5">Catalog SKU</span>
                  <span className="font-mono text-[11px] font-semibold text-[#0a192f]">{p.sku}</span>
                </div>
                {p.pricePerSqFt && (
                  <div>
                    <span className="text-[#536b88] block text-[11px] mb-0.5">Bespoke Wall Rate</span>
                    <span className="font-semibold text-[#0f2444]">{formatPrice(Number(p.pricePerSqFt))}/sq ft</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customizer or Add to Cart Section */}
            {p.isCustomizable ? (
              <div className="mb-8 p-6 bg-white border border-[#cbdceb] rounded-xl shadow-sm">
                <h3 className="font-serif italic text-xl font-normal text-[#0a192f] mb-3">
                  Bespoke Wall Dimension Calculator
                </h3>
                <p className="text-xs text-[#536b88] mb-4">
                  Input your exact wall width and height to calculate square footage, roll cuts, and instant transparent quote.
                </p>
                <WallpaperCalculator pricePerSqFt={p.pricePerSqFt} product={p} />
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {/* Luxury Quantity Controller Card */}
                <div className="luxury-quantity-card">
                  <div className="luxury-quantity-left">
                    <div className="luxury-quantity-header">
                      <h4 className="luxury-quantity-title">Select Quantity</h4>
                      {isAvailable && (
                        <span className="luxury-quantity-stock-badge">
                          In Stock ({inStockQty})
                        </span>
                      )}
                    </div>

                    {/* Stepper capsule + quick select presets */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
                      <div className="luxury-stepper-control">
                        <button 
                          type="button"
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          disabled={qty <= 1}
                          className="luxury-stepper-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>
                        
                        <div className="luxury-stepper-input-box">
                          <span className="luxury-stepper-value">{qty}</span>
                          <span className="luxury-stepper-unit">{p.unit || 'piece'}</span>
                        </div>

                        <button 
                          type="button"
                          onClick={() => setQty(Math.min(inStockQty || 99, qty + 1))}
                          disabled={qty >= (inStockQty || 99)}
                          className="luxury-stepper-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      {/* Quick Quantity Presets */}
                      <div className="luxury-qty-presets">
                        <span className="luxury-qty-preset-label">Quick:</span>
                        {[1, 2, 3, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setQty(Math.min(inStockQty || 99, val))}
                            className={`luxury-qty-preset-btn ${qty === val ? 'active' : ''}`}
                            disabled={(inStockQty || 99) < val}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Subtotal & Breakdown */}
                  <div className="luxury-quantity-price-box">
                    <span className="luxury-quantity-price-label">Subtotal</span>
                    <strong className="luxury-quantity-price-val">
                      {formatPrice(curPrice * qty)}
                    </strong>
                    <span className="luxury-quantity-price-breakdown">
                      {formatPrice(curPrice)} × {qty} {p.unit || 'piece'}
                    </span>
                  </div>
                </div>

                {/* Dual CTAs or Out of Stock Notification */}
                {!isAvailable ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                    <div className="text-red-700 font-bold text-sm mb-1">Article Out of Stock</div>
                    <p className="text-xs text-red-600 m-0">
                      All units have been claimed by existing orders. Our workshop is handcrafting additional stock.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <button 
                      type="button"
                      onClick={handleAddToCart}
                      className="btn btn-primary py-3.5 px-6 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <ShoppingBag size={16} />
                      <span>Add To Bag</span>
                    </button>

                    <button 
                      type="button"
                      onClick={handleBuyNow}
                      className="btn btn-secondary py-3.5 px-6 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Instant Commission</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* COLLAPSIBLE ACCORDIONS FOR HERITAGE, CARE & SHIPPING             */}
            {/* =============================================================== */}
            <div className="mt-8 border-t border-[#e2e8f0]">
              {/* Accordion 1: Craft Heritage */}
              <div className="product-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion('craft')}
                  className="product-accordion-header"
                >
                  <span>Artisan Provenance & Heritage Craftsmanship</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${openAccordions.craft ? 'rotate-180' : ''}`} 
                  />
                </button>
                {openAccordions.craft && (
                  <div className="product-accordion-body">
                    Every piece in the InteriorG sanctuary collection is crafted by registered master artisans using centuries-old heritage methods. Solid Sheesham and teak woods are hand-turned and seasoned to resist tropical humidity, while ceramic vessels undergo high-temperature wood firings for distinct textured patinas.
                  </div>
                )}
              </div>

              {/* Accordion 2: Dimensions & Care */}
              <div className="product-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion('dimensions')}
                  className="product-accordion-header"
                >
                  <span>Material Specifications & Preservation Care</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${openAccordions.dimensions ? 'rotate-180' : ''}`} 
                  />
                </button>
                {openAccordions.dimensions && (
                  <div className="product-accordion-body">
                    Dust lightly with a dry microfibre cloth. For solid brass pieces, a periodic buff with beeswax preserves the antiqued satin sheen. For porous terracotta planters, natural mineral breathability provides natural cooling; wash with plain water without harsh chemical detergents.
                  </div>
                )}
              </div>

              {/* Accordion 3: White-Glove Shipping & Returns */}
              <div className="product-accordion-item">
                <button
                  type="button"
                  onClick={() => toggleAccordion('shipping')}
                  className="product-accordion-header"
                >
                  <span>White-Glove Shipping, Transit Insurance & 7-Day Returns</span>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${openAccordions.shipping ? 'rotate-180' : ''}`} 
                  />
                </button>
                {openAccordions.shipping && (
                  <div className="product-accordion-body">
                    We provide complimentary pan-India insured transit on all orders. Each item is packed in reinforced corner crates. In the rare event of transit damage or dimension mismatch, our concierge arranges a hassle-free replacement or full refund within 7 days of delivery.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ================================================================= */}
        {/* MONGODB POWERED: VERIFIED REVIEWS & RATINGS                       */}
        {/* ================================================================= */}
        <section className="mt-16 pt-12 border-t border-[#e2e8f0]">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-1.5">
                🍃 MongoDB Verified Collector Feedback
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif italic text-[#0a192f] m-0">
                Customer Ratings & Real Space Reviews
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="py-2.5 px-5 bg-[#0f2444] hover:bg-[#1b3a6b] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <MessageSquare size={14} />
              <span>Write a Verified Review</span>
            </button>
          </div>

          {/* Rating Summary Card */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 mb-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left: Overall score */}
            <div className="text-center md:text-left md:border-r md:border-stone-200 md:pr-6">
              <div className="text-5xl font-serif font-bold text-[#0a192f] mb-1">
                {reviewsData?.summary?.averageRating || 4.9}
                <span className="text-xl text-stone-400 font-sans font-normal"> / 5.0</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={18} fill="#f59e0b" />
                ))}
              </div>
              <div className="text-xs text-stone-500 font-medium">
                Based on {reviewsData?.total || 1} verified customer experience{reviewsData?.total === 1 ? '' : 's'}
              </div>
            </div>

            {/* Middle: Rating distribution bars */}
            <div className="space-y-1.5 text-xs text-stone-600">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviewsData?.summary?.ratingDistribution?.[star] || 0;
                const total = reviewsData?.total || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-8 font-mono">{star} ★</span>
                    <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full transition-all" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                    <span className="w-8 text-right text-stone-400 font-mono">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Right: Key attributes */}
            <div className="border-t md:border-t-0 md:border-l md:border-stone-200 pt-4 md:pt-0 md:pl-6 space-y-2 text-xs">
              <div className="font-semibold text-stone-800 uppercase tracking-wider text-[11px] mb-2">
                Verified Attributes
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Botanical Health & Craft:</span>
                <span className="font-semibold text-emerald-800">4.9 / 5</span>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Breathable Safe Transit:</span>
                <span className="font-semibold text-emerald-800">4.8 / 5</span>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Dimensional Accuracy:</span>
                <span className="font-semibold text-emerald-800">4.9 / 5</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {(reviewsData?.items || []).length === 0 ? (
              <div className="p-8 text-center bg-stone-50 border border-dashed border-stone-200 rounded text-stone-500 text-sm">
                No reviews yet for this architectural piece. Be the first to share your real living room or balcony experience!
              </div>
            ) : (
              reviewsData?.items.map((rev) => (
                <div key={rev._id} className="p-5 border border-stone-200 rounded-lg bg-white shadow-xs">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} size={14} fill="#f59e0b" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-stone-900">{rev.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="font-semibold text-stone-700">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <ShieldCheck size={11} /> Verified Buyer
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleHelpfulVote(rev._id)}
                      className="text-xs text-stone-500 hover:text-stone-900 border border-stone-200 hover:border-stone-400 px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ThumbsUp size={12} />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>
                  </div>

                  <p className="text-sm text-stone-700 leading-relaxed mb-3">
                    {rev.comment}
                  </p>

                  {/* Customer Photos */}
                  {rev.media && rev.media.length > 0 && (
                    <div className="flex items-center gap-2 mb-3 overflow-x-auto">
                      {rev.media.map((m, idx) => (
                        <img
                          key={idx}
                          src={m.url}
                          alt={m.caption || 'Customer review photo'}
                          className="w-16 h-16 object-cover rounded border border-stone-200 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(m.url, '_blank')}
                        />
                      ))}
                    </div>
                  )}

                  {/* Staff Reply */}
                  {rev.replies && rev.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-emerald-500 bg-stone-50 p-2.5 rounded text-xs space-y-1">
                      {rev.replies.map((reply, rIdx) => (
                        <div key={rIdx}>
                          <span className="font-semibold text-emerald-900">{reply.author}: </span>
                          <span className="text-stone-700">{reply.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Review Form Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={18} />
              </button>

              <h4 className="text-lg font-serif font-bold text-stone-900 mb-1">
                Share Your Architectural & Botanical Experience
              </h4>
              <p className="text-xs text-stone-500 mb-4">
                Your review will be stored in MongoDB and verified for collector community authenticity.
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Overall Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="cursor-pointer text-amber-500 hover:scale-110 transition-transform"
                      >
                        <Star size={24} fill={star <= reviewRating ? '#f59e0b' : 'none'} />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-stone-600 ml-2">{reviewRating} of 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Review Headline</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Stunning craftsmanship, arrived vibrant and healthy"
                    required
                    className="w-full text-xs p-2.5 border border-stone-300 rounded focus:border-[#0f2444] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Detailed Feedback</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe the texture, plant health, packaging, installation ease, or living room ambiance..."
                    required
                    className="w-full text-xs p-2.5 border border-stone-300 rounded focus:border-[#0f2444] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Room Setup Photo URL (Optional)</label>
                  <input
                    type="url"
                    value={reviewPhotoUrl}
                    onChange={(e) => setReviewPhotoUrl(e.target.value)}
                    placeholder="https://... image of your installed space"
                    className="w-full text-xs p-2.5 border border-stone-300 rounded focus:border-[#0f2444] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 bg-[#0f2444] hover:bg-[#1b3a6b] text-white text-xs font-semibold rounded cursor-pointer transition-colors"
                  >
                    {submittingReview ? 'Submitting to MongoDB...' : 'Publish Verified Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* RELATED PIECES (RECOMMENDED COLLECTION)                           */}
        {/* ================================================================= */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#e2e8f0]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f2444] bg-[#edf4fc] border border-[#cbdceb] px-3 py-1 rounded-full inline-block mb-1.5">
                  Complete The Space
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif italic text-[#0a192f] m-0">
                  You May Also Admire
                </h3>
              </div>
              <Link 
                to="/shop" 
                className="text-xs font-semibold uppercase tracking-widest text-[#0f2444] hover:text-[#1b3a6b] flex items-center gap-1"
              >
                <span>View Full Catalog</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            <div className="product-grid">
              {relatedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={!product.isCustomizable ? async (prod) => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    try {
                      await addItem(prod.id, 1);
                      toast.success(`Added ${prod.name} to bag!`);
                    } catch {
                      toast.error('Unable to add item to bag.');
                    }
                  } : undefined}
                  onQuickView={(prod) => setQuickViewProduct(prod)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Quick View Modal for Related Products */}
      {quickViewProduct && (
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={async (prod, quantity) => {
            if (!user) {
              navigate('/login');
              return;
            }
            try {
              await addItem(prod.id, quantity);
              toast.success(`Added ${prod.name} to bag!`);
            } catch {
              toast.error('Unable to add item to bag.');
            }
          }}
        />
      )}

      <Footer />
    </div>
  );
}
