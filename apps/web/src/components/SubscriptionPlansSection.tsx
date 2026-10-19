import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  Leaf, 
  Crown, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  HeartHandshake
} from 'lucide-react';
import { useLocationContext } from '../contexts/LocationContext';

interface Plan {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  icon: React.ReactNode;
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  billedNote: {
    monthly: string;
    quarterly: string;
    annual: string;
  };
  buttonText: string;
  buttonClass: string;
  accentColor: string;
  features: string[];
  exclusivePerk: string;
}

const PLANS: Plan[] = [
  {
    id: 'botanical-club',
    name: 'Botanical Sanctuary Club',
    tagline: 'Fresh air-purifying greenery & hand-thrown terracotta planters delivered monthly.',
    icon: <Leaf size={22} className="text-[#3c6e47]" />,
    monthlyPrice: 999,
    quarterlyPrice: 2699,
    annualPrice: 9999,
    billedNote: {
      monthly: 'Billed monthly • Cancel or pause anytime',
      quarterly: 'Billed quarterly (₹2,699) • Save 10%',
      annual: 'Billed annually (₹9,999) • Save 20%'
    },
    buttonText: 'Join Botanical Club',
    buttonClass: 'subs-btn-botanical',
    accentColor: '#21432c',
    features: [
      '1 Hand-selected, NASA-rated indoor plant every month',
      'Artisanal unglazed terracotta planter (self-breathing)',
      'Organic cold-pressed neem shield & slow-release nutrients',
      '24/7 Botanical Plant Doctor & Care Concierge Consultation',
      '10% Flat Member Discount on all nursery & garden pieces'
    ],
    exclusivePerk: 'Complimentary ceramic water mister on 1st delivery'
  },
  {
    id: 'artisan-guild',
    name: 'The Artisan Decor Guild',
    tagline: 'Seasonal curation of hand-hammered brass, soy scents & artisanal textile heirlooms.',
    badge: 'Most Popular',
    popular: true,
    icon: <Sparkles size={22} className="text-[var(--navy)]" />,
    monthlyPrice: 2499,
    quarterlyPrice: 6999,
    annualPrice: 24999,
    billedNote: {
      monthly: 'Billed monthly • Free white-glove shipping',
      quarterly: 'Billed quarterly (₹6,999) • Save 10%',
      annual: 'Billed annually (₹24,999) • Save 20%'
    },
    buttonText: 'Join Artisan Guild',
    buttonClass: 'subs-btn-artisan',
    accentColor: '#0f2444',
    features: [
      'Quarterly Curation Box: Solid brass centerpiece, candle & raw linen cushion',
      'Architectural Lookbook & private room styling guide',
      'Priority workshop fabrication slot with Sector 58 Master Guilds',
      '15% Flat VIP Discount on all custom furniture & wall murals',
      'Free White-Glove delivery & assembly on every order'
    ],
    exclusivePerk: 'Personalized brass nameplate handcrafted with your family crest'
  },
  {
    id: 'bespoke-sanctum',
    name: 'Architectural Bespoke Sanctum',
    tagline: 'Comprehensive architectural styling, custom hardwood privileges & full-home curation.',
    badge: 'Connoisseur Tier',
    icon: <Crown size={22} className="text-[#1b3a6b]" />,
    monthlyPrice: 7999,
    quarterlyPrice: 21999,
    annualPrice: 79999,
    billedNote: {
      monthly: 'Billed monthly • Full concierge styling',
      quarterly: 'Billed quarterly (₹21,999) • Save 10%',
      annual: 'Billed annually (₹79,999) • Save 20%'
    },
    buttonText: 'Apply For Bespoke Sanctum',
    buttonClass: 'subs-btn-bespoke',
    accentColor: '#1b3a6b',
    features: [
      'Dedicated Senior Interior Architect for 1-on-1 consultations',
      '2 Full-room 3D 360° Studio spatial visualizer renders & custom wall murals',
      '20% Flat Lifetime Discount on solid Sheesham & Teakwood consoles',
      'Annual hardwood restoration & brass buffing maintenance kit',
      'Private VIP preview invitations to rare one-off antique acquisitions',
      'Direct WhatsApp concierge to Banjara Market Master Artisans'
    ],
    exclusivePerk: 'Complimentary bespoke live-edge solid Sheesham coffee table'
  }
];

