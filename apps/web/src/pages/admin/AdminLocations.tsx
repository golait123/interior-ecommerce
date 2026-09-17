import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, StateLocationItem, CityLocationItem } from '../../api/admin';
import { AdminLayout } from './AdminLayout';
import { StatCard } from '../../components/StatCard';
import { MapPin, Building2, TrendingUp, DollarSign, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminLocations() {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-location-analytics'],
    queryFn: adminApi.locationAnalytics
  });

  const states: StateLocationItem[] = data?.states || [];
  const cities: CityLocationItem[] = data?.cities || [];
  const totalOrders = data?.totalOrdersWithLocation || 0;

  const topState = states[0]?.state || 'N/A';
  const topCity = cities[0]?.city || 'N/A';

  // Prepare chart data for Top 6 States
  const chartData = states.slice(0, 6).map(s => ({
    name: s.state,
    orders: s.orderCount,
    revenue: s.revenue
  }));

  const activeStateObj = selectedState ? states.find(s => s.state === selectedState) : null;

  return (
    <AdminLayout>
      <div className="page-header mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1>Audience Interest & Location Analytics</h1>
          <p className="text-muted mt-1 text-sm">
            Track customer demand, order volume, and revenue broken down by State and City.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 border">
          <MapPin size={20} className="text-accent" />
          <span className="font-medium">{states.length} Active States</span>
          <span className="text-muted text-sm">across {cities.length} Cities</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Orders with Location" value={totalOrders} icon={<Package />} />
        <StatCard label="Top Performing State" value={topState} icon={<MapPin />} color="var(--accent)" />
        <StatCard label="Top Performing City" value={topCity} icon={<Building2 />} color="var(--success)" />
        <StatCard label="Active States Reached" value={states.length} icon={<TrendingUp />} />
      </div>

      {/* State Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white p-6 border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Top States by Order Volume</h3>
            <span className="text-xs text-muted uppercase">Live Order Distribution</span>
          </div>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? `₹${value}` : `${value} orders`,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Bar dataKey="orders" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted">
                {isLoading ? 'Loading analytics...' : 'No location order data available yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Top Cities List */}
        <div className="bg-white p-6 border flex flex-col">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-accent" /> Top Cities
          </h3>
          <div className="space-y-3 flex-1 overflow-auto max-h-72">
            {cities.slice(0, 6).map((c, i) => (
              <div key={i} className="flex justify-between items-center pb-2 border-b">
                <div>
                  <p className="font-semibold text-sm">{c.city}</p>
                  <p className="text-xs text-muted">{c.state}</p>
                </div>
                <div className="text-right">
                  <span className="badge badge-blue text-xs font-semibold">{c.orderCount} orders</span>
                  <p className="text-xs text-muted mt-1 font-medium">₹{c.revenue}</p>
                </div>
              </div>
            ))}
            {!cities.length && <p className="text-muted text-sm">No city data available yet.</p>}
          </div>
        </div>
      </div>

      {/* State & City Detailed Table */}
      <div className="bg-white border p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b">
          <div>
            <h3 className="text-lg font-bold">State-wise Audience & City Breakdown</h3>
            <p className="text-muted text-sm">Click on any state to inspect city-level demand and wallpaper preferences.</p>
          </div>
          {selectedState && (
            <button 
              onClick={() => setSelectedState(null)} 
              className="btn btn-secondary btn-sm"
            >
              Clear State Filter ({selectedState})
            </button>
          )}
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>State / Region</th>
                <th>Total Orders</th>
                <th>Total Revenue</th>
                <th>Top Cities in State</th>
                <th>Audience Share</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted">
                    Loading state statistics...
                  </td>
                </tr>
              ) : !states.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted">
                    No orders with address locations found yet. Place a customer order with a shipping address to see live statistics.
                  </td>
                </tr>
              ) : (
                states.map(s => {
                  const share = totalOrders > 0 ? Math.round((s.orderCount / totalOrders) * 100) : 0;
                  const isSelected = selectedState === s.state;
                  return (
                    <React.Fragment key={s.state}>
                      <tr 
                        style={{ background: isSelected ? '#f8f4ee' : undefined }}
                        className="cursor-pointer"
                        onClick={() => setSelectedState(isSelected ? null : s.state)}
                      >
                        <td className="font-semibold flex items-center gap-2">
                          <MapPin size={16} className="text-accent" />
                          {s.state}
                        </td>
                        <td>
                          <span className="badge badge-gray">{s.orderCount}</span>
                        </td>
                        <td className="font-medium">₹{s.revenue}</td>
                        <td className="text-sm text-muted">
                          {s.cities.slice(0, 3).map(c => c.city).join(', ') || 'N/A'}
                          {s.cities.length > 3 && ` (+${s.cities.length - 3})`}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 h-2 rounded overflow-hidden">
                              <div className="bg-accent h-full" style={{ width: `${share}%` }}></div>
                            </div>
                            <span className="text-xs font-medium">{share}%</span>
                          </div>
                        </td>
                        <td>
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedState(isSelected ? null : s.state);
                            }}
                          >
                            {isSelected ? 'Collapse' : 'Details'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded row for cities under this state */}
                      {isSelected && (
                        <tr>
                          <td colSpan={6} style={{ background: '#faf8f5', padding: '16px 24px' }}>
                            <div className="border bg-white p-4">
                              <h4 className="font-bold text-sm mb-3 text-muted uppercase">
                                Cities in {s.state} with Customer Demand
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {s.cities.map((city, cIdx) => (
                                  <div key={cIdx} className="p-3 border flex justify-between items-center bg-white" style={{ borderRadius: '4px' }}>
                                    <div>
                                      <p className="font-semibold text-sm">{city.city}</p>
                                      <p className="text-xs text-muted">{city.orderCount} order(s)</p>
                                    </div>
                                    <span className="font-bold text-accent">₹{city.revenue}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
