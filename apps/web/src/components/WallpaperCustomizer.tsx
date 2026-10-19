import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Check, 
  ShoppingBag, 
  Ruler, 
  Layers, 
  Sun, 
  Moon, 
  RefreshCw, 
  Info, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../api/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Curated Wallpaper Design Options
export interface WallpaperDesign {
  id: string;
  name: string;
  slug: string;
  baseRate: number; // ₹ per sq ft
  tag: string;
  image: string;
  description: string;
  colorFamily: string;
}

const WALLPAPER_DESIGNS: WallpaperDesign[] = [
  {
    id: 'des-jaipuri-floral',
    name: 'Banjara Heritage Jaipuri Floral',
    slug: 'banjara-heritage-jaipuri-floral-wallpaper',
    baseRate: 38,
    tag: 'Traditional Block Print',
    image: 'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.02_f3fa2aa6.jpg',
    description: 'Traditional nomadic floral block-print motifs in ochre and madder red.',
    colorFamily: 'Warm Terracotta & Mustard'
  },
  {
    id: 'des-terracotta-arch',
    name: 'Terracotta Bohemian Arch Mural',
    slug: 'terracotta-bohemian-arch-mural-wallpaper',
    baseRate: 42,
    tag: 'Modern Indian Boho',
    image: 'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.03_9c595ca4.jpg',
    description: 'Earthy curved arches and sunburst silhouettes creating visual height.',
    colorFamily: 'Desert Clay & Sand'
  },
  {
    id: 'des-sage-botanical',
    name: 'Sage Botanical Serenity',
    slug: 'sage-botanical',
    baseRate: 32,
    tag: 'Minimalist Japandi',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600',
    description: 'Calm eucalyptus leaves on textured warm off-white linen background.',
    colorFamily: 'Olive Sage & Cream'
  },
  {
    id: 'des-marble-vein',
    name: 'Calacatta Gold Marble Vein',
    slug: 'marble-vein',
    baseRate: 38,
    tag: 'Contemporary Luxe',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600',
    description: 'Organic gold and taupe veins flowing through soft ivory limestone.',
    colorFamily: 'Ivory & Warm Gold'
  },
  {
    id: 'des-antique-wood',
    name: 'Rustic Sheesham Wood Grain',
    slug: 'rustic-antique-distressed-wood-wallpaper',
    baseRate: 34,
    tag: 'Rustic Industrial',
    image: 'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.04_8d5c4146.jpg',
    description: 'Distressed weathered wood planks inspired by Banjara furniture workshops.',
    colorFamily: 'Warm Walnut & Umber'
  }
];

// Substrates / Material Options
const SUBSTRATES = [
  {
    id: 'textured-canvas',
    name: 'Textured Canvas Matte',
    addedCost: 0,
    description: 'Fine linen texture, zero glare under chandeliers, breathable and peel-resistant.',
    badge: 'Popular'
  },
  {
    id: 'eco-vinyl',
    name: 'Seamless Eco-Vinyl',
    addedCost: 6,
    description: 'Heavy-duty washable surface, scrub-resistant, perfect for dining rooms & hallways.',
    badge: 'Washable'
  },
  {
    id: 'silk-weave',
    name: 'Raw Silk Lustre',
    addedCost: 12,
    description: 'Subtle light-catching silk thread weave, designed for luxury master bedroom feature walls.',
    badge: 'Luxury'
  },
  {
    id: 'peel-stick',
    name: 'Removable Peel & Stick',
    addedCost: 8,
    description: 'Zero glue mess. Clean removal without damaging wall plaster, ideal for rented homes.',
    badge: 'Renter-Friendly'
  }
];

interface WallpaperCustomizerProps {
  initialDesignSlug?: string;
  customizableProducts?: Product[];
}

