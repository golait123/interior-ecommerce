import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLocationContext } from '../contexts/LocationContext';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import {
  Sparkles,
  Leaf,
  Sun,
  CloudSun,
  Moon,
  ShieldCheck,
  Droplets,
  Check,
  Truck,
  Package,
  RotateCw,
  Search,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  Plus,
  Minus,
  Sliders,
  Award,
  HelpCircle,
  Clock,
  HeartHandshake,
  Share2,
  BookmarkCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mongoApi } from '../api/mongoServices';

// -------------------------------------------------------------
// NURSERYLIVE INSPIRED DATA & CONFIGURATIONS
// -------------------------------------------------------------

export interface NurserySpaceType {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  defaultW: number;
  defaultL: number;
  basePrice: number;
  mrp: number;
  image: string;
  description: string;
}

const SPACE_TYPES: NurserySpaceType[] = [
  {
    id: 'balcony-eden',
    name: 'Apartment Balcony Sanctuary',
    tagline: 'High-Rise Aerated Microclimate',
    icon: '🏢',
    defaultW: 10,
    defaultL: 5,
    basePrice: 3999,
    mrp: 5499,
    image: '/images/outdoor-garden.jpg',
    description: 'Engineered for high-rise apartment balconies with railing safety planters, vertical tiers, and space-saving wind-hardy foliage.'
  },
  {
    id: 'living-corner',
    name: 'Living Room Clean Air Corner',
    tagline: 'NASA Certified Toxin Removal',
    icon: '🛋️',
    defaultW: 8,
    defaultL: 6,
    basePrice: 4499,
    mrp: 6299,
    image: '/images/indoor-sanctuary.jpg',
    description: 'Curated for indoor living spaces with statement floor urns, sub-irrigation reservoirs, and high-efficiency air purifier plants.'
  },
  {
    id: 'terrace-retreat',
    name: 'Rooftop Terrace Haven',
    tagline: 'Expansive Sun Foliage & Blooms',
    icon: '🌿',
    defaultW: 16,
    defaultL: 10,
    basePrice: 7999,
    mrp: 10999,
    image: '/images/outdoor-garden.jpg',
    description: 'Designed for rooftop sun foliage, heavy clay urns, fragrant climbing bougainvillea, and expansive green canopies.'
  },
  {
    id: 'workstation-desk',
    name: 'Workstation & Study Greens',
    tagline: 'Desk Stress-Relief Companions',
    icon: '💻',
    defaultW: 5,
    defaultL: 3,
    basePrice: 1999,
    mrp: 2999,
    image: '/images/interiorg-hero-banner.jpg',
    description: 'Compact desktop-friendly succulents, lucky bamboo, and calming jade plants that fit gracefully on work desks and study consoles.'
  },
  {
    id: 'verandah-alcove',
    name: 'Villa Verandah & Courtyard',
    tagline: 'Sheltered Architectural Elegance',
    icon: '🏡',
    defaultW: 12,
    defaultL: 8,
    basePrice: 6499,
    mrp: 8999,
    image: '/images/indoor-sanctuary.jpg',
    description: 'Under covered porticos and courtyards with solid wood pedestals, heirloom ceramic pottery, and dramatic architectural foliage.'
  }
];

interface SunlightOption {
  id: string;
  name: string;
  hours: string;
  desc: string;
  icon: React.ElementType;
}

const SUNLIGHT_OPTIONS: SunlightOption[] = [
  {
    id: 'full-sun',
    name: 'Direct Full Sun',
    hours: '5–8 Hours Direct Sunlight',
    desc: 'Ideal for flowering bougainvillea, hibiscus, palms, and jasmine.',
    icon: Sun
  },
  {
    id: 'partial-shade',
    name: 'Bright Filtered Light',
    hours: '3–5 Hours Mild Sunlight',
    desc: 'Perfect for monstera, areca palms, ferns, and philodendrons.',
    icon: CloudSun
  },
  {
    id: 'low-light',
    name: 'Low / Indirect Light',
    hours: '1–2 Hours Soft Ambient Light',
    desc: 'Best for snake plants, ZZ plants, pothos, and peace lilies.',
    icon: Moon
  }
];

interface PlantPack {
  id: string;
  name: string;
  badge: string;
  plantCount: string;
  priceDelta: number;
  mrpDelta: number;
  desc: string;
  image: string;
  plants: string[];
  careLevel: 'Beginner Friendly' | 'Moderate Care';
  waterFrequency: string;
}

