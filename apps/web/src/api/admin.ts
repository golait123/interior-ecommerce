import { api, unwrap } from './client';
export const adminApi = {
  metrics: () => api.get('/admin/metrics').then(unwrap<Metrics>),
  revenueChart: () => api.get('/admin/revenue-chart').then(unwrap<ChartPoint[]>),
  users: (params?: { page?: number; limit?: number; q?: string; role?: string }) =>
    api.get('/admin/users', { params }).then(unwrap<any>),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }).then(unwrap<any>),
  auditLog: (params?: { page?: number }) => api.get('/admin/audit-log', { params }).then(unwrap<any>),
  locationAnalytics: () => api.get('/admin/location-analytics').then(unwrap<LocationAnalyticsResponse>),
  financialAnalytics: (year?: number) =>
    api.get('/admin/financial-analytics', { params: { year } }).then(unwrap<FinancialAnalyticsResponse>),
  downloadFinancialReportCsvUrl: (year?: number) => {
    const base = import.meta.env.VITE_API_URL || '/api/v1';
    const token = localStorage.getItem('cc_token');
    return `${base}/admin/financial-report/csv?year=${year || new Date().getFullYear()}&token=${token || ''}`;
  },
  downloadCsvDirect: async (year?: number) => {
    const response = await api.get('/admin/financial-report/csv', {
      params: { year: year || new Date().getFullYear() },
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `InteriorG_Financial_Report_${year || new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
  trafficStats: () => api.get('/admin/traffic').then(unwrap<TrafficStatsResponse>),
};
export type FinancialSummary = {
  totalGrossRevenue: number;
  totalNetRevenue: number;
  totalTaxCollected: number;
  totalDiscounts: number;
  totalDeliveryFees: number;
  totalOrdersCount: number;
  allOrdersCount: number;
  cancelledOrdersCount: number;
  cancelledRevenueLost: number;
  averageOrderValue: number;
  averageRevenuePerCustomer: number;
  dailyAverageRevenue: number;
  targetYear: number;
};
export type AnnualFinancial = {
  year: number;
  revenue: number;
  grossSales: number;
  tax: number;
  discounts: number;
  orders: number;
  aov: number;
};
export type QuarterlyFinancial = {
  quarter: string;
  quarterNum: number;
  year: number;
  revenue: number;
  grossSales: number;
  tax: number;
  orders: number;
  aov: number;
  sharePercent: number;
};
export type MonthlyFinancial = {
  month: string;
  monthShort: string;
  monthNum: number;
  monthKey: string;
  year: number;
  revenue: number;
  grossSales: number;
  tax: number;
  discounts: number;
  orders: number;
  aov: number;
};
export type CategoryRevenueItem = {
  category: string;
  revenue: number;
  itemsSold: number;
  ordersCount: number;
  percentage: number;
};
export type FinancialTransactionItem = {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  itemsCount: number;
  subtotal: number;
  tax: number;
  discount: number;
  delivery: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentProvider: string;
};
export type FinancialAnalyticsResponse = {
  summary: FinancialSummary;
  annual: AnnualFinancial[];
  quarterly: QuarterlyFinancial[];
  monthly: MonthlyFinancial[];
  categoryBreakdown: CategoryRevenueItem[];
  recentFinancialTransactions: FinancialTransactionItem[];
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

export type TrafficStatsResponse = {
  totalPageviews: number;
  uniqueVisitors: number;
  activeNow: number;
  deviceBreakdown: {
    mobilePortrait: number;
    mobileLandscape: number;
    tablet: number;
    desktop: number;
  };
  topPages: { path: string; views: number; title: string }[];
  referrers: { source: string; count: number }[];
  recentVisitors: {
    id: string;
    path: string;
    device: string;
    orientation: string;
    timeAgo: string;
    location: string;
  }[];
};
