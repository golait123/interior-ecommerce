import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, Product } from '../api/products';
import { uploadApi } from '../api/upload';
import { 
  X, UploadCloud, Image as ImageIcon, Sparkles, Tag, 
  DollarSign, Package, MapPin, Check, AlertTriangle, Trash2, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated?: () => void;
}

const PRODUCT_TYPES = [
  { value: 'CUSTOM_WALLPAPER', label: 'Custom Wallpaper (Made-to-measure)' },
  { value: 'READY_WALLPAPER', label: 'Ready-to-Hang Wallpaper' },
  { value: 'WALL_ART', label: 'Wall Art & Murals' },
  { value: 'AESTHETIC_DECOR', label: 'Aesthetic Decor & Accents' },
  { value: 'HOME_DECOR', label: 'Home Decor & Furniture' },
  { value: 'CUSTOM_DESIGN', label: 'Custom Architectural Design' },
];

export function EditProductModal({ product, isOpen, onClose, onProductUpdated }: EditProductModalProps) {
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
  const [unit, setUnit] = useState('piece');
  const [pricePerSqFt, setPricePerSqFt] = useState('');
  const [coverageSqFt, setCoverageSqFt] = useState('');
  const [material, setMaterial] = useState('');
  const [finish, setFinish] = useState('');
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Inventory & Stock
  const [stockQuantity, setStockQuantity] = useState('0');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [warehouseLocation, setWarehouseLocation] = useState('Main Warehouse');

  // Images
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories(),
  });

  // Populate form when product changes
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setDescription(product.description || '');
      setCategoryId(product.category?.id || '');
      setType(product.type || 'HOME_DECOR');
      setPrice(String(product.price || ''));
      setDiscountPrice(product.discountPrice ? String(product.discountPrice) : '');
      setUnit(product.unit || 'piece');
      setPricePerSqFt(product.pricePerSqFt ? String(product.pricePerSqFt) : '');
      setMaterial(product.material || '');
      setFinish(product.finish || '');
      setIsCustomizable(Boolean(product.isCustomizable));
      setIsActive(Boolean(product.isActive));
      setImages(product.images ? [...product.images] : []);
      
      if (product.inventory) {
        setStockQuantity(String(product.inventory.totalQuantity ?? 0));
        setReorderLevel(String(product.inventory.reorderLevel ?? 10));
        setWarehouseLocation((product.inventory as any).warehouseLocation || 'Main Warehouse');
      } else {
        setStockQuantity('25');
        setReorderLevel('10');
        setWarehouseLocation('Main Warehouse');
      }
    }
  }, [product]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (!product) throw new Error('No product selected');
      return productsApi.update(product.id, payload);
    },
    onSuccess: () => {
      toast.success('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      if (onProductUpdated) onProductUpdated();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update product');
    }
  });

  if (!isOpen || !product) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const fileList = Array.from(files);
      const urls = await uploadApi.uploadImages(fileList);
      if (urls && urls.length > 0) {
        setImages(prev => [...prev, ...urls]);
        toast.success(`Uploaded ${urls.length} images`);
      }
    } catch {
      toast.error('Image upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (idxToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error('Product name is required');
    if (!price || Number(price) <= 0) return toast.error('Valid base price is required');

    const payload: any = {
      name: name.trim(),
      description: description.trim(),
      sku: sku.trim() || undefined,
      categoryId: categoryId || undefined,
      type,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      unit: unit.trim() || 'piece',
      pricePerSqFt: pricePerSqFt ? Number(pricePerSqFt) : undefined,
      coverageSqFt: coverageSqFt ? Number(coverageSqFt) : undefined,
      material: material.trim() || undefined,
      finish: finish.trim() || undefined,
      isCustomizable,
      images,
      stockQuantity: stockQuantity !== '' ? parseInt(stockQuantity, 10) : undefined,
      reorderLevel: reorderLevel !== '' ? parseInt(reorderLevel, 10) : undefined,
      warehouseLocation: warehouseLocation.trim() || undefined,
    };

    updateMutation.mutate(payload);
  };

  const availableUnits = product.inventory 
    ? product.inventory.totalQuantity - product.inventory.reservedQuantity - (product.inventory.damagedQuantity || 0)
    : Number(stockQuantity);

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div 
        className="modal-box bg-white" 
        style={{ maxWidth: '880px', width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b bg-[#faf8f5]">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#2d2a27]">Edit Product & Manage Stock</h2>
            <p className="text-xs text-muted mt-0.5">
              SKU: <strong className="text-[#8c6f52]">{sku || product.sku}</strong> • ID: {product.id.slice(0, 8)}...
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-ghost btn-sm p-2 text-muted hover:text-dark"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Status Bar */}
          <div className="flex flex-wrap items-center justify-between p-3.5 rounded-lg bg-[#f4ede4] border border-[#e5dcd3] gap-3">
            <div className="flex items-center gap-3">
              <span className={`badge ${availableUnits > 5 ? 'badge-green' : availableUnits > 0 ? 'badge-yellow' : 'badge-red'}`}>
                {availableUnits > 0 ? `${availableUnits} Available In Stock` : 'OUT OF STOCK'}
              </span>
              <span className={`badge ${isActive ? 'badge-blue' : 'badge-gray'}`}>
                {isActive ? 'Published (Live)' : 'Draft / Inactive'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStockQuantity('0')}
                className="btn btn-ghost btn-sm text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
              >
                Mark Out of Stock (0)
              </button>
              <button
                type="button"
                onClick={() => setStockQuantity(String(Math.max(25, Number(stockQuantity) + 25)))}
                className="btn btn-ghost btn-sm text-xs text-green-800 bg-green-50 hover:bg-green-100 border border-green-200"
              >
                + Restock 25 Units
              </button>
            </div>
          </div>

          {/* Section 1: Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group md:col-span-2">
              <label className="form-label font-semibold text-xs uppercase tracking-wider text-muted">
                Product Title / Name *
              </label>
              <input
                type="text"
                className="input w-full"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Royal Bengal Heritage Sheesham Console"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label font-semibold text-xs uppercase tracking-wider text-muted">
                Category *
              </label>
              <select
                className="select w-full"
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label font-semibold text-xs uppercase tracking-wider text-muted">
                Product Type
              </label>
              <select
                className="select w-full"
                value={type}
                onChange={e => {
                  setType(e.target.value);
                  setIsCustomizable(e.target.value === 'CUSTOM_WALLPAPER');
                }}
              >
                {PRODUCT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label font-semibold text-xs uppercase tracking-wider text-muted">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                className="input w-full"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="e.g. IG-CON-8841"
              />
            </div>

            <div className="form-group">
              <label className="form-label font-semibold text-xs uppercase tracking-wider text-muted">
                Unit of Measure
              </label>
              <input
                type="text"
                className="input w-full"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. piece, set, sq ft, roll"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Discounts */}
          <div className="p-4 rounded-lg border border-[#e8e4de] bg-[#fbf9f6]">
            <h3 className="text-sm font-bold text-[#2d2a27] mb-3 flex items-center gap-1.5">
              <DollarSign size={16} className="text-[#8c6f52]" />
              <span>Pricing & Offers</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label text-xs">Regular Price (₹) *</label>
                <input
                  type="number"
                  className="input w-full"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Discounted Price (₹)</label>
                <input
                  type="number"
                  className="input w-full"
                  value={discountPrice}
                  onChange={e => setDiscountPrice(e.target.value)}
                  placeholder="Optional sale price"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Price / Sq Ft (₹)</label>
                <input
                  type="number"
                  className="input w-full"
                  value={pricePerSqFt}
                  onChange={e => setPricePerSqFt(e.target.value)}
                  placeholder="For custom wallpapers"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Inventory & Warehouse Management */}
          <div className="p-4 rounded-lg border border-[#e8e4de] bg-[#fbf9f6]">
            <h3 className="text-sm font-bold text-[#2d2a27] mb-3 flex items-center gap-1.5">
              <Package size={16} className="text-[#8c6f52]" />
              <span>Inventory & Warehouse Control</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label text-xs">Total Stock Quantity *</label>
                <input
                  type="number"
                  className="input w-full"
                  value={stockQuantity}
                  onChange={e => setStockQuantity(e.target.value)}
                  min="0"
                  required
                />
                <small className="text-muted text-[11px] mt-1 block">
                  Available: {availableUnits} units (Reserved: {product.inventory?.reservedQuantity || 0})
                </small>
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Low Stock Alert Level</label>
                <input
                  type="number"
                  className="input w-full"
                  value={reorderLevel}
                  onChange={e => setReorderLevel(e.target.value)}
                  min="0"
                />
                <small className="text-muted text-[11px] mt-1 block">
                  Triggers reorder warning when stock &le; this level
                </small>
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Warehouse / Bay Location</label>
                <input
                  type="text"
                  className="input w-full"
                  value={warehouseLocation}
                  onChange={e => setWarehouseLocation(e.target.value)}
                  placeholder="e.g. Sector 58 Guild Bay"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Specifications & Craft */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label text-xs">Material</label>
              <input
                type="text"
                className="input w-full"
                value={material}
                onChange={e => setMaterial(e.target.value)}
                placeholder="e.g. Solid Sheesham Wood, Brass, Terracotta"
              />
            </div>

            <div className="form-group">
              <label className="form-label text-xs">Finish</label>
              <input
                type="text"
                className="input w-full"
                value={finish}
                onChange={e => setFinish(e.target.value)}
                placeholder="e.g. Distressed Teak Oil, Antique Gold Patina"
              />
            </div>

            <div className="form-group sm:col-span-2">
              <label className="form-label text-xs">Description & Specifications</label>
              <textarea
                className="input w-full"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detailed craft description, dimensions, and styling notes..."
              />
            </div>
          </div>

          {/* Section 5: Image Gallery Management */}
          <div className="p-4 rounded-lg border border-[#e8e4de] bg-[#fbf9f6]">
            <h3 className="text-sm font-bold text-[#2d2a27] mb-2 flex items-center gap-1.5">
              <ImageIcon size={16} className="text-[#8c6f52]" />
              <span>Product Image Gallery ({images.length})</span>
            </h3>

            {/* Current Image Grid */}
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative group border border-[#ddd] rounded-md overflow-hidden bg-white"
                  style={{ width: '84px', height: '84px' }}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 shadow transition-opacity"
                    title="Remove image"
                  >
                    <Trash2 size={12} />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5 font-bold uppercase tracking-wider">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              {images.length === 0 && (
                <div className="text-muted text-xs p-3">No images uploaded yet.</div>
              )}
            </div>

            {/* Add Image Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <UploadCloud size={14} />
                <span>{isUploading ? 'Uploading...' : 'Upload Photos'}</span>
              </button>

              <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                <input
                  type="url"
                  className="input input-sm flex-1 text-xs"
                  placeholder="Or paste direct image URL (https://...)"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="btn btn-ghost btn-sm text-xs font-semibold"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t mt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn btn-primary flex items-center gap-2"
            >
              <Check size={16} />
              <span>{updateMutation.isPending ? 'Saving Changes...' : 'Save Product Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
