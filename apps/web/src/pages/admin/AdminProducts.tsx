import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, Product } from '../../api/products';
import { AdminLayout } from './AdminLayout';
import { AddProductModal } from '../../components/AddProductModal';
import { Plus, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminProducts() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', { q }],
    queryFn: () => productsApi.list({ q, limit: 50 })
  });

  // Toggle status
  const toggleStatus = useMutation({
    mutationFn: (id: string) => productsApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product status updated');
    }
  });

  return (
    <AdminLayout>
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h1>Products</h1>
          <p className="text-muted mt-1 text-sm">Manage store inventory, customized wallpapers, and aesthetic articles.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
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
      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultRole="ADMIN" 
      />
    </AdminLayout>
  );
}
