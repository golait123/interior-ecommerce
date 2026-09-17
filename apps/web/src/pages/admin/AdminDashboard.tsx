import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { ordersApi } from '../../api/orders';
import { inventoryApi } from '../../api/inventory';
import { AdminLayout } from './AdminLayout';
import { StatCard } from '../../components/StatCard';
import { OrdersTable } from '../../components/OrdersTable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingCart, Users, Package, DollarSign, AlertTriangle } from 'lucide-react';

export function AdminDashboard() {
  const { data: metrics } = useQuery({ queryKey: ['admin-metrics'], queryFn: adminApi.metrics });
  const { data: chartData } = useQuery({ queryKey: ['admin-chart'], queryFn: adminApi.revenueChart });
  const { data: orders } = useQuery({ queryKey: ['admin-recent-orders'], queryFn: ordersApi.list });
  const { data: alerts } = useQuery({ queryKey: ['admin-alerts'], queryFn: inventoryApi.alerts });

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>Dashboard Overview</h1>
      </div>

      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`₹${metrics?.revenue || 0}`} icon={<DollarSign />} />
        <StatCard label="Orders" value={metrics?.orders || 0} icon={<ShoppingCart />} />
        <StatCard label="Customers" value={metrics?.customers || 0} icon={<Users />} />
        <StatCard label="Products" value={metrics?.products || 0} icon={<Package />} />
        <StatCard label="Low Stock" value={metrics?.lowStock || 0} icon={<AlertTriangle />} color="var(--danger)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-6 border">
          <h3 className="mb-4">Revenue (Last 30 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip cursor={{ stroke: '#ded9d0', strokeWidth: 1 }} />
                <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 border">
          <h3 className="mb-4 text-danger flex items-center gap-2"><AlertTriangle size={20} /> Low Stock Alerts</h3>
          <div className="space-y-4">
            {alerts?.slice(0,5).map((a: any) => (
              <div key={a.id} className="flex justify-between items-center pb-2 border-b">
                <div>
                  <p className="font-medium text-sm">{a.product.name}</p>
                  <p className="text-xs text-muted">SKU: {a.product.sku}</p>
                </div>
                <span className="badge badge-orange">{a.available} left</span>
              </div>
            ))}
            {!alerts?.length && <p className="text-muted text-sm">No alerts.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 border">
        <h3 className="mb-4">Recent Orders</h3>
        <OrdersTable orders={orders?.slice(0,10) || []} />
      </div>
    </AdminLayout>
  );
}