const NURSERY_PLANT_PACKS: PlantPack[] = [
  {
    id: 'nasa-clean-air',
    name: 'NASA Clean Air Best 5 Pack',
    badge: '★ Best Seller',
    plantCount: '5 Mature Potted Plants',
    priceDelta: 0,
    mrpDelta: 750,
    desc: 'Scientifically proven to filter benzene, formaldehyde, and indoor dust while releasing abundant oxygen day and night.',
    image: '/images/indoor-sanctuary.jpg',
    plants: ['Areca Palm (4.5ft)', 'Sansevieria Snake Plant', 'Peace Lily White Blooms', 'Golden Pothos Runner', 'Chlorophytum Spider Plant'],
    careLevel: 'Beginner Friendly',
    waterFrequency: 'Once every 7–10 days'
  },
  {
    id: 'vastu-good-luck',
    name: 'Good Luck & Vastu Positive Energy Pack',
    badge: 'Vastu Certified',
    plantCount: '4 Sacred & Auspicious Plants',
    priceDelta: 450,
    mrpDelta: 1200,
    desc: 'Attracts harmonious chi, prosperity, and peace into your living space, aligned with ancient Indian Vastu Shastra traditions.',
    image: '/images/interiorg-hero-banner.jpg',
    plants: ['Crassula Ovata Jade Plant', '2-Tier Lucky Bamboo in Glass Vase', 'Money Plant Golden Queen', 'Sacred Krishna Tulsi'],
    careLevel: 'Beginner Friendly',
    waterFrequency: 'Once every 5–7 days'
  },
  {
    id: 'fragrant-blooms',
    name: 'Fragrant Indian Balcony Flowering Pack',
    badge: 'Sweet Aroma',
    plantCount: '4 Heavy Blooming Plants',
    priceDelta: 750,
    mrpDelta: 1600,
    desc: 'Fills your morning and evening breeze with heavenly Indian floral scents and vibrant tropical nectar blossoms.',
    image: '/images/outdoor-garden.jpg',
    plants: ['Mogra (Arabian Jasmine)', 'Red Hibiscus (Gudhal)', 'Madhumalti (Rangoon Creeper)', 'Raat Ki Rani (Night-Blooming Cestrum)'],
    careLevel: 'Moderate Care',
    waterFrequency: 'Alternate days in summer'
  },
  {
    id: 'low-maintenance-hardy',
    name: 'Zero-Fuss "Cannot-Kill" Resilient Pack',
    badge: 'Drought Hardy',
    plantCount: '4 Indestructible Plants',
    priceDelta: 350,
    mrpDelta: 950,
    desc: 'Engineered for busy professionals, frequent travelers, and plant beginners. Forgiving and thrives with minimal water.',
    image: '/images/indoor-sanctuary.jpg',
    plants: ['ZZ Plant (Zamioculcas)', 'Sansevieria Futura Superba', 'Haworthia Zebra Succulent', 'Aloe Vera Barbadensis'],
    careLevel: 'Beginner Friendly',
    waterFrequency: 'Once every 12–15 days'
  },
  {
    id: 'kitchen-herbs',
    name: 'Organic Fresh Kitchen Herbarium Pack',
    badge: 'Edible & Medicinal',
    plantCount: '5 Fresh Culinary Herbs',
    priceDelta: 600,
    mrpDelta: 1400,
    desc: 'Harvest fresh aromatic herbs, immunity-boosting Tulsi, and digestion botanicals straight from your windowsill or balcony.',
    image: '/images/outdoor-garden.jpg',
    plants: ['Holy Krishna Tulsi', 'Italian Sweet Basil', 'Citronella Lemongrass', 'Organic Spearmint (Pudina)', 'Indian Borage (Ajwain)'],
    careLevel: 'Moderate Care',
    waterFrequency: 'Daily light misting'
  }
];

interface PlanterOption {
  id: string;
  name: string;
  finish: string;
  priceDelta: number;
  perk: string;
  colorHex: string;
}

const PLANTER_OPTIONS: PlanterOption[] = [
  {
    id: 'self-watering',
    name: 'Self-Watering Reservoir Planters',
    finish: 'Smart Sub-Irrigation Float Indicator',
    priceDelta: 650,
    perk: 'Refill reservoir once every 12–14 days. Eliminates over-watering and root rot.',
    colorHex: '#0f492c'
  },
  {
    id: 'terracotta-raw',
    name: 'Hand-Thrown Raw Terracotta Pots',
    finish: '100% Porous Natural Red Clay',
    priceDelta: 0,
    perk: 'Optimal root aeration with natural evaporative cooling that drops root temperature by 2–3°C.',
    colorHex: '#b45309'
  },
  {
    id: 'ceramic-fluted',
    name: 'Artisanal Fluted Glazed Ceramic',
    finish: 'Ivory Sandstone & Gloss Glaze',
    priceDelta: 1450,
    perk: 'Double-fired luxury ceramic with heavy wind stability and included matching drainage trays.',
    colorHex: '#e2e8f0'
  },
  {
    id: 'recycled-poly',
    name: 'Eco-Resilient Poly Balcony Troughs',
    finish: 'UV-Stabilized High-Density Polymer',
    priceDelta: 250,
    perk: 'Ultra-lightweight, shatterproof, and built specifically for modern apartment balcony railings.',
    colorHex: '#334155'
  }
];

interface AddonOption {
  key: string;
  name: string;
  desc: string;
  price: number;
}

