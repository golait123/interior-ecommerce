import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, Product } from '../../api/products';
import { AdminLayout } from './AdminLayout';
import { AddProductModal } from '../../components/AddProductModal';
import { EditProductModal } from '../../components/EditProductModal';
import { 
  Plus, Image as ImageIcon, Edit3, Trash2, Ban, CheckCircle, 
  ChevronUp, ChevronDown, RefreshCw, AlertCircle, PackageCheck, 
  PackageX, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminProducts() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.categories
  });

  // Fetch products (include inactive so admins see all store articles)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { q, category: selectedCategory }],
    queryFn: () => (productsApi as any).list({ 
      q, 
      category: selectedCategory || undefined,
      limit: 100,
      includeInactive: true 
    })
  });

  // Toggle active/draft status
  const toggleStatus = useMutation({
    mutationFn: (id: string) => productsApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product publication status updated');
    },
    onError: () => toast.error('Failed to change product status')
  });

  // Toggle Out-of-Stock
  const toggleStock = useMutation({
    mutationFn: ({ id, outOfStock }: { id: string; outOfStock: boolean }) => 
      productsApi.toggleOutOfStock(id, outOfStock),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(variables.outOfStock ? 'Marked as Out of Stock' : 'Restocked with fresh units');
    },
    onError: () => toast.error('Failed to update stock status')
  });

  // Quick Stock Adjustment (+/- units)
  const adjustStock = useMutation({
    mutationFn: ({ id, action, quantity }: { id: string; action: 'add' | 'deduct'; quantity: number }) =>
      productsApi.updateStock(id, { action, quantity, reason: 'Quick adjustment in admin shop management' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast.success(`Stock ${variables.action === 'add' ? 'increased' : 'reduced'} by ${variables.quantity}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Stock adjustment failed');
    }
  });

  // Delete product action
  const confirmDelete = async (force = false) => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      const res = await productsApi.delete(deletingProduct.id, force);
      if (res && res.archived) {
        toast.success('Product archived / deactivated as it has associated customer orders');
      } else {
        toast.success('Product permanently deleted');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setDeletingProduct(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const rawItems = data?.items || [];
  const filteredItems = rawItems.filter((p: Product) => {
    const avail = p.inventoryAvailable !== undefined 
      ? p.inventoryAvailable 
      : p.inventory 
        ? (p.inventory.totalQuantity - p.inventory.reservedQuantity - (p.inventory.damagedQuantity || 0)) 
        : 0;

    if (stockFilter === 'in-stock') return avail > 0;
    if (stockFilter === 'out-of-stock') return avail <= 0;
    return true;
  });

  const totalProducts = rawItems.length;
  const inStockCount = rawItems.filter((p: Product) => {
    const avail = p.inventoryAvailable !== undefined 
      ? p.inventoryAvailable 
      : p.inventory 
        ? (p.inventory.totalQuantity - p.inventory.reservedQuantity - (p.inventory.damagedQuantity || 0)) 
        : 0;
    return avail > 0;
  }).length;
  const outOfStockCount = totalProducts - inStockCount;

  return (
    <AdminLayout>
      {/* Header */}
      <div className="page-header flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2d2a27]">Shop Catalog & Inventory Control</h1>
          <p className="text-muted mt-1 text-sm">
            Complete shop management: Insert new articles, update prices & specs, delete/archive, and toggle stock.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="btn btn-primary flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white border border-[#e8e4de] rounded-lg shadow-xs">
          <div className="text-xs uppercase tracking-wider text-muted font-semibold">Total Articles</div>
          <div className="text-2xl font-serif font-bold text-[#2d2a27] mt-1">{totalProducts}</div>
        </div>
        <div className="p-4 bg-white border border-[#e8e4de] rounded-lg shadow-xs">
          <div className="text-xs uppercase tracking-wider text-green-700 font-semibold flex items-center gap-1">
            <PackageCheck size={14} />
            <span>In Stock</span>
          </div>
          <div className="text-2xl font-serif font-bold text-green-700 mt-1">{inStockCount}</div>
        </div>
        <div className="p-4 bg-white border border-[#e8e4de] rounded-lg shadow-xs">
          <div className="text-xs uppercase tracking-wider text-red-700 font-semibold flex items-center gap-1">
            <PackageX size={14} />
            <span>Out of Stock</span>
          </div>
          <div className="text-2xl font-serif font-bold text-red-700 mt-1">{outOfStockCount}</div>
        </div>
        <div className="p-4 bg-white border border-[#e8e4de] rounded-lg shadow-xs">
          <div className="text-xs uppercase tracking-wider text-[#8c6f52] font-semibold">Filtered Display</div>
          <div className="text-2xl font-serif font-bold text-[#8c6f52] mt-1">{filteredItems.length}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 border border-[#e8e4de] rounded-lg mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <input 
            type="text" 
            placeholder="Search products by title, SKU, material..." 
            className="input max-w-sm text-sm"
            value={q}
            onChange={e => setQ(e.target.value)}
          />

          <select
            className="select text-sm"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories?.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1 bg-[#f5f2eb] p-1 rounded-md border border-[#e2dcd2]">
          <button
            type="button"
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${stockFilter === 'all' ? 'bg-white shadow-xs text-[#2d2a27]' : 'text-muted'}`}
          >
            All ({totalProducts})
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('in-stock')}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${stockFilter === 'in-stock' ? 'bg-white shadow-xs text-green-800' : 'text-muted'}`}
          >
            In Stock ({inStockCount})
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('out-of-stock')}
            className={`px-3 py-1.5 text-xs font-semibold rounded ${stockFilter === 'out-of-stock' ? 'bg-white shadow-xs text-red-800' : 'text-muted'}`}
          >
            Out of Stock ({outOfStockCount})
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#e8e4de] rounded-lg shadow-xs overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            <tr className="bg-[#faf8f5] text-left text-xs uppercase tracking-wider text-muted border-b">
              <th className="py-3 px-4">Article</th>
              <th className="py-3 px-4">Category / Type</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Inventory & Quick Adjust</th>
              <th className="py-3 px-4">Stock Status</th>
              <th className="py-3 px-4">Publication</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted">Loading shop products...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted">
                  No products matched the filter criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((p: Product) => {
                const avail = p.inventoryAvailable !== undefined 
                  ? p.inventoryAvailable 
                  : p.inventory 
                    ? (p.inventory.totalQuantity - p.inventory.reservedQuantity - (p.inventory.damagedQuantity || 0)) 
                    : 0;
                const isOut = avail <= 0;

                return (
                  <tr key={p.id} className="border-b hover:bg-[#faf9f7] transition-colors">
                    {/* Article Thumbnail & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 bg-gray-100 flex-shrink-0 overflow-hidden border rounded"
                          style={{ width: '48px', height: '48px' }}
                        >
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[#2d2a27] line-clamp-1">{p.name}</div>
                          <div className="text-xs text-muted font-mono">{p.sku}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Type */}
                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-[#2d2a27]">{p.category?.name || 'Unassigned'}</div>
                      <span className={`badge ${p.isCustomizable ? 'badge-blue' : 'badge-yellow'} text-[10px] mt-1`}>
                        {p.isCustomizable ? 'CUSTOM' : 'CURATED'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      {p.discountPrice ? (
                        <div>
                          <span className="font-bold text-sm text-[#8c6f52]">₹{Number(p.discountPrice).toLocaleString()}</span>
                          <span className="text-xs text-muted line-through ml-1.5">₹{Number(p.price).toLocaleString()}</span>
                          <span className="text-[11px] text-muted block">/{p.unit || 'piece'}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-sm text-[#2d2a27]">₹{Number(p.price).toLocaleString()}</span>
                          <span className="text-[11px] text-muted block">/{p.unit || 'piece'}</span>
                        </div>
                      )}
                    </td>

                    {/* Inventory & Quick Adjust */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-bold ${avail > 5 ? 'text-green-700' : avail > 0 ? 'text-amber-700' : 'text-red-700'}`}>
                          {avail}
                        </span>
                        <span className="text-xs text-muted">avail</span>

                        {/* Quick +/- Stepper Buttons */}
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            type="button"
                            onClick={() => adjustStock.mutate({ id: p.id, action: 'deduct', quantity: 1 })}
                            disabled={avail <= 0 || adjustStock.isPending}
                            className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-xs font-bold disabled:opacity-30 cursor-pointer"
                            title="Deduct 1 unit"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustStock.mutate({ id: p.id, action: 'add', quantity: 5 })}
                            disabled={adjustStock.isPending}
                            className="px-1.5 h-6 flex items-center justify-center rounded bg-[#f4ede4] hover:bg-[#eadecf] text-xs font-semibold text-[#8c6f52] cursor-pointer"
                            title="Add 5 units"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                      <small className="text-muted text-[10px] block mt-0.5">
                        Total: {p.inventory?.totalQuantity ?? avail} | Res: {p.inventory?.reservedQuantity ?? 0}
                      </small>
                    </td>

                    {/* Stock Status Pill & 1-Click Out of Stock Toggle */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`badge ${!isOut ? 'badge-green' : 'badge-red'} text-[11px]`}>
                          {!isOut ? 'IN STOCK' : 'OUT OF STOCK'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleStock.mutate({ id: p.id, outOfStock: !isOut })}
                          disabled={toggleStock.isPending}
                          className="text-[11px] underline font-medium text-[#8c6f52] hover:text-[#6a533c] bg-transparent border-none p-0 cursor-pointer"
                        >
                          {!isOut ? 'Force Out of Stock' : 'Quick Restock (25)'}
                        </button>
                      </div>
                    </td>

                    {/* Publication Status Toggle */}
                    <td className="py-3 px-4">
                      <button 
                        type="button"
                        onClick={() => toggleStatus.mutate(p.id)} 
                        className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'} cursor-pointer hover:opacity-80`}
                        title="Click to toggle publication"
                      >
                        {p.isActive ? 'Active' : 'Draft'}
                      </button>
                    </td>

                    {/* Actions: Edit, Delete */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="btn btn-ghost btn-sm p-1.5 text-blue-700 hover:bg-blue-50"
                          title="Edit product data & stock"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(p)}
                          className="btn btn-ghost btn-sm p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete / Archive product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ADD PRODUCT MODAL */}
      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        defaultRole="ADMIN" 
      />

      {/* EDIT PRODUCT MODAL */}
      <EditProductModal
        product={editingProduct}
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingProduct && (
        <div className="modal-overlay" style={{ zIndex: 1300 }}>
          <div className="modal-box bg-white p-6 max-w-md w-full">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertCircle size={24} />
              <h3 className="font-bold text-lg text-[#2d2a27]">Delete Product</h3>
            </div>
            
            <p className="text-sm text-[#555] mb-4">
              Are you sure you want to delete <strong>"{deletingProduct.name}"</strong>?
            </p>
            <p className="text-xs text-muted bg-[#faf8f5] p-3 rounded border border-[#eee] mb-5">
              Note: If this article has past customer orders, our financial integrity system will automatically archive/deactivate it to preserve your audit logs and order histories.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="btn btn-ghost"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(false)}
                className="btn btn-danger flex items-center gap-1.5"
                disabled={isDeleting}
              >
                <Trash2 size={15} />
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
