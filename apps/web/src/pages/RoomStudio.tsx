import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Layers, 
  Sparkles, 
  UploadCloud, 
  Check, 
  Eye, 
  Info, 
  ShoppingBag, 
  Maximize2, 
  RotateCw, 
  Palette, 
  Ruler, 
  Sliders, 
  Plus, 
  Trash2,
  X,
  Image as ImageIcon,
  Move,
  RefreshCw,
  Search,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Tag,
  Video,
  Camera,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { visualizerApi, RoomAnalysisResponse, Hotspot } from '../api/visualizer';
import { productsApi, Product } from '../api/products';
import { Panorama360Viewer, PlacedItem } from '../components/Panorama360Viewer';
import { GeminiAgentChat } from '../components/GeminiAgentChat';
import { GeminiImageStudioModal } from '../components/GeminiImageStudioModal';
import { GeminiLiveVideoModal } from '../components/GeminiLiveVideoModal';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';

// Demo Presets with high-definition equirectangular room panoramas
const PRESETS = [
  {
    id: 'gemini-living',
    name: '✨ Gemini AI 360° Living Room',
    type: 'PANORAMA' as const,
    subtitle: 'Generated with Gemini Image Model',
    previewUrl: '/gemini-360-living.jpg',
    dimensions: { width: 16, height: 10, length: 20 }
  },
  {
    id: 'gemini-bedroom',
    name: '✨ Gemini AI 360° Master Suite',
    type: 'PANORAMA' as const,
    subtitle: 'Generated with Gemini Image Model',
    previewUrl: '/gemini-360-bedroom.jpg',
    dimensions: { width: 14, height: 9.5, length: 16 }
  },
  {
    id: 'heritage-hall',
    name: 'Heritage Drawing Room & Lounge',
    type: 'PANORAMA' as const,
    subtitle: 'Banjara Heritage Decor & Murals',
    previewUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2560&q=95',
    dimensions: { width: 18, height: 11, length: 22 }
  }
];