const ADDON_OPTIONS: AddonOption[] = [
  {
    key: 'vermicompostMix',
    name: 'Organic Potting Soil Mix with Vermicompost & Neem (5kg)',
    desc: 'Microbe-rich blend with perlite and natural pest repellant neem cake for vibrant root growth.',
    price: 349
  },
  {
    key: 'solarDripKit',
    name: 'Automated Solar Micro-Drip Irrigation Kit',
    desc: 'Self-timed 10-nozzle dripper line. Runs on ambient daylight to hydrate plants while on vacation.',
    price: 1499
  },
  {
    key: 'riverPebbles',
    name: 'Pure Snow White Marble River Pebbles (2kg)',
    desc: 'Decorative top-dressing mulch that locks in soil moisture and prevents weed sprouting.',
    price: 299
  },
  {
    key: 'seaweedTonic',
    name: 'Bio-Organic Liquid Seaweed Plant Tonic (500ml)',
    desc: 'Fast-acting botanical booster providing 60+ trace minerals and amino acids for lush foliage.',
    price: 249
  },
  {
    key: 'sheeshamStand',
    name: 'Multi-Tiered Solid Sheesham Balcony Stand',
    desc: 'Handcrafted weather-sealed solid hardwood stand to display plants vertically in style.',
    price: 1299
  }
];

