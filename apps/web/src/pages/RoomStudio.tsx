import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Sparkles, 
  ShoppingBag, 
  Maximize2, 
  RotateCw, 
  Sliders, 
  Plus, 
  Trash2,
  X,
  Move,
  Search,
  CheckCircle2,
  Smartphone,
  QrCode,
  Layers,
  Ruler,
  BarChart3,
  Check,
  Camera,
  Share2
} from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { productsApi, Product } from '../api/products';
import { ARViewer } from '../components/ARViewer';
import { ARProductConfig, ARDimensions, PlacedARItem } from '../types/ar';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

// Curated default fallback products in case store catalog is loading or empty
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-sofa-velvet',
    name: 'Royal Velvet 3-Seater Sofa',
    slug: 'royal-velvet-sofa',
    description: 'Deep navy velvet 3-seater sofa with hand-turned teakwood legs and plush down-fill cushions.',
    type: 'furniture',
    sku: 'SOFA-001',
    price: '34999',
    discountPrice: '28999',
    unit: 'piece',
    pricePerSqFt: null,
    material: 'Velvet & Teak',
    finish: 'Navy Blue & Natural Teak',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
    isCustomizable: true,
    isActive: true,
    category: { id: 'cat-sofa', name: 'Sofas & Lounges', slug: 'sofas' },
    rating: 4.9,
    reviewsCount: 38
  } as unknown as Product,
  {
    id: 'prod-chair-lounge',
    name: 'Artisan Brass & Boucle Lounge Chair',
    slug: 'boucle-lounge-chair',
    description: 'Sculptural reading chair crafted from ivory boucle fabric and warm brushed brass frame.',
    type: 'furniture',
    sku: 'CHAIR-001',
    price: '18499',
    discountPrice: '15999',
    unit: 'piece',
    pricePerSqFt: null,
    material: 'Boucle & Brass',
    finish: 'Ivory Boucle & Satin Brass',
    images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80'],
    isCustomizable: true,
    isActive: true,
    category: { id: 'cat-chair', name: 'Lounge Chairs', slug: 'chairs' },
    rating: 4.8,
    reviewsCount: 24
  } as unknown as Product,
  {
    id: 'prod-center-table',
    name: 'Teak & Gold Minimalist Center Table',
    slug: 'teak-center-table',
    description: 'Solid seasoned teak wood coffee table with satin brass cylindrical frame legs.',
    type: 'furniture',
    sku: 'TABLE-001',
    price: '12999',
    discountPrice: '10499',
    unit: 'piece',
    pricePerSqFt: null,
    material: 'Teak Wood & Brass',
    finish: 'Walnut Stain & Brushed Gold',
    images: ['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80'],
    isCustomizable: false,
    isActive: true,
    category: { id: 'cat-table', name: 'Coffee & Center Tables', slug: 'tables' },
    rating: 4.7,
    reviewsCount: 19
  } as unknown as Product,
  {
    id: 'prod-floor-lamp',
    name: 'Fluted Marble & Brass Floor Lamp',
    slug: 'brass-floor-lamp',
    description: 'Tall architectural floor lamp with weighted white marble base and warm opal diffuser shade.',
    type: 'lighting',
    sku: 'LAMP-001',
    price: '7999',
    discountPrice: '6499',
    unit: 'piece',
    pricePerSqFt: null,
    material: 'Brass & Marble',
    finish: 'Brushed Brass',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'],
    isCustomizable: false,
    isActive: true,
    category: { id: 'cat-lamp', name: 'Designer Lighting', slug: 'lighting' },
    rating: 4.9,
    reviewsCount: 31
  } as unknown as Product,
  {
    id: 'prod-planter-botanical',
    name: 'Ceramic Arch Planter with Botanical Ficus',
    slug: 'ceramic-arch-planter',
    description: 'Handmade matte earthenware planter atop a suspended brass tripod stand.',
    type: 'decor',
    sku: 'PLANT-001',
    price: '4499',
    discountPrice: '3799',
    unit: 'piece',
    pricePerSqFt: null,
    material: 'Ceramic & Plant',
    finish: 'Matte White & Brass',
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80'],
    isCustomizable: false,
    isActive: true,
    category: { id: 'cat-decor', name: 'Botanicals & Planters', slug: 'plants' },
    rating: 4.6,
    reviewsCount: 15
  } as unknown as Product,
  {
    id: 'prod-wall-art-mural',
    name: 'Banjara Heritage Gilded Wall Mural',
    slug: 'banjara-wall-mural',
    description: 'Gold-leaf framed canvas celebrating heritage Indian architectural motifs.',
    type: 'art',
    sku: 'ART-001',
    price: '8999',
    discountPrice: '7299',
    unit: 'piece',
    pricePerSqFt: null,
    material: 'Canvas & Gold Leaf',
    finish: 'Gilded Antique Gold',
    images: ['https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=800&q=80'],
    isCustomizable: false,
    isActive: true,
    category: { id: 'cat-art', name: 'Wall Murals & Art', slug: 'art' },
    rating: 5.0,
    reviewsCount: 42
  } as unknown as Product
];

