import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { uploadApi } from '../api/upload';
import { 
  X, UploadCloud, Image as ImageIcon, Sparkles, Home, Trees, Layers, 
  Check, Info, Tag, DollarSign, Package, MapPin, ShieldAlert
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

export function AddProductModal({ isOpen, onClose, onProductCreated }: AddProductModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-set category if available
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
      toast.error('You can only select up to 5 pictures.');
      return;
    }

    const filesToAdd = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      toast('Maximum 5 pictures allowed. Only the first ' + availableSlots + ' were added.', { icon: '⚠️' });
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    filesToAdd.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 10MB size limit.`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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
  };

  const createProductMutation = useMutation({
    mutationFn: (payload: any) => productsApi.create(payload),
    onSuccess: () => {
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

    if (!name.trim()) return toast.error('Product name is required');
    if (!categoryId) return toast.error('Please select a category');
    if (!price || Number(price) <= 0) return toast.error('Please enter a valid price');
    if (!description.trim()) return toast.error('Product description is required');
    if (selectedSpaces.length === 0) return toast.error('Please select at least one suitable space or room');

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
      description: description.trim(),
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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-box" 
        style={{ 
          maxWidth: '840px', 
          width: '95%',
          maxHeight: '92vh', 
          overflowY: 'auto',
          padding: '28px',
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-green" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '10px' }}>
                Stock Catalog & Studio
              </span>
              <span className="text-xs text-muted">All Website Fields Included</span>
            </div>
            <h2 style={{ margin: 0, fontSize: '1.6rem', fontFamily: 'var(--font-heading)' }}>
              Add New Product to Inventory
            </h2>
            <p className="text-muted text-xs mt-1">
              Specify architectural space tree placement, botanical living tags, materials, inventory thresholds, and upload pictures.
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-ghost" 
            style={{ padding: '6px', border: 'none', cursor: 'pointer' }}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. MEDIA SECTION: SYSTEM PICTURES UPLOAD */}
          <div className="p-4 border rounded" style={{ background: '#faf9f7', borderColor: 'var(--border)' }}>
            <div className="flex justify-between items-center mb-2">
              <label className="form-label font-medium flex items-center gap-1.5" style={{ margin: 0 }}>
                <UploadCloud size={16} className="text-accent" />
                Product Pictures (From Local System) *
              </label>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${selectedFiles.length === 5 ? 'bg-amber-100 text-amber-900' : 'bg-stone-200 text-stone-700'}`}>
                {selectedFiles.length} / 5 pictures chosen
              </span>
            </div>
            <p className="text-muted text-xs mb-3">
              Upload high-resolution photography for website gallery & quick view. (JPG, PNG, WebP — max 10MB per file).
            </p>

            <input 
              type="file" 
              ref={fileInputRef}
              multiple 
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="modal-system-image-upload"
              disabled={selectedFiles.length >= 5}
            />

            {selectedFiles.length < 5 && (
              <label 
                htmlFor="modal-system-image-upload" 
                className="flex flex-col items-center justify-center p-5 border-dashed border-2 cursor-pointer hover:bg-white transition-colors text-center"
                style={{ borderColor: 'var(--border)', borderRadius: '6px' }}
              >
                <UploadCloud size={28} className="text-accent mb-1.5" />
                <span className="font-medium text-sm">Click to choose pictures from your computer</span>
                <span className="text-muted text-xs mt-1">Select 1 to {5 - selectedFiles.length} remaining images</span>
              </label>
            )}

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mt-3" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {previewUrls.map((url, idx) => (
                  <div 
                    key={idx} 
                    className="relative group border overflow-hidden bg-white shadow-sm" 
                    style={{ height: '90px', borderRadius: '4px' }}
                  >
                    <img 
                      src={url} 
                      alt={`Preview ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                    <span 
                      className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5"
                      style={{ fontSize: '10px', borderRadius: '2px' }}
                    >
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700 transition"
                      style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                      title="Remove picture"
                      aria-label="Remove picture"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. BASIC IDENTITY */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted font-bold mb-3 flex items-center gap-1.5">
              <Tag size={14} /> 1. Product Identity & Classification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 form-group">
                <label className="form-label font-medium">Product Title / Name *</label>
                <input 
                  type="text" 
                  required 
                  className="input w-full" 
                  placeholder="e.g. Royal Botanica Velvet Wallpaper / Sheesham Console"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label font-medium">SKU (Stock Keeping Unit)</label>
                <input 
                  type="text" 
                  className="input w-full" 
                  placeholder="e.g. IG-BOT-091 (Auto if blank)"
                  value={sku} 
                  onChange={e => setSku(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="form-group">
                <label className="form-label font-medium">Category *</label>
                <select 
                  className="select w-full" 
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
                <label className="form-label font-medium">Product Type *</label>
                <select 
                  className="select w-full" 
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

          {/* 3. ARCHITECTURAL SPACE TREE CATEGORIZATION */}
          <div className="p-4 border rounded bg-stone-50" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs uppercase tracking-wider text-muted font-bold m-0 flex items-center gap-1.5">
                <Layers size={14} /> 2. Architectural Space Tree Taxonomy (Website Navigation & Filtering) *
              </h4>
              <span className="text-xs text-accent font-medium">
                {selectedSpaces.length} spaces selected
              </span>
            </div>
            <p className="text-muted text-xs mb-3">
              Assign this product to the architectural spaces where it belongs. Customers will filter by these in the tree navigation and catalog.
            </p>

            {/* Domain Selector */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-stone-700 block mb-1">Primary Space Domain:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDomainChange('indoor')}
                  className={`btn btn-sm flex items-center gap-1.5 ${primaryDomain === 'indoor' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Home size={14} /> Indoor Spaces
                </button>
                <button
                  type="button"
                  onClick={() => handleDomainChange('outdoor')}
                  className={`btn btn-sm flex items-center gap-1.5 ${primaryDomain === 'outdoor' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Trees size={14} /> Outdoor Spaces
                </button>
                <button
                  type="button"
                  onClick={() => handleDomainChange('both')}
                  className={`btn btn-sm flex items-center gap-1.5 ${primaryDomain === 'both' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <Sparkles size={14} /> Both (Indoor & Outdoor)
                </button>
              </div>
            </div>

            {/* Target Space Selection Chips */}
            {(primaryDomain === 'indoor' || primaryDomain === 'both') && (
              <div className="mb-3">
                <span className="text-xs font-semibold text-stone-700 block mb-1.5">Indoor Rooms:</span>
                <div className="flex flex-wrap gap-1.5">
                  {INDOOR_SPACES.map(space => {
                    const isSelected = selectedSpaces.includes(space.id);
                    return (
                      <button
                        key={space.id}
                        type="button"
                        onClick={() => toggleSpace(space.id)}
                        className={`text-xs px-2.5 py-1 rounded border transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected 
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm' 
                            : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                        }`}
                      >
                        <span>{space.icon}</span>
                        <span>{space.name}</span>
                        {isSelected && <Check size={12} className="ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(primaryDomain === 'outdoor' || primaryDomain === 'both') && (
              <div>
                <span className="text-xs font-semibold text-stone-700 block mb-1.5">Outdoor Spaces:</span>
                <div className="flex flex-wrap gap-1.5">
                  {OUTDOOR_SPACES.map(space => {
                    const isSelected = selectedSpaces.includes(space.id);
                    return (
                      <button
                        key={space.id}
                        type="button"
                        onClick={() => toggleSpace(space.id)}
                        className={`text-xs px-2.5 py-1 rounded border transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected 
                            ? 'bg-stone-900 text-white border-stone-900 shadow-sm' 
                            : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                        }`}
                      >
                        <span>{space.icon}</span>
                        <span>{space.name}</span>
                        {isSelected && <Check size={12} className="ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. BOTANICAL & WELLNESS BENEFITS */}
          <div className="p-4 border rounded" style={{ background: '#f6f9f6', borderColor: '#cde4cd' }}>
            <h4 className="text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5" style={{ color: '#2d5a27' }}>
              <Trees size={14} /> 3. Botanical Living & Environmental Benefits
            </h4>
            <p className="text-muted text-xs mb-3">
              Tag health, evaporative cooling, and wellness features shown on `/gardening` and the product specs card.
            </p>
            <div className="space-y-1.5">
              {BOTANICAL_BENEFITS_OPTIONS.map(b => {
                const isSelected = selectedBenefits.includes(b.label);
                return (
                  <label 
                    key={b.id} 
                    className={`flex items-center gap-2 text-xs p-2 rounded cursor-pointer transition-colors border ${
                      isSelected ? 'bg-white border-green-600 font-medium' : 'bg-transparent border-transparent hover:bg-white'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => toggleBenefit(b.label)}
                      style={{ width: '16px', height: '16px' }} 
                    />
                    <span>{b.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 5. PRICING & COMMERCE */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted font-bold mb-3 flex items-center gap-1.5">
              <DollarSign size={14} /> 4. Pricing, Dimensions & Units
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label font-medium">Standard Selling Price ($) *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.1" 
                  required 
                  className="input w-full" 
                  placeholder="299.00"
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label font-medium">Discount / Offer Price ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  className="input w-full" 
                  placeholder="Optional sale price"
                  value={discountPrice} 
                  onChange={e => setDiscountPrice(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label font-medium">Measurement Unit</label>
                <input 
                  type="text" 
                  className="input w-full" 
                  placeholder="sq ft / piece / roll / pot / set"
                  value={unit} 
                  onChange={e => setUnit(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div className="form-group">
                <label className="form-label font-medium">Price per Sq Ft ($) (For Wallpapers/Murals)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="input w-full" 
                  placeholder="e.g. 35.00 for wall customizer"
                  value={pricePerSqFt} 
                  onChange={e => setPricePerSqFt(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label font-medium">Coverage Area (Sq Ft per Unit)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="input w-full" 
                  placeholder="e.g. 56.0 sq ft per roll"
                  value={coverageSqFt} 
                  onChange={e => setCoverageSqFt(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group mt-3 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="modal-customizable" 
                checked={isCustomizable} 
                onChange={e => setIsCustomizable(e.target.checked)} 
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="modal-customizable" className="font-medium text-sm cursor-pointer">
                Enable Bespoke Dimension Calculator (Customers can customize height & width on product page)
              </label>
            </div>
          </div>

          {/* 6. MATERIALS & CRAFTSMANSHIP */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted font-bold mb-3 flex items-center gap-1.5">
              <Sparkles size={14} /> 5. Materials, Finishes & Craftsmanship
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label font-medium">Primary Material</label>
                <input 
                  type="text" 
                  className="input w-full" 
                  placeholder="e.g. Solid Sheesham Wood / Pure Terracotta / Brass"
                  value={material} 
                  onChange={e => setMaterial(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label font-medium">Finish & Texture</label>
                <input 
                  type="text" 
                  className="input w-full" 
                  placeholder="e.g. Natural Matte / Textured Glaze / Gold Leaf"
                  value={finish} 
                  onChange={e => setFinish(e.target.value)} 
                />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-xs font-semibold text-stone-700 block mb-1.5">Quick Craft Tags:</span>
              <div className="flex flex-wrap gap-1.5">
                {CRAFT_HIGHLIGHTS_OPTIONS.map(craft => {
                  const isSelected = selectedCrafts.includes(craft);
                  return (
                    <button
                      key={craft}
                      type="button"
                      onClick={() => toggleCraft(craft)}
                      className={`text-xs px-2.5 py-1 rounded border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-amber-900 text-white border-amber-900 font-medium' 
                          : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                      }`}
                    >
                      {craft} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 7. STOCK MANAGER INVENTORY FIELDS */}
          <div className="p-4 border rounded bg-amber-50" style={{ borderColor: '#e9dbcd' }}>
            <h4 className="text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-1.5 text-amber-900">
              <Package size={14} /> 6. Stock & Warehouse Management
            </h4>
            <p className="text-muted text-xs mb-3">
              Initial physical stock counts and automatic low-stock reorder thresholds for warehouse inventory tracking.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label font-medium text-xs">Initial Stock Available *</label>
                <input 
                  type="number" 
                  min="0" 
                  required
                  className="input w-full bg-white" 
                  placeholder="50"
                  value={initialStock} 
                  onChange={e => setInitialStock(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label font-medium text-xs">Low Stock Reorder Alert Level *</label>
                <input 
                  type="number" 
                  min="1" 
                  required
                  className="input w-full bg-white" 
                  placeholder="10"
                  value={reorderLevel} 
                  onChange={e => setReorderLevel(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label font-medium text-xs">Warehouse / Depot Location *</label>
                <input 
                  type="text" 
                  required
                  className="input w-full bg-white" 
                  placeholder="e.g. Sector 58 Guild Bay / Bay 4 Nursery"
                  value={warehouseLocation} 
                  onChange={e => setWarehouseLocation(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* 8. DESCRIPTION */}
          <div className="form-group">
            <label className="form-label font-medium">Editorial Description & Styling Narrative *</label>
            <textarea 
              required 
              rows={4} 
              className="input w-full" 
              style={{ height: 'auto', padding: '12px', lineHeight: '1.5' }}
              placeholder="Detail the craft heritage, aesthetic mood, suitable lighting, room ambiance, and installation recommendations..."
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t items-center">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              disabled={isUploading || createProductMutation.isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isUploading || createProductMutation.isPending} 
              className="btn btn-primary flex items-center gap-2"
              style={{ minWidth: '160px', justifyContent: 'center' }}
            >
              {isUploading ? (
                <>
                  <UploadCloud size={16} className="animate-spin" />
                  <span>Uploading Pictures...</span>
                </>
              ) : createProductMutation.isPending ? (
                <>
                  <Package size={16} className="animate-spin" />
                  <span>Creating Product...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Add Product to Catalog</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
