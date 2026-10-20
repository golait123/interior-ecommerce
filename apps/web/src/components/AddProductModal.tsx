import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { uploadApi } from '../api/upload';
import { 
  X, UploadCloud, Image as ImageIcon, Sparkles, Home, Trees, Layers, 
  Check, Info, Tag, DollarSign, Package, MapPin, ShieldAlert, 
  ChevronRight, ChevronLeft, CheckCircle2, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated?: () => void;
  defaultRole?: 'ADMIN' | 'STOCK_MANAGER';
}

const PRODUCT_TYPES = [
  { value: 'CUSTOM_WALLPAPER', label: 'Custom Wallpaper (Made-to-measure)' },
  { value: 'READY_WALLPAPER', label: 'Ready-to-Hang Wallpaper' },
  { value: 'WALL_ART', label: 'Wall Art & Murals' },
  { value: 'AESTHETIC_DECOR', label: 'Aesthetic Decor & Accents' },
  { value: 'HOME_DECOR', label: 'Home Decor & Furniture' },
  { value: 'CUSTOM_DESIGN', label: 'Custom Architectural Design' },
];

const INDOOR_SPACES = [
  { id: 'living-room', name: 'Living Room', icon: '🛋️' },
  { id: 'hall', name: 'Hall & Entryway', icon: '🚪' },
  { id: 'bedroom', name: 'Bedroom & Suite', icon: '🛏️' },
  { id: 'kitchen', name: 'Kitchen & Pantry', icon: '🍳' },
  { id: 'dining', name: 'Dining Room', icon: '🍽️' },
  { id: 'study-room', name: 'Study & Home Office', icon: '📚' },
  { id: 'mini-theatre', name: 'Mini-Theatres & Media Lounge', icon: '🎬' },
  { id: 'bathroom', name: 'Bathrooms & Powder Room', icon: '🛁' },
  { id: 'pooja-room', name: 'Pooja Room & Mandir', icon: '🪔' },
  { id: 'kids-room', name: 'Kids Room & Nursery', icon: '🧸' },
];

const OUTDOOR_SPACES = [
  { id: 'parking', name: 'Parking & Porch', icon: '🚗' },
  { id: 'lawn', name: 'Lawn & Garden', icon: '🌳' },
  { id: 'balcony', name: 'Balcony & Verandah', icon: '🪴' },
  { id: 'home-nursery', name: 'Home Nursery & Botanical Living', icon: '🌱' },
  { id: 'patio', name: 'Patio & Courtyard', icon: '☀️' },
  { id: 'terrace', name: 'Rooftop Terrace', icon: '🏙️' },
];

const BOTANICAL_BENEFITS_OPTIONS = [
  { id: 'air-purify', label: '🌬️ Air Purification & Oxygen (Traps VOCs & Formaldehyde)' },
  { id: 'evap-cool', label: '💧 Evaporative Cooling & Microclimate Humidity (2-4°C cooler)' },
  { id: 'biophilic', label: '🌿 Biophilic Calm (Lowers Cortisol & Visual Stress)' },
  { id: 'aromatherapy', label: '🍋 Natural Aromatherapy & Mosquito Repellent' },
  { id: 'hydration', label: '✨ Mindful Plant Hydration & Aesthetic Living Decor' },
];

const CRAFT_HIGHLIGHTS_OPTIONS = [
  'Hand-Carved Solid Sheesham',
  'Repousse Antique Brass',
  'Pure Terracotta Wheel-Thrown',
  'Weatherproof Teak & Cane',
  'Textured Mineral & Gold Leaf',
  'Acoustic Velvet Fabric',
  'Anti-Fog Backlit Mirror Glass',
  'Speckled Artisan Glaze'
];

type StepTab = 'identity' | 'spaces' | 'inventory' | 'media';

