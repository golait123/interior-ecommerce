import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../../api/inventory';
import { StockLayout } from './StockLayout';
import { StatCard } from '../../components/StatCard';
import { InventoryTable } from '../../components/InventoryTable';
import { Package, AlertTriangle, Activity, PackageCheck, ShoppingBag } from 'lucide-react';

export function StockDashboard() {
  const { data: alerts } = useQuery({ queryKey: ['stock-alerts'], queryFn: inventoryApi.alerts });
  const { data: inventory } = useQuery({ queryKey: ['stock-inventory'], queryFn: inventoryApi.list });
  
  const totalItems = inventory?.reduce((sum, item) => sum + item.totalQuantity, 0) || 0;
  const available = inventory?.reduce((sum, item) => sum + item.available, 0) || 0;
  const damaged = inventory?.reduce((sum, item) => sum + item.damagedQuantity, 0) || 0;

  return (
    <StockLayout>
      <div className="page-header flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif">Stock & Inventory Operations</h1>
          <p className="text-muted text-sm mt-1">Live overview of warehouse storage, stock allocations, and shop articles.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/stock/products" className="btn btn-primary flex items-center gap-2 shadow-xs">
            <PackageCheck size={18} />
            <span>Manage Shop Products & Stock</span>
          </Link>
        </div>
      </div>

      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Units (All SKUs)" value={totalItems} icon={<Package />} />
        <StatCard label="Available for Sale" value={available} icon={<Package />} color="var(--success)" />
        <StatCard label="Damaged Units" value={damaged} icon={<AlertTriangle />} color="var(--danger)" />
        <StatCard label="Low Stock Alerts" value={alerts?.length || 0} icon={<AlertTriangle />} color="var(--orange)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 border">
          <h3 className="mb-4">Inventory Status Overview</h3>
          <InventoryTable inventory={inventory?.slice(0,5) || []} />
        </div>

        <div className="bg-white p-6 border">
          <h3 className="mb-4 text-danger flex items-center gap-2"><AlertTriangle size={20} /> Low Stock Action Required</h3>
          <div className="space-y-4">
            {alerts?.slice(0,5).map((a: any) => (
              <div key={a.id} className="pb-2 border-b">
                <p className="font-medium text-sm">{a.product.name}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted">SKU: {a.product.sku}</span>
                  <span className="badge badge-orange">{a.available} left (Reorder: {a.reorderLevel})</span>
                </div>
              </div>
            ))}
            {!alerts?.length && <p className="text-muted text-sm">Inventory levels look good.</p>}
          </div>
        </div>
      </div>
    </StockLayout>
  );
}
