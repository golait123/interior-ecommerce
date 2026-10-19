import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory';
import { StockLayout } from './StockLayout';
import { InventoryTable } from '../../components/InventoryTable';
import { AddProductModal } from '../../components/AddProductModal';
import { Plus, Search, PackagePlus, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

export function StockInventory() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['stock-inventory-full'],
    queryFn: inventoryApi.list
  });

  const [modal, setModal] = useState<{ isOpen: boolean; productId: string; type: string } | null>(null);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('');

  const mutateStock = useMutation({
    mutationFn: (d: any) => inventoryApi.mutate(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-inventory-full'] });
      queryClient.invalidateQueries({ queryKey: ['stock-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stock-alerts'] });
      toast.success('Inventory updated');
      setModal(null);
      setQty(1);
      setReason('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update')
  });

  // Extract unique locations for filtering
  const locations = Array.from(new Set(inventory?.map(i => i.warehouseLocation || 'Main Warehouse') || []));

  // Filter inventory
  const filteredInventory = inventory?.filter(item => {
    const matchesSearch = !searchTerm || 
      item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = selectedLocation === 'ALL' || (item.warehouseLocation || 'Main Warehouse') === selectedLocation;

    return matchesSearch && matchesLocation;
  }) || [];

  return (
    <StockLayout>
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-blue text-xs uppercase tracking-wider font-semibold">Stock & Warehouse Portal</span>
          </div>
          <h1 className="text-3xl font-serif">Inventory & Catalog Management</h1>
          <p className="text-muted text-sm mt-1">
            Track warehouse inventory, perform stock-in/out mutations, or add new architectural articles with complete website fields.
          </p>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center gap-2 shadow-sm"
          style={{ whiteSpace: 'nowrap' }}
        >
          <PackagePlus size={18} />
          <span>Add New Item / Product</span>
        </button>
      </div>

      {/* SEARCH AND LOCATION FILTER BAR */}
      <div className="bg-white border p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <Search size={18} className="text-muted" />
          <input 
            type="text"
            className="input w-full"
            placeholder="Search SKU, product name, or warehouse aisle..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SlidersHorizontal size={16} className="text-muted" />
          <span className="text-xs font-medium text-stone-600">Depot:</span>
          <select 
            className="select"
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
          >
            <option value="ALL">All Warehouses ({inventory?.length || 0})</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border p-6 shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted">Loading inventory catalog...</div>
        ) : filteredInventory.length === 0 ? (
          <div className="empty-state p-8 text-center">
            <p className="text-muted">No matching inventory items found.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedLocation('ALL'); }} 
              className="btn btn-secondary btn-sm mt-3"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <InventoryTable 
            inventory={filteredInventory} 
            onMutate={(productId, type) => setModal({ isOpen: true, productId, type })} 
          />
        )}
      </div>

      {/* QUICK STOCK MUTATION MODAL */}
      {modal?.isOpen && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="mb-4">
              {modal.type === 'STOCK_IN' ? 'Stock In (Add Units)' : modal.type === 'STOCK_OUT' ? 'Stock Out (Fulfill/Transfer)' : 'Mark Units as Damaged'}
            </h3>
            <div className="form-group">
              <label className="form-label">Quantity (Units)</label>
              <input type="number" className="input" value={qty} onChange={e => setQty(Number(e.target.value))} min={1} />
            </div>
            <div className="form-group">
              <label className="form-label">Reason / Reference Note (Optional)</label>
              <input 
                type="text" 
                className="input" 
                placeholder="e.g. Supplier PO receipt, bay relocation, or floor damage"
                value={reason} 
                onChange={e => setReason(e.target.value)} 
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={() => mutateStock.mutate({ productId: modal.productId, type: modal.type, quantity: qty, reason })}
                disabled={mutateStock.isPending}
              >
                Confirm Mutation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE ADD PRODUCT MODAL */}
      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        defaultRole="STOCK_MANAGER"
      />
    </StockLayout>
  );
}