export function AddProductModal({ isOpen, onClose, onProductCreated }: AddProductModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeStep, setActiveStep] = useState<StepTab>('identity');

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('CUSTOM_WALLPAPER');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [unit, setUnit] = useState('sq ft');
  const [pricePerSqFt, setPricePerSqFt] = useState('');
  const [coverageSqFt, setCoverageSqFt] = useState('');
  const [material, setMaterial] = useState('');
  const [finish, setFinish] = useState('');
  const [isCustomizable, setIsCustomizable] = useState(true);

  // Architectural Tree / Spaces
  const [primaryDomain, setPrimaryDomain] = useState<'indoor' | 'outdoor' | 'both'>('indoor');
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>(['living-room']);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [selectedCrafts, setSelectedCrafts] = useState<string[]>([]);

  // Stock / Inventory
  const [initialStock, setInitialStock] = useState('50');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [warehouseLocation, setWarehouseLocation] = useState('Sector 58 Guild Bay');

  // Media
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories(),
  });

  React.useEffect(() => {
    if (categories && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const toggleSpace = (spaceId: string) => {
    setSelectedSpaces(prev => 
      prev.includes(spaceId) ? prev.filter(s => s !== spaceId) : [...prev, spaceId]
    );
  };

  const toggleBenefit = (benefitText: string) => {
    setSelectedBenefits(prev =>
      prev.includes(benefitText) ? prev.filter(b => b !== benefitText) : [...prev, benefitText]
    );
  };

  const toggleCraft = (craft: string) => {
    setSelectedCrafts(prev =>
      prev.includes(craft) ? prev.filter(c => c !== craft) : [...prev, craft]
    );
  };

  const handleDomainChange = (domain: 'indoor' | 'outdoor' | 'both') => {
    setPrimaryDomain(domain);
    if (domain === 'indoor' && selectedSpaces.every(s => OUTDOOR_SPACES.some(o => o.id === s))) {
      setSelectedSpaces(['living-room']);
    } else if (domain === 'outdoor' && selectedSpaces.every(s => INDOOR_SPACES.some(i => i.id === s))) {
      setSelectedSpaces(['balcony', 'home-nursery']);
    }
  };

  const handleTypeChange = (selectedType: string) => {
    setType(selectedType);
    if (selectedType === 'CUSTOM_WALLPAPER') {
      setUnit('sq ft');
      setIsCustomizable(true);
      if (!pricePerSqFt && price) setPricePerSqFt(price);
    } else {
      setUnit('piece');
      setIsCustomizable(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const availableSlots = 5 - selectedFiles.length;
    if (availableSlots <= 0) {
      toast.error('Maximum 5 pictures allowed');
      return;
    }
    const toAdd = files.slice(0, availableSlots);
    const newPreviews = toAdd.map(f => URL.createObjectURL(f));
    setSelectedFiles(prev => [...prev, ...toAdd]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (idx: number) => {
    URL.revokeObjectURL(previewUrls[idx]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setName('');
    setSku('');
    setDescription('');
    setType('CUSTOM_WALLPAPER');
    setPrice('');
    setDiscountPrice('');
    setUnit('sq ft');
    setPricePerSqFt('');
    setCoverageSqFt('');
    setInitialStock('50');
    setReorderLevel('10');
    setWarehouseLocation('Sector 58 Guild Bay');
    setMaterial('');
    setFinish('');
    setIsCustomizable(true);
    setPrimaryDomain('indoor');
    setSelectedSpaces(['living-room']);
    setSelectedBenefits([]);
    setSelectedCrafts([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveStep('identity');
  };

  const createProductMutation = useMutation({
    mutationFn: (payload: any) => productsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-products'] });
      queryClient.invalidateQueries({ queryKey: ['stock-inventory-full'] });
      queryClient.invalidateQueries({ queryKey: ['stock-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['spaces-tree'] });
      toast.success('Product added successfully to inventory!');
      resetForm();
      if (onProductCreated) onProductCreated();
      onClose();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to create product';
      toast.error(msg);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setActiveStep('identity');
      return toast.error('Product title / name is required');
    }
    if (!categoryId) {
      setActiveStep('identity');
      return toast.error('Please select a category');
    }
    if (!price || Number(price) <= 0) {
      setActiveStep('identity');
      return toast.error('Please enter a valid base price');
    }
    if (selectedSpaces.length === 0) {
      setActiveStep('spaces');
      return toast.error('Please select at least one suitable room or living space');
    }

    let uploadedUrls: string[] = [];
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        uploadedUrls = await uploadApi.uploadImages(selectedFiles);
      } catch (err: any) {
        setIsUploading(false);
        const msg = err.response?.data?.message || 'Failed to upload pictures from system';
        toast.error(msg);
        return;
      }
      setIsUploading(false);
    }

    const payload: any = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      description: description.trim() || `${name.trim()} - Handcrafted for luxury architectural living.`,
      type,
      categoryId,
      price: Number(price),
      unit: unit || 'piece',
      isCustomizable,
      initialStock: Number(initialStock) || 0,
      reorderLevel: Number(reorderLevel) || 10,
      warehouseLocation: warehouseLocation.trim() || 'Sector 58 Guild Bay',
      images: uploadedUrls,
      spaces: selectedSpaces,
      primaryDomain,
      botanicalBenefits: selectedBenefits,
      craftHighlights: selectedCrafts,
    };

    if (discountPrice && Number(discountPrice) > 0) {
      payload.discountPrice = Number(discountPrice);
    }
    if (pricePerSqFt && Number(pricePerSqFt) > 0) {
      payload.pricePerSqFt = Number(pricePerSqFt);
    }
    if (coverageSqFt && Number(coverageSqFt) > 0) {
      payload.coverageSqFt = Number(coverageSqFt);
    }
    if (material.trim()) payload.material = material.trim();
    if (finish.trim()) payload.finish = finish.trim();

    createProductMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-box" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-add-product-title"
      >
        {/* Pinned Luxury Modal Header */}
        <div className="modal-header">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-blue">
                Stock & Studio Portal
              </span>
              <span className="text-xs text-muted font-medium">Standard Website Specifications</span>
            </div>
            <h2 id="modal-add-product-title">
              Add New Product to Inventory
            </h2>
            <p className="text-muted text-xs mt-0.5 mb-0">
              Complete catalog data entry with architectural living spaces, pricing, inventory alerts, and studio photos.
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="btn btn-ghost btn-sm p-1.5 text-muted hover:text-[#0f2444]"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stepped Tab Controller */}
        <div className="px-6 pt-4 bg-[#ffffff] border-b border-[#e2e8f0]">
          <div className="modal-steps-nav">
            <button
              type="button"
              onClick={() => setActiveStep('identity')}
              className={`modal-step-btn ${activeStep === 'identity' ? 'active' : ''}`}
            >
              <span className="modal-step-num">1</span>
              <span>Identity & Pricing</span>
              {name && price && <Check size={13} className="text-green-700 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('spaces')}
              className={`modal-step-btn ${activeStep === 'spaces' ? 'active' : ''}`}
            >
              <span className="modal-step-num">2</span>
              <span>Spaces & Craft ({selectedSpaces.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('inventory')}
              className={`modal-step-btn ${activeStep === 'inventory' ? 'active' : ''}`}
            >
              <span className="modal-step-num">3</span>
              <span>Inventory & Depot</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('media')}
              className={`modal-step-btn ${activeStep === 'media' ? 'active' : ''}`}
            >
              <span className="modal-step-num">4</span>
              <span>Photos & Story ({selectedFiles.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form id="add-product-form" onSubmit={handleSubmit} className="modal-body">

          {/* STEP 1: IDENTITY & PRICING */}
          {activeStep === 'identity' && (
            <div>
              <div className="form-section-card">
                <h4 className="form-section-title">
                  <Tag size={15} className="text-[#8c6f52]" />
                  <span>1. Product Classification & Identification</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 form-group">
                    <label className="form-label">
                      Product Title / Name <span className="required">*</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      className="input" 
                      placeholder="e.g. Royal Botanica Gold Leaf Velvet Wallpaper / Sheesham Console"
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      SKU (Stock Keeping Unit)
                    </label>
                    <input 
                      type="text" 
                      className="input font-mono" 
                      placeholder="e.g. IG-BOT-091"
                      value={sku} 
                      onChange={e => setSku(e.target.value)} 
                    />
                    <span className="form-hint">Generated automatically if left blank</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                  <div className="form-group">
                    <label className="form-label">
                      Store Category <span className="required">*</span>
                    </label>
                    <select 
                      className="select" 
                      value={categoryId} 
                      onChange={e => setCategoryId(e.target.value)}
                      required
                    >
                      <option value="">-- Select Store Category --</option>
                      {categories?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Product Type <span className="required">*</span>
                    </label>
                    <select 
                      className="select" 
                      value={type} 
                      onChange={e => handleTypeChange(e.target.value)}
                    >
                      {PRODUCT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Pricing & Surface Specifications */}
              <div className="form-section-card">
                <h4 className="form-section-title">
                  <DollarSign size={15} className="text-[#8c6f52]" />
                  <span>2. Valuation, Pricing & Discounts</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">
                      Base Price (₹) <span className="required">*</span>
                    </label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      className="input font-mono" 
                      placeholder="e.g. 1499"
                      value={price} 
                      onChange={e => setPrice(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Discounted Price (₹)
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      className="input font-mono" 
                      placeholder="Optional special sale price"
                      value={discountPrice} 
                      onChange={e => setDiscountPrice(e.target.value)} 
                    />
                    <span className="form-hint">Applies strikethrough on original price</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Unit of Measure
                    </label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="piece, sq ft, set, roll"
                      value={unit} 
                      onChange={e => setUnit(e.target.value)} 
                    />
                  </div>
                </div>

                {/* Wallpaper Customizer Fields */}
                {type === 'CUSTOM_WALLPAPER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 p-3 bg-[#edf4fc] rounded-lg border border-[#cbdceb]">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label text-[#0f2444]">
                        Price Per Sq Ft (₹)
                      </label>
                      <input 
                        type="number" 
                        min="1"
                        className="input" 
                        placeholder="e.g. 42"
                        value={pricePerSqFt} 
                        onChange={e => setPricePerSqFt(e.target.value)} 
                      />
                      <span className="form-hint text-[#536b88]">Used by wall dimension calculator</span>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label text-[#0f2444]">
                        Standard Roll Coverage (Sq Ft)
                      </label>
                      <input 
                        type="number" 
                        min="1"
                        className="input" 
                        placeholder="e.g. 120"
                        value={coverageSqFt} 
                        onChange={e => setCoverageSqFt(e.target.value)} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SPACES & CRAFT */}
          {activeStep === 'spaces' && (
            <div>
              <div className="form-section-card">
                <h4 className="form-section-title">
                  <Home size={15} className="text-[#8c6f52]" />
                  <span>1. Living Domain Placement</span>
                </h4>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleDomainChange('indoor')}
                    className={`p-3 text-center rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      primaryDomain === 'indoor'
                        ? 'border-[#0f2444] bg-[#edf4fc] text-[#0f2444] shadow-xs'
                        : 'border-[#e2e8f0] bg-[#f8fafc] text-muted hover:border-[#cbdceb]'
                    }`}
                  >
                    <span className="text-lg block mb-1">🏠</span>
                    <span>Indoor Sanctuary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDomainChange('outdoor')}
                    className={`p-3 text-center rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      primaryDomain === 'outdoor'
                        ? 'border-[#15803d] bg-[#f0fdf4] text-[#15803d] shadow-xs'
                        : 'border-[#e2e8f0] bg-[#f8fafc] text-muted hover:border-[#cbdceb]'
                    }`}
                  >
                    <span className="text-lg block mb-1">🌿</span>
                    <span>Outdoor & Botanical</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDomainChange('both')}
                    className={`p-3 text-center rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      primaryDomain === 'both'
                        ? 'border-[#8c6f52] bg-[#fcf9f6] text-[#8c6f52] shadow-xs'
                        : 'border-[#e2e8f0] bg-[#f8fafc] text-muted hover:border-[#cbdceb]'
                    }`}
                  >
                    <span className="text-lg block mb-1">🏡</span>
                    <span>Indoor & Outdoor</span>
                  </button>
                </div>

                <label className="form-label mb-2">
                  Suitable Living Spaces & Rooms ({selectedSpaces.length} selected) <span className="required">*</span>
                </label>

                {/* Indoor Spaces Grid */}
                {(primaryDomain === 'indoor' || primaryDomain === 'both') && (
                  <div className="mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f2444] block mb-1.5">Indoor Spaces:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {INDOOR_SPACES.map(s => {
                        const isSel = selectedSpaces.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSpace(s.id)}
                            className={`p-2 text-left rounded-md border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSel 
                                ? 'bg-[#0f2444] text-white border-[#0f2444] font-semibold' 
                                : 'bg-white border-[#e2e8f0] text-[#2d2a27] hover:border-[#cbdceb]'
                            }`}
                          >
                            <span>{s.icon}</span>
                            <span className="truncate">{s.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Outdoor Spaces Grid */}
                {(primaryDomain === 'outdoor' || primaryDomain === 'both') && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803d] block mb-1.5">Outdoor Spaces:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {OUTDOOR_SPACES.map(s => {
                        const isSel = selectedSpaces.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSpace(s.id)}
                            className={`p-2 text-left rounded-md border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSel 
                                ? 'bg-[#15803d] text-white border-[#15803d] font-semibold' 
                                : 'bg-white border-[#e2e8f0] text-[#2d2a27] hover:border-[#cbdceb]'
                            }`}
                          >
                            <span>{s.icon}</span>
                            <span className="truncate">{s.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Botanical & Craft Highlights */}
              <div className="form-section-card">
                <h4 className="form-section-title">
                  <Trees size={15} className="text-[#15803d]" />
                  <span>2. Botanical Benefits & Craft Highlights</span>
                </h4>

                <div className="mb-4">
                  <span className="form-label mb-1.5">Botanical Living Wellness Tags:</span>
                  <div className="space-y-1.5">
                    {BOTANICAL_BENEFITS_OPTIONS.map(b => (
                      <label 
                        key={b.id} 
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          selectedBenefits.includes(b.label) ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d] font-semibold' : 'bg-white border-[#e2e8f0] text-muted'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBenefits.includes(b.label)}
                          onChange={() => toggleBenefit(b.label)}
                          className="accent-[#15803d]"
                        />
                        <span>{b.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="form-label mb-1.5">Artisan Craft Highlights:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {CRAFT_HIGHLIGHTS_OPTIONS.map(c => {
                      const isSel = selectedCrafts.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleCraft(c)}
                          className={`px-2.5 py-1 rounded-full border text-[11px] font-medium cursor-pointer transition-all ${
                            isSel ? 'bg-[#8c6f52] text-white border-[#8c6f52]' : 'bg-white border-[#e2e8f0] text-muted hover:border-[#cbdceb]'
                          }`}
                        >
                          {isSel ? '✓ ' : '+ '}{c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: INVENTORY & DEPOT */}
          {activeStep === 'inventory' && (
            <div>
              <div className="form-section-card">
                <h4 className="form-section-title">
                  <Package size={15} className="text-[#8c6f52]" />
                  <span>1. Inventory Levels & Reorder Thresholds</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">
                      Initial Available Stock (Units) <span className="required">*</span>
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      required
                      className="input font-mono" 
                      placeholder="e.g. 50"
                      value={initialStock} 
                      onChange={e => setInitialStock(e.target.value)} 
                    />
                    <span className="form-hint">Physical stock available immediately for customer orders</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Low Stock Alert Threshold
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      className="input font-mono" 
                      placeholder="e.g. 10"
                      value={reorderLevel} 
                      onChange={e => setReorderLevel(e.target.value)} 
                    />
                    <span className="form-hint">Triggers warning alert when remaining stock &le; this count</span>
                  </div>
                </div>

                <div className="form-group mt-2">
                  <label className="form-label">
                    Warehouse / Depot Location
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input 
                      type="text" 
                      className="input" 
                      style={{ paddingLeft: '34px' }}
                      placeholder="e.g. Sector 58 Guild Bay, Gurugram"
                      value={warehouseLocation} 
                      onChange={e => setWarehouseLocation(e.target.value)} 
                    />
                  </div>
                  <span className="form-hint">Used for dispatch routing and packing slips</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PHOTOS & CRAFT STORY */}
          {activeStep === 'media' && (
            <div>
              {/* Media Upload */}
              <div className="form-section-card">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="form-section-title" style={{ margin: 0 }}>
                    <UploadCloud size={16} className="text-[#8c6f52]" />
                    <span>1. High-Resolution Photography</span>
                  </h4>
                  <span className="text-xs font-semibold text-[#8c6f52] bg-[#fbf6f0] border border-[#ecd9c6] px-2 py-0.5 rounded">
                    {selectedFiles.length} / 5 pictures chosen
                  </span>
                </div>
                <p className="text-muted text-xs mb-3">
                  Upload photography from your computer. (JPG, PNG, WebP — max 10MB per file). First photo acts as Cover.
                </p>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple 
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="modal-system-image-upload"
                  disabled={selectedFiles.length >= 5}
                />

                {selectedFiles.length < 5 && (
                  <label 
                    htmlFor="modal-system-image-upload" 
                    className="flex flex-col items-center justify-center p-6 border-dashed border-2 rounded-xl cursor-pointer hover:bg-[#faf9f7] transition-all text-center border-[#cbdceb] bg-[#fbf9f6]"
                  >
                    <UploadCloud size={32} className="text-[#8c6f52] mb-1.5" />
                    <span className="font-semibold text-sm text-[#0f2444]">Click to choose pictures from your computer</span>
                    <span className="text-muted text-xs mt-1">Select 1 to {5 - selectedFiles.length} remaining images</span>
                  </label>
                )}

                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {previewUrls.map((url, idx) => (
                      <div 
                        key={idx} 
                        className="relative group border border-[#ded9d0] rounded-lg overflow-hidden bg-white shadow-xs" 
                        style={{ height: '96px' }}
                      >
                        <img 
                          src={url} 
                          alt={`Preview ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {idx === 0 ? 'COVER' : `#${idx + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700 transition cursor-pointer border-none"
                          title="Remove picture"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specifications & Description */}
              <div className="form-section-card">
                <h4 className="form-section-title">
                  <Layers size={15} className="text-[#8c6f52]" />
                  <span>2. Craft Story, Materials & Finish</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Material Composition</label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="e.g. Solid Sheesham Wood, Brass, Terracotta"
                      value={material} 
                      onChange={e => setMaterial(e.target.value)} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Surface Finish</label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="e.g. Distressed Teak Oil, Antique Gold Patina"
                      value={finish} 
                      onChange={e => setFinish(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    Full Description & Styling Notes
                  </label>
                  <textarea 
                    className="input" 
                    rows={4}
                    placeholder="Describe heritage motifs, dimensions, styling inspirations, and care guidelines..."
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                  />
                </div>
              </div>
            </div>
          )}

        </form>

        {/* Pinned Luxury Modal Footer */}
        <div className="modal-footer">
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-ghost"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {activeStep !== 'identity' && (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 'media') setActiveStep('inventory');
                  else if (activeStep === 'inventory') setActiveStep('spaces');
                  else if (activeStep === 'spaces') setActiveStep('identity');
                }}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <ChevronLeft size={14} />
                <span>Previous Step</span>
              </button>
            )}

            {activeStep !== 'media' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 'identity') {
                    if (!name.trim()) return toast.error('Product title / name is required');
                    if (!categoryId) return toast.error('Please select a category');
                    if (!price || Number(price) <= 0) return toast.error('Please enter a valid base price');
                    setActiveStep('spaces');
                  } else if (activeStep === 'spaces') {
                    if (selectedSpaces.length === 0) return toast.error('Please select at least one living space');
                    setActiveStep('inventory');
                  } else if (activeStep === 'inventory') {
                    setActiveStep('media');
                  }
                }}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button 
                type="submit" 
                form="add-product-form"
                disabled={createProductMutation.isPending || isUploading}
                className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm"
              >
                <Check size={15} />
                <span>
                  {isUploading ? 'Uploading Pictures...' : createProductMutation.isPending ? 'Publishing...' : 'Publish & Add to Inventory'}
                </span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
