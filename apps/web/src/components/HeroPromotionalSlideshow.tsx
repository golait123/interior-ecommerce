import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  ShieldCheck, 
  Flame, 
  Percent, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Leaf, 
  Award,
  Pause,
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export interface HeroPromoSlide {
  id: string;
  badge: string;
  badgeIcon: React.ElementType;
  title: string;
  titleHighlight?: string;
  subtitle: string;
  code: string;
  discountBadge: string;
  perks: { icon: React.ElementType; text: string }[];
  bgImage: string;
  accentGlow: string;
  ctaText: string;
  ctaLink: string;
  tabLabel: string;
}

const HERO_PROMO_SLIDES: HeroPromoSlide[] = [
  {
    id: 'feel-like-home',
    badge: 'Seasonal Privilege • Limited Edition',
    badgeIcon: Flame,
    title: 'Make Your House Feel Like Home',
    titleHighlight: 'Autumn Salon: Flat 20% OFF',
    subtitle: 'Thoughtfully designed pieces made with premium materials, crafted for comfort, built to last, and styled to feel like home.',
    code: 'INTERIORG20',
    discountBadge: 'Flat 20% OFF',
    perks: [
      { icon: ShieldCheck, text: 'Solid Kiln-Dried Hardwood' },
      { icon: Sparkles, text: 'Free White-Glove Setup (₹9,999+)' },
      { icon: Award, text: 'Zero Middlemen Markup' }
    ],
    bgImage: '/images/majestic-hero-banner.jpg',
    accentGlow: 'rgba(56, 189, 248, 0.22)',
    ctaText: 'EXPLORE NEW COLLECTION',
    ctaLink: '/shop?sort=newest',
    tabLabel: '01 Feel Like Home'
  },
  {
    id: 'botanical-living',
    badge: 'Living Nature Sanctuary • Botanical Care',
    badgeIcon: Leaf,
    title: 'Indoor Botanical Sanctuaries: ',
    titleHighlight: 'Complimentary Planter with ₹4,999',
    subtitle: 'Air-purifying nursery greens in handcrafted artisanal fluted ceramic & terrazzo planters. Delivered potted, nourished, and fully acclimated to home lighting.',
    code: 'BOTANICALFREE',
    discountBadge: 'Free Handcrafted Planter',
    perks: [
      { icon: Leaf, text: 'Air-Purifying Certified Greens' },
      { icon: Sparkles, text: 'Delivered Potted & Acclimated' },
      { icon: ShieldCheck, text: '14-Day Plant Health Guarantee' }
    ],
    bgImage: '/images/outdoor-garden.jpg',
    accentGlow: 'rgba(16, 185, 129, 0.22)',
    ctaText: 'EXPLORE BOTANICAL PLANTS',
    ctaLink: '/gardening',
    tabLabel: '02 Botanical Living'
  },
  {
    id: 'sheesham-guild',
    badge: 'Master Artisan Guild • Heirloom Collection',
    badgeIcon: Award,
    title: 'Solid Sheesham & Cast Brass Heirlooms: ',
    titleHighlight: 'Up to 35% OFF Guild Releases',
    subtitle: 'Kiln-dried solid Indian hardwoods finished in natural matte wax, paired with hand-hammered antiqued brass accents engineered to endure generations of family living.',
    code: 'HERITAGE35',
    discountBadge: 'Up to 35% OFF',
    perks: [
      { icon: ShieldCheck, text: '10-Year Structural Guarantee' },
      { icon: Sparkles, text: 'Hand-Finished Matte Wax' },
      { icon: Award, text: 'Complimentary Doorstep Assembly' }
    ],
    bgImage: '/images/project-dining.jpg',
    accentGlow: 'rgba(245, 158, 11, 0.22)',
    ctaText: 'SHOP ARTISAN FURNITURE',
    ctaLink: '/shop?category=furniture',
    tabLabel: '03 Solid Sheesham'
  },
  {
    id: 'wall-murals',
    badge: 'Bespoke Studio • Made-to-Measure',
    badgeIcon: Layers,
    title: '3D Panoramic Wall Murals: ',
    titleHighlight: 'Buy 2 Walls, Get 1 Accent Free',
    subtitle: 'Textured non-woven canvases precision-scaled to your exact millimeter room height. Zero seams, zero shrinkage, and effortless peel-and-stick application.',
    code: 'WALLMURAL3',
    discountBadge: 'Buy 2 Walls Get 1 Free',
    perks: [
      { icon: Layers, text: 'Exact Millimeter Precision' },
      { icon: Sparkles, text: 'Waterproof & Non-Woven' },
      { icon: ShieldCheck, text: 'Free Swatch Sample Box' }
    ],
    bgImage: '/images/indoor-sanctuary.jpg',
    accentGlow: 'rgba(168, 85, 247, 0.22)',
    ctaText: 'LAUNCH 3D WALL STUDIO',
    ctaLink: '/customizer',
    tabLabel: '04 3D Wall Murals'
  }
];