export function SubscriptionPlansSection() {
  const navigate = useNavigate();
  const { formatPrice } = useLocationContext();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('quarterly');
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Triggers both when scrolling down or upward into view
          if (entry.isIntersecting) {
            setInView(true);
          } else {
            // Reset on scroll exit so upward scrolling re-triggers the bottom-to-up reveal
            setInView(false);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  const handleSubscribe = (_plan: Plan) => {
    navigate('/login');
  };

  return (
    <section id="subscriptions" ref={sectionRef} className="subs-section">
      <div className="page" style={{ maxWidth: '1360px' }}>
        
        {/* Section Header */}
        <div className="subs-header">
          <div className="subs-badge">
            <Sparkles size={12} />
            <span>InteriorG Memberships</span>
          </div>
          
          <h2 className="subs-title">
            Curated Living Subscriptions
          </h2>
          
          <p className="subs-subtitle">
            Elevate your living space on autopilot. Choose an ongoing curation of botanical living foliage, handcrafted heirlooms, and privileged architectural design consultations.
          </p>

          {/* Billing Interval Toggle (Sleek pill bar with proper alignment) */}
          <div className="subs-toggle-wrapper">
            <div className="subs-toggle-bar">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`subs-toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
              >
                Monthly
              </button>
              
              <button
                type="button"
                onClick={() => setBillingCycle('quarterly')}
                className={`subs-toggle-btn ${billingCycle === 'quarterly' ? 'active' : ''}`}
              >
                <span>Quarterly</span>
                <span className="subs-pill-discount subs-pill-discount-gold">SAVE 10%</span>
              </button>
              
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`subs-toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
              >
                <span>Annual</span>
                <span className="subs-pill-discount subs-pill-discount-green">SAVE 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Horizontal Subscription Cards (With Bottom-to-Up Scroll Animation) */}
        <div className="subs-grid">
          {PLANS.map((plan, index) => {
            const currentPrice = billingCycle === 'monthly' 
              ? plan.monthlyPrice 
              : billingCycle === 'quarterly' 
              ? plan.quarterlyPrice 
              : plan.annualPrice;

            const getBilledNote = (p: Plan, cycle: 'monthly' | 'quarterly' | 'annual') => {
              if (cycle === 'monthly') return p.billedNote.monthly;
              if (cycle === 'quarterly') return `Billed quarterly (${formatPrice(p.quarterlyPrice)}) • Save 10%`;
              return `Billed annually (${formatPrice(p.annualPrice)}) • Save 20%`;
            };

            return (
              <div
                key={plan.id}
                className={`subs-card-item ${plan.popular ? 'popular' : ''} ${inView ? 'in-view' : ''}`}
                style={{
                  transitionDelay: inView ? `${index * 140}ms` : '0ms'
                }}
              >
                {/* Popular / Connoisseur Badge */}
                {plan.badge && (
                  <div className="subs-popular-badge">
                    {plan.badge}
                  </div>
                )}

                {/* Card Top: Icon & Billing Cycle Tag */}
                <div className="subs-card-top">
                  <div className="subs-card-icon">
                    {plan.icon}
                  </div>
                  <span className="subs-card-cycle-tag">
                    {billingCycle} plan
                  </span>
                </div>

                {/* Plan Title & Tagline */}
                <h3 className="subs-card-title">
                  {plan.name}
                </h3>
                
                <p className="subs-card-tagline">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="subs-price-container">
                  <div className="subs-price-flex items-baseline">
                    <span className="subs-price-val font-serif font-bold text-2xl text-dark">
                      {formatPrice(currentPrice)}
                    </span>
                    <span className="subs-price-unit ml-1">
                      / {billingCycle === 'monthly' ? 'month' : billingCycle === 'quarterly' ? 'quarter' : 'year'}
                    </span>
                  </div>
                  <p className="subs-price-cycle-note">
                    {getBilledNote(plan, billingCycle)}
                  </p>
                </div>

                {/* Feature Checklist (flex: 1 pushes bottom items to exact baseline) */}
                <div className="subs-features-block">
                  <div className="subs-features-title">
                    Privilege Inclusions:
                  </div>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="subs-feature-row">
                      <Check size={14} className="subs-feature-check" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Exclusive Welcome Perk Box */}
                <div className="subs-gift-card">
                  <div className="subs-gift-head">
                    <Sparkles size={12} />
                    <span>Artisan Welcome Gift</span>
                  </div>
                  <p className="subs-gift-body">
                    {plan.exclusivePerk}
                  </p>
                </div>

                {/* Action CTA Button with distinct button colour */}
                <button
                  type="button"
                  onClick={() => handleSubscribe(plan)}
                  className={`subs-btn ${plan.buttonClass}`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Guild Trust Badges */}
        <div className="subs-trust-grid">
          <div className="subs-trust-item">
            <ShieldCheck size={16} className="text-[var(--navy)]" />
            <span>Cancel, pause, or switch tiers anytime with 1 click</span>
          </div>
          <div className="subs-trust-item">
            <Truck size={16} className="text-[var(--navy)]" />
            <span>Complimentary white-glove packaging & express delivery</span>
          </div>
          <div className="subs-trust-item">
            <HeartHandshake size={16} className="text-[var(--navy)]" />
            <span>Directly empowering 50+ master artisan families with fair living wages</span>
          </div>
        </div>

      </div>
    </section>
  );
}