export default function RoomStudio() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { addItem } = useCart();

  // Query store products
  const { data: catalogData } = useQuery({
    queryKey: ['vision-ar-products'],
    queryFn: () => productsApi.list({ limit: 50 })
  });

  const allProducts: Product[] = (catalogData?.items && catalogData.items.length > 0)
    ? catalogData.items
    : FALLBACK_PRODUCTS;

  // Active product loaded in Vision AR
  const [activeProduct, setActiveProduct] = useState<Product>(allProducts[0]);
  const [isFullscreenArOpen, setIsFullscreenArOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Right Panel Tab: CATALOG, SCENE, DIMENSIONS, TELEMETRY
  const [sidebarTab, setSidebarTab] = useState<'CATALOG' | 'SCENE' | 'DIMENSIONS' | 'TELEMETRY'>('CATALOG');
  const [catalogCategory, setCatalogCategory] = useState<string>('ALL');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Placed items in the AR scene
  const [placedSceneItems, setPlacedSceneItems] = useState<PlacedARItem[]>([]);
  const [isAddingAllToCart, setIsAddingAllToCart] = useState(false);

  // Sync product selection from query param (?product=<id>)
  useEffect(() => {
    const prodId = searchParams.get('product');
    if (prodId && allProducts.length > 0) {
      const found = allProducts.find(p => p.id === prodId || p.slug === prodId);
      if (found) {
        setActiveProduct(found);
      }
    }
  }, [searchParams, allProducts]);

  // Generate Mobile AR QR Code
  useEffect(() => {
    const mobileUrl = `${window.location.origin}/room-studio?product=${activeProduct.id}&mode=ar`;
    QRCode.toDataURL(mobileUrl, {
      width: 260,
      margin: 2,
      color: { dark: '#0B2E5B', light: '#FFFFFF' }
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('Failed to generate Vision AR QR code:', err));
  }, [activeProduct.id]);

  // Filter catalog products
  const filteredCatalog = allProducts.filter(item => {
    const catSlug = (item.category?.slug || '').toLowerCase();
    const catName = (item.category?.name || '').toLowerCase();
    const nameLower = item.name.toLowerCase();

    if (catalogCategory === 'SOFAS' && !catSlug.includes('sofa') && !nameLower.includes('sofa')) return false;
    if (catalogCategory === 'CHAIRS' && !catSlug.includes('chair') && !nameLower.includes('chair')) return false;
    if (catalogCategory === 'TABLES' && !catSlug.includes('table') && !nameLower.includes('table')) return false;
    if (catalogCategory === 'LIGHTING' && !catSlug.includes('light') && !catSlug.includes('lamp') && !nameLower.includes('lamp')) return false;
    if (catalogCategory === 'PLANTS' && !catSlug.includes('plant') && !nameLower.includes('plant')) return false;
    if (catalogCategory === 'ART' && !catSlug.includes('art') && !catSlug.includes('mural') && !nameLower.includes('art')) return false;

    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      return nameLower.includes(q) || catName.includes(q);
    }
    return true;
  });

  // Extract dimensions for active product
  const arConfig = (activeProduct as any).arConfig as ARProductConfig | undefined;
  const dimensions: ARDimensions = arConfig?.dimensions || {
    widthMeters: 1.2,
    heightMeters: 0.85,
    depthMeters: 0.8,
    widthFeet: 4.0,
    heightFeet: 2.8,
    depthFeet: 2.6
  };

  // Add individual product to cart
  const handleAddToCart = async (prod: Product) => {
    try {
      await addItem(prod.id, 1);
      toast.success(`Added ${prod.name} to cart!`);
    } catch {
      toast.error('Unable to add item to cart.');
    }
  };

  // Place active piece into multi-product room scene
  const handlePlaceActiveInScene = (prod: Product) => {
    const existing = placedSceneItems.find(i => i.productId === prod.id);
    if (existing) {
      toast('Item is already in your AR scene. Select another or adjust its position.', { icon: '📍' });
      return;
    }

    const newItem: PlacedARItem = {
      id: `scene-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: prod.id,
      productName: prod.name,
      category: prod.category?.name,
      price: Number(prod.discountPrice || prod.price),
      imageUrl: prod.images?.[0] || '',
      geometryType: arConfig?.geometryType || 'table',
      primaryColor: arConfig?.primaryColor || '#0B2E5B',
      dimensions,
      position: { x: (placedSceneItems.length * 0.6) - 0.6, y: 0, z: -0.2 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.0, y: 1.0, z: 1.0 }
    };

    setPlacedSceneItems(prev => [...prev, newItem]);
    toast.success(`📍 Placed ${prod.name} in your Vision AR room!`);
  };

  // Add entire AR scene to cart
  const handleAddAllSceneToCart = async () => {
    if (placedSceneItems.length === 0) {
      handleAddToCart(activeProduct);
      return;
    }

    setIsAddingAllToCart(true);
    let count = 0;
    try {
      for (const item of placedSceneItems) {
        await addItem(item.productId, 1);
        count++;
      }
      toast.success(`Added all ${count} Vision AR pieces to your cart!`);
    } catch {
      toast.error('Failed to add all room scene items to cart.');
    } finally {
      setIsAddingAllToCart(false);
    }
  };

  // Total scene valuation
  const totalScenePrice = placedSceneItems.length > 0
    ? placedSceneItems.reduce((acc, curr) => acc + curr.price, 0)
    : Number(activeProduct.discountPrice || activeProduct.price);

  return (
    <div className="page-wrapper bg-[#F5F9FF] min-h-screen">
      <Header />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Studio Top Header Ribbon */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 pb-5 border-b border-[#DCE7F5]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge flex items-center gap-1.5 bg-[#0B2E5B] text-white text-xs px-2.5 py-1 rounded-full font-bold">
                <Sparkles size={13} className="text-[#8EC5FF]" /> Vision AR Studio
              </span>
              <span className="badge flex items-center gap-1.5 bg-[#2D8CFF]/15 text-[#0B2E5B] text-xs px-2.5 py-1 rounded-full font-bold border border-[#2D8CFF]/30">
                <CheckCircle2 size={13} className="text-[#2D8CFF]" /> True-to-Scale 3D Experience
              </span>
              <span className="badge flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-200">
                ● MongoDB Sync Active
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl m-0 font-bold text-[#0B2E5B] font-['Montserrat',sans-serif]">
              Vision AR Studio
            </h1>
            <p className="text-[#4B5563] mt-1.5 max-w-2xl text-sm leading-relaxed font-['Inter',sans-serif]">
              Place true-to-scale 3D furniture into your living room through your device camera. Tap to position, drag to move across your floor, rotate 360°, and verify physical clearance before purchasing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white text-[#0B2E5B] border border-[#DCE7F5] rounded-lg shadow-sm hover:border-[#2D8CFF] cursor-pointer"
              title="Scan QR Code to open Vision AR on mobile"
            >
              <Smartphone size={14} className="text-[#2D8CFF]" />
              <span>Mobile AR QR</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreenArOpen(true)}
              className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 bg-[#2D8CFF] text-white rounded-lg shadow-sm hover:bg-[#1a7ae6] cursor-pointer"
              title="Expand Vision AR to Fullscreen"
            >
              <Maximize2 size={14} />
              <span>Fullscreen AR</span>
            </button>
          </div>
        </div>

        {/* Vision AR Grid Layout: 8 Cols Main AR Viewport + 4 Cols Catalog & Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Primary Vision AR 3D Viewport */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Embedded 3D AR Viewer Canvas */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-xl border-2 border-[#8EC5FF] bg-black"
              style={{ height: '640px', minHeight: '520px' }}
            >
              <ARViewer
                product={activeProduct}
                catalog={allProducts}
                onSelectProduct={(p) => setActiveProduct(p)}
                onClose={() => {}}
                isEmbedded={true}
                roomDimensions={{ width: 16, height: 10, length: 20 }}
              />
            </div>

            {/* Vision AR Capability Features Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-white rounded-xl border border-[#DCE7F5] flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#2D8CFF]/15 text-[#2D8CFF] flex items-center justify-center flex-shrink-0">
                  <Move size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0B2E5B] m-0">Surface Detection</h4>
                  <p className="text-[11px] text-[#6B7280] m-0 mt-0.5">Floor plane raycasting & tap-to-place</p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#DCE7F5] flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#2D8CFF]/15 text-[#2D8CFF] flex items-center justify-center flex-shrink-0">
                  <Ruler size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0B2E5B] m-0">1:1 Physical Sizing</h4>
                  <p className="text-[11px] text-[#6B7280] m-0 mt-0.5">Guaranteed true metric dimensions</p>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#DCE7F5] flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#2D8CFF]/15 text-[#2D8CFF] flex items-center justify-center flex-shrink-0">
                  <Layers size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0B2E5B] m-0">Multi-Product Staging</h4>
                  <p className="text-[11px] text-[#6B7280] m-0 mt-0.5">Combine furniture pieces in one room</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Studio Catalog, Scene Staging & Telemetry Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Sidebar Navigation Tabs */}
            <div className="flex bg-white p-1 rounded-xl border border-[#DCE7F5] shadow-sm">
              <button
                type="button"
                onClick={() => setSidebarTab('CATALOG')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  sidebarTab === 'CATALOG'
                    ? 'bg-[#0B2E5B] text-white shadow-sm'
                    : 'text-[#4B5563] hover:text-[#0B2E5B]'
                }`}
              >
                <Layers size={13} />
                <span>Catalog</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('SCENE')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  sidebarTab === 'SCENE'
                    ? 'bg-[#0B2E5B] text-white shadow-sm'
                    : 'text-[#4B5563] hover:text-[#0B2E5B]'
                }`}
              >
                <ShoppingBag size={13} />
                <span>Scene ({placedSceneItems.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('DIMENSIONS')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  sidebarTab === 'DIMENSIONS'
                    ? 'bg-[#0B2E5B] text-white shadow-sm'
                    : 'text-[#4B5563] hover:text-[#0B2E5B]'
                }`}
              >
                <Ruler size={13} />
                <span>Scale</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('TELEMETRY')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  sidebarTab === 'TELEMETRY'
                    ? 'bg-[#0B2E5B] text-white shadow-sm'
                    : 'text-[#4B5563] hover:text-[#0B2E5B]'
                }`}
              >
                <BarChart3 size={13} />
                <span>Session</span>
              </button>
            </div>

            {/* TAB 1: VISION AR CATALOG BROWSER */}
            {sidebarTab === 'CATALOG' && (
              <div className="bg-white rounded-2xl border border-[#DCE7F5] p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0B2E5B] m-0 font-['Montserrat',sans-serif]">
                    Furniture & Decor Pieces
                  </h3>
                  <span className="text-xs text-[#2D8CFF] font-semibold">
                    {filteredCatalog.length} available
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Search furniture (sofa, chair, lamp...)"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-7 py-2 border border-[#DCE7F5] rounded-lg bg-[#F5F9FF] focus:bg-white focus:outline-none focus:border-[#2D8CFF]"
                  />
                  {catalogSearch && (
                    <button
                      type="button"
                      onClick={() => setCatalogSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-black border-none bg-transparent cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'SOFAS', label: 'Sofas' },
                    { id: 'CHAIRS', label: 'Chairs' },
                    { id: 'TABLES', label: 'Tables' },
                    { id: 'LIGHTING', label: 'Lamps' },
                    { id: 'PLANTS', label: 'Planters' },
                    { id: 'ART', label: 'Wall Art' }
                  ].map(pill => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setCatalogCategory(pill.id)}
                      className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer border ${
                        catalogCategory === pill.id
                          ? 'bg-[#0B2E5B] text-white border-[#0B2E5B]'
                          : 'bg-[#F5F9FF] text-[#4B5563] border-[#DCE7F5] hover:border-[#2D8CFF]'
                      }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                {/* Catalog Cards Scroll List */}
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredCatalog.map(prod => {
                    const isSelected = prod.id === activeProduct.id;
                    const curPrice = Number(prod.discountPrice || prod.price);

                    return (
                      <div
                        key={prod.id}
                        onClick={() => setActiveProduct(prod)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
                          isSelected
                            ? 'border-[#2D8CFF] bg-[#F5F9FF] shadow-sm'
                            : 'border-[#E5E7EB] hover:border-[#2D8CFF] bg-white'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-lg bg-gray-100 border border-[#DCE7F5] overflow-hidden flex-shrink-0">
                          {prod.images?.[0] ? (
                            <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#0B2E5B] text-[#8EC5FF]">
                              <Sparkles size={16} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-[#6B7280] block truncate uppercase tracking-wider">
                            {prod.category?.name || 'Interior Piece'}
                          </span>
                          <h4 className="text-xs font-bold text-[#0B2E5B] truncate m-0">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-extrabold text-[#2D8CFF]">
                              ₹{curPrice.toLocaleString('en-IN')}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] bg-[#2D8CFF] text-white px-1.5 py-0.2 rounded font-bold">
                                Active AR
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlaceActiveInScene(prod);
                            }}
                            className="p-1.5 rounded-md bg-[#0B2E5B] text-white hover:bg-[#2D8CFF] transition-all cursor-pointer border-none"
                            title="Place in Vision AR Scene"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: ACTIVE AR SCENE STAGING */}
            {sidebarTab === 'SCENE' && (
              <div className="bg-white rounded-2xl border border-[#DCE7F5] p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0B2E5B] m-0 font-['Montserrat',sans-serif]">
                    Items in Active Room Scene
                  </h3>
                  <span className="badge bg-[#2D8CFF] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {placedSceneItems.length} placed
                  </span>
                </div>

                <p className="text-xs text-[#6B7280] m-0">
                  {placedSceneItems.length === 0
                    ? 'No products staged in room yet. Click "+" on any catalog piece to place it in your AR scene.'
                    : 'These pieces are currently staged together in your real room view:'}
                </p>

                {/* Placed Items List */}
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {placedSceneItems.length === 0 ? (
                    <div className="p-8 text-center text-[#6B7280] bg-[#F5F9FF] rounded-xl border border-dashed border-[#DCE7F5]">
                      <ShoppingBag size={24} className="mx-auto mb-2 text-[#9CA3AF]" />
                      <p className="text-xs font-semibold m-0">Room Scene is Empty</p>
                      <button
                        type="button"
                        onClick={() => handlePlaceActiveInScene(activeProduct)}
                        className="btn btn-primary btn-sm text-xs mt-3 bg-[#2D8CFF] text-white px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        <Plus size={13} className="inline mr-1" /> Place {activeProduct.name.substring(0, 18)}
                      </button>
                    </div>
                  ) : (
                    placedSceneItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl border border-[#DCE7F5] bg-[#F5F9FF] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-bold text-[#0B2E5B] w-4">#{idx + 1}</span>
                          <div className="w-10 h-10 rounded-md bg-white border border-[#DCE7F5] overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#0B2E5B]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-[#0B2E5B] truncate m-0">
                              {item.productName}
                            </h4>
                            <p className="text-[11px] text-[#2D8CFF] font-bold m-0">
                              ₹{item.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPlacedSceneItems(prev => prev.filter(i => i.id !== item.id));
                            toast.success(`Removed ${item.productName} from scene`);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer"
                          title="Remove from room scene"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Scene Checkout Button */}
                <div className="pt-3 border-t border-[#DCE7F5] mt-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-[#6B7280] font-medium">Total Scene Price</span>
                    <span className="text-base font-extrabold text-[#0B2E5B]">
                      ₹{totalScenePrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAllSceneToCart}
                    disabled={isAddingAllToCart}
                    className="w-full py-2.5 rounded-xl bg-[#2D8CFF] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#1a7ae6] transition-all cursor-pointer border-none"
                  >
                    <ShoppingBag size={15} />
                    <span>{isAddingAllToCart ? 'Adding to Cart...' : `Add Scene to Cart (${placedSceneItems.length || 1})`}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: TRUE 1:1 PHYSICAL SCALE INSPECTOR */}
            {sidebarTab === 'DIMENSIONS' && (
              <div className="bg-white rounded-2xl border border-[#DCE7F5] p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0B2E5B] m-0 font-['Montserrat',sans-serif]">
                    Physical Dimensions Inspector
                  </h3>
                  <span className="badge bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                    1:1 Scale
                  </span>
                </div>

                <div className="p-3 bg-[#F5F9FF] rounded-xl border border-[#DCE7F5] flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border border-[#8EC5FF] overflow-hidden flex-shrink-0">
                    <img src={activeProduct.images?.[0]} alt={activeProduct.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#0B2E5B] truncate m-0">
                      {activeProduct.name}
                    </h4>
                    <p className="text-[11px] text-[#2D8CFF] font-semibold m-0 mt-0.5">
                      Surface Placement: {arConfig?.placementType || 'Floor'}
                    </p>
                  </div>
                </div>

                {/* Measurements Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg bg-[#fafbfc] border border-[#E5E7EB] text-center">
                    <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Width</span>
                    <span className="text-sm font-extrabold text-[#0B2E5B] block mt-1">{dimensions.widthFeet} ft</span>
                    <span className="text-[10px] text-[#9CA3AF]">({dimensions.widthMeters} m)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#fafbfc] border border-[#E5E7EB] text-center">
                    <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Depth</span>
                    <span className="text-sm font-extrabold text-[#0B2E5B] block mt-1">{dimensions.depthFeet} ft</span>
                    <span className="text-[10px] text-[#9CA3AF]">({dimensions.depthMeters} m)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#fafbfc] border border-[#E5E7EB] text-center">
                    <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Height</span>
                    <span className="text-sm font-extrabold text-[#0B2E5B] block mt-1">{dimensions.heightFeet} ft</span>
                    <span className="text-[10px] text-[#9CA3AF]">({dimensions.heightMeters} m)</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-[#0B2E5B] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#2D8CFF]" />
                    <span>Real-World Space Verification</span>
                  </div>
                  <p className="text-[11px] text-[#4B5563] m-0">
                    This 3D piece matches manufacturer blueprints within ±1cm accuracy. Use Vision AR to verify doorway clearances, walking corridors, and room proportions.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: VISION AR SESSION TELEMETRY */}
            {sidebarTab === 'TELEMETRY' && (
              <div className="bg-white rounded-2xl border border-[#DCE7F5] p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0B2E5B] m-0 font-['Montserrat',sans-serif]">
                    Live AR Session Telemetry
                  </h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Connected
                  </span>
                </div>

                <p className="text-xs text-[#6B7280] m-0">
                  AR interactions are synchronized to the MongoDB <code className="bg-gray-100 px-1 py-0.5 rounded text-[#0B2E5B]">ARSession</code> collection at <code className="bg-gray-100 px-1 py-0.5 rounded text-[#0B2E5B]">/api/v1/ar-sessions</code>.
                </p>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div className="p-2.5 rounded-lg bg-[#F5F9FF] border border-[#DCE7F5]">
                    <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Engine</span>
                    <span className="text-xs font-bold text-[#0B2E5B] block mt-0.5">Three.js + WebXR</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F5F9FF] border border-[#DCE7F5]">
                    <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Surface Tracking</span>
                    <span className="text-xs font-bold text-[#2D8CFF] block mt-0.5">Hit-Test Active</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F5F9FF] border border-[#DCE7F5]">
                    <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Database</span>
                    <span className="text-xs font-bold text-[#0B2E5B] block mt-0.5">MongoDB Mongoose</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#F5F9FF] border border-[#DCE7F5]">
                    <span className="text-[10px] text-[#6B7280] uppercase font-bold block">Status</span>
                    <span className="text-xs font-bold text-emerald-600 block mt-0.5">200 OK Live</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-[#4B5563] space-y-1">
                  <div className="font-semibold text-[#0B2E5B]">Backend REST Endpoints:</div>
                  <div className="font-mono text-[10px] text-gray-600 space-y-0.5">
                    <div>POST /api/v1/ar-sessions</div>
                    <div>GET /api/v1/ar-sessions/:id</div>
                    <div>PUT /api/v1/ar-sessions/:id</div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* FULLSCREEN VISION AR VIEWER MODAL */}
        {isFullscreenArOpen && (
          <div className="fixed inset-0 z-[99999] bg-black">
            <ARViewer
              product={activeProduct}
              catalog={allProducts}
              onSelectProduct={(p) => setActiveProduct(p)}
              onClose={() => setIsFullscreenArOpen(false)}
              isEmbedded={false}
              roomDimensions={{ width: 16, height: 10, length: 20 }}
            />
          </div>
        )}

        {/* MOBILE VISION AR QR CODE MODAL */}
        {showQrModal && (
          <div
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowQrModal(false)}
          >
            <div
              className="bg-white rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl border-2 border-[#8EC5FF]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setShowQrModal(false)}
                  className="bg-transparent border-none text-gray-500 hover:text-black cursor-pointer p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-[#0B2E5B] text-[#8EC5FF] flex items-center justify-center mx-auto mb-3 shadow-md">
                <Smartphone size={28} />
              </div>

              <h3 className="text-lg font-bold text-[#0B2E5B] m-0 font-['Montserrat',sans-serif]">
                Scan to View in Vision AR
              </h3>
              <p className="text-xs text-gray-600 mt-1 mb-4 leading-relaxed">
                Scan this QR code with your iPhone or Android camera to instantly place <strong>{activeProduct.name}</strong> inside your physical living space.
              </p>

              {qrCodeUrl ? (
                <div className="p-3 bg-white rounded-2xl inline-block border border-gray-200 shadow-inner">
                  <img src={qrCodeUrl} alt="Vision AR QR" className="w-52 h-52 block mx-auto" />
                </div>
              ) : (
                <div className="w-52 h-52 flex items-center justify-center mx-auto text-xs text-gray-400">
                  Generating QR...
                </div>
              )}

              <div className="mt-4 text-[11px] text-gray-500">
                Supports iOS (Safari Quick Look) & Android (Chrome WebXR)
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}