export function HeroPromotionalSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const SLIDE_DURATION = 4000; // 4 seconds timer requested by user
  const TICK_INTERVAL = 50;

  // 4-Second Slideshow Timer & Progress Bar Loop
  useEffect(() => {
    if (isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepPct = (TICK_INTERVAL / SLIDE_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentSlide(curr => (curr + 1) % HERO_PROMO_SLIDES.length);
          return 0;
        }
        return prev + stepPct;
      });
    }, TICK_INTERVAL);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPaused, currentSlide]);

  const handleSelectSlide = (idx: number) => {
    setCurrentSlide(idx);
    setProgress(0);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(curr => (curr === 0 ? HERO_PROMO_SLIDES.length - 1 : curr - 1));
    setProgress(0);
  };

  const handleNextSlide = () => {
    setCurrentSlide(curr => (curr + 1) % HERO_PROMO_SLIDES.length);
    setProgress(0);
  };

  const handleCopyCoupon = (code: string, discountText: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied! (${discountText})`, {
      icon: '🏷️',
      duration: 3500
    });
    setTimeout(() => {
      setCopiedCode(null);
    }, 3000);
  };

  const currentPromo = HERO_PROMO_SLIDES[currentSlide];

  return (
    <section 
      className="hero-split-banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Make Your House Feel Like Home - Seasonal Offers & Collections"
    >
      <div className="hero-split-stage">
        {/* Render each slide with smooth transitions */}
        {HERO_PROMO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const BadgeIcon = slide.badgeIcon;

          return (
            <div 
              key={slide.id}
              className={`hero-split-panel ${isActive ? 'active' : ''}`}
            >
              {/* TOP / MAIN ROW: IMAGE ON LEFT & OFFERS DETAIL ON RIGHT */}
              <div className="hero-split-main">
                {/* 1. LEFT: HIGH-RESOLUTION PHOTOGRAPHY IMAGE WITH BLENDED EDGES */}
                <div className="hero-split-left">
                  {/* Atmospheric radial ambient glow behind image */}
                  <div 
                    className="hero-split-img-glow"
                    style={{ background: slide.accentGlow }}
                    aria-hidden="true"
                  />
                  <div className="hero-split-img-wrapper">
                    <img 
                      src={slide.bgImage} 
                      alt={slide.title} 
                      className="hero-split-img" 
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                    <div className="hero-split-img-tag">
                      <Sparkles size={12} className="text-sky-300" />
                      <span>{slide.tabLabel.replace(/^\d+\s*/, '')}</span>
                    </div>
                  </div>
                </div>

                {/* 2. RIGHT: OFFERS DETAIL & VALUE PROPOSITION */}
                <div className="hero-split-right">
                  <div className="hero-split-badges">
                    <span className="hero-split-badge-tag">
                      <BadgeIcon size={13} style={{ color: '#38bdf8' }} />
                      <span>{slide.badge}</span>
                    </span>
                    <span className="hero-split-discount-pill">
                      <Percent size={12} />
                      <span>{slide.discountBadge}</span>
                    </span>
                  </div>

                  <h1 className="hero-split-title">
                    {slide.title}
                    {slide.titleHighlight && (
                      <span className="hero-split-highlight">
                        {slide.titleHighlight}
                      </span>
                    )}
                  </h1>

                  <p className="hero-split-desc">
                    {slide.subtitle}
                  </p>

                  {/* Trust Perks Strip */}
                  <div className="hero-split-perks">
                    {slide.perks.map((perk, pIdx) => {
                      const PerkIcon = perk.icon;
                      return (
                        <span key={pIdx} className="hero-split-perk">
                          <PerkIcon size={14} className="hero-split-perk-icon" />
                          <span>{perk.text}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Prev & Next Chevrons */}
        <button 
          type="button" 
          onClick={handlePrevSlide}
          className="hero-split-nav-btn hero-split-nav-prev"
          title="Previous slide"
          aria-label="Previous promotional slide"
        >
          <ChevronLeft size={22} />
        </button>

        <button 
          type="button" 
          onClick={handleNextSlide}
          className="hero-split-nav-btn hero-split-nav-next"
          title="Next slide"
          aria-label="Next promotional slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* 4-Second Animated Progress Bar */}
        <div className="hero-split-progress-wrap">
          <div className="promo-progress-track">
            <div 
              className="promo-progress-fill" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* UNIFIED DOWN SIDE: VOUCHER (LEFT), SLIDE SELECTOR TABS (CENTER), AND RESPONSIVE CTA (RIGHT) */}
        <div className="hero-split-bottom-bar">
          {/* 1. Left: Voucher Box with 1-Click Copy */}
          <div className="hero-split-voucher-box">
            <div className="hero-split-voucher-meta">
              <span className="hero-split-voucher-label">
                Artisan Privilege Voucher
              </span>
              <span className="hero-split-voucher-code">
                {currentPromo.code}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleCopyCoupon(currentPromo.code, currentPromo.discountBadge)}
              className="hero-split-copy-btn"
              title="Copy voucher code to clipboard"
              aria-label={`Copy voucher code ${currentPromo.code}`}
            >
              {copiedCode === currentPromo.code ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} />
              )}
              <span>{copiedCode === currentPromo.code ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* 2. Center: Interactive Slide Selector Tabs with 4s Timer / Pause Indicator */}
          <div className="hero-split-tabs-center">
            <div className="promo-tabs-bar">
              {HERO_PROMO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => handleSelectSlide(idx)}
                  className={`promo-tab-chip ${idx === currentSlide ? 'active' : ''}`}
                  aria-label={`Switch to slide: ${slide.tabLabel}`}
                >
                  <span>{slide.tabLabel}</span>
                </button>
              ))}

              {/* Pause / Play Indicator */}
              <button
                type="button"
                onClick={() => setIsPaused(p => !p)}
                className="hero-split-playpause-badge"
                title={isPaused ? 'Click to resume 4s slideshow' : 'Click to pause slideshow'}
                aria-label={isPaused ? 'Resume slideshow' : 'Pause slideshow'}
              >
                {isPaused ? <Play size={10} /> : <Pause size={10} />}
                <span>{isPaused ? 'Paused' : '4s Auto'}</span>
              </button>
            </div>
          </div>

          {/* 3. Right / Down Right Corner: Responsive Action Button */}
          <div className="hero-split-cta-wrapper">
            {currentPromo.ctaLink.startsWith('#') ? (
              <a href={currentPromo.ctaLink} className="hero-split-btn">
                <span>{currentPromo.ctaText}</span>
                <ArrowRight size={15} className="hero-split-btn-arrow" />
              </a>
            ) : (
              <Link to={currentPromo.ctaLink} className="hero-split-btn">
                <span>{currentPromo.ctaText}</span>
                <ArrowRight size={15} className="hero-split-btn-arrow" />
              </Link>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
