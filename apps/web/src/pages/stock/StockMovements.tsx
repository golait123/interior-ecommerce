import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory';
import { StockLayout } from './StockLayout';

export function StockMovements() {
  const { data, isLoading } = useQuery({
    queryKey: ['stock-transactions'],
    queryFn: () => inventoryApi.transactions()
  });

  return (
    <StockLayout>
      <div className="page-header mb-8">
        <h1>Stock Movements</h1>
      </div>

      <div className="bg-white border table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Performed By</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr> : 
             data?.items.map((t: any) => (
              <tr key={t.id}>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td className="font-medium">{t.product?.name}</td>
                <td>
                  <span className={`badge ${
                    t.type === 'STOCK_IN' ? 'badge-green' : 
                    t.type === 'STOCK_OUT' ? 'badge-blue' : 'badge-red'
                  }`}>
                    {t.type}
                  </span>
                </td>
                <td className={t.type === 'STOCK_IN' ? 'text-green' : 'text-danger'}>
                  {t.type === 'STOCK_IN' ? '+' : '-'}{t.quantity}
                </td>
                <td><span className="text-muted">{t.reason || '-'}</span></td>
                <td>{t.user?.name || 'System'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StockLayout>
  );
}
