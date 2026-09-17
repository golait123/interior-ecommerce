import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';
import { AdminLayout } from './AdminLayout';
import { OrdersTable } from '../../components/OrdersTable';
import toast from 'react-hot-toast';

export function AdminOrders() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-all-orders'],
    queryFn: ordersApi.list
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      toast.success('Order status updated');
    }
  });

  return (
    <AdminLayout>
      <div className="page-header mb-8">
        <h1>Orders</h1>
      </div>

      <div className="bg-white border p-6">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <OrdersTable 
            orders={orders || []} 
            showActions 
            onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
          />
        )}
      </div>
    </AdminLayout>
  );
}
