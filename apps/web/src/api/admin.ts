import { api, unwrap } from './client';
export const adminApi = {
  metrics: () => api.get('/admin/metrics').then(unwrap<Metrics>),
  revenueChart: () => api.get('/admin/revenue-chart').then(unwrap<ChartPoint[]>),
  users: (params?: { page?: number; limit?: number; q?: string; role?: string }) =>
    api.get('/admin/users', { params }).then(unwrap<any>),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }).then(unwrap<any>),
  auditLog: (params?: { page?: number }) => api.get('/admin/audit-log', { params }).then(unwrap<any>),
  locationAnalytics: () => api.get('/admin/location-analytics').then(unwrap<LocationAnalyticsResponse>),
};
export type Metrics = { orders: number; customers: number; products: number; revenue: string | number; lowStock: number };
export type ChartPoint = { date: string; revenue: number; orders: number };
export type StateLocationItem = { state: string; orderCount: number; revenue: number; cities: CityLocationItem[] };
export type CityLocationItem = { city: string; state?: string; orderCount: number; revenue: number };
export type LocationAnalyticsResponse = {
  totalOrdersWithLocation: number;
  states: StateLocationItem[];
  cities: CityLocationItem[];
};