export default function NurseryDesignCustomizer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { formatPrice } = useLocationContext();

  // Wizard active step (1 to 4)
  const [activeStep, setActiveStep] = useState<number>(1);

  // Mobile View Tab: 'options' | 'visualizer'
  const [mobileView, setMobileView] = useState<'options' | 'visualizer'>('options');

  // Step 1: Space Type Selection
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('balcony-eden');
  const currentSpace = SPACE_TYPES.find(s => s.id === selectedSpaceId) || SPACE_TYPES[0];

  // Dimensions (Width & Length in feet)
  const [width, setWidth] = useState<number>(currentSpace.defaultW);
  const [length, setLength] = useState<number>(currentSpace.defaultL);

  // Sunlight Preference
  const [sunlightId, setSunlightId] = useState<string>('partial-shade');
  const selectedSunlight = SUNLIGHT_OPTIONS.find(s => s.id === sunlightId) || SUNLIGHT_OPTIONS[0];

  // Step 2: Plant Pack Selection
  const [packId, setPackId] = useState<string>('nasa-clean-air');
  const selectedPack = NURSERY_PLANT_PACKS.find(p => p.id === packId) || NURSERY_PLANT_PACKS[0];

  // Step 3: Planters Selection
  const [planterId, setPlanterId] = useState<string>('self-watering');
  const selectedPlanter = PLANTER_OPTIONS.find(p => p.id === planterId) || PLANTER_OPTIONS[0];

  // Step 4: Add-ons Toggles
  const [addons, setAddons] = useState<{ [key: string]: boolean }>({
    vermicompostMix: true,
    solarDripKit: false,
    riverPebbles: true,
    seaweedTonic: false,
    sheeshamStand: false
  });

  // Quantity Stepper
  const [quantity, setQuantity] = useState<number>(1);

  // 360 Visualizer Controls
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [sunlightMode, setSunlightMode] = useState<'day' | 'filtered' | 'ambient'>('day');
  const [activeThumbIdx, setActiveThumbIdx] = useState<number>(0);

  // Pincode Checker
  const [pincode, setPincode] = useState<string>('400001');
  const [pincodeVerified, setPincodeVerified] = useState<boolean>(true);

  // Search input state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch product to attach cart order to
  const { data: productsData } = useQuery({
    queryKey: ['products-nursery-base'],
    queryFn: () => productsApi.list({ limit: 20 })
  });

  const anchorProduct = useMemo(() => {
    const items = productsData?.items || [];
    return (
      items.find(p => p.primaryDomain === 'outdoor' || p.name.toLowerCase().includes('planter') || p.name.toLowerCase().includes('plant')) ||
      items[0] ||
      null
    );
  }, [productsData]);

  // Handle Space Switch
  const handleSelectSpace = (space: NurserySpaceType) => {
    setSelectedSpaceId(space.id);
    setWidth(space.defaultW);
    setLength(space.defaultL);
  };

  // 360 Rotation Controls
  const handleRotateLeft = () => {
    setRotationAngle(prev => (prev - 45 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotationAngle(prev => (prev + 45) % 360);
  };

  // Pricing Model
  const areaSqFt = width * length;
  const basePrice = currentSpace.basePrice;
  const baseMrp = currentSpace.mrp;
  
  const dimensionMultiplier = Math.max(1, (areaSqFt / (currentSpace.defaultW * currentSpace.defaultL)) * 0.6 + 0.4);

  const packCost = selectedPack.priceDelta;
  const packMrp = selectedPack.mrpDelta;

  const planterCost = selectedPlanter.priceDelta;
  const planterMrp = Math.round(planterCost * 1.35);

  const addonsTotal = ADDON_OPTIONS.reduce((sum, item) => {
    return addons[item.key] ? sum + item.price : sum;
  }, 0);

  const addonsMrpTotal = Math.round(addonsTotal * 1.3);

  const subtotalBeforeTax = Math.round(((basePrice * dimensionMultiplier) + packCost + planterCost + addonsTotal) * quantity);
  const totalMrp = Math.round(((baseMrp * dimensionMultiplier) + packMrp + planterMrp + addonsMrpTotal) * quantity);
  const discountAmount = Math.max(0, totalMrp - subtotalBeforeTax);
  const discountPercent = Math.round((discountAmount / totalMrp) * 100);

  const gstTax = Math.round(subtotalBeforeTax * 0.18);
  const finalTotalPrice = subtotalBeforeTax + gstTax;

  // Add Custom Commission to Cart
  const handleCommissionNursery = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!anchorProduct) {
      toast.error('Botanical inventory sync in progress. Please try again.');
      return;
    }

    const calculatedUnitPrice = Math.round(subtotalBeforeTax / quantity);
    const customizationPayload = {
      nurseryDesignType: 'Nurserylive Curated Nursery Commission',
      bespokeType: 'Nursery Architectural Commission',
      spaceName: currentSpace.name,
      spaceType: currentSpace.id,
      dimensions: `${width}ft × ${length}ft (${areaSqFt} sq ft)`,
      width,
      height: length,
      areaSqFt,
      unit: 'ft',
      sunlightOrientation: selectedSunlight.name,
      plantPack: selectedPack.name,
      plantCount: selectedPack.plantCount,
      includedPlants: selectedPack.plants,
      planterType: selectedPlanter.name,
      planterFinish: selectedPlanter.finish,
      addonsSelected: ADDON_OPTIONS.filter(a => addons[a.key]).map(a => a.name),
      shippingPincode: pincode,
      unitPrice: calculatedUnitPrice,
      customPrice: calculatedUnitPrice,
      materialCost: calculatedUnitPrice,
      subtotal: subtotalBeforeTax,
      taxGst18: gstTax,
      totalAmount: finalTotalPrice,
      // Store Manager & Admin tracking fields
      fulfillmentStatus: 'Commission Confirmed',
      trackingNumber: '',
      nurseryNotes: `Commission for ${currentSpace.name} (${areaSqFt} sq ft). ${selectedPack.name} with ${selectedPlanter.name}.`,
      dispatchEta: '3–5 Days'
    };

    try {
      // 1. Persist the complete polymorphic design state into MongoDB
      const mongoRecord = await mongoApi.saveDesign({
        title: `${currentSpace.name} (${areaSqFt} sq ft)`,
        designType: 'NURSERY_GARDEN',
        status: 'ORDERED',
        totalEstimatedCost: finalTotalPrice,
        dimensions: { width, length, areaSqFt, unit: 'ft' },
        metadata: {
          ...customizationPayload,
          spaceId: currentSpace.id,
          userEmail: user?.email
        },
        tags: [currentSpace.name, selectedPack.name, selectedPlanter.name]
      }).catch(err => {
        console.warn('MongoDB design save notice:', err);
        return null;
      });

      const enrichedPayload = {
        ...customizationPayload,
        mongoDesignId: mongoRecord?._id,
        shareSlug: mongoRecord?.shareSlug
      };

      await addItem(anchorProduct.id, quantity, enrichedPayload);
      toast.success(`✨ Bespoke ${currentSpace.name} successfully reserved & saved to MongoDB!`);
      navigate('/cart');
    } catch {
      toast.error('Unable to reserve custom nursery order.');
    }
  };

  const [savingDraft, setSavingDraft] = useState(false);
  const handleSaveAndShareDesign = async () => {
    setSavingDraft(true);
    try {
      const savedDoc = await mongoApi.saveDesign({
        title: `${currentSpace.name} Garden Design (${areaSqFt} sq ft)`,
        designType: 'NURSERY_GARDEN',
        status: 'SAVED',
        isPublic: true,
        totalEstimatedCost: finalTotalPrice,
        dimensions: { width, length, areaSqFt, unit: 'ft' },
        metadata: {
          spaceName: currentSpace.name,
          spaceType: currentSpace.id,
          sunlightOrientation: selectedSunlight.name,
          plantPack: selectedPack.name,
          plantCount: selectedPack.plantCount,
          includedPlants: selectedPack.plants,
          planterType: selectedPlanter.name,
          planterFinish: selectedPlanter.finish,
          addonsSelected: ADDON_OPTIONS.filter(a => addons[a.key]).map(a => a.name),
          shippingPincode: pincode,
          basePrice,
          finalTotalPrice
        },
        tags: [currentSpace.name, selectedPack.name]
      });

      const shareUrl = `${window.location.origin}/nursery-customizer?design=${savedDoc.shareSlug}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('🍃 Design saved to MongoDB! Share link copied to clipboard.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save design to MongoDB');
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <div className="nl-page-wrapper">
      <Header />

      {/* ========================================================================= */}
      {/* 1. NURSERYLIVE TRUST ANNOUNCEMENT RIBBON                                   */}
      {/* ========================================================================= */}
      <div className="nl-trust-ribbon">
        <div className="nl-trust-ribbon-inner">
          <div className="nl-trust-pill">
            <Truck size={14} />
            <span>Free Pan-India Delivery on Orders over ₹499</span>
          </div>
          <div className="nl-trust-pill">
            <Package size={14} />
            <span>100% Breathable Transit-Safe Plant Packaging</span>
          </div>
          <div className="nl-trust-pill">
            <ShieldCheck size={14} />
            <span>7-Day Live Plant Replacement Guarantee</span>
          </div>
          <div className="nl-trust-pill">
            <Star size={14} fill="#4ade80" />
            <span>Over 1.5 Lakh+ Happy Green Homes Across India</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CUSTOMIZER HERO HEADER (NURSERYLIVE LOOK)                               */}
      {/* ========================================================================= */}
      <header className="nl-hero-header">
        <div className="nl-hero-glow" aria-hidden="true" />
        <div className="nl-hero-content">
          <div className="nl-hero-top-row">
            <div>
              <div className="nl-hero-badge">
                <Leaf size={13} />
                <span>Nurserylive Botanical Studio • Bespoke Customizer</span>
              </div>
              <h1 className="nl-hero-title">
                Custom Nursery & Balcony Studio
              </h1>
              <p className="nl-hero-subtitle">
                Customize your ideal green sanctuary in 4 simple steps. Select your living area, pick NASA-certified plant packs, choose premium self-watering pots, and enjoy doorstep white-glove plant delivery across India.
              </p>
            </div>

            {/* Pincode Quick-Check Box */}
            <div className="nl-pincode-card">
              <div className="nl-pincode-title">
                <MapPin size={14} />
                <span>Check Delivery to Your City</span>
              </div>
              <div className="nl-pincode-form">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Pincode"
                  className="nl-pincode-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (pincode.length === 6) {
                      setPincodeVerified(true);
                      toast.success(`Express delivery verified for pincode ${pincode}`);
                    } else {
                      toast.error('Please enter a valid 6-digit Indian pincode');
                    }
                  }}
                  className="nl-pincode-btn"
                >
                  Verify
                </button>
              </div>
              {pincodeVerified && (
                <div className="nl-pincode-status">
                  <Check size={14} />
                  <span>Express 3–5 Days Safe Delivery to <strong>PIN {pincode}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. STEPPER PROGRESS NAVIGATION                                            */}
      {/* ========================================================================= */}
      <nav className="nl-steps-bar" aria-label="Customizer Steps">
        <div className="nl-steps-container">
          {[
            { num: 1, title: '1. Space & Sunlight', id: 1 },
            { num: 2, title: '2. Curated Plant Packs', id: 2 },
            { num: 3, title: '3. Pots & Planters', id: 3 },
            { num: 4, title: '4. Soil & Care Add-ons', id: 4 }
          ].map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                setActiveStep(step.id);
                setMobileView('options');
              }}
              className={`nl-step-btn ${activeStep === step.id ? 'active' : ''}`}
            >
              <span className="nl-step-number">{step.num}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 4. MAIN 2-COLUMN STUDIO STAGE                                             */}
      {/* ========================================================================= */}
      <main className="nl-studio-layout">

        {/* Mobile View Toggle Bar */}
        <div className="nl-mobile-view-tabs" style={{ gridColumn: 'span 2' }}>
          <button
            type="button"
            onClick={() => setMobileView('options')}
            className={`nl-mobile-tab-btn ${mobileView === 'options' ? 'active' : ''}`}
          >
            ⚙️ Step {activeStep} Options
          </button>
          <button
            type="button"
            onClick={() => setMobileView('visualizer')}
            className={`nl-mobile-tab-btn ${mobileView === 'visualizer' ? 'active' : ''}`}
          >
            🪴 360 Preview & Quote ({formatPrice(finalTotalPrice)})
          </button>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* LEFT COLUMN: CUSTOMIZATION PANELS ACCORDING TO ACTIVE STEP             */}
        {/* --------------------------------------------------------------------- */}
        <section
          className="nl-customizer-controls"
          style={{ display: mobileView === 'visualizer' ? 'none' : 'block' }}
        >

          {/* STEP 1: SPACE & DIMENSIONS */}
          {activeStep === 1 && (
            <div className="nl-panel-card">
              <div className="nl-panel-head">
                <h2 className="nl-panel-title">
                  <span>1. Choose Living Space & Environment</span>
                </h2>
                <span className="nl-panel-badge">Step 1 of 4</span>
              </div>

              <div className="nl-space-grid">
                {SPACE_TYPES.map((space) => {
                  const isSelected = selectedSpaceId === space.id;
                  return (
                    <div
                      key={space.id}
                      onClick={() => handleSelectSpace(space)}
                      className={`nl-space-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="nl-space-top">
                        <span className="nl-space-icon">{space.icon}</span>
                        <span className="nl-space-tag">{space.tagline}</span>
                      </div>
                      <h3 className="nl-space-title">{space.name}</h3>
                      <p className="nl-space-desc">{space.description}</p>
                      <div className="nl-space-price-row">
                        <span className="nl-space-price">from {formatPrice(space.basePrice)}</span>
                        <span className="nl-space-mrp">{formatPrice(space.mrp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dimension Sliders Box */}
              <div className="nl-dim-box">
                <div className="nl-panel-head" style={{ border: 'none', padding: 0, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f492c' }}>
                    📐 Custom Space Dimensions ({areaSqFt} sq ft total)
                  </span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    Adjust sliders to match your exact home size
                  </span>
                </div>

                <div className="nl-dim-sliders">
                  <div>
                    <div className="nl-dim-label-row">
                      <span>Width:</span>
                      <strong style={{ color: '#0f492c' }}>{width} feet</strong>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={25}
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      className="nl-range-input"
                    />
                  </div>

                  <div>
                    <div className="nl-dim-label-row">
                      <span>Length / Depth:</span>
                      <strong style={{ color: '#0f492c' }}>{length} feet</strong>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={20}
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="nl-range-input"
                    />
                  </div>
                </div>
              </div>

              {/* Sunlight Orientation Filter */}
              <div style={{ marginTop: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f492c', display: 'block', marginBottom: 6 }}>
                  ☀️ Sunlight & Daily Exposure in this Area
                </span>
                <div className="nl-sun-pills">
                  {SUNLIGHT_OPTIONS.map((sun) => {
                    const isSelected = sunlightId === sun.id;
                    const IconComp = sun.icon;
                    return (
                      <div
                        key={sun.id}
                        onClick={() => setSunlightId(sun.id)}
                        className={`nl-sun-pill ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="nl-sun-name">
                          <IconComp size={15} color={isSelected ? '#0f492c' : '#eab308'} />
                          <span>{sun.name}</span>
                        </div>
                        <p className="nl-sun-desc">{sun.hours}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="nl-reserve-btn"
                  style={{ display: 'inline-flex', width: 'auto', padding: '12px 24px' }}
                >
                  <span>Continue to Plant Packs</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: NURSERYLIVE PLANT PACKS */}
          {activeStep === 2 && (
            <div className="nl-panel-card">
              <div className="nl-panel-head">
                <h2 className="nl-panel-title">
                  <span>2. Select Curated Botanical Plant Pack</span>
                </h2>
                <span className="nl-panel-badge">Step 2 of 4</span>
              </div>

              <div className="nl-packs-list">
                {NURSERY_PLANT_PACKS.map((pack) => {
                  const isSelected = packId === pack.id;
                  return (
                    <div
                      key={pack.id}
                      onClick={() => setPackId(pack.id)}
                      className={`nl-pack-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="nl-pack-img-wrap">
                        <img src={pack.image} alt={pack.name} className="nl-pack-img" />
                      </div>

                      <div className="nl-pack-details">
                        <div className="nl-pack-title-row">
                          <h3 className="nl-pack-title">{pack.name}</h3>
                          <span className="nl-pack-badge">{pack.badge}</span>
                        </div>
                        <p className="nl-pack-desc">{pack.desc}</p>

                        {/* Included Plants Chips */}
                        <div className="nl-pack-chips">
                          {pack.plants.map((plant, pIdx) => (
                            <span key={pIdx} className="nl-plant-chip">
                              ✓ {plant}
                            </span>
                          ))}
                        </div>

                        <div className="nl-pack-meta-row">
                          <span style={{ color: '#0f492c', fontWeight: 600 }}>
                            🌿 {pack.plantCount} • {pack.careLevel}
                          </span>
                          <span style={{ color: '#0f492c', fontWeight: 700, fontFamily: 'monospace' }}>
                            {pack.priceDelta === 0 ? 'Included in Base' : `+${formatPrice(pack.priceDelta)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 12,
                    padding: '10px 20px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Back to Space</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="nl-reserve-btn"
                  style={{ display: 'inline-flex', width: 'auto', padding: '12px 24px' }}
                >
                  <span>Continue to Pots & Planters</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: POTS & PLANTERS */}
          {activeStep === 3 && (
            <div className="nl-panel-card">
              <div className="nl-panel-head">
                <h2 className="nl-panel-title">
                  <span>3. Select Pots & Planter Finishes</span>
                </h2>
                <span className="nl-panel-badge">Step 3 of 4</span>
              </div>

              <div className="nl-planter-grid">
                {PLANTER_OPTIONS.map((planter) => {
                  const isSelected = planterId === planter.id;
                  return (
                    <div
                      key={planter.id}
                      onClick={() => setPlanterId(planter.id)}
                      className={`nl-planter-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div
                        className="nl-planter-color-swatch"
                        style={{ backgroundColor: planter.colorHex }}
                      />
                      <h3 className="nl-planter-name">{planter.name}</h3>
                      <div style={{ fontSize: 11, color: '#0f492c', fontWeight: 600, marginBottom: 4 }}>
                        {planter.finish}
                      </div>
                      <p className="nl-planter-perk">{planter.perk}</p>
                      <div className="nl-planter-price">
                        {planter.priceDelta === 0 ? 'Standard Included' : `+${formatPrice(planter.priceDelta)} upgrade`}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 12,
                    padding: '10px 20px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Back to Plant Packs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(4)}
                  className="nl-reserve-btn"
                  style={{ display: 'inline-flex', width: 'auto', padding: '12px 24px' }}
                >
                  <span>Continue to Soil & Care Essentials</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SOIL & LIVING CARE ADD-ONS */}
          {activeStep === 4 && (
            <div className="nl-panel-card">
              <div className="nl-panel-head">
                <h2 className="nl-panel-title">
                  <span>4. Soil, Irrigation & Living Care Essentials</span>
                </h2>
                <span className="nl-panel-badge">Step 4 of 4</span>
              </div>

              <div className="nl-addons-list">
                {ADDON_OPTIONS.map((addon) => {
                  const isActive = Boolean(addons[addon.key]);
                  return (
                    <div
                      key={addon.key}
                      onClick={() => setAddons(prev => ({ ...prev, [addon.key]: !prev[addon.key] }))}
                      className={`nl-addon-row ${isActive ? 'active' : ''}`}
                    >
                      <div className="nl-addon-info">
                        <div className="nl-addon-check">
                          {isActive && '✓'}
                        </div>
                        <div>
                          <h4 className="nl-addon-name">{addon.name}</h4>
                          <p className="nl-addon-desc">{addon.desc}</p>
                        </div>
                      </div>
                      <span className="nl-addon-price">+{formatPrice(addon.price)}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 12,
                    padding: '10px 20px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Back to Pots</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileView('visualizer')}
                  className="nl-reserve-btn"
                  style={{ display: 'inline-flex', width: 'auto', padding: '12px 24px' }}
                >
                  <span>Review 360 Visualizer & Price</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </section>

        {/* --------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: 360 VISUALIZER & QUOTATION CARD                          */}
        {/* --------------------------------------------------------------------- */}
        <aside
          className="nl-customizer-summary"
          style={{ display: mobileView === 'options' ? 'block' : 'block' }}
        >
          <div className="nl-sticky-summary-wrap">

            {/* 360 Live Visualizer Stage */}
            <div className="nl-visualizer-card">
              <div className="nl-visualizer-header">
                <div>
                  <div className="nl-visualizer-tag">Live Botanical Studio</div>
                  <h3 className="nl-visualizer-title">{currentSpace.name}</h3>
                </div>

                {/* Sun Light Mode Toggles */}
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => setSunlightMode('day')}
                    title="Day Full Sun"
                    style={{
                      border: 'none',
                      background: sunlightMode === 'day' ? '#0f492c' : '#f1f5f9',
                      color: sunlightMode === 'day' ? '#ffffff' : '#64748b',
                      borderRadius: 6,
                      padding: 4,
                      cursor: 'pointer'
                    }}
                  >
                    <Sun size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSunlightMode('filtered')}
                    title="Filtered Golden Hour"
                    style={{
                      border: 'none',
                      background: sunlightMode === 'filtered' ? '#0f492c' : '#f1f5f9',
                      color: sunlightMode === 'filtered' ? '#ffffff' : '#64748b',
                      borderRadius: 6,
                      padding: 4,
                      cursor: 'pointer'
                    }}
                  >
                    <CloudSun size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSunlightMode('ambient')}
                    title="Ambient Evening Glow"
                    style={{
                      border: 'none',
                      background: sunlightMode === 'ambient' ? '#0f492c' : '#f1f5f9',
                      color: sunlightMode === 'ambient' ? '#ffffff' : '#64748b',
                      borderRadius: 6,
                      padding: 4,
                      cursor: 'pointer'
                    }}
                  >
                    <Moon size={14} />
                  </button>
                </div>
              </div>

              {/* Visualizer Viewport */}
              <div className={`nl-stage-viewport nl-stage-sun-${sunlightMode}`}>
                <img
                  src={selectedPack.image}
                  alt={selectedPack.name}
                  className="nl-stage-plant-img"
                  style={{
                    transform: `rotate(${rotationAngle * 0.05}deg) scale(1.03)`
                  }}
                />

                <div className="nl-stage-rotator-ring" />

                {/* Stage Rotation Controls */}
                <div className="nl-stage-ctrls-bar">
                  <button
                    type="button"
                    onClick={handleRotateLeft}
                    className="nl-stage-ctrl-btn"
                    title="Rotate Left 45°"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="nl-stage-angle-text">
                    <RotateCw size={11} style={{ display: 'inline', marginRight: 3 }} />
                    {rotationAngle}° 3D View
                  </span>
                  <button
                    type="button"
                    onClick={handleRotateRight}
                    className="nl-stage-ctrl-btn"
                    title="Rotate Right 45°"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Perspectives Thumbnails Strip */}
              <div className="nl-thumb-strip">
                {[
                  { label: 'Overview', img: selectedPack.image },
                  { label: 'Foliage', img: currentSpace.image },
                  { label: 'Pot Angle', img: '/images/indoor-sanctuary.jpg' },
                  { label: 'Roots', img: '/images/outdoor-garden.jpg' },
                  { label: 'Balcony', img: '/images/interiorg-hero-banner.jpg' }
                ].map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveThumbIdx(idx);
                      setRotationAngle(idx * 72);
                    }}
                    className={`nl-thumb-btn ${activeThumbIdx === idx ? 'active' : ''}`}
                    title={thumb.label}
                  >
                    <img src={thumb.img} alt={thumb.label} />
                  </button>
                ))}
              </div>

              {/* Included Roster in this Pack */}
              <div className="nl-included-roster">
                <div className="nl-roster-title">
                  {selectedPack.name} ({selectedPack.plants.length} Botanical Specimens)
                </div>
                <div className="nl-roster-chips">
                  {selectedPack.plants.map((plant, idx) => (
                    <span key={idx} className="nl-roster-chip">
                      <Leaf size={11} /> {plant}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quotation & Reservation Card */}
            <div className="nl-quote-card">
              <div className="nl-price-row">
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Investment (Inclusive)
                  </div>
                  <div className="nl-final-price">
                    {formatPrice(finalTotalPrice)}
                    <span className="nl-original-mrp">{formatPrice(totalMrp)}</span>
                  </div>
                </div>

                <span className="nl-discount-badge">
                  Save {discountPercent}% Special Deal
                </span>
              </div>

              {/* Quantity Stepper */}
              <div className="nl-qty-row">
                <span className="nl-qty-label">Quantity / Sets:</span>
                <div className="nl-qty-stepper">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="nl-qty-btn"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="nl-qty-num">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="nl-qty-btn"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Itemized Breakdown */}
              <div className="nl-breakdown">
                <div className="nl-breakdown-row">
                  <span>{currentSpace.name} ({areaSqFt} sq ft):</span>
                  <span>{formatPrice(Math.round(basePrice * dimensionMultiplier))}</span>
                </div>
                <div className="nl-breakdown-row">
                  <span>{selectedPack.name}:</span>
                  <span>{selectedPack.priceDelta === 0 ? 'Included' : `+${formatPrice(selectedPack.priceDelta)}`}</span>
                </div>
                <div className="nl-breakdown-row">
                  <span>{selectedPlanter.name}:</span>
                  <span>{selectedPlanter.priceDelta === 0 ? 'Standard Clay' : `+${formatPrice(selectedPlanter.priceDelta)}`}</span>
                </div>
                {addonsTotal > 0 && (
                  <div className="nl-breakdown-row">
                    <span>Care Essentials & Add-ons:</span>
                    <span>+{formatPrice(addonsTotal)}</span>
                  </div>
                )}
                <div className="nl-breakdown-row">
                  <span>18% GST (Pan-India Tax):</span>
                  <span>+{formatPrice(gstTax)}</span>
                </div>
                <div className="nl-breakdown-row total">
                  <span>Total Amount:</span>
                  <span>{formatPrice(finalTotalPrice)}</span>
                </div>
              </div>

              {/* Big Reserve Commission Button */}
              <button
                type="button"
                onClick={handleCommissionNursery}
                className="nl-reserve-btn"
              >
                <Plus size={18} />
                <span>Reserve Custom Nursery Commission</span>
              </button>

              {/* MongoDB Saved Design & Share Button */}
              <button
                type="button"
                onClick={handleSaveAndShareDesign}
                disabled={savingDraft}
                className="mt-2.5 w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold flex items-center justify-center gap-1.5 border border-stone-300 transition-colors cursor-pointer"
                title="Save bespoke garden state into MongoDB and copy shareable URL"
              >
                <Share2 size={13} className="text-emerald-700" />
                <span>{savingDraft ? 'Saving to MongoDB...' : 'Save Draft & Share Design Link'}</span>
              </button>

              <p className="nl-auth-hint">
                {user ? '✨ Ready for express checkout with your verified account' : '🔒 Guests will be redirected to secure login to commission'}
              </p>

              {/* Trust Guarantees */}
              <div className="nl-guarantee-row">
                <div className="nl-guarantee-item">
                  <Truck size={14} />
                  <span>Free doorstep delivery to pincode {pincode}</span>
                </div>
                <div className="nl-guarantee-item">
                  <ShieldCheck size={14} />
                  <span>7-Day Live Plant Replacement Guarantee</span>
                </div>
                <div className="nl-guarantee-item">
                  <HeartHandshake size={14} />
                  <span>Free potting, soil mixing, and care card included</span>
                </div>
              </div>
            </div>

          </div>
        </aside>

      </main>

      <Footer />
    </div>
  );
}
