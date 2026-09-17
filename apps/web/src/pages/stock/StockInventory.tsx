import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory';
import { StockLayout } from './StockLayout';
import { InventoryTable } from '../../components/InventoryTable';
import toast from 'react-hot-toast';

export function StockInventory() {
  const queryClient = useQueryClient();
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
      toast.success('Inventory updated');
      setModal(null);
      setQty(1);
      setReason('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update')
  });

  return (
    <StockLayout>
      <div className="page-header mb-8">
        <h1>Inventory Management</h1>
      </div>

      <div className="bg-white border p-6">
        {isLoading ? <div>Loading...</div> : 
          <InventoryTable 
            inventory={inventory || []} 
            onMutate={(productId, type) => setModal({ isOpen: true, productId, type })} 
          />
        }
      </div>

      {modal?.isOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 className="mb-4">
              {modal.type === 'STOCK_IN' ? 'Add Stock' : modal.type === 'STOCK_OUT' ? 'Remove Stock' : 'Mark as Damaged'}
            </h3>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input type="number" className="input" value={qty} onChange={e => setQty(Number(e.target.value))} min={1} />
            </div>
            <div className="form-group">
              <label className="form-label">Reason (Optional)</label>
              <input type="text" className="input" value={reason} onChange={e => setReason(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={() => mutateStock.mutate({ productId: modal.productId, type: modal.type, quantity: qty, reason })}
                disabled={mutateStock.isPending}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </StockLayout>
  );
}