export function WallpaperCustomizer({ initialDesignSlug, customizableProducts }: WallpaperCustomizerProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  // Design State
  const [selectedDesign, setSelectedDesign] = useState<WallpaperDesign>(() => {
    if (initialDesignSlug) {
      const found = WALLPAPER_DESIGNS.find(d => d.slug === initialDesignSlug);
      if (found) return found;
    }
    return WALLPAPER_DESIGNS[0];
  });

  // Material / Substrate State
  const [selectedSubstrate, setSelectedSubstrate] = useState<string>('textured-canvas');

  // Dimensions State
  const [width, setWidth] = useState<number>(14);
  const [height, setHeight] = useState<number>(10);
  const [unit, setUnit] = useState<'ft' | 'm' | 'in' | 'cm'>('ft');
  const [walls, setWalls] = useState<number>(1);
  const [wastage, setWastage] = useState<number>(10); // 10% standard wastage
  const [lightingMode, setLightingMode] = useState<'day' | 'evening'>('day');
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Quick Preset Handlers
  const handleApplyPreset = (w: number, h: number, name: string) => {
    setWidth(w);
    setHeight(h);
    setUnit('ft');
    toast(`Applied preset: ${name} (${w}ft × ${h}ft)`, { icon: '📐' });
  };

  // Calculations
  const calculations = useMemo(() => {
    let wFt = width;
    let hFt = height;

    if (unit === 'in') { wFt = width / 12; hFt = height / 12; }
    else if (unit === 'm') { wFt = width * 3.28084; hFt = height * 3.28084; }
    else if (unit === 'cm') { wFt = width * 0.0328084; hFt = height * 0.0328084; }

    const rawAreaSqFt = wFt * hFt * walls;
    const billableAreaSqFt = rawAreaSqFt * (1 + wastage / 100);

    const activeSubstrate = SUBSTRATES.find(s => s.id === selectedSubstrate);
    const substrateAddon = activeSubstrate?.addedCost || 0;
    const ratePerSqFt = selectedDesign.baseRate + substrateAddon;

    const materialSubtotal = Math.round(billableAreaSqFt * ratePerSqFt);
    const gstTax = Math.round(materialSubtotal * 0.18);
    const totalCost = materialSubtotal + gstTax;

    // A standard wallpaper roll in India covers ~57 sq ft (0.53m × 10m)
    const rollsNeeded = Math.ceil(billableAreaSqFt / 57);

    return {
      rawAreaSqFt: Number(rawAreaSqFt.toFixed(1)),
      billableAreaSqFt: Number(billableAreaSqFt.toFixed(1)),
      ratePerSqFt,
      substrateAddon,
      materialSubtotal,
      gstTax,
      totalCost,
      rollsNeeded
    };
  }, [width, height, unit, walls, wastage, selectedDesign, selectedSubstrate]);

  // Add Custom Wallpaper to Cart
  const handleAddCustomWallpaper = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsAdding(true);
    try {
      // Find matching product in catalog or use first customizable product id
      const matchedCatalogProduct = customizableProducts?.find(
        p => p.slug === selectedDesign.slug || p.name.toLowerCase().includes(selectedDesign.name.toLowerCase())
      ) || customizableProducts?.[0];

      const productId = matchedCatalogProduct?.id || 'custom-wallpaper-id';

      const customSpec = {
        wallpaperName: selectedDesign.name,
        wallpaperSlug: selectedDesign.slug,
        wallpaperImage: selectedDesign.image,
        substrate: SUBSTRATES.find(s => s.id === selectedSubstrate)?.name,
        width,
        height,
        unit,
        walls,
        wastagePercent: wastage,
        baseAreaSqFt: calculations.rawAreaSqFt,
        billableAreaSqFt: calculations.billableAreaSqFt,
        rollsCount: calculations.rollsNeeded,
        ratePerSqFt: calculations.ratePerSqFt,
        materialSubtotal: calculations.materialSubtotal,
        gstTax: calculations.gstTax,
        totalPrice: calculations.totalCost
      };

      await addItem(productId, 1, customSpec);
      toast.success(`🎉 Added bespoke ${selectedDesign.name} (${calculations.billableAreaSqFt} sq ft) to your cart!`);
    } catch {
      toast.error('Unable to add custom order to cart.');
    } finally {
      setIsAdding(false);
    }
  };

  const currentSubstrate = SUBSTRATES.find(s => s.id === selectedSubstrate);

  return (
    <div className="bg-white border rounded shadow-md overflow-hidden" style={{ borderColor: '#ded9d0' }}>
      {/* Top Banner Header */}
      <div className="p-6 bg-[#2d2a27] text-white flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-yellow text-xs font-semibold">
              <Sparkles size={12} className="inline mr-1" /> Bespoke Wall Studio
            </span>
            <span className="text-xs text-gray-300">Millimeter-Accurate Digital Murals</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-normal m-0 text-white font-playfair">
            Interactive Wallpaper Customizer
          </h2>
          <p className="text-xs text-gray-300 mt-1 m-0 max-w-xl">
            Pick your artisan mural, calibrate wall dimensions with cutting margins, select luxury substrates, and preview the real scale.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur px-4 py-2.5 rounded border border-white/20 text-right self-start sm:self-auto">
          <span className="text-[11px] text-gray-300 uppercase block font-medium">Estimated Total</span>
          <span className="text-2xl font-bold text-[#c4a982] font-playfair">
            ₹{calculations.totalCost.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-gray-300 block">incl. 18% GST & cutting margins</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* LEFT / CENTER: Customizer Controls (7 Columns) */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col gap-8 border-b lg:border-b-0 lg:border-r" style={{ borderColor: '#ded9d0' }}>
          
          {/* STEP 1: Wallpaper Pattern Picker */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-dark text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-bold text-dark m-0">
                  Select Wallpaper Mural / Pattern
                </h3>
              </div>
              <span className="text-xs text-muted">
                Active: <strong className="text-dark">{selectedDesign.name}</strong>
              </span>
            </div>

            {/* Pattern Card Carousel/Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {WALLPAPER_DESIGNS.map((des) => {
                const isSelected = selectedDesign.id === des.id;
                return (
                  <div
                    key={des.id}
                    onClick={() => setSelectedDesign(des)}
                    className={`border rounded p-2.5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected 
                        ? 'border-accent bg-[#fbf9f5] ring-2 ring-accent/30 shadow-sm' 
                        : 'border-[#ded9d0] hover:border-gray-400 bg-white'
                    }`}
                  >
                    <div className="w-full h-24 rounded overflow-hidden mb-2 relative border" style={{ borderColor: '#ded9d0' }}>
                      <img src={des.image} alt={des.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center shadow">
                          <Check size={12} />
                        </span>
                      )}
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur">
                        ₹{des.baseRate}/sq ft
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-muted block truncate font-medium">{des.tag}</span>
                      <h4 className="text-xs font-semibold text-dark m-0 truncate">{des.name}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Dimensions & Calibrated Scale */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-dark text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-base font-bold text-dark m-0">
                  Enter Your Wall Dimensions
                </h3>
              </div>

              {/* Unit Switcher */}
              <div className="flex items-center gap-1 bg-[#f5efe6] p-0.5 rounded border" style={{ borderColor: '#ded9d0' }}>
                {(['ft', 'm', 'in', 'cm'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-2.5 py-0.5 text-xs font-semibold rounded cursor-pointer border-none transition-all ${
                      unit === u ? 'bg-dark text-white shadow-xs' : 'bg-transparent text-muted hover:text-dark'
                    }`}
                  >
                    {u.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension Sliders & Number Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#faf8f5] p-4 rounded border" style={{ borderColor: '#ded9d0' }}>
              {/* Width */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span>Wall Width:</span>
                  <span className="text-accent font-bold">{width} {unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={unit === 'ft' ? 4 : 2}
                    max={unit === 'ft' ? 40 : 15}
                    step={unit === 'ft' ? 0.5 : 0.1}
                    value={width}
                    onChange={(e) => setWidth(parseFloat(e.target.value) || 1)}
                    className="w-full cursor-pointer accent-accent"
                  />
                  <input
                    type="number"
                    min={1}
                    value={width}
                    onChange={(e) => setWidth(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-16 px-2 py-1 text-xs border rounded bg-white font-semibold text-center"
                    style={{ borderColor: '#ded9d0' }}
                  />
                </div>
                <span className="text-[10px] text-muted mt-0.5 block">Total horizontal span</span>
              </div>

              {/* Height */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span>Ceiling Height:</span>
                  <span className="text-accent font-bold">{height} {unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={unit === 'ft' ? 6 : 2}
                    max={unit === 'ft' ? 18 : 6}
                    step={unit === 'ft' ? 0.5 : 0.1}
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value) || 1)}
                    className="w-full cursor-pointer accent-accent"
                  />
                  <input
                    type="number"
                    min={1}
                    value={height}
                    onChange={(e) => setHeight(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-16 px-2 py-1 text-xs border rounded bg-white font-semibold text-center"
                    style={{ borderColor: '#ded9d0' }}
                  />
                </div>
                <span className="text-[10px] text-muted mt-0.5 block">Floor-to-ceiling clearance</span>
              </div>
            </div>

            {/* Quick Sizing Presets */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-[11px] text-muted uppercase font-bold">Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset(8, 8, 'Powder Room / Niche')}
                className="text-xs px-2.5 py-1 bg-white border hover:border-dark rounded cursor-pointer transition-all"
                style={{ borderColor: '#ded9d0' }}
              >
                Small Niche (8×8 ft)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(12, 10, 'Standard Bedroom')}
                className="text-xs px-2.5 py-1 bg-white border hover:border-dark rounded cursor-pointer transition-all"
                style={{ borderColor: '#ded9d0' }}
              >
                Master Bedroom (12×10 ft)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(18, 10.5, 'Living Room Hall')}
                className="text-xs px-2.5 py-1 bg-white border hover:border-dark rounded cursor-pointer transition-all"
                style={{ borderColor: '#ded9d0' }}
              >
                Living Hall (18×10.5 ft)
              </button>
            </div>

            {/* Number of Walls & Wastage Allowance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-dark block mb-1">
                  Number of Identical Walls:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setWalls(num)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded border cursor-pointer transition-all ${
                        walls === num ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-[#ded9d0] hover:border-gray-400'
                      }`}
                    >
                      {num} {num === 1 ? 'Wall' : 'Walls'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span>Cutting Margin ({wastage}%):</span>
                  <span className="text-muted text-[11px]">Recommended 10%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={5}
                  value={wastage}
                  onChange={(e) => setWastage(parseInt(e.target.value) || 10)}
                  className="w-full cursor-pointer accent-accent"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Substrate / Material Options */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-dark text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-base font-bold text-dark m-0">
                Select Premium Substrate & Finish
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUBSTRATES.map((sub) => {
                const isSelected = selectedSubstrate === sub.id;
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubstrate(sub.id)}
                    className={`p-3.5 border rounded cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'border-accent bg-[#fbf9f5] ring-1 ring-accent shadow-sm' 
                        : 'border-[#ded9d0] hover:border-dark bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-xs font-bold text-dark m-0 flex items-center gap-1.5">
                          {isSelected && <Check size={14} className="text-accent" />}
                          {sub.name}
                        </h4>
                        <span className="badge badge-yellow text-[10px] py-0 px-1.5 font-semibold">
                          {sub.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed m-0 mb-2">
                        {sub.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t flex justify-between items-center text-xs" style={{ borderColor: '#ded9d0' }}>
                      <span className="text-muted">Rate Upgrade:</span>
                      <span className="font-bold text-accent">
                        {sub.addedCost === 0 ? 'Included (Base Rate)' : `+₹${sub.addedCost}/sq ft`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT: Live Wall Scale Mockup & Real-Time Bill (5 Columns) */}
        <div className="lg:col-span-5 bg-[#faf8f5] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-dark m-0 flex items-center gap-2">
                  <Layers size={18} className="text-accent" />
                  Live Wall Scale & Lighting Mockup
                </h3>
                <span className="text-xs text-muted">Real-time architectural aspect ratio</span>
              </div>

              {/* Lighting Switcher */}
              <div className="flex items-center gap-1 bg-white border p-1 rounded" style={{ borderColor: '#ded9d0' }}>
                <button
                  type="button"
                  onClick={() => setLightingMode('day')}
                  className={`p-1.5 rounded border-none cursor-pointer ${lightingMode === 'day' ? 'bg-[#c4a982] text-white' : 'bg-transparent text-muted'}`}
                  title="Daylight natural ambience"
                >
                  <Sun size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setLightingMode('evening')}
                  className={`p-1.5 rounded border-none cursor-pointer ${lightingMode === 'evening' ? 'bg-[#2d2a27] text-white' : 'bg-transparent text-muted'}`}
                  title="Evening warm lighting ambience"
                >
                  <Moon size={14} />
                </button>
              </div>
            </div>

            {/* Realistic Room Wall Mockup Canvas */}
            <div 
              className={`w-full rounded border overflow-hidden relative shadow-lg transition-all duration-500 ${
                lightingMode === 'evening' ? 'brightness-95 contrast-105' : 'brightness-100'
              }`}
              style={{
                height: '240px',
                borderColor: '#ded9d0',
                background: `url(${selectedDesign.image}) center/cover no-repeat`
              }}
            >
              {/* Wallpaper Pattern Layer with Ambient Lighting Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: lightingMode === 'evening' 
                    ? 'radial-gradient(circle at 50% 20%, rgba(255, 204, 128, 0.25) 0%, rgba(30, 20, 15, 0.45) 85%)'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.15) 100%)'
                }}
              />

              {/* Dimension Callout Guidelines */}
              <div className="absolute top-2 left-3 right-3 flex justify-between items-center text-[10px] font-mono font-bold bg-black/60 text-white px-2.5 py-1 rounded backdrop-blur">
                <span>↔ Width: {width} {unit}</span>
                <span>↕ Height: {height} {unit}</span>
              </div>

              {/* Room Decor Silhouette for Realistic Human Scale */}
              <div className="absolute bottom-0 inset-x-0 h-20 flex items-end justify-between px-6 pointer-events-none">
                {/* Modern Floor Plant */}
                <div className="w-10 h-16 bg-emerald-950/70 rounded-t-full blur-[0.5px] shadow-lg" />
                {/* Low Console Credenza Silhouette */}
                <div className="w-40 h-8 bg-[#2d2a27]/80 rounded-t border-t border-white/20 shadow-2xl flex items-center justify-center">
                  <span className="text-[9px] text-white/70 font-sans tracking-wide">Sheesham Console</span>
                </div>
                {/* Accent Floor Urn */}
                <div className="w-8 h-12 bg-amber-950/70 rounded-t-lg shadow-lg" />
              </div>

              {/* Active Finish Floating Tag */}
              <span className="absolute bottom-2 right-2 bg-white/95 text-dark text-[10px] font-bold px-2 py-0.5 rounded shadow border" style={{ borderColor: '#ded9d0' }}>
                {currentSubstrate?.name}
              </span>
            </div>

            {/* Real-time Calculation Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-center">
              <div className="p-2.5 bg-white border rounded shadow-xs" style={{ borderColor: '#ded9d0' }}>
                <span className="text-[10px] text-muted block uppercase font-medium">Net Wall Area</span>
                <span className="text-sm font-bold text-dark">{calculations.rawAreaSqFt} sq ft</span>
              </div>
              <div className="p-2.5 bg-white border rounded shadow-xs" style={{ borderColor: '#ded9d0' }}>
                <span className="text-[10px] text-muted block uppercase font-medium">Billable (+{wastage}%)</span>
                <span className="text-sm font-bold text-dark">{calculations.billableAreaSqFt} sq ft</span>
              </div>
              <div className="p-2.5 bg-white border rounded shadow-xs" style={{ borderColor: '#ded9d0' }}>
                <span className="text-[10px] text-muted block uppercase font-medium">Rolls Required</span>
                <span className="text-sm font-bold text-dark">{calculations.rollsNeeded} rolls</span>
              </div>
              <div className="p-2.5 bg-white border rounded shadow-xs" style={{ borderColor: '#ded9d0' }}>
                <span className="text-[10px] text-muted block uppercase font-medium">Applied Rate</span>
                <span className="text-sm font-bold text-accent">₹{calculations.ratePerSqFt}/sq ft</span>
              </div>
            </div>

            {/* Price Line Breakdown */}
            <div className="bg-white p-4 rounded border mt-4 space-y-2 text-xs" style={{ borderColor: '#ded9d0' }}>
              <div className="flex justify-between text-muted">
                <span>Material Cost ({calculations.billableAreaSqFt} sq ft × ₹{calculations.ratePerSqFt}):</span>
                <span className="font-medium text-dark">₹{calculations.materialSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Standard GST Tax (18%):</span>
                <span className="font-medium text-dark">₹{calculations.gstTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Doorstep Insured Delivery:</span>
                <span className="font-semibold text-emerald-700">FREE</span>
              </div>
              <div className="pt-2 border-t flex justify-between items-baseline text-sm font-bold text-dark" style={{ borderColor: '#ded9d0' }}>
                <span>Total Estimated Price:</span>
                <span className="text-xl font-bold text-accent font-playfair">
                  ₹{calculations.totalCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="mt-6 pt-4 border-t space-y-3" style={{ borderColor: '#ded9d0' }}>
            <button
              type="button"
              onClick={handleAddCustomWallpaper}
              disabled={isAdding}
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold shadow-md cursor-pointer transition-all"
            >
              <ShoppingBag size={18} />
              <span>{isAdding ? 'Preparing Custom Order...' : `Add Bespoke Wallpaper to Cart • ₹${calculations.totalCost.toLocaleString('en-IN')}`}</span>
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-muted">
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-600" /> Made-to-measure
              </span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-600" /> Non-toxic pigments
              </span>
              <span className="flex items-center gap-1">
                <Check size={13} className="text-emerald-600" /> Free paste included
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
