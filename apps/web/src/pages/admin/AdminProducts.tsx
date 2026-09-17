import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, Product } from '../../api/products';
import { uploadApi } from '../../api/upload';
import { AdminLayout } from './AdminLayout';
import { Plus, X, UploadCloud, Image as ImageIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PRODUCT_TYPES = [
  { value: 'CUSTOM_WALLPAPER', label: 'Custom Wallpaper' },
  { value: 'READY_WALLPAPER', label: 'Ready-to-Hang Wallpaper' },
  { value: 'WALL_ART', label: 'Wall Art & Prints' },
  { value: 'AESTHETIC_DECOR', label: 'Aesthetic Decor' },
  { value: 'HOME_DECOR', label: 'Home Decor' },
  { value: 'CUSTOM_DESIGN', label: 'Custom Design' },
];

export function AdminProducts() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [q, setQ] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('CUSTOM_WALLPAPER');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [unit, setUnit] = useState('sq ft');
  const [pricePerSqFt, setPricePerSqFt] = useState('');
  const [initialStock, setInitialStock] = useState('50');
  const [material, setMaterial] = useState('');
  const [finish, setFinish] = useState('');
  const [isCustomizable, setIsCustomizable] = useState(true);

  // Multiple system picture upload (limit 5)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { q }],
    queryFn: () => productsApi.list({ q, limit: 50 })
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories()
  });

  // Toggle status
  const toggleStatus = useMutation({
    mutationFn: (id: string) => productsApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product status updated');
    }
  });

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: (payload: any) => productsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product added successfully!');
      resetForm();
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to create product';
      toast.error(msg);
    }
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategoryId('');
    setType('CUSTOM_WALLPAPER');
    setPrice('');
    setDiscountPrice('');
    setUnit('sq ft');
    setPricePerSqFt('');
    setInitialStock('50');
    setMaterial('');
    setFinish('');
    setIsCustomizable(true);

    // Clean up previews
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTypeChange = (selectedType: string) => {
    setType(selectedType);
    if (selectedType === 'CUSTOM_WALLPAPER') {
      setUnit('sq ft');
      setIsCustomizable(true);
    } else {
      setUnit('piece');
      setIsCustomizable(false);
    }
  };

  // Handle local system image selection (limit upto 5)
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

    // Reset input so user can choose more files if slots remain
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove individual picture
  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error('Product name is required');
    if (!categoryId) return toast.error('Please select a category');
    if (!price || Number(price) <= 0) return toast.error('Please enter a valid price');
    if (!description.trim()) return toast.error('Product description is required');

    let uploadedUrls: string[] = [];

    // Upload selected pictures from local system if any
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
      description: description.trim(),
      type,
      categoryId,
      price: Number(price),
      unit: unit || 'piece',
      isCustomizable,
      initialStock: Number(initialStock) || 0,
      images: uploadedUrls,
    };

    if (discountPrice && Number(discountPrice) > 0) {
      payload.discountPrice = Number(discountPrice);
    }
    if (pricePerSqFt && Number(pricePerSqFt) > 0) {
      payload.pricePerSqFt = Number(pricePerSqFt);
    }
    if (material.trim()) payload.material = material.trim();
    if (finish.trim()) payload.finish = finish.trim();

    createProduct.mutate(payload);
  };

  return (
    <AdminLayout>
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h1>Products</h1>
          <p className="text-muted mt-1 text-sm">Manage store inventory, customized wallpapers, and aesthetic articles.</p>
        </div>
        <button 
          onClick={() => {
            if (categories && categories.length > 0 && !categoryId) {
              setCategoryId(categories[0].id);
            }
            setIsModalOpen(true);
          }} 
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <input 
          type="text" 
          placeholder="Search products by name or SKU..." 
          className="input max-w-xs"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      <div className="bg-white border table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Images</th>
              <th>Name / SKU</th>
              <th>Category</th>
              <th>Type</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-8">Loading products...</td></tr>
            ) : data?.items?.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-muted">No products found. Click "Add Product" to create one.</td></tr>
            ) : (
              data?.items.map((p: Product) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-12 bg-gray-100 flex-shrink-0 overflow-hidden" style={{ width: '48px', height: '48px', borderRadius: '4px' }}>
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full gradient-bg flex items-center justify-center text-muted">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </div>
                      {p.images && p.images.length > 1 && (
                        <span className="badge badge-gray text-xs" style={{ padding: '2px 4px' }}>
                          +{p.images.length - 1}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">{p.name}</div>
                    <small className="text-muted">{p.sku}</small>
                  </td>
                  <td><span className="badge badge-gray">{p.category?.name}</span></td>
                  <td>
                    <span className={`badge ${p.isCustomizable ? 'badge-blue' : 'badge-yellow'}`}>
                      {p.isCustomizable ? 'CUSTOM' : 'CURATED'}
                    </span>
                  </td>
                  <td>
                    {p.discountPrice ? (
                      <div>
                        <span className="price">₹{p.discountPrice}</span>{' '}
                        <span className="price-original text-xs">₹{p.price}</span>
                        <small className="text-muted">/{p.unit}</small>
                      </div>
                    ) : (
                      <div>
                        ₹{p.price} <small className="text-muted">/{p.unit}</small>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${((p.inventory?.totalQuantity || 0) - (p.inventory?.reservedQuantity || 0)) > 5 ? 'badge-green' : 'badge-red'}`}>
                      {(p.inventory?.totalQuantity || 0) - (p.inventory?.reservedQuantity || 0)} avail
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>
                      {p.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleStatus.mutate(p.id)} 
                      className="btn btn-ghost btn-sm"
                      title={p.isActive ? 'Deactivate product' : 'Activate product'}
                    >
                      {p.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD PRODUCT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-2 border-b">
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Add New Product</h2>
                <p className="text-muted text-xs mt-1">Upload pictures from your system and set product details.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="btn btn-ghost" 
                style={{ padding: '4px 8px', border: 'none' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* SYSTEM PICTURE UPLOAD (UP TO 5) */}
              <div className="form-group mb-6 p-4 border" style={{ background: '#faf9f7' }}>
                <div className="flex justify-between items-center mb-2">
                  <label className="form-label font-medium" style={{ margin: 0 }}>
                    Product Pictures (From System) *
                  </label>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${selectedFiles.length === 5 ? 'bg-amber-100 text-amber-800' : 'text-muted'}`}>
                    {selectedFiles.length} / 5 pictures selected
                  </span>
                </div>
                <p className="text-muted text-xs mb-3">
                  Upload up to 5 photos directly from your device (JPG, PNG, WebP). Max 10MB per image.
                </p>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple 
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="system-image-upload"
                  disabled={selectedFiles.length >= 5}
                />

                {selectedFiles.length < 5 && (
                  <label 
                    htmlFor="system-image-upload" 
                    className="flex flex-col items-center justify-center p-6 border-dashed border-2 cursor-pointer hover:bg-white transition-colors text-center"
                    style={{ borderColor: 'var(--border)', borderRadius: '4px' }}
                  >
                    <UploadCloud size={32} className="text-accent mb-2" />
                    <span className="font-medium text-sm">Click to choose pictures from your system</span>
                    <span className="text-muted text-xs mt-1">Select 1 to {5 - selectedFiles.length} remaining images</span>
                  </label>
                )}

                {/* IMAGE PREVIEW THUMBNAILS WITH REMOVE BUTTON */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                    {previewUrls.map((url, idx) => (
                      <div 
                        key={idx} 
                        className="relative group border overflow-hidden bg-white" 
                        style={{ height: '90px', borderRadius: '4px' }}
                      >
                        <img 
                          src={url} 
                          alt={`Preview ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                        <span 
                          className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1"
                          style={{ fontSize: '10px', borderRadius: '2px' }}
                        >
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 transition"
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

              <div className="form-group mb-4">
                <label className="form-label font-medium">Product Name *</label>
                <input 
                  type="text" 
                  required 
                  className="input w-full" 
                  placeholder="e.g. Royal Botanica Velvet Wallpaper"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label font-medium">Category *</label>
                  <select 
                    className="select w-full" 
                    value={categoryId} 
                    onChange={e => setCategoryId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Category --</option>
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

              <div className="grid grid-cols-3 gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label font-medium">Price ($) *</label>
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
                  <label className="form-label font-medium">Discount Price ($)</label>
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
                  <label className="form-label font-medium">Unit</label>
                  <input 
                    type="text" 
                    className="input w-full" 
                    placeholder="sq ft / piece / roll"
                    value={unit} 
                    onChange={e => setUnit(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label font-medium">Price per Sq Ft ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="input w-full" 
                    placeholder="e.g. 35.00 for wallpaper calculator"
                    value={pricePerSqFt} 
                    onChange={e => setPricePerSqFt(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-medium">Initial Stock Quantity</label>
                  <input 
                    type="number" 
                    min="0" 
                    className="input w-full" 
                    placeholder="50"
                    value={initialStock} 
                    onChange={e => setInitialStock(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="form-group">
                  <label className="form-label font-medium">Material</label>
                  <input 
                    type="text" 
                    className="input w-full" 
                    placeholder="e.g. Non-Woven Matte / Ceramic"
                    value={material} 
                    onChange={e => setMaterial(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-medium">Finish</label>
                  <input 
                    type="text" 
                    className="input w-full" 
                    placeholder="e.g. Textured / Satin / Glazed"
                    value={finish} 
                    onChange={e => setFinish(e.target.value)} 
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label className="form-label font-medium">Description *</label>
                <textarea 
                  required 
                  rows={3} 
                  className="input w-full" 
                  style={{ height: 'auto', padding: '10px' }}
                  placeholder="Describe the product aesthetics, suitable rooms, and installation notes..."
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                />
              </div>

              <div className="form-group mb-6 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="customizable" 
                  checked={isCustomizable} 
                  onChange={e => setIsCustomizable(e.target.checked)} 
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="customizable" className="font-medium cursor-pointer">
                  Enable Custom Dimension Calculator for this product
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn btn-secondary"
                  disabled={isUploading || createProduct.isPending}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading || createProduct.isPending} 
                  className="btn btn-primary flex items-center gap-2"
                >
                  {isUploading ? 'Uploading Pictures...' : createProduct.isPending ? 'Saving Product...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
