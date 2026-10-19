import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';
import { StockLayout } from './StockLayout';
import { OrdersTable } from '../../components/OrdersTable';
import { ShoppingBag, Sparkles, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export function StockOrders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['stock-orders'],
    queryFn: ordersApi.list
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-orders'] });
      toast.success('Order fulfillment status updated');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update order status')
  });

  return (
    <StockLayout>
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-blue text-xs uppercase tracking-wider font-semibold">Store Manager Portal</span>
            <span className="text-xs text-muted">Customer Orders & Nursery Acclimation</span>
          </div>
          <h1 className="text-3xl font-serif font-normal m-0 text-dark">
            Fulfillment & Customization Tracking
          </h1>
          <p className="text-muted text-sm mt-1 max-w-xl">
            Track bespoke nursery orders, inspect plant pack specifications, record polyhouse acclimation notes, and update carrier tracking numbers.
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: '#ded9d0' }}>
        {isLoading ? (
          <div className="p-8 text-center text-muted">Loading customer commissions...</div>
        ) : (
          <OrdersTable 
            orders={orders || []} 
            showActions 
            onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
            onOrderUpdated={() => queryClient.invalidateQueries({ queryKey: ['stock-orders'] })}
          />
        )}
      </div>
    </StockLayout>
  );
}

export default StockOrders;