export default function RoomStudio() {
  const { cart, addItem } = useCart();

  // Convert cart items for Gemini AI Agent
  const cartItemsForAgent = (cart?.items || []).map(ci => ({
    id: ci.id,
    productId: ci.product.id,
    name: ci.product.name,
    category: (ci.product as any).category?.name || 'Decor',
    price: Number(ci.product.discountPrice || ci.product.price),
    imageUrl: ci.product.images?.[0] || ''
  }));

  // Mode & Upload State
  const [analysisMode, setAnalysisMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [activePreset, setActivePreset] = useState<string>('gemini-living');
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingGemini, setIsGeneratingGemini] = useState(false);

  // Dynamic Real Room Dimensions State (auto-adjustable)
  const [wallWidth, setWallWidth] = useState<number>(16);
  const [wallHeight, setWallHeight] = useState<number>(10);
  const [roomLength, setRoomLength] = useState<number>(20);
  const [isDimensionsOpen, setIsDimensionsOpen] = useState<boolean>(true);

  // Placed Items in 3D Scene State
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);

  // Manual Selection State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);

  // Viewer State
  const [showStaged, setShowStaged] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isAddingBundle, setIsAddingBundle] = useState(false);

  // Gemini Image Studio & Live Video Modal States
  const [isImageStudioOpen, setIsImageStudioOpen] = useState<boolean>(false);
  const [isLiveVideoOpen, setIsLiveVideoOpen] = useState<boolean>(false);

  const handleLoadGeminiImageIntoStudio = (newImageUrl: string) => {
    setUploadedFileUrl(newImageUrl);
    toast.success('🎉 Loaded Gemini AI image into 360° Studio!');
  };

  const handleCaptureForRestyle = (_frameBase64: string) => {
    setIsImageStudioOpen(true);
  };

  const handlePlaceLiveSuggestion = (name: string, price: number) => {
    const newItem: PlacedItem = {
      id: `live-placed-${Date.now()}`,
      productId: `live-${Date.now()}`,
      name,
      category: 'Decor',
      price,
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300',
      yaw: -15,
      pitch: 0,
      scale: 1.0,
    };
    setPlacedItems(prev => [...prev, newItem]);
  };

  // Fetch full store catalog for placement and manual selection
  const { data: catalogData } = useQuery({
    queryKey: ['visualizer-all-products'],
    queryFn: () => productsApi.list({ limit: 50 })
  });

  // Analysis Result State
  const [analysis, setAnalysis] = useState<RoomAnalysisResponse | null>(null);

  // Auto-detect & calibrate dimensions
  const handleAutoAdjustDimensions = () => {
    if (activePreset === 'gemini-bedroom') {
      setWallWidth(14);
      setWallHeight(9.5);
      setRoomLength(16);
      toast.success('Auto-calibrated bedroom dimensions: 14ft × 9.5ft × 16ft');
    } else if (activePreset === 'heritage-hall') {
      setWallWidth(18);
      setWallHeight(11);
      setRoomLength(22);
      toast.success('Auto-calibrated drawing room dimensions: 18ft × 11ft × 22ft');
    } else {
      setWallWidth(16);
      setWallHeight(10);
      setRoomLength(20);
      toast.success('Auto-calibrated living room dimensions: 16ft × 10ft × 20ft');
    }
  };

  // Run analysis function
  const triggerAnalysis = async (mode = analysisMode, manualIds = selectedProductIds) => {
    setIsAnalyzing(true);
    try {
      const currentPreset = PRESETS.find(p => p.id === activePreset);
      const res = await visualizerApi.analyze({
        designType: 'PANORAMA',
        mode: mode,
        fileUrl: uploadedFileUrl || currentPreset?.previewUrl,
        fileName: currentPreset?.name,
        selectedProductIds: mode === 'MANUAL' ? manualIds : undefined,
        dimensions: { width: wallWidth, height: wallHeight, length: roomLength }
      });
      setAnalysis(res);

      // Auto-set initial dimensions from analysis if available
      if (res.dimensions) {
        setWallWidth(res.dimensions.width);
        setWallHeight(res.dimensions.height);
        setRoomLength(res.dimensions.length);
      }

      // Populate initial 3D placed items in room from recommended store products
      if (res.products && res.products.length > 0) {
        const initialPlaced: PlacedItem[] = res.products.map((p, idx) => {
          const hotspot = res.hotspots.find(h => h.productId === p.id);
          return {
            id: `placed-${p.id}`,
            productId: p.id,
            name: p.name,
            category: p.category?.name,
            price: Number(p.discountPrice || p.price),
            imageUrl: p.images?.[0] || '',
            yaw: hotspot?.position.yaw ?? (-40 + idx * 28),
            pitch: hotspot?.position.pitch ?? (idx % 2 === 0 ? 5 : -15),
            scale: 1.0,
          };
        });
        setPlacedItems(initialPlaced);
      }

      if (res.hotspots && res.hotspots.length > 0) {
        setActiveHotspot(res.hotspots[0]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to analyze room layout');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Initial load
  useEffect(() => {
    triggerAnalysis('AUTO', []);
  }, []);

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await visualizerApi.upload(file);
      setUploadedFileUrl(res.fileUrl);
      toast.success(`${file.name} uploaded successfully. Real dimensions auto-calculated.`);
      triggerAnalysis(analysisMode, selectedProductIds);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Gemini AI 360 Generator Modal State
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [geminiRoomType, setGeminiRoomType] = useState('Living Room');
  const [geminiStyle, setGeminiStyle] = useState('Modern Indian Bohemian');
  const [geminiWallpaper, setGeminiWallpaper] = useState('Rajasthani Heritage Floral Mural');
  const [geminiCustomPrompt, setGeminiCustomPrompt] = useState('');
  const [activeGeminiModel, setActiveGeminiModel] = useState('gemini-3.1-flash-image');

  // Generate 360° Room using Gemini Image Model
  const handleGenerateGemini360 = async (overrides?: { roomType?: string; style?: string; wallpaper?: string; prompt?: string }) => {
    setIsGeneratingGemini(true);
    try {
      const roomType = overrides?.roomType || geminiRoomType;
      const style = overrides?.style || geminiStyle;
      const wallpaper = overrides?.wallpaper || geminiWallpaper;
      const customPrompt = overrides?.prompt ?? geminiCustomPrompt;

      toast.loading('Synthesizing 360° room with Gemini Image Model (gemini-3.1-flash-image)...', { id: 'gemini-gen' });
      const res = await visualizerApi.generate360({
        roomType,
        style,
        wallpaper,
        customPrompt: customPrompt.trim() || undefined,
        dimensions: { width: wallWidth, height: wallHeight, length: roomLength }
      });
      toast.dismiss('gemini-gen');
      setUploadedFileUrl(res.imageUrl);
      if (res.model) setActiveGeminiModel(res.model);
      toast.success(`✨ Synthesized 360° room using ${res.model || 'Gemini Image Model'}!`);
      setIsGeminiModalOpen(false);
      triggerAnalysis(analysisMode, selectedProductIds);
    } catch (err: any) {
      toast.dismiss('gemini-gen');
      toast.error(err.response?.data?.message || 'Failed to generate 360° image with Gemini');
    } finally {
      setIsGeneratingGemini(false);
    }
  };

  // Handle Preset Change
  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setActivePreset(preset.id);
    setUploadedFileUrl('');
    setWallWidth(preset.dimensions.width);
    setWallHeight(preset.dimensions.height);
    setRoomLength(preset.dimensions.length);
    triggerAnalysis(analysisMode, selectedProductIds);
  };

  // Toggle Mode (Auto vs Manual)
  const handleModeChange = (mode: 'AUTO' | 'MANUAL') => {
    setAnalysisMode(mode);
    triggerAnalysis(mode, selectedProductIds);
  };

  // Toggle Product in Manual Selection
  const toggleManualProduct = (id: string) => {
    const next = selectedProductIds.includes(id)
      ? selectedProductIds.filter(x => x !== id)
      : [...selectedProductIds, id];
    setSelectedProductIds(next);
    triggerAnalysis('MANUAL', next);
  };

  // Add Entire Room Bundle to Cart
  const handleAddBundleToCart = async () => {
    const itemsToAdd = placedItems.length > 0 
      ? placedItems 
      : (analysis?.products || []).map(p => ({ productId: p.id, name: p.name }));

    if (!itemsToAdd.length) return;
    setIsAddingBundle(true);
    let count = 0;
    try {
      for (const item of itemsToAdd) {
        await addItem(item.productId, 1);
        count++;
      }
      toast.success(`Added all ${count} room items to your cart!`);
    } catch (e) {
      toast.error('Please login as a customer to add room bundle to cart.');
    } finally {
      setIsAddingBundle(false);
    }
  };

  // Live Wallpaper Area & Cost Calculations from Dynamic Sliders
  const primaryWallArea = Math.round(wallWidth * wallHeight);
  const billableArea = Math.ceil(primaryWallArea * 1.10);
  const wallpaperRate = analysis?.wallpaperCostEstimate?.pricePerSqFt || 38;
  const wallpaperMaterialCost = billableArea * wallpaperRate;
  const wallpaperTax = Math.round(wallpaperMaterialCost * 0.18);
  const wallpaperTotal = wallpaperMaterialCost + wallpaperTax;

  // Dynamic Total Room Bundle Price
  const totalBundlePrice = placedItems.length > 0
    ? placedItems.reduce((sum, item) => sum + item.price, 0)
    : (analysis?.totalBundlePrice || 0);

  // Right Studio Panel Tabs & Filtering State
  const [rightPanelTab, setRightPanelTab] = useState<'SUGGESTIONS' | 'PLACED' | 'PALETTE'>('SUGGESTIONS');
  const [suggestionFilter, setSuggestionFilter] = useState<string>('ALL');
  const [suggestionSearch, setSuggestionSearch] = useState<string>('');

  // AI Suggested Products
  const suggestedProducts = analysis?.products || [];

  // Categorized counts for suggestions
  const suggestionCategoryCounts = {
    ALL: suggestedProducts.length,
    WALL: suggestedProducts.filter(p => {
      const s = (p.category?.slug || '').toLowerCase();
      const n = p.name.toLowerCase();
      return s.includes('wallpaper') || s.includes('mirror') || n.includes('mirror') || n.includes('art') || n.includes('mural');
    }).length,
    LIGHTING: suggestedProducts.filter(p => {
      const s = (p.category?.slug || '').toLowerCase();
      const n = p.name.toLowerCase();
      return s.includes('lighting') || n.includes('chandelier') || n.includes('lamp') || n.includes('pendant');
    }).length,
    FURNITURE: suggestedProducts.filter(p => {
      const s = (p.category?.slug || '').toLowerCase();
      const n = p.name.toLowerCase();
      return s.includes('furniture') || n.includes('console') || n.includes('table') || n.includes('stool');
    }).length,
    DECOR: suggestedProducts.filter(p => {
      const s = (p.category?.slug || '').toLowerCase();
      const n = p.name.toLowerCase();
      return s.includes('vase') || s.includes('decor') || s.includes('candle') || n.includes('vase') || n.includes('bowl');
    }).length,
  };

  // Filtered AI suggestions
  const filteredSuggestions = suggestedProducts.filter((prod) => {
    const catSlug = (prod.category?.slug || '').toLowerCase();
    const nameLower = prod.name.toLowerCase();

    if (suggestionFilter === 'WALL') {
      const isWall = catSlug.includes('wallpaper') || catSlug.includes('mirror') || nameLower.includes('mirror') || nameLower.includes('art') || nameLower.includes('mural');
      if (!isWall) return false;
    } else if (suggestionFilter === 'LIGHTING') {
      const isLighting = catSlug.includes('lighting') || nameLower.includes('chandelier') || nameLower.includes('lamp') || nameLower.includes('pendant');
      if (!isLighting) return false;
    } else if (suggestionFilter === 'FURNITURE') {
      const isFurniture = catSlug.includes('furniture') || nameLower.includes('console') || nameLower.includes('table') || nameLower.includes('stool');
      if (!isFurniture) return false;
    } else if (suggestionFilter === 'DECOR') {
      const isDecor = catSlug.includes('vase') || catSlug.includes('candle') || catSlug.includes('decor') || nameLower.includes('vase') || nameLower.includes('bowl');
      if (!isDecor) return false;
    }

    if (suggestionSearch.trim()) {
      const q = suggestionSearch.toLowerCase();
      return nameLower.includes(q) || (prod.category?.name || '').toLowerCase().includes(q);
    }

    return true;
  });

  // Check if product is placed in 360 scene
  const isProductPlaced = (productId: string) => placedItems.some(i => i.productId === productId);

  // 1-Click Toggle Placement of Suggestion in 360 Scene
  const handleTogglePlaceSuggestion = (prod: Product) => {
    const existing = placedItems.find(i => i.productId === prod.id);
    if (existing) {
      setPlacedItems(placedItems.filter(i => i.productId !== prod.id));
      toast.success(`Removed ${prod.name} from 360° room`);
    } else {
      const hotspot = analysis?.hotspots.find(h => h.productId === prod.id);
      const newItem: PlacedItem = {
        id: `placed-${prod.id}-${Date.now()}`,
        productId: prod.id,
        name: prod.name,
        category: prod.category?.name,
        price: Number(prod.discountPrice || prod.price),
        imageUrl: prod.images?.[0] || '',
        yaw: hotspot?.position.yaw ?? -22,
        pitch: hotspot?.position.pitch ?? 0,
        scale: 1.0,
      };
      setPlacedItems(prev => [...prev, newItem]);
      toast.success(`📍 Placed ${prod.name} in 360° room!`);
    }
  };

  // 1-Click Place All AI Suggestions into 360 Scene
  const handlePlaceAllSuggestions = () => {
    const unplaced = suggestedProducts.filter(p => !placedItems.some(i => i.productId === p.id));
    if (unplaced.length === 0) {
      toast('All suggestions are already placed in your 360° room!', { icon: '✨' });
      return;
    }

    const newPlaced: PlacedItem[] = unplaced.map((prod) => {
      const hotspot = analysis?.hotspots.find(h => h.productId === prod.id);
      return {
        id: `placed-${prod.id}-${Date.now()}`,
        productId: prod.id,
        name: prod.name,
        category: prod.category?.name,
        price: Number(prod.discountPrice || prod.price),
        imageUrl: prod.images?.[0] || '',
        yaw: hotspot?.position.yaw ?? -20,
        pitch: hotspot?.position.pitch ?? 0,
        scale: 1.0,
      };
    });

    setPlacedItems(prev => [...prev, ...newPlaced]);
    toast.success(`✨ Placed all ${newPlaced.length} AI suggestions in 360° room!`);
  };

  // Add individual product to cart
  const handleAddToCart = async (productId: string, name: string) => {
    try {
      await addItem(productId, 1);
      toast.success(`Added ${name} to cart!`);
    } catch {
      toast.error('Please login as customer to add to cart');
    }
  };

  return (
    <div className="page-wrapper">
      <Header />

      <main className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Studio Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 pb-5 border-b" style={{ borderColor: '#ded9d0' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-blue flex items-center gap-1">
                <Sparkles size={14} /> 3D AI Studio & Visualizer
              </span>
              <span className="badge badge-yellow">Banjara Market Gurugram Collection</span>
            </div>
            <h1 className="text-3xl md:text-4xl m-0 font-normal">Interior Design Studio</h1>
            <p className="text-muted mt-1.5 max-w-2xl text-sm leading-relaxed">
              Explore room designs in 360° spherical view, place handcrafted decor directly into your space, and restyle with Google Gemini AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsDimensionsOpen(!isDimensionsOpen)}
              className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs font-semibold"
              title="Toggle Room Dimensions & Wallpaper Area Sizing"
            >
              <Ruler size={14} className="text-accent" />
              <span>{wallWidth}ft × {wallHeight}ft ({billableArea} sq ft)</span>
              {isDimensionsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <button
              onClick={() => handleModeChange('AUTO')}
              className={`btn btn-sm flex items-center gap-1.5 text-xs font-semibold ${analysisMode === 'AUTO' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Sparkles size={14} />
              <span>Auto (AI/ML)</span>
            </button>
            <button
              onClick={() => handleModeChange('MANUAL')}
              className={`btn btn-sm flex items-center gap-1.5 text-xs font-semibold ${analysisMode === 'MANUAL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Sliders size={14} />
              <span>Manual Pick</span>
            </button>
          </div>
        </div>

        {/* Unified Studio Command Ribbon */}
        <div className="bg-white border p-3 mb-6 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4" style={{ borderRadius: '6px', borderColor: '#ded9d0' }}>
          {/* Left: 360 Scene Presets & Upload */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted uppercase font-bold tracking-wider mr-1">360° Scene:</span>
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`text-xs px-3 py-1.5 border font-medium cursor-pointer transition-all ${
                  activePreset === preset.id && !uploadedFileUrl
                    ? 'bg-dark text-white border-dark shadow-sm' 
                    : 'bg-[#faf8f5] text-dark hover:border-accent'
                }`}
                style={{ borderRadius: '20px', borderColor: activePreset === preset.id && !uploadedFileUrl ? '#2d2a27' : '#ded9d0' }}
              >
                {preset.name}
              </button>
            ))}

            <label className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer text-xs py-1.5 px-3">
              <UploadCloud size={14} />
              <span>{isUploading ? 'Uploading...' : 'Upload Photo / 360°'}</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Right: AI Creative Studio Suite */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsImageStudioOpen(true)}
              className="btn btn-sm flex items-center gap-2 shadow-sm font-semibold cursor-pointer text-xs"
              style={{ background: '#8c6f52', color: '#ffffff', borderColor: '#8c6f52' }}
              title="Restyle your room picture or panorama with Gemini Image Model (gemini-3.1-flash-image)"
            >
              <Sparkles size={14} />
              <span>✨ Gemini Image Studio</span>
            </button>

            <button
              onClick={() => setIsLiveVideoOpen(true)}
              className="btn btn-sm flex items-center gap-2 shadow-sm font-semibold cursor-pointer text-xs"
              style={{ background: '#2d2a27', color: '#ffffff', borderColor: '#2d2a27' }}
              title="Real-time webcam interior consultant with Gemini Live & Spoken Voice"
            >
              <Video size={14} className="text-red-400 animate-pulse" />
              <span>🎥 Gemini Live Video</span>
            </button>

            <button
              onClick={() => setIsGeminiModalOpen(true)}
              disabled={isGeneratingGemini}
              className="btn btn-secondary btn-sm flex items-center gap-1.5 shadow-sm cursor-pointer text-xs"
              title="Synthesize 360° Equirectangular Panorama with Gemini Image Model"
            >
              <Sparkles size={13} className={isGeneratingGemini ? 'animate-spin' : 'text-accent'} />
              <span>{isGeneratingGemini ? 'Synthesizing...' : '✨ Generate 360°'}</span>
            </button>
          </div>
        </div>

        {/* Visualizer Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left / Main: Interactive 360 Viewer Canvas & Studio Controls */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <Panorama360Viewer
              imageUrl={uploadedFileUrl || PRESETS.find(p => p.id === activePreset)?.previewUrl || PRESETS[0].previewUrl}
              hotspots={analysis?.hotspots || []}
              activeHotspot={activeHotspot}
              onSelectHotspot={(h) => setActiveHotspot(h)}
              onAddToCart={async (productId) => {
                try {
                  await addItem(productId, 1);
                  const prod = catalogData?.items.find(p => p.id === productId) || analysis?.products.find(p => p.id === productId);
                  toast.success(`Added ${prod?.name || 'item'} to cart!`);
                } catch {
                  toast.error('Please login as a customer to add items to cart');
                }
              }}
              showStaged={showStaged}
              availableProducts={catalogData?.items || []}
              placedItems={placedItems}
              onPlacedItemsChange={setPlacedItems}
            />

            {/* Unified Room Dimensions & Live Wallpaper Sizing Panel */}
            <div className="bg-white border shadow-sm transition-all" style={{ borderRadius: '6px', borderColor: '#ded9d0' }}>
              {/* Card Header with Toggle */}
              <div 
                onClick={() => setIsDimensionsOpen(!isDimensionsOpen)}
                className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 cursor-pointer select-none bg-[#faf8f5] border-b"
                style={{ borderColor: '#ded9d0' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#8c6f52]/10 border border-[#8c6f52]/30 flex items-center justify-center text-[#8c6f52]">
                    <Ruler size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2 m-0 text-dark">
                      Room Dimensions & Live Wallpaper Sizing
                    </h3>
                    <p className="text-xs text-muted mt-0.5 m-0">
                      Scale: <span className="font-semibold text-dark">{wallWidth}ft W × {wallHeight}ft H × {roomLength}ft L</span> • Area: <span className="font-semibold text-accent">{primaryWallArea} sq ft</span> ({billableArea} sq ft billable)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAutoAdjustDimensions();
                    }}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs text-accent font-semibold py-1 px-2.5"
                    title="Auto-detect dimensions from active room view"
                  >
                    <RefreshCw size={13} />
                    <span>⚡ Auto-Detect</span>
                  </button>

                  <button 
                    type="button"
                    className="text-muted hover:text-dark border-none bg-transparent p-1 cursor-pointer"
                  >
                    {isDimensionsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
              </div>

              {/* Collapsible Sliders + Cost Calculations Grid */}
              {isDimensionsOpen && (
                <div className="p-5">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left: 3 Interactive Sliders */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Wall Width Slider */}
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold mb-1">
                          <span>Wall Width:</span>
                          <span className="text-accent font-bold text-sm">{wallWidth} ft</span>
                        </div>
                        <input 
                          type="range"
                          min="8"
                          max="35"
                          step="0.5"
                          value={wallWidth}
                          onChange={(e) => setWallWidth(parseFloat(e.target.value))}
                          className="w-full cursor-pointer accent-accent"
                        />
                        <span className="text-[10px] text-muted block mt-0.5">Primary wall width</span>
                      </div>

                      {/* Ceiling Height Slider */}
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold mb-1">
                          <span>Ceiling Height:</span>
                          <span className="text-accent font-bold text-sm">{wallHeight} ft</span>
                        </div>
                        <input 
                          type="range"
                          min="8"
                          max="16"
                          step="0.5"
                          value={wallHeight}
                          onChange={(e) => setWallHeight(parseFloat(e.target.value))}
                          className="w-full cursor-pointer accent-accent"
                        />
                        <span className="text-[10px] text-muted block mt-0.5">Floor-to-ceiling (9–12 ft)</span>
                      </div>

                      {/* Room Length / Depth Slider */}
                      <div>
                        <div className="flex justify-between items-center text-xs font-semibold mb-1">
                          <span>Room Depth:</span>
                          <span className="text-accent font-bold text-sm">{roomLength} ft</span>
                        </div>
                        <input 
                          type="range"
                          min="10"
                          max="40"
                          step="0.5"
                          value={roomLength}
                          onChange={(e) => setRoomLength(parseFloat(e.target.value))}
                          className="w-full cursor-pointer accent-accent"
                        />
                        <span className="text-[10px] text-muted block mt-0.5">Perspective depth</span>
                      </div>
                    </div>

                    {/* Right: 4 Cost Metric Cards */}
                    <div className="lg:col-span-5 grid grid-cols-2 gap-2.5">
                      <div className="p-2.5 bg-[#faf8f5] border rounded text-center" style={{ borderColor: '#ded9d0' }}>
                        <span className="text-[11px] text-muted block">Wall Area</span>
                        <span className="text-base font-bold text-dark">{primaryWallArea} sq ft</span>
                      </div>
                      <div className="p-2.5 bg-[#faf8f5] border rounded text-center" style={{ borderColor: '#ded9d0' }}>
                        <span className="text-[11px] text-muted block">Billable (+10%)</span>
                        <span className="text-base font-bold text-dark">{billableArea} sq ft</span>
                      </div>
                      <div className="p-2.5 bg-[#faf8f5] border rounded text-center" style={{ borderColor: '#ded9d0' }}>
                        <span className="text-[11px] text-muted block">Material Rate</span>
                        <span className="text-base font-bold text-dark">₹{wallpaperRate}/sq ft</span>
                      </div>
                      <div className="p-2.5 bg-[#faf8f5] border rounded text-center" style={{ borderColor: '#8c6f52' }}>
                        <span className="text-[11px] text-muted block font-medium">Estimated Wallpaper</span>
                        <span className="text-base font-bold text-accent">₹{wallpaperTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Gemini AI Image Agent Chat with Automatic Cart Placement */}
            <GeminiAgentChat
              cartItems={cartItemsForAgent}
              placedItems={placedItems}
              onPlacedItemsChange={setPlacedItems}
              onImageUrlChange={(newUrl) => {
                setUploadedFileUrl(newUrl);
                triggerAnalysis(analysisMode, selectedProductIds);
              }}
              roomContext={{
                roomType: activePreset === 'gemini-bedroom' ? 'Master Bedroom' : 'Living Room',
                style: analysis?.detectedStyle || 'Modern Indian Bohemian',
                width: wallWidth,
                height: wallHeight,
                length: roomLength,
                currentImageUrl: uploadedFileUrl || PRESETS.find(p => p.id === activePreset)?.previewUrl
              }}
            />
          </div>

          {/* Right Column: Dynamic Multi-Tab Studio Assistant */}
          <div className="lg:col-span-4 sticky top-4 self-start flex flex-col gap-3">
            {/* Top Navigation Tabs */}
            <div className="bg-white border p-1.5 flex gap-1 rounded shadow-sm" style={{ borderColor: '#ded9d0' }}>
              <button
                type="button"
                onClick={() => setRightPanelTab('SUGGESTIONS')}
                className={`flex-1 py-2 px-2 text-xs font-semibold rounded border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  rightPanelTab === 'SUGGESTIONS'
                    ? 'bg-dark text-white shadow-sm'
                    : 'bg-transparent text-muted hover:text-dark hover:bg-gray-100'
                }`}
              >
                <Sparkles size={14} className={rightPanelTab === 'SUGGESTIONS' ? 'text-accent' : ''} />
                <span>Suggestions</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  rightPanelTab === 'SUGGESTIONS' ? 'bg-[#8c6f52] text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {suggestedProducts.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRightPanelTab('PLACED')}
                className={`flex-1 py-2 px-2 text-xs font-semibold rounded border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  rightPanelTab === 'PLACED'
                    ? 'bg-dark text-white shadow-sm'
                    : 'bg-transparent text-muted hover:text-dark hover:bg-gray-100'
                }`}
              >
                <ShoppingBag size={14} className={rightPanelTab === 'PLACED' ? 'text-accent' : ''} />
                <span>In Room</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  rightPanelTab === 'PLACED' ? 'bg-[#8c6f52] text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {placedItems.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRightPanelTab('PALETTE')}
                className={`flex-1 py-2 px-2 text-xs font-semibold rounded border-none cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  rightPanelTab === 'PALETTE'
                    ? 'bg-dark text-white shadow-sm'
                    : 'bg-transparent text-muted hover:text-dark hover:bg-gray-100'
                }`}
              >
                <Palette size={14} className={rightPanelTab === 'PALETTE' ? 'text-accent' : ''} />
                <span>Palette</span>
              </button>
            </div>

            {/* TAB 1: AI Suggestions */}
            {rightPanelTab === 'SUGGESTIONS' && (
              <div className="bg-white border p-4 sm:p-5 flex flex-col gap-4 rounded shadow-sm" style={{ borderColor: '#ded9d0' }}>
                {/* Header & Subtext */}
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2 m-0 text-dark">
                        <Sparkles size={16} className="text-accent" />
                        Curated Room Additions
                      </h3>
                      <p className="text-xs text-muted mt-1 m-0">
                        Handcrafted decor from Banjara Market Gurugram styled for this space:
                      </p>
                    </div>
                  </div>

                  {/* Bulk Quick Action Buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={handlePlaceAllSuggestions}
                      className="btn btn-secondary btn-sm flex-1 text-xs py-1.5 px-2 flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                      title="Place all recommendations into their matched positions in the 360 scene"
                    >
                      <Sparkles size={13} className="text-accent" />
                      <span>Place All in 360°</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddBundleToCart}
                      disabled={isAddingBundle || suggestedProducts.length === 0}
                      className="btn btn-primary btn-sm flex-1 text-xs py-1.5 px-2 flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                      title="Add all recommended items to cart"
                    >
                      <ShoppingBag size={13} />
                      <span>{isAddingBundle ? 'Adding...' : 'Add All to Cart'}</span>
                    </button>
                  </div>
                </div>

                {/* Search and Category Filter Bar */}
                <div className="flex flex-col gap-2 pt-2 border-t">
                  {/* Search input */}
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      placeholder="Search suggestions (mirror, lamp, table...)"
                      value={suggestionSearch}
                      onChange={(e) => setSuggestionSearch(e.target.value)}
                      className="w-full text-xs pl-8 pr-7 py-1.5 border rounded bg-[#faf8f5] focus:bg-white focus:outline-none focus:border-dark"
                    />
                    {suggestionSearch && (
                      <button
                        type="button"
                        onClick={() => setSuggestionSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-dark border-none bg-transparent cursor-pointer p-0"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Category Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'ALL', label: '🌟 All', count: suggestionCategoryCounts.ALL },
                      { id: 'WALL', label: '🪞 Mirrors & Walls', count: suggestionCategoryCounts.WALL },
                      { id: 'LIGHTING', label: '💡 Lighting', count: suggestionCategoryCounts.LIGHTING },
                      { id: 'FURNITURE', label: '🛋️ Furniture', count: suggestionCategoryCounts.FURNITURE },
                      { id: 'DECOR', label: '🏺 Decor', count: suggestionCategoryCounts.DECOR },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setSuggestionFilter(pill.id)}
                        className={`text-[11px] py-1 px-2.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 font-medium ${
                          suggestionFilter === pill.id
                            ? 'bg-[#2d2a27] text-white border-[#2d2a27]'
                            : 'bg-[#f7f4ee] text-dark border-[#ded9d0] hover:border-gray-400'
                        }`}
                      >
                        <span>{pill.label}</span>
                        <span className="text-[10px] opacity-75">({pill.count})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Suggestions Cards List */}
                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-340px)] min-h-[360px] pr-1">
                  {filteredSuggestions.length === 0 ? (
                    <div className="p-8 text-center text-muted bg-[#faf8f5] rounded border border-dashed">
                      <Search size={24} className="mx-auto mb-2 opacity-40" />
                      <p className="text-xs m-0 font-medium">No suggestion items found</p>
                      <p className="text-[11px] text-muted mt-1">Try selecting "All" or clearing the search box.</p>
                      <button
                        type="button"
                        onClick={() => { setSuggestionFilter('ALL'); setSuggestionSearch(''); }}
                        className="btn btn-secondary btn-sm mt-3 text-xs"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    filteredSuggestions.map((prod) => {
                      const placed = isProductPlaced(prod.id);
                      const hotspot = analysis?.hotspots.find(h => h.productId === prod.id);
                      const curPrice = Number(prod.discountPrice || prod.price);
                      const origPrice = Number(prod.price);
                      const hasDiscount = prod.discountPrice && Number(prod.discountPrice) < origPrice;
                      const discountPct = hasDiscount ? Math.round(((origPrice - curPrice) / origPrice) * 100) : null;
                      const placementLabel = hotspot?.role || hotspot?.placement || prod.category?.name || 'Curated Accent';

                      return (
                        <div
                          key={prod.id}
                          className={`p-3.5 border rounded transition-all duration-200 bg-white ${
                            placed
                              ? 'border-[#8c6f52] shadow-sm bg-[#faf6f0]'
                              : 'hover:border-dark hover:shadow-sm'
                          }`}
                        >
                          {/* Card Header Tag Bar */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="badge badge-yellow text-[10px] font-semibold tracking-wide flex items-center gap-1 py-0.5 px-2">
                              <Sparkles size={10} className="text-accent" />
                              {placementLabel}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              ● In Stock
                            </span>
                          </div>

                          {/* Card Content Row */}
                          <div className="flex gap-3">
                            {/* Product Image Preview */}
                            <div className="w-20 h-20 bg-gray-50 rounded border overflow-hidden flex-shrink-0 relative group">
                              <img
                                src={prod.images?.[0] || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300'}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {hasDiscount && (
                                <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-1 rounded">
                                  {discountPct}% OFF
                                </span>
                              )}
                            </div>

                            {/* Details Column */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] text-muted uppercase tracking-wider block truncate">
                                  {prod.category?.name || 'Home Decor'}
                                </span>
                                <h4 className="text-xs font-bold text-dark m-0 line-clamp-2 leading-tight">
                                  {prod.name}
                                </h4>
                                <p className="text-[11px] text-muted m-0 mt-0.5 line-clamp-1">
                                  {prod.finish || prod.material || 'Handcrafted Banjara Sheesham & Brass'}
                                </p>
                              </div>

                              {/* Price Row */}
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-sm font-bold text-dark">
                                  ₹{curPrice.toLocaleString('en-IN')}
                                </span>
                                {hasDiscount && (
                                  <span className="text-[11px] text-muted line-through">
                                    ₹{origPrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-gray-100">
                            {/* 1-Click 360 Room Placement Toggle */}
                            <button
                              type="button"
                              onClick={() => handleTogglePlaceSuggestion(prod)}
                              className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                placed
                                  ? 'bg-[#8c6f52] text-white border-[#8c6f52] shadow-sm'
                                  : 'bg-white text-dark border-gray-300 hover:border-dark hover:bg-gray-50'
                              }`}
                            >
                              {placed ? (
                                <>
                                  <CheckCircle2 size={13} />
                                  <span>In 360° Scene</span>
                                </>
                              ) : (
                                <>
                                  <MapPin size={13} className="text-accent" />
                                  <span>Place in 360°</span>
                                </>
                              )}
                            </button>

                            {/* Quick Add To Cart */}
                            <button
                              type="button"
                              onClick={() => handleAddToCart(prod.id, prod.name)}
                              className="py-1.5 px-3 text-xs font-semibold rounded border border-[#2d2a27] bg-[#2d2a27] text-white hover:bg-[#3d3a37] transition-all cursor-pointer flex items-center gap-1"
                              title="Add to shopping cart"
                            >
                              <Plus size={13} />
                              <span>Cart</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Bottom Bundle Summary Footer */}
                <div className="pt-3 border-t bg-[#faf8f5] -mx-5 -mb-5 p-4 rounded-b">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-[11px] text-muted uppercase block font-medium">All Curated Items</span>
                      <span className="text-base font-bold text-dark">
                        ₹{(analysis?.totalBundlePrice || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <span className="text-xs text-muted font-medium">
                      {suggestedProducts.length} coordinated pieces
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBundleToCart}
                    disabled={isAddingBundle || suggestedProducts.length === 0}
                    className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag size={15} />
                    <span>{isAddingBundle ? 'Adding...' : 'Add All Curated Items to Cart'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Placed Items in 360 Room */}
            {rightPanelTab === 'PLACED' && (
              <div className="bg-white border p-5 flex flex-col flex-1 rounded" style={{ borderColor: '#ded9d0' }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-bold flex items-center gap-2 m-0">
                    <ShoppingBag size={18} className="text-accent" />
                    In 360° Room Scene ({placedItems.length})
                  </h3>
                  <button 
                    onClick={() => setIsCatalogOpen(true)}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer"
                  >
                    <Plus size={14} /> Catalog
                  </button>
                </div>

                <p className="text-xs text-muted mb-4">
                  {placedItems.length > 0 
                    ? 'These pieces are currently rendered inside your interactive 360° sphere:' 
                    : 'No items placed yet. Click "Place in 360°" on any AI suggestion or use the 360 viewer tray to place items.'}
                </p>

                {/* Placed Items List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-360px)] min-h-[300px] pr-1">
                  {placedItems.length === 0 ? (
                    <div className="p-8 text-center text-muted bg-[#faf8f5] rounded border border-dashed">
                      <ShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-semibold m-0">Room is currently empty</p>
                      <p className="text-[11px] text-muted mt-1 mb-3">
                        Populate your room with AI recommendations or your own selections.
                      </p>
                      <button
                        type="button"
                        onClick={handlePlaceAllSuggestions}
                        className="btn btn-primary btn-sm text-xs cursor-pointer"
                      >
                        <Sparkles size={13} className="mr-1 inline" /> Place AI Suggestions
                      </button>
                    </div>
                  ) : (
                    placedItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-3 border flex gap-3 items-center justify-between hover:border-dark transition-all rounded bg-white"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 bg-gray-100 flex-shrink-0 border overflow-hidden rounded">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-muted block truncate">{item.category || 'Decor'}</span>
                            <h4 className="text-xs font-semibold truncate m-0">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-bold text-accent">₹{item.price.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-muted font-mono bg-gray-100 px-1 rounded">
                                {Math.round(item.yaw)}° / {Math.round(item.pitch)}°
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item.productId, item.name)}
                            className="p-1.5 text-muted hover:text-dark hover:bg-gray-100 rounded border-none bg-transparent cursor-pointer"
                            title="Add to cart"
                          >
                            <ShoppingBag size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPlacedItems(placedItems.filter(i => i.id !== item.id));
                              toast.success(`Removed ${item.name} from room`);
                            }}
                            className="p-1.5 text-muted hover:text-danger hover:bg-red-50 rounded border-none bg-transparent cursor-pointer"
                            title="Remove from room"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Placed Bundle Checkout Bar */}
                {placedItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="text-[11px] text-muted uppercase block font-medium">Placed Items Total</span>
                        <span className="text-lg font-bold text-dark">₹{totalBundlePrice.toLocaleString('en-IN')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPlacedItems([]);
                          toast('Cleared all items from 360 scene', { icon: '🧹' });
                        }}
                        className="text-[11px] text-muted hover:text-danger border-none bg-transparent cursor-pointer"
                      >
                        Clear Scene
                      </button>
                    </div>

                    <button 
                      type="button"
                      onClick={handleAddBundleToCart}
                      disabled={isAddingBundle || placedItems.length === 0}
                      className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 cursor-pointer text-xs font-bold"
                    >
                      <ShoppingBag size={16} />
                      <span>{isAddingBundle ? 'Adding items...' : `Add Placed Items (${placedItems.length}) to Cart`}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Color Harmony & Room Mood */}
            {rightPanelTab === 'PALETTE' && (
              <div className="bg-white border p-5 flex flex-col gap-4 rounded" style={{ borderColor: '#ded9d0' }}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-base font-bold flex items-center gap-2 m-0">
                    <Palette size={18} className="text-accent" />
                    Color Harmony & Room Mood
                  </h3>
                  <span className="badge badge-green text-xs">{analysis?.detectedStyle || 'Harmonized'}</span>
                </div>
                <p className="text-xs text-muted mb-2">
                  Extracted palette matching Banjara Market handcrafted Sheesham wood and brass accents:
                </p>

                <div className="space-y-2.5">
                  {analysis?.colorPalette.map((color, cIdx) => (
                    <div key={cIdx} className="flex items-center justify-between p-2.5 border bg-white rounded" style={{ borderColor: '#ded9d0' }}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded border shadow-inner flex-shrink-0" 
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="text-xs font-bold m-0 text-dark">{color.name}</p>
                          <p className="text-[11px] text-muted m-0">{color.role}</p>
                        </div>
                      </div>
                      <code className="text-xs font-mono font-semibold text-muted bg-[#f7f4ee] px-2 py-0.5 rounded">{color.hex}</code>
                    </div>
                  ))}
                </div>

                {/* Style Inspiration Note */}
                <div className="p-3.5 bg-[#faf8f5] rounded border text-xs text-muted space-y-1 mt-2">
                  <p className="font-semibold text-dark m-0 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-accent" />
                    Designer Recommendation
                  </p>
                  <p className="m-0 leading-relaxed text-[11px]">
                    Pair rich antique brass sconces and warm walnut woodwork against textured warm-white walls to accentuate ambient natural light.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Manual Catalog Modal */}
        {isCatalogOpen && (
          <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '800px', maxHeight: '85vh' }}>
              <div className="flex justify-between items-center mb-4 pb-3 border-b">
                <div>
                  <h3 className="text-xl font-bold m-0">Select Store Items for Your Room</h3>
                  <p className="text-xs text-muted mt-1">Pick products from Banjara Market Gurugram to test in your layout.</p>
                </div>
                <button onClick={() => setIsCatalogOpen(false)} className="btn btn-ghost p-2 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto max-h-96 pr-2 mb-4">
                {catalogData?.items.map(p => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <div 
                      key={p.id}
                      onClick={() => toggleManualProduct(p.id)}
                      className={`p-3 border cursor-pointer flex flex-col justify-between transition-all ${
                        isSelected ? 'border-accent bg-secondary/60' : 'hover:border-dark'
                      }`}
                      style={{ borderRadius: '4px' }}
                    >
                      <div className="w-full h-32 bg-gray-100 border overflow-hidden mb-2">
                        <img src={p.images?.[0]} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-xs text-muted block truncate">{p.category?.name}</span>
                        <h4 className="text-xs font-semibold truncate m-0">{p.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-bold text-accent">₹{p.discountPrice || p.price}</span>
                          <span className={`badge ${isSelected ? 'badge-green' : 'badge-gray'} text-xs`}>
                            {isSelected ? 'Selected' : 'Add'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <span className="text-xs text-muted font-medium">{selectedProductIds.length} items selected</span>
                <button className="btn btn-primary" onClick={() => setIsCatalogOpen(false)}>
                  Done Customizing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gemini AI 360 Studio Synthesis Modal */}
        {isGeminiModalOpen && (
          <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: '640px', maxHeight: '90vh' }}>
              <div className="flex justify-between items-start mb-4 pb-3 border-b">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-blue flex items-center gap-1 text-xs">
                      <Sparkles size={12} /> Gemini AI Image Skill
                    </span>
                    <span className="badge badge-purple text-xs">Model: gemini-3.1-flash-image</span>
                  </div>
                  <h3 className="text-xl font-bold m-0">Generate 360° Real Room with Gemini</h3>
                  <p className="text-xs text-muted mt-1">
                    Uses Google Gemini image model to synthesize a seamless 2:1 equirectangular spherical room panorama with Banjara Market decor.
                  </p>
                </div>
                <button onClick={() => setIsGeminiModalOpen(false)} className="btn btn-ghost p-1 cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1">
                {/* Room Type Selector */}
                <div>
                  <label className="form-label text-xs font-semibold block mb-1.5">1. Room Type:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Living Room', 'Master Bedroom', 'Dining Hall', 'Foyer & Lounge'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setGeminiRoomType(type)}
                        className={`text-xs py-2 px-2 border text-center font-medium cursor-pointer transition-all rounded ${
                          geminiRoomType === type ? 'bg-dark text-white border-dark' : 'bg-white text-dark hover:border-dark'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Decor Style Selector */}
                <div>
                  <label className="form-label text-xs font-semibold block mb-1.5">2. Interior Decor Style:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'Modern Indian Bohemian', desc: 'Banjara Market Sheesham wood, sunburst brass mirror, rattan pendant' },
                      { id: 'Heritage Rajasthani', desc: 'Jaipur block-print floral mural wallpaper, antique carved wood' },
                      { id: 'Terracotta Japandi', desc: 'Warm terracotta arches, fluted ceramic vases, ribbed minimalism' },
                      { id: 'Moroccan Luxury', desc: 'Brass filigree lanterns, mosaic arched niches, warm ambient glow' },
                    ].map((style) => (
                      <div
                        key={style.id}
                        onClick={() => setGeminiStyle(style.id)}
                        className={`p-2.5 border cursor-pointer rounded transition-all ${
                          geminiStyle === style.id ? 'border-accent bg-secondary/50' : 'hover:border-dark'
                        }`}
                      >
                        <span className="text-xs font-bold block">{style.id}</span>
                        <span className="text-[11px] text-muted">{style.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calibrated Dimensions Info */}
                <div className="p-3 bg-secondary/70 border rounded flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-dark flex items-center gap-1.5">
                      <Ruler size={14} className="text-accent" />
                      Calibrated Dimensions:
                    </span>
                    <span className="text-muted text-[11px]">Will scale the 360° perspective ratio</span>
                  </div>
                  <span className="font-bold text-accent">{wallWidth}ft W × {wallHeight}ft H × {roomLength}ft L</span>
                </div>

                {/* Custom Prompt Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label text-xs font-semibold block m-0">3. Custom Design Prompt (Optional):</label>
                    <span className="text-[11px] text-muted">Natural Language AI</span>
                  </div>
                  <textarea
                    value={geminiCustomPrompt}
                    onChange={(e) => setGeminiCustomPrompt(e.target.value)}
                    placeholder="e.g. Luxurious high-rise living room with floor-to-ceiling balcony windows, brass arched mirrors, warm Jaipuri heritage wallpaper, and handwoven cane chandeliers..."
                    className="input w-full text-xs"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setGeminiCustomPrompt('Luxury Indian living hall with antique sunburst brass wall mirror, solid Sheesham wood credenza, Rajasthani floral mural, and warm rattan ceiling pendant.')}
                      className="text-[11px] text-accent hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      + Use Bohemian Living Prompt
                    </button>
                    <span className="text-muted text-[11px]">|</span>
                    <button
                      type="button"
                      onClick={() => setGeminiCustomPrompt('Master suite bedroom with terracotta arch feature wall, carved Sheesham side tables, Moroccan brass filigree pendant lamps, and fluted pastel vases.')}
                      className="text-[11px] text-accent hover:underline bg-transparent border-none p-0 cursor-pointer"
                    >
                      + Use Bedroom Suite Prompt
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 mt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsGeminiModalOpen(false)}
                  className="btn btn-ghost btn-sm text-xs cursor-pointer w-full sm:w-auto"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleGenerateGemini360()}
                    disabled={isGeneratingGemini}
                    className="btn btn-primary btn-sm flex items-center justify-center gap-2 text-xs py-2 px-4 cursor-pointer w-full sm:w-auto shadow-sm"
                  >
                    <Sparkles size={14} className={isGeneratingGemini ? 'animate-spin' : ''} />
                    <span>{isGeneratingGemini ? 'Synthesizing with Gemini...' : '✨ Generate 360° Panorama'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gemini Image Restyle & Design Studio Modal */}
        <GeminiImageStudioModal
          isOpen={isImageStudioOpen}
          onClose={() => setIsImageStudioOpen(false)}
          currentRoomImageUrl={uploadedFileUrl || PRESETS.find(p => p.id === activePreset)?.previewUrl || PRESETS[0].previewUrl}
          onLoadIntoStudio={handleLoadGeminiImageIntoStudio}
        />

        {/* Gemini Live Video AR Consultant Modal */}
        <GeminiLiveVideoModal
          isOpen={isLiveVideoOpen}
          onClose={() => setIsLiveVideoOpen(false)}
          onCaptureForRestyle={handleCaptureForRestyle}
          onPlaceSuggestionInRoom={handlePlaceLiveSuggestion}
        />

      </main>

      <Footer />
    </div>
  );
}
